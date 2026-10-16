"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { recordAttempt, sync } from "@/lib/progress";
import { speak, useSpeech } from "@/lib/speech";
import { WORDS, shuffle, type Example, type Word } from "@/lib/words";

type Phase = "cards" | "quiz" | "result";

export function Session({ words, startWith, title }: { words: Word[]; startWith: "cards" | "quiz"; title: string }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>(startWith);
  const [pool, setPool] = useState<Word[]>(words);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const voice = useSpeech();

  const quizWords = useMemo(() => shuffle(pool), [pool, round]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish(wrongWords: Word[], count: number) {
    setWrong(wrongWords);
    setTotal(count);
    setPhase("result");
    void sync();
  }

  function retry(list: Word[]) {
    setPool(list);
    setRound((r) => r + 1);
    setPhase("quiz");
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500">← 홈</Link>
        <h1 className="text-base font-bold">{title}</h1>
        {voice.canSpeak ? (
          <button
            onClick={() => voice.setAuto(!voice.auto)}
            className={`rounded-full px-2 py-1 text-xs ${voice.auto ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
            aria-pressed={voice.auto}
          >
            {voice.auto ? "자동 읽기 켬" : "자동 읽기 끔"}
          </button>
        ) : (
          <span className="w-8" />
        )}
      </header>
      {voice.support === "no-ja" && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          이 기기에는 일본어 음성이 없어서 읽어 주기를 쓸 수 없어요. 휴대폰 설정의 텍스트 음성 변환(TTS)에서 일본어 음성을 받으면 사용할 수 있어요.
        </p>
      )}

      {phase === "cards" && <Cards words={words} voice={voice} onDone={() => setPhase("quiz")} />}
      {phase === "quiz" && <Quiz key={round} words={quizWords} voice={voice} onFinish={finish} />}
      {phase === "result" && (
        <Result
          wrong={wrong}
          total={total}
          onRetryWrong={() => retry(wrong)}
          onRetryAll={() => retry(words)}
        />
      )}
    </div>
  );
}

type Voice = ReturnType<typeof useSpeech>;

function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      onClick={() => speak(text)}
      aria-label="발음 듣기"
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-xl active:scale-95 dark:bg-indigo-950 ${className}`}
    >
      🔊
    </button>
  );
}

function ExampleBox({ ex, canSpeak }: { ex: Example; canSpeak: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-left dark:bg-slate-900">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-lg">{ex.text}</p>
        <p className="text-xs text-slate-500">{ex.reading}</p>
        <p className="text-sm">{ex.meaning}</p>
      </div>
      {canSpeak && <SpeakButton text={ex.reading} className="shrink-0" />}
    </div>
  );
}

function Cards({ words, voice, onDone }: { words: Word[]; voice: Voice; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const w = words[i];
  const last = i === words.length - 1;

  // 카드가 바뀔 때마다 자동으로 읽어 줘요
  useEffect(() => {
    if (voice.canSpeak && voice.auto) speak(w.reading);
  }, [w, voice.canSpeak, voice.auto]);

  function go(next: number) {
    setOpen(false);
    setI(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-500">플래시카드 {i + 1} / {words.length}</p>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="card flex min-h-72 w-full flex-col items-center justify-center gap-4 p-6"
        >
          <span className="text-5xl font-bold">{w.word}</span>
          {open ? (
            <>
              {w.reading !== w.word && <span className="text-2xl text-indigo-600 dark:text-indigo-300">{w.reading}</span>}
              <span className="text-xl">{w.meaning}</span>
            </>
          ) : (
            <span className="text-sm text-slate-400">탭해서 뜻 보기</span>
          )}
        </button>
        {open && w.example && (
          <div className="mt-3">
            <ExampleBox ex={w.example} canSpeak={voice.canSpeak} />
          </div>
        )}
        {voice.canSpeak && <SpeakButton text={w.reading} className="absolute right-3 top-3" />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-ghost" disabled={i === 0} onClick={() => go(i - 1)}>이전</button>
        {last ? (
          <button className="btn-primary" onClick={onDone}>문제 풀기</button>
        ) : (
          <button className="btn-primary" onClick={() => go(i + 1)}>다음</button>
        )}
      </div>
      <button className="w-full text-sm text-slate-500 underline" onClick={onDone}>카드 건너뛰고 바로 문제 풀기</button>
    </div>
  );
}

function makeChoices(answer: Word): Word[] {
  const others = shuffle(WORDS.filter((w) => w.id !== answer.id && w.meaning !== answer.meaning)).slice(0, 3);
  return shuffle([answer, ...others]);
}

function Quiz({ words, voice, onFinish }: { words: Word[]; voice: Voice; onFinish: (wrong: Word[], total: number) => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<Word[]>([]);
  const w = words[i];
  const choices = useMemo(() => makeChoices(w), [w]);

  function pick(c: Word) {
    if (picked) return;
    const ok = c.id === w.id;
    setPicked(c.id);
    recordAttempt(w.id, ok);
    if (!ok) setWrong((x) => [...x, w]);
    // 문제에서는 답을 고른 뒤에 읽어 줘요 (읽는 법이 미리 들리지 않게)
    if (voice.canSpeak && voice.auto) speak(w.reading);
  }

  function next() {
    if (i === words.length - 1) {
      onFinish(wrong, words.length);
      return;
    }
    setPicked(null);
    setI(i + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-500">문제 {i + 1} / {words.length}</p>
      <div className="card relative flex min-h-40 flex-col items-center justify-center gap-2 p-6">
        {voice.canSpeak && <SpeakButton text={w.reading} className="absolute right-3 top-3" />}
        <span className="text-5xl font-bold">{w.word}</span>
        {picked && w.reading !== w.word && <span className="text-xl text-indigo-600 dark:text-indigo-300">{w.reading}</span>}
      </div>
      <div className="grid gap-3">
        {choices.map((c) => {
          const state =
            !picked ? "" : c.id === w.id ? "border-emerald-500! bg-emerald-50! dark:bg-emerald-950!" : c.id === picked ? "border-rose-500! bg-rose-50! dark:bg-rose-950!" : "opacity-50";
          return (
            <button key={c.id} onClick={() => pick(c)} className={`btn-ghost text-left ${state}`}>
              {c.meaning}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="space-y-3">
          <p className={`text-center font-semibold ${picked === w.id ? "text-emerald-600" : "text-rose-600"}`}>
            {picked === w.id ? "정답!" : `오답 — 정답: ${w.meaning}`}
          </p>
          {w.example && <ExampleBox ex={w.example} canSpeak={voice.canSpeak} />}
          <button className="btn-primary w-full" onClick={next}>
            {i === words.length - 1 ? "결과 보기" : "다음 문제"}
          </button>
        </div>
      )}
    </div>
  );
}

function Result({ wrong, total, onRetryWrong, onRetryAll }: { wrong: Word[]; total: number; onRetryWrong: () => void; onRetryAll: () => void }) {
  const correct = total - wrong.length;
  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="text-sm text-slate-500">이번 결과</p>
        <p className="mt-1 text-4xl font-bold">{correct} / {total}</p>
        <p className="mt-1 text-slate-500">정답률 {Math.round((correct / total) * 100)}%</p>
      </div>
      {wrong.length > 0 && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700">
          <p className="p-3 text-sm font-semibold">틀린 단어</p>
          {wrong.map((w) => (
            <div key={w.id} className="flex items-center justify-between p-3">
              <span className="text-lg font-semibold">{w.word}<span className="ml-2 text-sm font-normal text-slate-500">{w.reading !== w.word ? w.reading : ""}</span></span>
              <span className="text-sm">{w.meaning}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3">
        {wrong.length > 0 && <button className="btn-primary" onClick={onRetryWrong}>틀린 단어만 다시 풀기</button>}
        <button className="btn-ghost" onClick={onRetryAll}>처음부터 다시 풀기</button>
        <Link href="/" className="btn-ghost text-center">홈으로</Link>
      </div>
    </div>
  );
}
