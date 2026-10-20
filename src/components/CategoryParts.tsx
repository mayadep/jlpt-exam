"use client";

import Link from "next/link";
import { GroupCard } from "@/components/GroupCard";
import { useStats } from "@/lib/progress";
import { categoryBySlug, categoryParts } from "@/lib/words";

// 단어가 많은 주제는 묶음을 골라서 학습해요
export function CategoryParts({ slug }: { slug: string }) {
  const { stats } = useStats();
  const c = categoryBySlug(slug)!;
  const parts = categoryParts(slug);

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500">← 홈</Link>
        <h1 className="text-base font-bold">{c.name}</h1>
        <span className="w-8" />
      </header>
      <p className="text-sm text-slate-500">단어가 {parts.reduce((n, p) => n + p.length, 0)}개라서 {parts.length}묶음으로 나눴어요.</p>
      <div className="grid grid-cols-2 gap-3">
        {parts.map((ws, i) => (
          <GroupCard key={i} href={`/category/${slug}/${i + 1}`} title={`${c.name} ${i + 1}`} words={ws} stats={stats} />
        ))}
      </div>
    </main>
  );
}
