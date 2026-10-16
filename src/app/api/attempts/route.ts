import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { WORD_BY_ID } from "@/lib/words";

export const dynamic = "force-dynamic";

type In = { id?: unknown; wordId?: unknown; correct?: unknown; at?: unknown };

export async function POST(req: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "no-db" }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { attempts?: In[] } | null;
  if (!body || !Array.isArray(body.attempts) || body.attempts.length > 500) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const rows = [];
  for (const a of body.attempts) {
    if (
      typeof a.id !== "string" ||
      a.id.length > 64 ||
      typeof a.wordId !== "string" ||
      !WORD_BY_ID.has(a.wordId) ||
      typeof a.correct !== "boolean" ||
      typeof a.at !== "number"
    ) {
      continue;
    }
    rows.push({ id: a.id, wordId: a.wordId, correct: a.correct, at: new Date(a.at) });
  }

  await db.attempt.createMany({ data: rows, skipDuplicates: true });
  return NextResponse.json({ saved: rows.length });
}
