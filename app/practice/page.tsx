"use client";
import { useState } from "react";
import { PracticeSession } from "@/components/PracticeSession";
import { exercises } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { buildPracticeSession, practiceTopics, PracticeTopic } from "@/lib/practice-session";
import { Exercise, Level } from "@/types";
import { supplementalPracticeExercises } from "@/data/practice/supplemental";
export default function PracticePage() {
  const [level, setLevel] = useState<Level | "Mixed">("A2");
  const [topic, setTopic] = useState<PracticeTopic>("Mixed");
  const [count, setCount] = useState(20);
  const [session, setSession] = useState<Exercise[]>([]);
  const { progress, setContinuation } = useProgress();
  const practicePool = [...exercises, ...supplementalPracticeExercises];
  const reviewExercises = progress.review.map(item => exercises.find(exercise => exercise.id === item.exerciseId) || item.exercise).filter(item => item !== undefined);
  const start = () => { setContinuation({ type: "practice", label: `${topic} Practice`, href: "/practice", level: level === "Mixed" ? undefined : level, category: topic, updatedAt: new Date().toISOString() }); setSession(buildPracticeSession(practicePool, level, topic, count, reviewExercises)); };
  if (session.length) return <div className="page"><PracticeSession title={`${topic} · ${level}`} initialExercises={session} onDone={() => setSession([])} /></div>;
  const available = buildPracticeSession(practicePool, level, topic, 1000, reviewExercises).length;
  return <div className="page app-page"><div className="simple-heading"><h1>Practice</h1><p>Choose a focus and start a balanced session.</p></div><section className="card start-panel"><label>Level</label><div className="segmented">{(["A1", "A2", "B1", "Mixed"] as const).map(item => <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>{item}</button>)}</div><label htmlFor="practice-topic">Topic</label><select id="practice-topic" value={topic} onChange={event => setTopic(event.target.value as PracticeTopic)}>{practiceTopics.map(item => <option key={item}>{item}</option>)}</select><label>Questions</label><div className="segmented">{[10, 20, 30].map(item => <button className={count === item ? "active" : ""} key={item} onClick={() => setCount(item)}>{item}</button>)}</div><button className="primary start-main-action" disabled={!available} onClick={start}>Start {Math.min(count, available)} Questions →</button><small>{available} unique questions available for this selection.</small></section><div className="quick-practice-links"><button onClick={() => { setTopic("Fill in the Blank"); setCount(20); }}>Fill in the Blank</button><button onClick={() => { setTopic("Connectors"); setCount(20); }}>Connectors</button><button onClick={() => { setTopic("Question Words"); setCount(20); }}>Question Words</button><button onClick={() => { setTopic("Articles"); setCount(20); }}>Articles</button><button onClick={() => { setTopic("IT German"); setCount(20); }}>IT German</button></div></div>;
}
