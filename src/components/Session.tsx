"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { recordAttempt, sync } from "@/lib/progress";
import { WORDS, shuffle, type Word } from "@/lib/words";

type Phase = "cards" | "quiz" | "result";

export function Session({ words, startWith, title }: { words: Word[]; startWith: "cards" | "quiz"; title: string }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>(startWith);
  const [pool, setPool] = useState<Word[]>(words);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);

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
        <span className="w-8" />
      </header>

      {phase === "cards" && <Cards words={words} onDone={() => setPhase("quiz")} />}
      {phase === "quiz" && <Quiz key={round} words={quizWords} onFinish={finish} />}
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

function Cards({ words, onDone }: { words: Word[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const w = words[i];
  const last = i === words.length - 1;

  function go(next: number) {
    setOpen(false);
    setI(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-500">플래시카드 {i + 1} / {words.length}</p>
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

function Quiz({ words, onFinish }: { words: Word[]; onFinish: (wrong: Word[], total: number) => void }) {
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
      <div className="card flex min-h-40 flex-col items-center justify-center gap-2 p-6">
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
