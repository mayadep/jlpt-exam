"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Session } from "@/components/Session";
import { reviewList, useStats } from "@/lib/progress";
import { WORD_BY_ID, shuffle, type Word } from "@/lib/words";

const REVIEW_SIZE = 20;

export function ReviewSession() {
  const { stats, ready } = useStats();
  // 오답률이 높은 단어를 먼저 뽑아요
  const words = useMemo(() => {
    if (!ready) return null;
    const top = reviewList(stats).slice(0, REVIEW_SIZE);
    return shuffle(top.map((r) => WORD_BY_ID.get(r.id)).filter((w): w is Word => !!w));
    // 시작할 때 한 번만 정하고, 풀이 중 통계가 바뀌어도 문제 목록은 유지해요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!words) return <p className="py-20 text-center text-slate-500">불러오는 중…</p>;
  if (words.length === 0) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-lg font-semibold">복습할 오답이 없어요 🎉</p>
        <p className="text-sm text-slate-500">주제별 학습에서 문제를 풀고 틀린 단어가 생기면 여기에 모여요.</p>
        <Link href="/" className="btn-primary inline-block">홈으로</Link>
      </div>
    );
  }
  return <Session words={words} startWith="quiz" title="오답 복습" />;
}
