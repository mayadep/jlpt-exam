import { notFound } from "next/navigation";
import { Session } from "@/components/Session";
import { SECTION_COUNT, sectionWords } from "@/lib/words";

export default async function StudyPage({ params }: { params: Promise<{ section: string }> }) {
  const n = Number((await params).section);
  if (!Number.isInteger(n) || n < 1 || n > SECTION_COUNT) notFound();
  return <Session words={sectionWords(n)} startWith="cards" title={`구간 ${n}`} />;
}
