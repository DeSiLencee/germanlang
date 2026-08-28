"use client";
import Link from "next/link";
import { useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { SessionHeader } from "@/components/SessionHeader";
import { Exercise } from "@/types";
import { shuffleExercises } from "@/lib/practice-session";
export function PracticeSession({ title, initialExercises, onDone, exitHref = "/practice" }: { title: string; initialExercises: Exercise[]; onDone?: () => void; exitHref?: string }) {
  const [session, setSession] = useState(initialExercises);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState<Exercise[]>([]);
  if (index < session.length) return <div className="focused-session"><SessionHeader title={title} current={index + 1} total={session.length} exitHref={exitHref} hasProgress={index > 0} /><div className="bar session-progress"><i style={{ width: `${index / session.length * 100}%` }} /></div><ExerciseCard key={session[index].id} exercise={session[index]} onDone={result => { if (result) setCorrect(value => value + 1); else setMistakes(value => [...value, session[index]]); setIndex(value => value + 1); }} /></div>;
  const accuracy = session.length ? Math.round(correct / session.length * 100) : 0;
  const restart = (next: Exercise[]) => { setSession(shuffleExercises(next)); setIndex(0); setCorrect(0); setMistakes([]); };
  return <div className="card session-summary"><div className="deck-complete-mark">{accuracy >= 70 ? "✓" : "↻"}</div><h1>Practice Complete</h1><strong className="session-score">{correct} / {session.length}</strong><p>{accuracy}% accuracy</p>{mistakes.length > 0 && <div className="needs-review"><small>Needs review</small>{mistakes.slice(0, 8).map(exercise => <span key={exercise.id}>{exercise.answer}</span>)}</div>}<div className="deck-summary-actions">{mistakes.length > 0 && <button className="primary" onClick={() => restart(mistakes)}>Practice Mistakes</button>}<button className="secondary" onClick={() => restart(initialExercises)}>Practice Again</button>{onDone ? <button className="secondary" onClick={onDone}>Done</button> : <Link className="button secondary" href="/">Done</Link>}</div></div>;
}
