import { grammarWordCategories, grammarWordExercises, grammarWords } from "../data/grammar-words";
const minimums: Record<string, number> = { Connectors: 20, "Question Words": 20, Prepositions: 25, Pronouns: 20, "Time Words": 15, "Modal Verbs": 7, "Common Adverbs": 20 };
const errors: string[] = [];
for (const [category, minimum] of Object.entries(minimums)) { const count = grammarWords.filter(word => word.category === category).length; if (count < minimum) errors.push(`${category}: ${count}/${minimum}`); }
for (const word of grammarWords) if (!word.englishMeaning || !word.turkishMeaning || !word.sentenceRule || word.examples.length < 2 || !word.examples.some(example => example.context === "it")) errors.push(`Incomplete word: ${word.id}`);
for (const exercise of grammarWordExercises) { if (exercise.options && (!exercise.options.includes(exercise.answer) || new Set(exercise.options).size !== exercise.options.length)) errors.push(`Invalid options: ${exercise.id}`); if (exercise.type === "sentence_order" && (!exercise.words || exercise.words.join(" ") !== exercise.answer)) errors.push(`Invalid ordering: ${exercise.id}`); }
if (new Set(grammarWords.map(word => word.id)).size !== grammarWords.length) errors.push("Duplicate grammar-word IDs");
if (new Set(grammarWordExercises.map(item => item.id)).size !== grammarWordExercises.length) errors.push("Duplicate exercise IDs");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${grammarWords.length} grammar words in ${grammarWordCategories.length} categories and ${grammarWordExercises.length} exercises.`);
