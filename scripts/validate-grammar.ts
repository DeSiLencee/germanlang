import { grammarExercises, grammarTopics } from "../data/grammar/topics";

const errors: string[] = [];
const ids = new Set<string>();
for (const topic of grammarTopics) {
  if (ids.has(topic.id)) errors.push(`Duplicate topic id: ${topic.id}`);
  ids.add(topic.id);
  if (!topic.titleGerman || !topic.titleEnglish || !topic.explanationEnglish || !topic.structure) errors.push(`${topic.id}: incomplete topic metadata`);
  if (topic.examples.length < 3) errors.push(`${topic.id}: fewer than 3 examples`);
  if (!topic.examples.some(example => example.context === "it")) errors.push(`${topic.id}: missing IT example`);
  if (topic.examples.some(example => !example.german || !example.english)) errors.push(`${topic.id}: untranslated example`);
  if (!topic.importantNotes.length || !topic.commonMistakes.length) errors.push(`${topic.id}: missing notes or common mistakes`);
}
const exerciseIds = new Set<string>();
for (const exercise of grammarExercises) {
  if (exerciseIds.has(exercise.id)) errors.push(`Duplicate exercise id: ${exercise.id}`);
  exerciseIds.add(exercise.id);
  if (!exercise.prompt || !exercise.answer || !exercise.explanation) errors.push(`${exercise.id}: incomplete exercise`);
  if (exercise.options && (!exercise.options.includes(exercise.answer) || new Set(exercise.options).size !== exercise.options.length)) errors.push(`${exercise.id}: invalid choices`);
  if (exercise.type === "sentence_order" && (!exercise.words?.length || !exercise.answerEnglish)) errors.push(`${exercise.id}: incomplete ordering exercise`);
}
for (const topic of grammarTopics) for (const exerciseId of topic.exerciseIds) if (!exerciseIds.has(exerciseId)) errors.push(`${topic.id}: missing exercise ${exerciseId}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const byLevel = (["A1", "A2", "B1"] as const).map(level => `${level}: ${grammarTopics.filter(topic => topic.level === level).length} topics / ${grammarExercises.filter(exercise => exercise.level === level).length} exercises`);
const dailyExamples = grammarTopics.flatMap(topic => topic.examples).filter(example => example.context === "daily").length;
const itExamples = grammarTopics.flatMap(topic => topic.examples).filter(example => example.context === "it").length;
console.log(`Grammar validation passed\n${byLevel.join("\n")}\n${dailyExamples} daily-life examples / ${itExamples} IT examples`);
