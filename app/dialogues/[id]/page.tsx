"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { dialogues, exercises } from "@/data/content";
import { allITVocabulary } from "@/data/it/catalog";
import { vocabulary } from "@/data/vocabulary";
import { useProgress } from "@/lib/progress";
import { buildDialoguePractice } from "@/lib/dialogue-practice";
import { SessionHeader } from "@/components/SessionHeader";

export default function DialogueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dialogue = dialogues.find(item => item.id === id);
  const [practicing, setPracticing] = useState(false);
  const [index, setIndex] = useState(0);
  const { completeDialogue, progress } = useProgress();
  if (!dialogue) return notFound();
  const practice = [...(dialogue.relatedExerciseIds || []).map(exerciseId => exercises.find(exercise => exercise.id === exerciseId)).filter(exercise => exercise !== undefined), ...buildDialoguePractice(dialogue)].filter((exercise, exerciseIndex, all) => all.findIndex(item => item.id === exercise.id) === exerciseIndex).slice(0, 6);
  const related = (dialogue.vocabularyIds || []).map(vocabularyId => {
    const direct = vocabulary.find(word => word.id === vocabularyId);
    if (direct) return direct;
    const canonical = allITVocabulary.find(word => word.id === vocabularyId);
    return canonical && vocabulary.find(word => word.german.toLocaleLowerCase("de-DE") === canonical.german.toLocaleLowerCase("de-DE"));
  }).filter(word => word !== undefined);
  if (practicing && index < practice.length) return <div className="page focused-session"><SessionHeader title={dialogue.title} current={index + 1} total={practice.length} exitHref={`/dialogues/${dialogue.id}`} hasProgress={index > 0} /><ExerciseCard exercise={practice[index]} onDone={() => { if (index + 1 === practice.length) completeDialogue(dialogue.id); setIndex(value => value + 1); }} /></div>;
  return <div className="page"><Link className="back-link" href="/dialogues">← Dialogues</Link><div className="page-title"><div><div className="eyebrow">{dialogue.level} · {dialogue.category} {dialogue.technical ? "· German for IT" : ""}</div><h1>{dialogue.title}</h1><p>{dialogue.participants?.join(" · ")}</p></div></div><div className="grid dialogue-detail-layout"><section className="card"><div className="dialogue-lines">{dialogue.lines.map((line, lineIndex) => <div className="line" key={lineIndex}><strong>{line.speaker}</strong><p>{line.text}</p><small><b>English:</b> {line.englishTranslation}</small>{line.translation && <small>Türkçe: {line.translation}</small>}</div>)}</div></section><aside className="card dialogue-practice-panel"><div className="eyebrow">Vocabulary in this dialogue</div><div className="related-word-links">{related.map(word => <Link className="pill" href={`/vocabulary/study?id=${encodeURIComponent(word.id)}`} key={word.id}>{[word.article, word.german].filter(Boolean).join(" ")}</Link>)}</div><button className="primary" disabled={!practice.length} onClick={() => { setIndex(0); setPracticing(true); }}>{(progress.completedDialogues || []).includes(dialogue.id) ? "Practice again" : "Practice Dialogue"} →</button><small>{practice.length} focused dialogue exercise{practice.length === 1 ? "" : "s"}</small></aside></div>{practicing && index >= practice.length && <div className="card review-empty"><b>✓</b><h2>Dialogue complete</h2><p>Your progress has been saved.</p></div>}</div>;
}
