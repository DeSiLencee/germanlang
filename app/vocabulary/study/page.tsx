"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExerciseCard } from "@/components/ExerciseCard";
import { useProgress } from "@/lib/progress";
import { vocabularyExercises } from "@/lib/vocabulary-practice";
import { VocabularyItem, VocabularyStudyStatus } from "@/types";
import { allITVocabulary } from "@/data/it/catalog";
import { itDialogues } from "@/data/it/dialogues";
import { getITLearningContext } from "@/data/it/learning";
import { SessionHeader } from "@/components/SessionHeader";
import { shuffleExercises } from "@/lib/practice-session";

type Mode = "study" | "study-practice" | "practice";
const sourceName = (source?: VocabularyItem["source"]) => source === "goethe" ? "Goethe" : source === "custom_it" || source === "german-for-it" ? "German for IT" : "Custom";
function StudyDeck() {
  const search = useSearchParams();
  const { progress, rateWord, ready, setContinuation } = useProgress();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [deck, setDeck] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [mode, setMode] = useState<Mode>((search.get("mode") as Mode) || "study");
  const [statusFilter, setStatusFilter] = useState(search.get("status") || "All");
  const [display, setDisplay] = useState<"full" | "flip">("full");
  const [flipped, setFlipped] = useState(false);
  const [practice, setPractice] = useState<ReturnType<typeof vocabularyExercises>>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceReturn, setPracticeReturn] = useState<"card" | "next">("card");
  const [studied, setStudied] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState<Set<string>>(new Set());
  const touchStart = useRef<number | null>(null);
  const level = search.get("level") || "All", category = search.get("category") || "All", source = search.get("source") || "All", requestedId = search.get("id");
  useEffect(() => {
    const params = new URLSearchParams({ level, category, source, pageSize: "5000" });
    if (requestedId) params.set("id", requestedId);
    fetch(`/api/vocabulary?${params}`).then(response => response.json()).then(result => { setItems(result.items); setLoading(false); });
  }, [category, level, requestedId, source]);
  useEffect(() => {
    if (deck.length && statusFilter === "All") return;
    const filtered = items.filter(word => {
      if (requestedId && word.id !== requestedId) return false;
      const state = progress.vocabularyReview?.[word.id]?.status || (progress.learnedWords.includes(word.id) ? "learned" : "new");
      return statusFilter === "All" || (statusFilter === "Not learned" ? state !== "learned" : state === statusFilter.toLowerCase());
    });
    // Rebuild the deck when persisted learning-state filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(shuffleExercises(filtered)); setIndex(0); setFlipped(false);
  }, [deck.length, items, progress.learnedWords, progress.vocabularyReview, ready, requestedId, statusFilter]);
  const word = deck[index];
  const move = useCallback((step: number) => { const next = Math.max(0, Math.min(deck.length, index + step)); const target = deck[Math.min(next, Math.max(0, deck.length - 1))]; setDirection(step > 0 ? "next" : "previous"); setFlipped(false); setIndex(next); if (target) setContinuation({ type: target.technical ? "it-vocabulary" : "vocabulary", label: target.technical ? `German for IT · ${target.category}` : `${target.level} Vocabulary · ${target.category}`, href: `/vocabulary/study?id=${encodeURIComponent(target.id)}`, level: target.level, category: target.category, contentId: target.id, updatedAt: new Date().toISOString() }); }, [deck, index, setContinuation]);
  const startPractice = (single: boolean, returnTo: "card" | "next") => { if (!word) return; const generated = vocabularyExercises(word, items); setPractice(single ? generated.slice(index % Math.max(1, generated.length), index % Math.max(1, generated.length) + 1) : generated); setPracticeIndex(0); setPracticeReturn(returnTo); };
  const finishQuestion = (wasCorrect: boolean) => { setQuestions(value => value + 1); setCorrect(value => value + (wasCorrect ? 1 : 0)); if (!wasCorrect && word) setMistakes(value => new Set(value).add(word.id)); if (practiceIndex + 1 < practice.length) setPracticeIndex(value => value + 1); else { setPractice([]); setPracticeIndex(0); if (practiceReturn === "next") move(1); } };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { const target = event.target as HTMLElement; if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || practice.length) return; if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); if (event.code === "Space" && display === "flip") { event.preventDefault(); setFlipped(value => !value); } };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, [display, move, practice.length]);
  useEffect(() => {
    if (mode !== "practice" || !word || practice.length) return;
    const generated = vocabularyExercises(word, items);
    if (generated.length) {
      // Practice-only mode advances by generating one hidden-answer check per card.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPractice([generated[index % generated.length]]);
      setPracticeReturn("next");
    }
  }, [index, items, mode, practice.length, word]);
  const stats = useMemo(() => ({ accuracy: questions ? Math.round(correct / questions * 100) : 0, remaining: Math.max(0, deck.length - studied.size) }), [correct, deck.length, questions, studied.size]);
  if (loading) return <div className="page"><div className="card review-empty"><h2>Building your deck…</h2></div></div>;
  if (!deck.length) return <div className="page"><div className="card review-empty"><h1>No cards match these filters</h1><p>Try a broader level, category, source, or learning status.</p><Link className="button primary" href="/vocabulary">Back to Vocabulary</Link></div></div>;
  if (practice.length && practice[practiceIndex]) return <div className="page vocab-study-page"><SessionHeader title="Vocabulary Practice" current={practiceIndex + 1} total={practice.length} exitHref="/study" hasProgress={practiceIndex > 0} /><ExerciseCard key={practice[practiceIndex].id} exercise={practice[practiceIndex]} onDone={finishQuestion} /></div>;
  if (index >= deck.length) return <div className="page"><div className="card deck-summary"><div className="deck-complete-mark">✓</div><h1>Deck Complete</h1><div className="deck-summary-grid"><span>Cards studied<strong>{studied.size}</strong></span><span>Practice questions<strong>{questions}</strong></span><span>Correct<strong>{correct}</strong></span><span>Accuracy<strong>{stats.accuracy}%</strong></span><span>Words for review<strong>{mistakes.size}</strong></span></div><div className="deck-summary-actions">{mistakes.size > 0 && <button className="primary" onClick={() => { setDeck(deck.filter(item => mistakes.has(item.id))); setIndex(0); setMode("practice"); setMistakes(new Set()); }}>Practice Mistakes</button>}<button className="secondary" onClick={() => { setIndex(0); setStudied(new Set()); setQuestions(0); setCorrect(0); setMistakes(new Set()); }}>Study Again</button><Link className="button secondary" href="/vocabulary">Back to Vocabulary</Link></div></div></div>;
  const status = (progress.vocabularyReview?.[word.id]?.status || (progress.learnedWords.includes(word.id) ? "learned" : "new")) as VocabularyStudyStatus;
  const canonicalITWord = word.technical ? allITVocabulary.find(item => item.german.toLocaleLowerCase("de-DE") === word.german.toLocaleLowerCase("de-DE")) : undefined;
  const learningContext = getITLearningContext(word);
  const relatedWords = word.technical ? items.filter(item => item.technical && item.id !== word.id && item.category === word.category).sort((a, b) => Number(b.partOfSpeech === "expression") - Number(a.partOfSpeech === "expression")).slice(0, 7) : [];
  const relatedDialogues = canonicalITWord ? itDialogues.filter(dialogue => dialogue.vocabularyIds?.includes(canonicalITWord.id)).slice(0, 3) : [];
  return <div className="page vocab-study-page" onTouchStart={event => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={event => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 55) move(delta < 0 ? 1 : -1); touchStart.current = null; }}>
    <SessionHeader title={mode === "study" ? "Flashcards" : mode === "study-practice" ? "Study + Practice" : "Practice"} current={index + 1} total={deck.length} exitHref={word.technical ? "/it" : "/study"} hasProgress={studied.size > 0 || questions > 0} />
    <div className="study-toolbar"><Link href="/study" className="back-link">Deck settings</Link><div className="study-selects"><select aria-label="Study mode" value={mode} onChange={event => setMode(event.target.value as Mode)}><option value="study">Study</option><option value="study-practice">Study + Practice</option><option value="practice">Practice Only</option></select><select aria-label="Learning status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All</option><option>New</option><option>Learning</option><option>Learned</option><option>Review</option></select><select aria-label="Card display" value={display} onChange={event => { setDisplay(event.target.value as "full" | "flip"); setFlipped(false); }}><option value="full">Full Card</option><option value="flip">Flip Card</option></select><button className="secondary" onClick={() => { setDeck(shuffleExercises(deck)); setIndex(0); }}>Shuffle Again</button><button className="secondary" onClick={() => setIndex(0)}>Restart Deck</button></div></div>
    <div className="deck-progress"><span>{level} {category !== "All" && `· ${category}`} · {source !== "All" && sourceName(source as VocabularyItem["source"])}</span><strong>{index + 1} / {deck.length}</strong><span>{studied.size} studied · {stats.accuracy}% accuracy · {stats.remaining} remaining</span></div>
    <div className="flashcard-navigation flashcard-navigation-top"><button aria-label="Previous vocabulary card" className="secondary" disabled={index === 0} onClick={() => move(-1)}>← Previous</button><button aria-label="Next vocabulary card" className="secondary" onClick={() => { setStudied(value => new Set(value).add(word.id)); move(1); }}>Next →</button></div>
    <article key={word.id} className={`vocab-flashcard slide-${direction} ${display === "flip" ? "flip-card" : ""} ${flipped ? "flipped" : ""}`} onClick={() => display === "flip" && setFlipped(value => !value)} aria-label={`${labelFor(word)} vocabulary card`}>
      <div className="pills"><span className="pill">{word.level}</span><span className="pill">{word.category}</span><span className="pill">{sourceName(word.source)}</span><span className="pill status-pill">{status}</span></div>
      <div className="flashcard-front"><h1>{labelFor(word)}</h1>{display === "flip" && !flipped && <button className="secondary">Show Meaning <kbd>Space</kbd></button>}</div>
      {(display === "full" || flipped) && <div className="flashcard-details"><p className="flashcard-english"><small>English</small>{word.englishMeaning || "Meaning pending review"}</p>{word.plural && <p><small>Plural</small><strong>{word.plural}</strong></p>}{word.turkish && <p className="flashcard-turkish"><small>Türkçe</small>🇹🇷 {word.turkish}</p>}<div className="flashcard-examples">{learningContext.examples.map((example, exampleIndex) => <div className="flashcard-example" key={example.german}><small>Example {learningContext.examples.length > 1 ? exampleIndex + 1 : ""}</small><strong>{example.german}</strong><span><b>English:</b> {example.english}</span>{example.turkish && <span><b>Türkçe:</b> {example.turkish}</span>}</div>)}</div></div>}
    </article>
    {word.technical && (display === "full" || flipped) && <div className="grid it-word-context"><section className="card"><div className="eyebrow">Related expressions</div>{learningContext.expressions.length ? learningContext.expressions.map(expression => <div className="related-expression" key={expression.german}><strong>{expression.german}</strong><small>{expression.english}</small></div>) : <p className="muted">Practice this word with the related technical vocabulary below.</p>}<div className="related-word-links">{relatedWords.map(item => <Link className="pill" href={`/vocabulary/study?id=${encodeURIComponent(item.id)}`} key={item.id}>{[item.article, item.german].filter(Boolean).join(" ")}</Link>)}</div></section><section className="card"><div className="eyebrow">Used in dialogues</div>{relatedDialogues.length ? relatedDialogues.map(dialogue => <Link className="related-dialogue" href={`/dialogues/${dialogue.id}`} key={dialogue.id}><span><strong>{dialogue.title}</strong><small>{dialogue.participants?.join(" · ")}</small></span><b>Open →</b></Link>) : <p className="muted">No directly linked dialogue yet for this item.</p>}</section></div>}
    <div className="word-ratings" aria-label="Vocabulary review rating">{(["again", "hard", "good", "easy"] as const).map(rating => <button key={rating} className="secondary" onClick={() => { rateWord(word.id, rating, word.level, vocabularyExercises(word, items)[0]); setStudied(value => new Set(value).add(word.id)); }}>{rating[0].toUpperCase() + rating.slice(1)}</button>)}</div>
    <div className="flashcard-navigation"><button aria-label="Previous vocabulary card" className="secondary" disabled={index === 0} onClick={() => move(-1)}>← Previous</button><button className="primary" onClick={() => startPractice(false, "card")}>Practice This Word</button>{mode === "study-practice" && <button className="primary" onClick={() => { setStudied(value => new Set(value).add(word.id)); startPractice(true, "next"); }}>Quick Check →</button>}<button aria-label="Next vocabulary card" className="secondary" onClick={() => { setStudied(value => new Set(value).add(word.id)); move(1); }}>Next →</button></div>
  </div>;
}
const labelFor = (word: VocabularyItem) => [word.article, word.german].filter(Boolean).join(" ");
export default function VocabularyStudyPage() { return <Suspense fallback={<div className="page"><div className="card review-empty">Building your deck…</div></div>}><StudyDeck /></Suspense>; }
