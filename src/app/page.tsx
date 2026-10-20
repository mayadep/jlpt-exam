"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GroupCard } from "@/components/GroupCard";
import { reviewList, useStats } from "@/lib/progress";
import { CATEGORIES, SECTION_COUNT, SECTION_SIZE, WORDS, categoryWords, sectionWords } from "@/lib/words";

type View = "section" | "category";
const VIEW_KEY = "jw.homeView";

export default function Home() {
  const { stats } = useStats();
  const review = reviewList(stats);
  const all = Object.values(stats);
  const total = all.reduce((n, s) => n + s.total, 0);
  const wrong = all.reduce((n, s) => n + s.wrong, 0);
  const [view, setView] = useState<View>("section");

  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "category") setView("category");
    } catch {
      // 저장소를 못 쓰면 구간별로 보여줘요
    }
  }, []);

  function choose(v: View) {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">일본어 단어장</h1>
        <p className="text-sm text-slate-500">JLPT N5 · 단어 {WORDS.length}개 · {SECTION_SIZE}개씩 {SECTION_COUNT}구간 · 주제 {CATEGORIES.length}개</p>
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
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
          {(["section", "category"] as const).map((v) => (
            <button
              key={v}
              onClick={() => choose(v)}
              aria-pressed={view === v}
              className={`rounded-lg py-2 ${view === v ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500"}`}
            >
              {v === "section" ? "구간별" : "주제별"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {view === "section"
            ? Array.from({ length: SECTION_COUNT }, (_, i) => i + 1).map((n) => (
                <GroupCard key={n} href={`/study/${n}`} title={`구간 ${n}`} words={sectionWords(n)} stats={stats} />
              ))
            : CATEGORIES.map((c) => {
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
