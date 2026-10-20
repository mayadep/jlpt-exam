import { N5_RAW } from "@/data/n5";
import { N5_EXAMPLES_RAW } from "@/data/n5-examples";

export type Word = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  category: string;
  example?: Example;
};

export type Example = { text: string; reading: string; meaning: string };

// 예문은 n5-examples.ts에 같은 순서로 들어 있어요. 단어가 안 맞는 줄은 건너뛰어요
const EXAMPLES = N5_EXAMPLES_RAW.trim()
  .split("\n")
  .map((line) => line.split("|"));

export const SECTION_SIZE = 20;

// 주제(분류). 단어마다 n5.ts의 네 번째 칸에 이 이름 중 하나가 적혀 있어요
export const CATEGORIES = [
  { slug: "people", name: "사람·직업" },
  { slug: "family", name: "가족·호칭" },
  { slug: "numbers", name: "숫자·세기" },
  { slug: "time", name: "시간·날짜" },
  { slug: "nature", name: "계절·자연·동물" },
  { slug: "body", name: "몸·건강" },
  { slug: "food", name: "음식" },
  { slug: "home", name: "집·옷·생활" },
  { slug: "things", name: "물건·문구" },
  { slug: "school", name: "학교·공부" },
  { slug: "places", name: "장소·건물" },
  { slug: "position", name: "위치·방향" },
  { slug: "transport", name: "교통·여행" },
  { slug: "verbs", name: "동사" },
  { slug: "adjectives", name: "형용사" },
  { slug: "adverbs", name: "부사·접속사" },
  { slug: "questions", name: "의문사·지시어" },
  { slug: "greetings", name: "인사·표현" },
] as const;

export type Category = (typeof CATEGORIES)[number];

export const WORDS: Word[] = N5_RAW.trim()
  .split("\n")
  .map((line, i) => {
    const [word, reading, meaning, category = ""] = line.split("|");
    const ex = EXAMPLES[i];
    const example = ex && ex[0] === word && ex.length === 4 ? { text: ex[1], reading: ex[2], meaning: ex[3] } : undefined;
    return { id: `n5-${String(i + 1).padStart(4, "0")}`, word, reading, meaning, category, example };
  });

// 주제 이름이 틀리면 빌드할 때 바로 알 수 있게 해요
const unknown = WORDS.filter((w) => !CATEGORIES.some((c) => c.name === w.category));
if (unknown.length > 0) throw new Error(`주제가 없거나 틀린 단어: ${unknown.map((w) => `${w.word}(${w.category})`).join(", ")}`);

export const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));

export const SECTION_COUNT = Math.ceil(WORDS.length / SECTION_SIZE);

export function sectionWords(section: number): Word[] {
  return WORDS.slice((section - 1) * SECTION_SIZE, section * SECTION_SIZE);
}

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryWords(slug: string): Word[] {
  const c = categoryBySlug(slug);
  return c ? WORDS.filter((w) => w.category === c.name) : [];
}

// 단어가 많은 주제는 20개 이하로 고르게 나눠서 학습해요
export function categoryParts(slug: string): Word[][] {
  const ws = categoryWords(slug);
  const count = Math.ceil(ws.length / SECTION_SIZE);
  return Array.from({ length: count }, (_, i) => ws.slice(Math.round((i * ws.length) / count), Math.round(((i + 1) * ws.length) / count)));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
