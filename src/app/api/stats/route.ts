import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "no-db" }, { status: 503 });

  const rows = await db.attempt.findMany({
    where: { userId: "me" },
    select: { wordId: true, correct: true, at: true },
    orderBy: { at: "asc" },
  });

  // 단어별로 시도 수, 오답 수, 현재 연속 정답 수, 마지막 오답 시각을 계산해요.
  const stats: Record<string, { total: number; wrong: number; streak: number; lastWrongAt: number }> = {};
  for (const r of rows) {
    const s = (stats[r.wordId] ??= { total: 0, wrong: 0, streak: 0, lastWrongAt: 0 });
    s.total++;
    if (r.correct) {
      s.streak++;
    } else {
      s.wrong++;
      s.streak = 0;
      s.lastWrongAt = r.at.getTime();
    }
  }
  return NextResponse.json({ stats });
}
