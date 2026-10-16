import { N5_RAW } from "@/data/n5";
import { N5_EXAMPLES_RAW } from "@/data/n5-examples";

export type Word = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example?: Example;
};

export type Example = { text: string; reading: string; meaning: string };

// 예문은 n5-examples.ts에 같은 순서로 들어 있어요. 단어가 안 맞는 줄은 건너뛰어요
const EXAMPLES = N5_EXAMPLES_RAW.trim()
  .split("\n")
  .map((line) => line.split("|"));

export const SECTION_SIZE = 20;

export const WORDS: Word[] = N5_RAW.trim()
  .split("\n")
  .map((line, i) => {
    const [word, reading, meaning] = line.split("|");
    const ex = EXAMPLES[i];
    const example = ex && ex[0] === word && ex.length === 4 ? { text: ex[1], reading: ex[2], meaning: ex[3] } : undefined;
    return { id: `n5-${String(i + 1).padStart(4, "0")}`, word, reading, meaning, example };
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
