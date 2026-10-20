import { notFound } from "next/navigation";
import { Session } from "@/components/Session";
import { CategoryParts } from "@/components/CategoryParts";
import { CATEGORIES, categoryBySlug, categoryParts } from "@/lib/words";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  const parts = categoryParts(slug);
  if (parts.length === 1) return <Session words={parts[0]} startWith="cards" title={c.name} />;
  return <CategoryParts slug={slug} />;
}
