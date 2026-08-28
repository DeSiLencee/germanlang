import { Exercise, VocabularyItem } from "@/types";
const label = (word: VocabularyItem) => [word.article, word.german].filter(Boolean).join(" ");
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const choices = (word: VocabularyItem, deck: VocabularyItem[], value: (item: VocabularyItem) => string | undefined) => {
  const preferred = deck.filter(item => item.id !== word.id && item.level === word.level && item.partOfSpeech === word.partOfSpeech);
  const fallback = deck.filter(item => item.id !== word.id && item.level === word.level);
  return [...new Set([...preferred, ...fallback].map(value).filter((item): item is string => !!item))].slice(0, 3);
};
const options = (answer: string, distractors: string[]) => [answer, ...distractors].sort((a, b) => a.localeCompare(b));
export function vocabularyExercises(word: VocabularyItem, deck: VocabularyItem[]): Exercise[] {
  const result: Exercise[] = [];
  const simpleMeaning = word.englishMeaning && !/[,;/]|\bor\b/i.test(word.englishMeaning);
  if (simpleMeaning) result.push({ id: `vocab-${word.id}-de-en`, type: "multiple_choice", level: word.level, category: word.category, prompt: `${label(word)}\nWhat does this mean?`, answer: word.englishMeaning, options: options(word.englishMeaning, choices(word, deck, item => item.englishMeaning)), explanation: `${label(word)} means “${word.englishMeaning}”.`, answerEnglish: word.englishMeaning });
  if (simpleMeaning) result.push({ id: `vocab-${word.id}-en-de`, type: "multiple_choice", level: word.level, category: word.category, prompt: `${word.englishMeaning}\nWhich German word matches?`, answer: label(word), options: options(label(word), choices(word, deck, label)), explanation: `The German expression is ${label(word)}.`, answerEnglish: word.englishMeaning });
  if (word.article && ["der", "die", "das"].includes(word.article)) result.push({ id: `vocab-${word.id}-article`, type: "multiple_choice", level: word.level, category: word.category, prompt: `_____ ${word.german}`, answer: word.article, options: ["der", "die", "das"], explanation: `The noun is ${label(word)}.`, answerEnglish: word.englishMeaning });
  if (word.plural && word.plural !== "—" && word.plural !== "-") result.push({ id: `vocab-${word.id}-plural`, type: "fill_blank", level: word.level, category: word.category, prompt: `What is the plural of “${label(word)}”?`, answer: word.plural.replace(/^die\s+/i, ""), acceptedAnswers: [word.plural, `die ${word.plural.replace(/^die\s+/i, "")}`], explanation: `The plural is ${word.plural}.`, answerEnglish: word.englishMeaning });
  if (word.exampleSentence && word.exampleEnglishTranslation) result.push({ id: `vocab-${word.id}-translation`, type: "tr_to_de", level: word.level, category: word.category, prompt: word.exampleEnglishTranslation, answer: word.exampleSentence, acceptedAnswers: [word.exampleSentence.replace(/[.!?]$/, "")], explanation: `A natural German sentence is: ${word.exampleSentence}`, answerEnglish: word.exampleEnglishTranslation, technical: word.technical });
  if (word.exampleSentence && new RegExp(escapeRegExp(word.german), "iu").test(word.exampleSentence)) { const prompt = word.exampleSentence.replace(new RegExp(escapeRegExp(word.german), "iu"), "_____"); result.push({ id: `vocab-${word.id}-context`, type: "multiple_choice", level: word.level, category: word.category, prompt, englishHelp: word.exampleEnglishTranslation, answer: word.german, acceptedAnswers: [label(word)], options: options(word.german, choices(word, deck, item => item.german)), explanation: `The complete sentence is: ${word.exampleSentence}`, answerEnglish: word.exampleEnglishTranslation || word.englishMeaning }); }
  return result.slice(0, word.technical ? 6 : 5).map(exercise => ({ ...exercise, technical: word.technical }));
}
