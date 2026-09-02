import type { VocabularyItem } from "@/types";
import { cleanVocabularyMeaning, plainText, sanitizeVocabularyItem } from "@/lib/plain-text";

export type LikeDuoExerciseType = "de_to_meaning" | "meaning_to_de" | "type_german" | "type_meaning" | "fill_blank" | "sentence_order";

export type LikeDuoQuestion = {
  id: string;
  type: LikeDuoExerciseType;
  prompt: string;
  display: string;
  answer: string;
  acceptedAnswers: string[];
  options?: string[];
  words?: string[];
  sentence?: string;
  sentenceTranslation?: string;
  hints: string[];
};

type Example = { german: string; translation: string };

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

export const germanLabel = (word: VocabularyItem) => [plainText(word.article), plainText(word.german)].filter(Boolean).join(" ");

function examplesFor(word: VocabularyItem): Example[] {
  const legacy = word.exampleSentence ? [{ german: word.exampleSentence, translation: word.exampleEnglishTranslation || word.exampleTranslation || "" }] : [];
  const expanded = (word.examples || []).map(example => ({ german: example.german, translation: example.english || example.turkish || "" }));
  return [...new Map([...legacy, ...expanded].filter(example => example.translation).map(example => [example.german, example])).values()];
}

function alternatives(meaning: string) {
  return cleanVocabularyMeaning(meaning).split(/\s*(?:\/|;|,|\bor\b)\s*/i).filter(Boolean);
}

function distractors(word: VocabularyItem, deck: VocabularyItem[], value: (item: VocabularyItem) => string) {
  const similar = deck.filter(item => item.id !== word.id && item.level === word.level && item.partOfSpeech === word.partOfSpeech);
  const sameLevel = deck.filter(item => item.id !== word.id && item.level === word.level);
  const all = deck.filter(item => item.id !== word.id);
  return [...new Set([...shuffle(similar), ...shuffle(sameLevel), ...shuffle(all)].map(value).filter(Boolean))].slice(0, 3);
}

function blankExample(sentence: string, word: string) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sentence.match(new RegExp(`\\b${escaped}\\b`, "iu"));
  return match ? sentence.replace(new RegExp(`\\b${escaped}\\b`, "iu"), "________") : undefined;
}

function sentenceWords(sentence: string) {
  return sentence.replace(/[.!?…]+$/u, "").split(/\s+/).filter(Boolean);
}

function maskTerms(text: string, terms: string[]) {
  return terms.reduce((result, term) => {
    const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escaped ? result.replace(new RegExp(`\\b${escaped}\\b`, "giu"), "___") : result;
  }, text);
}

function wordPattern(word: string) {
  return [...word].map((letter, index) => index === 0 || (index > 1 && index % 2 === 0) ? letter : "_").join(" ");
}

function germanHints(word: VocabularyItem) {
  const context = plainText(word.category).toLocaleLowerCase("en-US");
  const kind = word.partOfSpeech === "noun" || word.article ? "a noun" : word.partOfSpeech ? `a ${plainText(word.partOfSpeech)}` : "a word";
  const hints = [`This is ${kind} used when talking about ${context || "this situation"}.`];
  if (word.article) hints.push(`Article: ${plainText(word.article)}.`);
  else if (word.partOfSpeech === "verb") hints.push("Look for the German infinitive form.");
  hints.push(`It starts with “${word.german[0]}” and has ${[...word.german].length} letters.`);
  if (hints.length < 3 && [...word.german].length > 3) hints.push(`Word pattern: ${wordPattern(word.german)}`);
  return hints.slice(0, 3);
}

function meaningHints(word: VocabularyItem, example?: Example) {
  const answers = alternatives(word.englishMeaning);
  const hints = [`Think of the “${word.category}” context${word.partOfSpeech ? `; this is a ${word.partOfSpeech}` : ""}.`];
  if (example) {
    const context = maskTerms(example.translation, [word.englishMeaning, ...answers]);
    if (context.includes("___")) hints.push(`Example context: ${context}`);
  }
  const first = answers[0]?.trim()[0];
  if (first) hints.push(`The English meaning starts with “${first.toLocaleUpperCase("en-US")}”.`);
  return [...new Set(hints)].slice(0, 3);
}

function orderHints(words: string[]) {
  const hints = [`The sentence starts with “${words[0]}”.`];
  if (words.length > 2) hints.push("In a standard German statement, the conjugated verb is usually in the second position.");
  if (words.length > 3) hints.push(`The first two words are “${words.slice(0, 2).join(" ")}”.`);
  return hints;
}

function candidatesFor(word: VocabularyItem, deck: VocabularyItem[]): LikeDuoQuestion[] {
  const label = germanLabel(word);
  const meaningAnswers = alternatives(word.englishMeaning);
  const primaryExample = examplesFor(word)[0];
  const result: LikeDuoQuestion[] = [
    { id: `${word.id}-de-meaning`, type: "de_to_meaning", prompt: "What does this word mean?", display: label, answer: word.englishMeaning, acceptedAnswers: meaningAnswers, options: shuffle([word.englishMeaning, ...distractors(word, deck, item => item.englishMeaning)]), hints: meaningHints(word, primaryExample) },
    { id: `${word.id}-meaning-de`, type: "meaning_to_de", prompt: "Which German word means:", display: word.englishMeaning, answer: label, acceptedAnswers: [label, word.german], options: shuffle([label, ...distractors(word, deck, germanLabel)]), hints: germanHints(word) },
    { id: `${word.id}-type-de`, type: "type_german", prompt: "Type the German word", display: word.englishMeaning, answer: label, acceptedAnswers: [label, word.german], hints: germanHints(word) },
    { id: `${word.id}-type-meaning`, type: "type_meaning", prompt: "Type the meaning", display: label, answer: word.englishMeaning, acceptedAnswers: meaningAnswers, hints: meaningHints(word, primaryExample) },
  ];

  examplesFor(word).forEach((example, index) => {
    const blank = blankExample(example.german, word.german);
    if (blank) result.push({ id: `${word.id}-blank-${index}`, type: "fill_blank", prompt: "What completes this sentence?", display: blank, answer: word.german, acceptedAnswers: [word.german, label], options: shuffle([word.german, ...distractors(word, deck, item => item.german)]), sentence: example.german, sentenceTranslation: example.translation, hints: [`Sentence meaning: ${maskTerms(example.translation, [word.englishMeaning, ...meaningAnswers])}`, `The missing German word starts with “${word.german[0]}”.`, `It has ${[...word.german].length} letters.`] });
    const words = sentenceWords(example.german);
    if (words.length > 2 && words.length <= 14) result.push({ id: `${word.id}-order-${index}`, type: "sentence_order", prompt: "Put the words in the correct order", display: example.translation, answer: words.join(" "), acceptedAnswers: [example.german], words: shuffle(words), sentence: example.german, sentenceTranslation: example.translation, hints: orderHints(words) });
  });
  return result;
}

export function buildLikeDuoSession(deck: VocabularyItem[], count: number): LikeDuoQuestion[] {
  const usable = deck.map(sanitizeVocabularyItem).filter(word => word.german && word.englishMeaning);
  const words = shuffle(usable);
  const chosen: LikeDuoQuestion[] = [];
  const previousTypes: LikeDuoExerciseType[] = [];
  let cursor = 0;
  while (chosen.length < count && cursor < words.length * 3) {
    const word = words[cursor % words.length];
    const candidates = shuffle(candidatesFor(word, usable)).filter(question => question.options === undefined || question.options.length >= 4);
    const different = candidates.find(question => !previousTypes.slice(-2).includes(question.type)) || candidates[0];
    if (different && !chosen.some(question => question.id === different.id)) {
      chosen.push(different);
      previousTypes.push(different.type);
    }
    cursor += 1;
  }
  return chosen;
}

export function normalizeLikeDuoAnswer(value: string) {
  return value.toLocaleLowerCase("de-DE").normalize("NFKC").replace(/[.!?,;:„“\"']/g, "").replace(/\s+/g, " ").trim();
}

export function isLikeDuoAnswerCorrect(question: LikeDuoQuestion, answer: string) {
  const normalized = normalizeLikeDuoAnswer(answer);
  return [question.answer, ...question.acceptedAnswers].some(candidate => normalizeLikeDuoAnswer(candidate) === normalized);
}
