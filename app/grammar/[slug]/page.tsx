"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { grammarExercises, grammarTopics } from "@/data/grammar/topics";
import { useProgress } from "@/lib/progress";
import { SessionHeader } from "@/components/SessionHeader";

export default function GrammarTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = grammarTopics.find((item) => item.slug === slug);
  const [practicing, setPracticing] = useState(false);
  const [index, setIndex] = useState(0);
  const { progress } = useProgress();
  if (!topic) notFound();
  const exercises = topic.exerciseIds
    .map((id) => grammarExercises.find((exercise) => exercise.id === id))
    .filter((exercise) => exercise !== undefined);
  const stats = progress.grammarStats?.[topic.id];

  if (practicing && index < exercises.length)
    return (
      <div className="page focused-session">
        <SessionHeader title={topic.titleGerman} current={index + 1} total={exercises.length} exitHref={`/grammar/${topic.slug}`} hasProgress={index > 0} />
        <ExerciseCard key={exercises[index].id} exercise={exercises[index]} onDone={() => setIndex((value) => value + 1)} />
      </div>
    );

  return (
    <div className="page grammar-topic-page">
      <Link href="/grammar" className="back-link">← All grammar topics</Link>
      <div className="grammar-topic-hero">
        <div>
          <div className="eyebrow">{topic.level} · {topic.category}</div>
          <h1>{topic.titleGerman}</h1>
          <p>{topic.titleEnglish}</p>
        </div>
        <div className="grammar-topic-progress">
          <strong>{stats?.attempts || 0}</strong>
          <span>practice attempts</span>
        </div>
      </div>
      <div className="grid grammar-topic-layout">
        <main className="grammar-topic-content">
          <section className="card">
            <div className="eyebrow">Simple explanation</div>
            <p className="grammar-explanation">{topic.explanationEnglish}</p>
            <div className="grammar-formula"><span>Structure</span><code>{topic.structure}</code></div>
          </section>
          <section className="card">
            <div className="eyebrow">Examples</div>
            <div className="grammar-examples">
              {topic.examples.map((example) => (
                <div key={example.german}>
                  <span className="example-context">{example.context === "it" ? "German for IT" : "Daily life"}</span>
                  <strong>{example.german}</strong>
                  <small>English: {example.english}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="card">
            <div className="eyebrow">Common mistake</div>
            {topic.commonMistakes.map((mistake) => (
              <div className="grammar-mistake" key={mistake.wrong}>
                <p className="mistake-wrong">✕ {mistake.wrong}</p>
                <p className="mistake-correct">✓ {mistake.correct}</p>
                <small>{mistake.explanation}</small>
              </div>
            ))}
          </section>
        </main>
        <aside className="card grammar-notes">
          <div className="eyebrow">Remember</div>
          <ul>{topic.importantNotes.map((note) => <li key={note}>{note}</li>)}</ul>
          <button className="primary" onClick={() => { setPracticing(true); setIndex(0); }}>
            {index >= exercises.length ? "Practice again" : "Start topic practice"} →
          </button>
          <small>{exercises.length} focused exercises</small>
        </aside>
      </div>
    </div>
  );
}
