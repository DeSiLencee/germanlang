import { Exercise, Level } from "@/types";
export type PracticeTopic = "Mixed" | "Fill in the Blank" | "Sentence Ordering" | "Connectors" | "Question Words" | "Articles" | "Prepositions" | "Verbs" | "Modal Verbs" | "Cases" | "IT German";
export const practiceTopics: PracticeTopic[] = ["Mixed", "Fill in the Blank", "Sentence Ordering", "Connectors", "Question Words", "Articles", "Prepositions", "Verbs", "Modal Verbs", "Cases", "IT German"];
const shuffle = <T,>(items: T[]) => { const result = [...items]; for (let index = result.length - 1; index > 0; index--) { const target = Math.floor(Math.random() * (index + 1)); [result[index], result[target]] = [result[target], result[index]]; } return result; };
const unique = (items: Exercise[]) => [...new Map(items.map(item => [item.id, item])).values()];
export function buildPracticeSession(all: Exercise[], level: Level | "Mixed", topic: PracticeTopic, count: number, review: Exercise[] = []) {
  let pool = all.filter(exercise => level === "Mixed" || exercise.level === level);
  if (topic === "IT German") pool = pool.filter(exercise => exercise.technical);
  else if (topic === "Sentence Ordering") pool = pool.filter(exercise => exercise.type === "sentence_order");
  else if (topic === "Fill in the Blank") pool = pool.filter(exercise => exercise.type === "fill_blank" || (exercise.type === "multiple_choice" && exercise.prompt.includes("___")));
  else if (topic !== "Mixed") {
    const terms: Record<Exclude<PracticeTopic, "Mixed" | "Fill in the Blank" | "Sentence Ordering" | "IT German">, string[]> = { Connectors: ["connector", "subordinate"], "Question Words": ["question"], Articles: ["article"], Prepositions: ["preposition"], Verbs: ["verb", "tense"], "Modal Verbs": ["modal"], Cases: ["case", "accusative", "dative"] };
    const needles = terms[topic].map(value => value.toLowerCase());
    pool = pool.filter(exercise => needles.some(needle => exercise.category.toLowerCase().includes(needle) || exercise.explanation.toLowerCase().includes(needle)));
  }
  if (topic !== "Mixed") return shuffle(unique(pool)).slice(0, count);
  const buckets = [pool.filter(exercise => exercise.type === "vocabulary" || exercise.id.includes("vocab")), pool.filter(exercise => exercise.type === "fill_blank" || (exercise.type === "multiple_choice" && exercise.prompt.includes("___"))), pool.filter(exercise => exercise.id.startsWith("grammar-")), pool.filter(exercise => exercise.type === "tr_to_de" || exercise.type === "de_to_tr"), pool.filter(exercise => exercise.type === "sentence_order"), pool.filter(exercise => exercise.type === "dialogue_completion"), review];
  const targets = [4, 4, 3, 3, 2, 2, 2];
  const selected = unique(buckets.flatMap((bucket, index) => shuffle(bucket).slice(0, Math.ceil(targets[index] * count / 20))));
  const remaining = shuffle(pool.filter(exercise => !selected.some(item => item.id === exercise.id)));
  return shuffle([...selected, ...remaining.slice(0, Math.max(0, count - selected.length))]).slice(0, count);
}
export { shuffle as shuffleExercises };
