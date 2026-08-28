"use client";
import Link from "next/link";
import { useState } from "react";
import { dialogues, exercises } from "@/data/content";
import { allITCategories } from "@/data/it/catalog";
import { vocabulary } from "@/data/vocabulary";
import { useProgress } from "@/lib/progress";
export default function ITPage() {
  const [category, setCategory] = useState<string>("Networking");
  const [practiceCount, setPracticeCount] = useState(20);
  const { progress } = useProgress();
  const words = vocabulary.filter(word => word.technical && word.category === category);
  const categoryDialogues = dialogues.filter(dialogue => dialogue.technical && dialogue.category === category);
  const categoryExercises = exercises.filter(exercise => exercise.technical && exercise.category === category);
  const learned = words.filter(word => progress.learnedWords.includes(word.id)).length;
  const completed = categoryDialogues.filter(dialogue => (progress.completedDialogues || []).includes(dialogue.id)).length;
  const stats = progress.itCategoryStats?.[category];
  const accuracy = stats?.attempts ? Math.round(stats.correct / stats.attempts * 100) : 0;
  return <div className="page app-page it-simple">
    <div className="simple-heading"><h1>German for IT</h1><p>Technical German for real work situations.</p></div>
    <section className="card it-start">
      <label htmlFor="it-topic">Topic</label>
      <select id="it-topic" value={category} onChange={event => setCategory(event.target.value)}>{allITCategories.map(item => <option key={item}>{item}</option>)}</select>
      <div className="segmented">{[10,20,30].map(count => <button className={practiceCount === count ? "active" : ""} key={count} onClick={() => setPracticeCount(count)}>{count} questions</button>)}</div>
      <div className="it-primary-actions"><Link className="button primary" href={`/vocabulary/study?source=custom_it&category=${encodeURIComponent(category)}`}>Study</Link><Link className="button secondary" href={`/it/practice?category=${encodeURIComponent(category)}&count=${practiceCount}`}>Practice {practiceCount}</Link><Link className="button secondary" href="/dialogues">Dialogues</Link></div>
      <p>{learned}/{words.length} words · {completed}/{categoryDialogues.length} dialogues · {accuracy}% accuracy · {categoryExercises.length} exercises</p>
    </section>
    <div className="section-label"><h2>Vocabulary</h2><Link href={`/vocabulary/study?source=custom_it&category=${encodeURIComponent(category)}`}>Open deck →</Link></div>
    <div className="simple-word-list">{words.slice(0, 12).map(word => <Link href={`/vocabulary/study?id=${encodeURIComponent(word.id)}`} key={word.id}><strong>{word.article} {word.german}</strong><span>{word.englishMeaning}</span><small>{word.level}</small></Link>)}</div>
    {categoryDialogues.length > 0 && <><div className="section-label"><h2>Dialogues</h2></div><div className="simple-dialogue-list">{categoryDialogues.slice(0, 4).map(dialogue => <Link className="card" href={`/dialogues/${dialogue.id}`} key={dialogue.id}><strong>{dialogue.title}</strong><span>{dialogue.lines.length} lines · Practice →</span></Link>)}</div></>}
  </div>;
}
