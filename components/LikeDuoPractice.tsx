"use client";

import { useEffect, useMemo, useState } from "react";
import { buildLikeDuoSession, isLikeDuoAnswerCorrect, LikeDuoQuestion } from "@/lib/likeduo";
import type { VocabularyItem } from "@/types";

type VocabularyResponse = { items: VocabularyItem[]; total: number };

export function LikeDuoPractice() {
  const [deck, setDeck] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(20);
  const [session, setSession] = useState<LikeDuoQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [hintCount, setHintCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/vocabulary?pageSize=5000", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Vocabulary could not be loaded."); return response.json() as Promise<VocabularyResponse>; })
      .then(data => setDeck(data.items))
      .catch(cause => { if (cause.name !== "AbortError") setError(cause.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const question = session[index];
  const isOrder = question?.type === "sentence_order";
  const currentAnswer = isOrder ? selectedWords.join(" ") : answer;
  const remainingWords = useMemo(() => question?.words?.filter((word, wordIndex, words) => words.slice(0, wordIndex).filter(item => item === word).length >= selectedWords.filter(item => item === word).length) || [], [question, selectedWords]);

  function start() {
    setSession(buildLikeDuoSession(deck, count));
    setIndex(0); setAnswer(""); setSelectedWords([]); setChecked(null); setCorrect(0); setHintCount(0);
  }
  function check() {
    if (!currentAnswer.trim() || checked !== null) return;
    const result = isLikeDuoAnswerCorrect(question, currentAnswer);
    setChecked(result);
    if (result) setCorrect(value => value + 1);
  }
  function next() { setIndex(value => value + 1); setAnswer(""); setSelectedWords([]); setChecked(null); setHintCount(0); }

  if (loading) return <div className="page app-page"><section className="card likeduo-loading">Loading vocabulary…</section></div>;
  if (error) return <div className="page app-page"><section className="card likeduo-loading"><b>LikeDuo is unavailable.</b><p>{error}</p></section></div>;
  if (!session.length) return <div className="page app-page"><div className="simple-heading"><h1>LikeDuo</h1><p>Practice all {deck.length} vocabulary words with short, mixed exercises.</p></div><section className="card start-panel"><label>Questions</label><div className="segmented">{[10, 20, 30].map(value => <button className={count === value ? "active" : ""} key={value} onClick={() => setCount(value)}>{value}</button>)}</div><button className="primary start-main-action" disabled={!deck.length} onClick={start}>Start Practice →</button><small>German, meanings, examples, sentence completion, and active recall.</small></section></div>;
  if (!question) return <div className="page app-page"><section className="card session-summary"><div className="deck-complete-mark">✓</div><h1>Practice Complete</h1><strong className="session-score">{correct} / {session.length}</strong><p>Correct answers</p><p>Incorrect answers: {session.length - correct} / {session.length}</p><div className="deck-summary-actions"><button className="primary" onClick={start}>Practice Again</button><button className="secondary" onClick={() => setSession([])}>Done</button></div></section></div>;

  return <div className="page likeduo-session"><div className="likeduo-progress-label"><b>Question {index + 1} / {session.length}</b><span>{Math.round(index / session.length * 100)}%</span></div><div className="bar session-progress"><i style={{ width: `${index / session.length * 100}%` }} /></div><section className="exercise-card likeduo-card"><div className="eyebrow">Vocabulary practice · {question.type.replaceAll("_", " ")}</div><h2>{question.prompt}</h2><p className="likeduo-display">{question.display}</p>
    {isOrder ? <div className="order"><div className="answer-zone">{selectedWords.length ? selectedWords.map((word, wordIndex) => <button disabled={checked !== null} key={`${word}-${wordIndex}`} onClick={() => setSelectedWords(selectedWords.filter((_, indexToKeep) => indexToKeep !== wordIndex))}>{word}</button>) : <span>Choose words below …</span>}</div><div className="word-bank">{remainingWords.map((word, wordIndex) => <button disabled={checked !== null} key={`${word}-${wordIndex}`} onClick={() => setSelectedWords([...selectedWords, word])}>{word}</button>)}</div></div> : question.options ? <div className="options">{question.options.map(option => <button disabled={checked !== null} className={answer === option ? "selected" : ""} key={option} onClick={() => setAnswer(option)}>{option}</button>)}</div> : <input autoFocus disabled={checked !== null} value={answer} placeholder={question.type === "type_german" ? "German word…" : "Meaning…"} onChange={event => setAnswer(event.target.value)} onKeyDown={event => { if (event.key === "Enter") checked === null ? check() : next(); }} />}
    {hintCount > 0 && <aside className="likeduo-hints"><strong>Hint</strong>{question.hints.slice(0, hintCount).map((hint, hintIndex) => <p key={`${question.id}-hint-${hintIndex}`}>{hint}</p>)}</aside>}
    {checked !== null && <div className={`feedback ${checked ? "correct" : "wrong"}`}><strong>{checked ? "✓ Correct" : "✕ Incorrect"}</strong>{!checked && <p>Correct answer: <b>{question.answer}</b></p>}{question.sentence && <p>Complete sentence: <b>{question.sentence}</b></p>}{question.sentenceTranslation && <p className="feedback-english"><b>Meaning:</b> {question.sentenceTranslation}</p>}</div>}
    <div className="exercise-actions likeduo-actions">{checked === null ? <><button className="secondary" disabled={hintCount >= question.hints.length} onClick={() => setHintCount(value => Math.min(value + 1, question.hints.length))}>{hintCount ? hintCount >= question.hints.length ? "No More Hints" : "Another Hint" : "Hint"}</button><button className="primary" disabled={!currentAnswer.trim()} onClick={check}>Check Answer</button></> : <button className="primary" onClick={next}>Continue →</button>}</div></section></div>;
}
