"use client";

import { useCallback, useEffect, useState } from "react";

export type WordStat = { total: number; wrong: number; streak: number; lastWrongAt: number };
export type StatMap = Record<string, WordStat>;
type Attempt = { id: string; wordId: string; correct: boolean; at: number };

const QUEUE_KEY = "jw.queue";
const CACHE_KEY = "jw.stats";
export const MASTER_STREAK = 3; // 연속 3번 맞히면 오답노트에서 빠져요

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간이 없거나 막힌 경우엔 그냥 넘어가요
  }
}

function applyAttempts(base: StatMap, attempts: Attempt[]): StatMap {
  const out: StatMap = {};
  for (const [k, v] of Object.entries(base)) out[k] = { ...v };
  for (const a of attempts) {
    const s = (out[a.wordId] ??= { total: 0, wrong: 0, streak: 0, lastWrongAt: 0 });
    s.total++;
    if (a.correct) {
      s.streak++;
    } else {
      s.wrong++;
      s.streak = 0;
      s.lastWrongAt = a.at;
    }
  }
  return out;
}

export function currentStats(): StatMap {
  return applyAttempts(read<StatMap>(CACHE_KEY, {}), read<Attempt[]>(QUEUE_KEY, []));
}

let syncing: Promise<void> | null = null;

// 기기에 쌓인 기록을 서버로 보내고, 서버의 최신 통계를 받아와요. 실패하면 기기 기록만으로 계속 동작해요.
export function sync(): Promise<void> {
  syncing ??= (async () => {
    try {
      const queue = read<Attempt[]>(QUEUE_KEY, []);
      if (queue.length > 0) {
        for (let i = 0; i < queue.length; i += 500) {
          const res = await fetch("/api/attempts", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ attempts: queue.slice(i, i + 500) }),
          });
          if (!res.ok) return;
        }
        const sent = new Set(queue.map((a) => a.id));
        write(QUEUE_KEY, read<Attempt[]>(QUEUE_KEY, []).filter((a) => !sent.has(a.id)));
      }
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) return;
      const { stats } = (await res.json()) as { stats: StatMap };
      write(CACHE_KEY, stats);
    } catch {
      // 오프라인이면 다음에 다시 시도해요
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

export function recordAttempt(wordId: string, correct: boolean) {
  const queue = read<Attempt[]>(QUEUE_KEY, []);
  queue.push({ id: crypto.randomUUID(), wordId, correct, at: Date.now() });
  write(QUEUE_KEY, queue);
}

export function useStats() {
  const [stats, setStats] = useState<StatMap>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    setStats(currentStats());
    await sync();
    setStats(currentStats());
  }, []);

  useEffect(() => {
    setStats(currentStats());
    setReady(true);
    void sync().then(() => setStats(currentStats()));
    const online = () => void sync().then(() => setStats(currentStats()));
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, []);

  return { stats, ready, refresh };
}

// 오답노트 대상: 틀린 적이 있고 아직 연속 정답 기준을 못 채운 단어, 오답률 높은 순
export function reviewList(stats: StatMap): { id: string; rate: number }[] {
  return Object.entries(stats)
    .filter(([, s]) => s.wrong > 0 && s.streak < MASTER_STREAK)
    .map(([id, s]) => ({ id, rate: s.wrong / s.total, lastWrongAt: s.lastWrongAt }))
    .sort((a, b) => b.rate - a.rate || b.lastWrongAt - a.lastWrongAt)
    .map(({ id, rate }) => ({ id, rate }));
}

export function accuracy(s?: WordStat): number | null {
  return s && s.total > 0 ? (s.total - s.wrong) / s.total : null;
}
