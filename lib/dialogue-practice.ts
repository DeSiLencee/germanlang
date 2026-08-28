import { Dialogue, Exercise } from "@/types";
export function buildDialoguePractice(dialogue: Dialogue): Exercise[] {
  const usable = dialogue.lines.filter(line => line.text && line.englishTranslation);
  const translations = usable.slice(0, 3).map((line, index): Exercise => ({ id: `dialogue-${dialogue.id}-translation-${index}`, type: "tr_to_de", level: dialogue.level, category: dialogue.category, prompt: line.englishTranslation!, answer: line.text, acceptedAnswers: [line.text.replace(/[.!?]$/, "")], answerEnglish: line.englishTranslation, explanation: `In this dialogue, ${line.speaker} says: ${line.text}`, technical: dialogue.technical }));
  const orders = usable.slice(-2).map((line, index): Exercise => ({ id: `dialogue-${dialogue.id}-order-${index}`, type: "sentence_order", level: dialogue.level, category: dialogue.category, prompt: `Build ${line.speaker}’s sentence.`, englishHelp: line.englishTranslation, answer: line.text, answerEnglish: line.englishTranslation, words: line.text.replace(/[.!?]/g, "").split(" "), explanation: "This word order matches the original conversation.", technical: dialogue.technical }));
  const question = dialogue.questions?.[0];
  const comprehension: Exercise[] = question ? [{ id: `dialogue-${dialogue.id}-comprehension`, type: "multiple_choice", level: dialogue.level, category: dialogue.category, prompt: question.prompt, answer: question.answer, options: question.options, answerEnglish: question.answer, explanation: "This answer matches the meaning of the dialogue.", technical: dialogue.technical }] : [];
  return [...translations, ...orders, ...comprehension].slice(0, 6);
}
