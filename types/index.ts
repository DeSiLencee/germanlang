export type Level = "A1" | "A2" | "B1";
export type VocabularyItem = {
  id: string;
  german: string;
  article?: string;
  plural?: string;
  partOfSpeech?: string;
  turkish?: string;
  englishMeaning: string;
  level: Level;
  category: string;
  source?: "goethe" | "custom" | "german-for-it" | "custom_it";
  sourceType?: "wordlist" | "curated";
  externalKey?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  exampleEnglishTranslation?: string;
  tags: string[];
  technical?: boolean;
  examples?: { german: string; english: string; turkish?: string }[];
  relatedExpressions?: { german: string; english: string }[];
  relatedVocabularyIds?: string[];
  dialogueIds?: string[];
};
export type ExerciseType =
  | "fill_blank"
  | "multiple_choice"
  | "tr_to_de"
  | "de_to_tr"
  | "sentence_order"
  | "vocabulary"
  | "dialogue_completion"
  | "error_correction";
export type Exercise = {
  id: string;
  type: ExerciseType;
  level: Level;
  category: string;
  prompt: string;
  englishHelp?: string;
  answer: string;
  answerEnglish?: string;
  acceptedAnswers?: string[];
  options?: string[];
  words?: string[];
  explanation: string;
  translation?: string;
  technical?: boolean;
};
export type Dialogue = {
  id: string;
  title: string;
  level: Level;
  category: string;
  technical?: boolean;
  participants?: string[];
  vocabularyIds?: string[];
  relatedExerciseIds?: string[];
  questions?: { prompt: string; answer: string; options?: string[] }[];
  lines: {
    speaker: string;
    text: string;
    translation?: string;
    englishTranslation?: string;
  }[];
};
export type ITSentence = {
  id: string;
  german: string;
  english: string;
  level: Level;
  category: string;
  tags: string[];
};
export type GrammarExample={german:string;english:string;context:'daily'|'it'};
export type GrammarTopic={id:string;slug:string;titleGerman:string;titleEnglish:string;level:Level;category:string;explanationEnglish:string;structure:string;examples:GrammarExample[];importantNotes:string[];commonMistakes:{wrong:string;correct:string;explanation:string}[];relatedVocabulary?:string[];tags:string[];exerciseIds:string[]};
export type GrammarWord = { id: string; german: string; englishMeaning: string; turkishMeaning: string; level: Level; category: string; shortExplanationEnglish: string; sentenceRule: string; case?: string; examples: { german: string; english: string; turkish?: string; context: "daily" | "it" }[]; commonMistakes?: string[]; relatedItems: string[]; tags: string[]; };
export type Lesson = {
  id: string;
  title: string;
  level: Level;
  category: string;
  description: string;
  englishDescription?: string;
  vocabularyIds: string[];
  exerciseIds: string[];
  grammar: string;
  englishExplanation?: string;
  duration: number;
};
export type ReviewItem = {
  exerciseId: string;
  exercise?: Exercise;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  difficulty: number;
};
export type VocabularyStudyStatus = "new" | "learning" | "learned" | "review";
export type VocabularyReviewState = {
  status: VocabularyStudyStatus;
  attempts: number;
  correct: number;
  lastReviewedAt: string;
  nextReviewAt: string;
};
export type Progress = {
  currentLevel?: Level;
  completedLessons: string[];
  attempts: number;
  correct: number;
  learnedWords: string[];
  learnedWordLevels?: Partial<Record<Level, number>>;
  completedDialogues?: string[];
  itAttempts?: number;
  itCorrect?: number;
  itCategoryStats?: Record<string, { attempts: number; correct: number }>;
  grammarStats?:Record<string,{attempts:number;correct:number}>;
  grammarWordStats?: Record<string, { attempts: number; correct: number }>;
  vocabularyReview?: Record<string, VocabularyReviewState>;
  review: ReviewItem[];
  streak: number;
  lastActive: string;
  dailyCount: number;
  continuation?: { type: string; label: string; href: string; level?: Level; category?: string; contentId?: string; updatedAt: string };
};
