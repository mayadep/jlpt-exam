import { notFound } from "next/navigation";
import { Session } from "@/components/Session";
import { categoryBySlug, categoryParts } from "@/lib/words";

export default async function CategoryPartPage({ params }: { params: Promise<{ slug: string; part: string }> }) {
  const { slug, part } = await params;
  const c = categoryBySlug(slug);
  const parts = categoryParts(slug);
  const n = Number(part);
  if (!c || !Number.isInteger(n) || n < 1 || n > parts.length) notFound();
  return <Session words={parts[n - 1]} startWith="cards" title={`${c.name} ${n}`} />;
}
