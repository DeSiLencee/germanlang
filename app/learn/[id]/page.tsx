"use client";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import Link from "next/link";
import { lessons, exercises } from "@/data/content";
import { vocabulary } from "@/data/vocabulary";
import { ExerciseCard } from "@/components/ExerciseCard";
import { SessionHeader } from "@/components/SessionHeader";
import { useProgress } from "@/lib/progress";
export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lesson = lessons.find(item => item.id === id);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const { completeLesson } = useProgress();
  if (!lesson) return notFound();
  const questions = lesson.exerciseIds.map(exerciseId => exercises.find(exercise => exercise.id === exerciseId)).filter(exercise => exercise !== undefined);
  if (started && index < questions.length) return <div className="page focused-session"><SessionHeader title={lesson.title} current={index + 1} total={questions.length} exitHref={`/learn/${lesson.id}`} hasProgress={index > 0} /><ExerciseCard exercise={questions[index]} onDone={() => { if (index + 1 === questions.length) completeLesson(lesson.id); setIndex(value => value + 1); }} /></div>;
  if (started) return <div className="page"><div className="card review-empty"><b>✓</b><h1>Lektion abgeschlossen!</h1><p>Gut gemacht. Dein Fortschritt wurde gespeichert.</p><Link href="/learn" className="button primary">Weitere Lektionen</Link></div></div>;
  return <div className="page"><div className="page-title"><div><div className="eyebrow">{lesson.level} · {lesson.category}</div><h1>{lesson.title}</h1><p>{lesson.description}</p><p className="english-help"><span>English</span>{lesson.englishDescription}</p></div></div><div className="grid two-col"><div className="card"><h3>Wortschatz</h3>{lesson.vocabularyIds.map(wordId => vocabulary.find(word => word.id === wordId)).filter(word => word !== undefined).map(word => <div key={word.id} className="lesson-word"><b>{word.article} {word.german}</b><small>English: {word.englishMeaning}</small><small>Türkçe: {word.turkish}</small></div>)}</div><div className="card"><div className="eyebrow">Grammatik</div><h3>{lesson.grammar}</h3><p className="english-help"><span>English explanation</span>{lesson.englishExplanation}</p><p>{questions.length} Übungen · etwa {lesson.duration} Minuten</p><button className="primary" onClick={() => setStarted(true)}>Lektion starten →</button></div></div></div>;
}
