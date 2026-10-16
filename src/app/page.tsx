"use client";

import Link from "next/link";
import { accuracy, reviewList, useStats } from "@/lib/progress";
import { SECTION_COUNT, SECTION_SIZE, WORDS, sectionWords } from "@/lib/words";

export default function Home() {
  const { stats } = useStats();
  const review = reviewList(stats);
  const all = Object.values(stats);
  const total = all.reduce((n, s) => n + s.total, 0);
  const wrong = all.reduce((n, s) => n + s.wrong, 0);

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">일본어 단어장</h1>
        <p className="text-sm text-slate-500">JLPT N5 · 단어 {WORDS.length}개 · {SECTION_SIZE}개씩 {SECTION_COUNT}구간</p>
      </header>

      <section className="card grid grid-cols-3 divide-x divide-slate-100 p-4 text-center dark:divide-slate-700">
        <Stat label="푼 문제" value={String(total)} />
        <Stat label="정답률" value={total ? `${Math.round(((total - wrong) / total) * 100)}%` : "-"} />
        <Stat label="오답노트" value={`${review.length}개`} />
      </section>

      <Link href="/review" className={`btn-primary block text-center ${review.length === 0 ? "pointer-events-none opacity-40" : ""}`}>
        오답 복습하기 {review.length > 0 && `(오답률 높은 순)`}
      </Link>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-500">구간 선택</h2>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: SECTION_COUNT }, (_, i) => i + 1).map((n) => {
            const ws = sectionWords(n);
            const tried = ws.filter((w) => stats[w.id]).length;
            const t = ws.reduce((s, w) => s + (stats[w.id]?.total ?? 0), 0);
            const wr = ws.reduce((s, w) => s + (stats[w.id]?.wrong ?? 0), 0);
            const acc = t ? accuracy({ total: t, wrong: wr, streak: 0, lastWrongAt: 0 }) : null;
            return (
              <Link key={n} href={`/study/${n}`} className="card p-3">
                <p className="font-bold">구간 {n}</p>
                <p className="text-xs text-slate-500">{ws[0].word} ~ {ws[ws.length - 1].word}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
                  <div className="h-full bg-indigo-500" style={{ width: `${(tried / ws.length) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{tried}/{ws.length}개 학습{acc !== null && ` · 정답률 ${Math.round(acc * 100)}%`}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <Link href="/stats" className="btn-ghost block text-center">통계 보기</Link>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
