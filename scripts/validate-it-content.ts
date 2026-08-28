import {
  allITVocabulary,
  allITCategories,
  itCategories,
  itSentences,
  itExercises,
  itVocabularyExercises,
} from "../data/it/catalog";
import { itDialogues, itDialogueExercises } from "../data/it/dialogues";
import { getITLearningContext } from "../data/it/learning";
import { vocabularyExercises } from "../lib/vocabulary-practice";
let failures = 0;
const fail = (message: string) => {
  console.error(message);
  failures++;
};
const keys = new Set<string>();
const normalizedTerms = new Set<string>();
for (const v of allITVocabulary) {
  if (keys.has(v.externalKey!))
    fail(`Duplicate vocabulary key: ${v.externalKey}`);
  keys.add(v.externalKey!);
  const normalized = v.german.toLocaleLowerCase("de-DE").replace(/[\s_-]+/g, "").replace(/[^a-z0-9äöüß]/g, "");
  if (normalizedTerms.has(`${v.level}:${normalized}`)) fail(`Normalized duplicate vocabulary: ${v.german}`);
  normalizedTerms.add(`${v.level}:${normalized}`);
  if (
    !v.german ||
    !v.englishMeaning ||
    !v.exampleSentence ||
    !v.exampleEnglishTranslation
  )
    fail(`Incomplete vocabulary: ${v.id}`);
  if (v.partOfSpeech === "noun" && (!v.article || !v.plural))
    fail(`Noun missing article/plural: ${v.id}`);
  if (v.source !== "custom_it") fail(`Wrong source: ${v.id}`);
  const generated = vocabularyExercises(v, allITVocabulary);
  if (generated.length < 2) fail(`Insufficient card practice: ${v.id}`);
  if (generated.some((exercise) => !exercise.technical))
    fail(`Generated practice is not marked technical: ${v.id}`);
  if (!getITLearningContext(v).examples.length)
    fail(`Card has no learning example: ${v.id}`);
}
const dialogueIds = new Set<string>();
for (const d of itDialogues) {
  if (dialogueIds.has(d.id)) fail(`Duplicate dialogue: ${d.id}`);
  dialogueIds.add(d.id);
  if (d.lines.length < 3 || d.lines.length > 8)
    fail(`Dialogue length: ${d.id}`);
  if (
    !d.participants?.length ||
    d.lines.some((l) => !l.speaker || !l.text || !l.englishTranslation)
  )
    fail(`Incomplete dialogue: ${d.id}`);
  if (
    !d.questions?.length ||
    !d.relatedExerciseIds?.every((id) =>
      itDialogueExercises.some((e) => e.id === id),
    )
  )
    fail(`Broken dialogue references: ${d.id}`);
  if (!d.vocabularyIds?.length || !d.vocabularyIds.every((id) => allITVocabulary.some((v) => v.id === id)))
    fail(`Broken dialogue vocabulary relationship: ${d.id}`);
}
for (const c of itCategories) {
  if (!allITVocabulary.some((v) => v.category === c))
    fail(`Category without vocabulary: ${c}`);
  if (!itDialogues.some((d) => d.category === c))
    fail(`Category without dialogues: ${c}`);
  if (!itSentences.some((s) => s.category === c))
    fail(`Category without sentences: ${c}`);
}
for (const category of allITCategories)
  if (!allITVocabulary.some((item) => item.category === category))
    fail(`Expanded category without vocabulary: ${category}`);
const exercises = [
  ...itExercises,
  ...itVocabularyExercises,
  ...itDialogueExercises,
];
for (const e of exercises) {
  if (!e.id || !e.prompt || !e.answer || !e.answerEnglish)
    fail(`Incomplete exercise: ${e.id}`);
  if (e.options && new Set(e.options).size !== e.options.length)
    fail(`Duplicate options: ${e.id}`);
}
console.log(
  `${allITVocabulary.length} IT vocabulary items ${JSON.stringify(Object.fromEntries(["A1", "A2", "B1"].map((l) => [l, allITVocabulary.filter((v) => v.level === l).length])))}`,
);
console.log(
  `${itDialogues.length} dialogues across ${itCategories.length} categories`,
);
console.log(`${itSentences.length} reusable sentences`);
console.log(
  `${exercises.length} IT exercises validated for the shared review engine`,
);
if (failures) throw new Error(`${failures} IT content validation failure(s)`);
