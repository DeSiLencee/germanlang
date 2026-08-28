"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import {
  grammarCategories,
  grammarExercises,
  grammarTopics,
} from "@/data/grammar/topics";
import { useProgress } from "@/lib/progress";
import { Level } from "@/types";
import { SessionHeader } from "@/components/SessionHeader";

export default function GrammarPage() {
  const [level, setLevel] = useState<Level | "All">("All");
  const [category, setCategory] = useState("All");
  const [count, setCount] = useState(10);
  const [practice, setPractice] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const { progress } = useProgress();
  const topics = grammarTopics.filter(
    (topic) =>
      (level === "All" || topic.level === level) &&
      (category === "All" || topic.category === category),
  );
  const session = useMemo(() => {
    const pool = grammarExercises.filter(
      (exercise) =>
        (level === "All" || exercise.level === level) &&
        (category === "All" || exercise.category === category),
    );
    return [...pool]
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, Math.min(count, pool.length));
  }, [category, count, level]);

  if (practice && index < session.length)
    return (
      <div className="page focused-session">
        <SessionHeader title={`Grammar · ${level}`} current={index + 1} total={session.length} exitHref="/grammar" hasProgress={index > 0} />
        <div className="bar grammar-session-bar">
          <i style={{ width: `${(index / session.length) * 100}%` }} />
        </div>
        <ExerciseCard
          key={session[index].id}
          exercise={session[index]}
          onDone={(correct) => {
            setScore((value) => value + (correct ? 1 : 0));
            setIndex((value) => value + 1);
          }}
        />
      </div>
    );

  if (practice)
    return (
      <div className="page">
        <div className="card review-empty">
          <b>✓</b>
          <h1>Grammar practice complete</h1>
          <p>
            <strong>
              {score} / {session.length}
            </strong>{" "}
            correct
          </p>
          <button
            className="primary"
            onClick={() => {
              setPractice(false);
              setIndex(0);
              setScore(0);
            }}
          >
            Back to grammar
          </button>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h1>Grammar &amp; Sentence Building</h1>
          <p>Build clear German sentences from A1 foundations to B1.</p>
        </div>
      </div>
      <section className="card grammar-practice-panel">
        <div>
          <div className="eyebrow">Quick Grammar Practice</div>
          <h2>Practice the structures you are learning.</h2>
          <p>Choose a level, category, and session length.</p>
        </div>
        <div className="grammar-practice-controls">
          <select value={level} onChange={(event) => setLevel(event.target.value as Level | "All")}>
            <option value="All">All levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="All">All categories</option>
            {grammarCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
            <option value={10}>10 questions</option>
            <option value={20}>20 questions</option>
            <option value={30}>30 questions</option>
          </select>
          <button className="primary" disabled={!session.length} onClick={() => setPractice(true)}>
            Start practice →
          </button>
        </div>
      </section>
      <div className="grammar-summary">
        <strong>{topics.length} topics</strong>
        <span>Short English guidance · Daily life and IT examples</span>
      </div>
      <div className="grid grammar-grid">
        {topics.map((topic) => {
          const stats = progress.grammarStats?.[topic.id];
          const accuracy = stats?.attempts
            ? Math.round((stats.correct / stats.attempts) * 100)
            : 0;
          return (
            <Link className="card grammar-card" href={`/grammar/${topic.slug}`} key={topic.id}>
              <div className="pills">
                <span className="pill">{topic.level}</span>
                <span className="pill">{topic.category}</span>
              </div>
              <h2>{topic.titleGerman}</h2>
              <p className="grammar-english-title">{topic.titleEnglish}</p>
              <p>{topic.explanationEnglish}</p>
              <div className="grammar-card-footer">
                <span>{stats?.attempts || 0} attempts</span>
                <strong>{stats?.attempts ? `${accuracy}%` : "Start →"}</strong>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
