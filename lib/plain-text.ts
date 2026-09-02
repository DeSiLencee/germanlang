import type { VocabularyItem } from "../types";

const namedEntities: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };

/** Decode text for normal React interpolation. This never returns HTML markup. */
export function plainText(value?: string | null) {
  if (!value) return "";
  let result = value;
  for (let pass = 0; pass < 2; pass++) {
    result = result
      .replace(/&([a-z]+);/gi, (entity, name: string) => namedEntities[name.toLowerCase()] ?? entity)
      .replace(/&#(\d+);/g, (entity, code: string) => { const parsed = Number(code); return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 0x10ffff ? String.fromCodePoint(parsed) : entity; })
      .replace(/&#x([\da-f]+);/gi, (entity, code: string) => { const parsed = Number.parseInt(code, 16); return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 0x10ffff ? String.fromCodePoint(parsed) : entity; });
  }
  return result.replace(/<\/?[a-z][^>]*>/gi, " ").replace(/\s+/g, " ").trim();
}

function looksLikeDictionaryExample(value: string) {
  return /\bSAMPLE\b/i.test(value)
    || (/^(?:I|he|she|we|they|it|when|Andy|Tom)\b/i.test(value) && /[.!?]$/.test(value))
    || (/^(?:I|he|she|we|they)\b/i.test(value) && value.split(/\s+/).length >= 5);
}

/** Keep dictionary glosses separate from example sentences and placeholders. */
export function cleanVocabularyMeaning(value?: string | null) {
  const decoded = plainText(value);
  if (!decoded) return "";
  const parts = decoded.split(/\s*\/\s*/).map(part => part.trim()).filter(Boolean);
  const glosses = parts.filter(part => !looksLikeDictionaryExample(part));
  return (glosses.length ? glosses : parts.filter(part => !/\bSAMPLE\b/i.test(part))).join(" / ");
}

export function sanitizeVocabularyItem(word: VocabularyItem): VocabularyItem {
  return {
    ...word,
    german: plainText(word.german), article: plainText(word.article) || undefined,
    plural: plainText(word.plural) || undefined, partOfSpeech: plainText(word.partOfSpeech) || undefined,
    turkish: plainText(word.turkish) || undefined, englishMeaning: cleanVocabularyMeaning(word.englishMeaning),
    category: plainText(word.category), exampleSentence: plainText(word.exampleSentence) || undefined,
    exampleTranslation: plainText(word.exampleTranslation) || undefined,
    exampleEnglishTranslation: plainText(word.exampleEnglishTranslation) || undefined,
    examples: word.examples?.map(example => ({ german: plainText(example.german), english: plainText(example.english), turkish: plainText(example.turkish) || undefined })),
    relatedExpressions: word.relatedExpressions?.map(expression => ({ german: plainText(expression.german), english: plainText(expression.english) })),
  };
}
