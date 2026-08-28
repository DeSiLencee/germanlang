"use client";
import Link from "next/link";
import { grammarTopics } from "@/data/grammar/topics";
import { useProgress } from "@/lib/progress";
import { Level } from "@/types";
export default function ProgressPage() {
  const { progress } = useProgress();
  const accuracy = progress.attempts ? Math.round(progress.correct / progress.attempts * 100) : 0, learned = progress.learnedWordLevels || {};
  const weak = grammarTopics.map(topic => { const stats = progress.grammarStats?.[topic.id]; return { topic, attempts: stats?.attempts || 0, accuracy: stats?.attempts ? Math.round(stats.correct / stats.attempts * 100) : 0 }; }).filter(item => item.attempts && item.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  return <div className="page app-page"><div className="simple-heading"><h1>Progress</h1><p>The numbers that help you decide what to study next.</p></div><section className="card simple-progress">{(["A1", "A2", "B1"] as Level[]).map(level => { const topics = grammarTopics.filter(topic => topic.level === level), practiced = topics.filter(topic => progress.grammarStats?.[topic.id]?.attempts).length, percent = Math.round(practiced / topics.length * 100); return <div className="level-line" key={level}><strong>{level}</strong><div className="bar"><i style={{ width: `${percent}%` }} /></div><span>{percent}%</span></div>; })}</section><section className="simple-numbers"><span><small>Vocabulary learned</small><strong>{progress.learnedWords.length}</strong></span><span><small>Questions answered</small><strong>{progress.attempts}</strong></span><span><small>Accuracy</small><strong>{accuracy}%</strong></span></section><section className="card weak-areas"><div className="eyebrow">Weak areas</div>{weak.length ? weak.map(item => <Link href={`/grammar/${item.topic.slug}`} key={item.topic.id}><span>{item.topic.titleGerman}</span><b>{item.accuracy}%</b></Link>) : <p className="muted">Practice more topics to identify weak areas.</p>}<small>{learned.A1 || 0} A1 · {learned.A2 || 0} A2 · {learned.B1 || 0} B1 words learned</small></section></div>;
}
