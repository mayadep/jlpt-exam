"use client";

import { useCallback, useEffect, useState } from "react";

// 브라우저에 들어 있는 음성합성(Web Speech API)으로 일본어를 읽어 줘요. 파일·비용 없음.
const AUTO_KEY = "jw.autoSpeak";

// "unknown": 아직 확인 전, "ok": 일본어 음성 있음(또는 목록을 못 받아 일단 시도), "no-ja": 일본어 음성 없음, "none": 음성합성 미지원
export type SpeechSupport = "unknown" | "ok" | "no-ja" | "none";

function pickVoice(): SpeechSynthesisVoice | undefined {
  const ja = speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
  // 기기에 설치된(로컬) 음성을 먼저 써서 오프라인에서도 되게 해요
  return ja.find((v) => v.localService) ?? ja[0];
}

function checkSupport(): SpeechSupport {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return "none";
  const voices = speechSynthesis.getVoices();
  // 일부 안드로이드 브라우저는 목록을 비워 두고도 읽을 수 있어서, 빈 목록이면 일단 시도해요
  if (voices.length === 0) return "ok";
  return pickVoice() ? "ok" : "no-ja";
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  const v = pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

export function useSpeech() {
  const [support, setSupport] = useState<SpeechSupport>("unknown");
  const [auto, setAutoState] = useState(true);

  useEffect(() => {
    setSupport(checkSupport());
    try {
      if (localStorage.getItem(AUTO_KEY) === "off") setAutoState(false);
    } catch {
      // 저장소가 막혀 있으면 기본값(켜짐)으로 둬요
    }
    if (!("speechSynthesis" in window)) return;
    const onChange = () => setSupport(checkSupport());
    speechSynthesis.addEventListener("voiceschanged", onChange);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", onChange);
      speechSynthesis.cancel();
    };
  }, []);

  const setAuto = useCallback((on: boolean) => {
    setAutoState(on);
    try {
      localStorage.setItem(AUTO_KEY, on ? "on" : "off");
    } catch {
      // 저장 못 해도 이번 학습 동안은 적용돼요
    }
  }, []);

  return { support, canSpeak: support === "ok", auto, setAuto };
}
