import Link from "next/link";
import { accuracy, type StatMap } from "@/lib/progress";
import type { Word } from "@/lib/words";

// 주제·묶음 선택 카드: 학습한 단어 수와 정답률을 보여줘요
export function GroupCard({ href, title, subtitle, words, stats }: { href: string; title: string; subtitle?: string; words: Word[]; stats: StatMap }) {
  const tried = words.filter((w) => stats[w.id]).length;
  const t = words.reduce((s, w) => s + (stats[w.id]?.total ?? 0), 0);
  const wr = words.reduce((s, w) => s + (stats[w.id]?.wrong ?? 0), 0);
  const acc = t ? accuracy({ total: t, wrong: wr, streak: 0, lastWrongAt: 0 }) : null;
  return (
    <Link href={href} className="card p-3">
      <p className="font-bold">{title}</p>
      <p className="truncate text-xs text-slate-500">{subtitle ?? `${words[0].word} ~ ${words[words.length - 1].word}`}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
        <div className="h-full bg-indigo-500" style={{ width: `${(tried / words.length) * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{tried}/{words.length}개 학습{acc !== null && ` · 정답률 ${Math.round(acc * 100)}%`}</p>
    </Link>
  );
}
