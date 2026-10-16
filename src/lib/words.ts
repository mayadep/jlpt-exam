import { N5_RAW } from "@/data/n5";

export type Word = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
};

export const SECTION_SIZE = 20;

export const WORDS: Word[] = N5_RAW.trim()
  .split("\n")
  .map((line, i) => {
    const [word, reading, meaning] = line.split("|");
    return { id: `n5-${String(i + 1).padStart(4, "0")}`, word, reading, meaning };
  });

export const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));

export const SECTION_COUNT = Math.ceil(WORDS.length / SECTION_SIZE);

export function sectionWords(section: number): Word[] {
  return WORDS.slice((section - 1) * SECTION_SIZE, section * SECTION_SIZE);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
