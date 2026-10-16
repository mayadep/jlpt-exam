"use client";

import Link from "next/link";
import { MASTER_STREAK, reviewList, useStats } from "@/lib/progress";
import { WORD_BY_ID } from "@/lib/words";

export default function StatsPage() {
  const { stats } = useStats();
  const review = reviewList(stats);
  const all = Object.values(stats);
  const mastered = all.filter((s) => s.wrong > 0 && s.streak >= MASTER_STREAK).length;

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500">← 홈</Link>
        <h1 className="text-base font-bold">통계</h1>
        <span className="w-8" />
      </header>
      <div className="card grid grid-cols-2 divide-x divide-slate-100 p-4 text-center dark:divide-slate-700">
        <div><p className="text-xl font-bold">{all.length}</p><p className="text-xs text-slate-500">학습한 단어</p></div>
        <div><p className="text-xl font-bold">{mastered}</p><p className="text-xs text-slate-500">오답 극복 ({MASTER_STREAK}연속 정답)</p></div>
      </div>
      <section className="card divide-y divide-slate-100 dark:divide-slate-700">
        <p className="p-3 text-sm font-semibold">오답노트 (오답률 높은 순)</p>
        {review.length === 0 && <p className="p-3 text-sm text-slate-500">아직 오답이 없어요.</p>}
        {review.slice(0, 50).map(({ id, rate }) => {
          const w = WORD_BY_ID.get(id);
          const s = stats[id];
          if (!w) return null;
          return (
            <div key={id} className="flex items-center justify-between p-3">
              <span className="font-semibold">{w.word}<span className="ml-2 text-sm font-normal text-slate-500">{w.meaning}</span></span>
              <span className="text-sm text-rose-600">{Math.round(rate * 100)}% ({s.wrong}/{s.total})</span>
            </div>
          );
        })}
      </section>
    </main>
  );
}
