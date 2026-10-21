"use client";

import Link from "next/link";
import { GroupCard } from "@/components/GroupCard";
import { reviewList, useStats } from "@/lib/progress";
import { CATEGORIES, WORDS, categoryWords } from "@/lib/words";

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
        <p className="text-sm text-slate-500">JLPT N5 · 단어 {WORDS.length}개 · 주제 {CATEGORIES.length}개</p>
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
        <h2 className="text-sm font-semibold text-slate-500">주제 선택</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => {
            const ws = categoryWords(c.slug);
            return (
              <GroupCard
                key={c.slug}
                href={`/category/${c.slug}`}
                title={c.name}
                subtitle={ws.slice(0, 3).map((w) => w.word).join(", ") + " …"}
                words={ws}
                stats={stats}
              />
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
