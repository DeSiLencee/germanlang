"use client";
import { useState } from "react";
import { Exercise } from "@/types";
import { normalize, useProgress } from "@/lib/progress";
export function shuffleSentenceTokens(words: string[]) {
  if (words.length < 2) return [...words];
  const result = [...words];
  for (let index = result.length - 1; index > 0; index--) { const target = Math.floor(Math.random() * (index + 1)); [result[index], result[target]] = [result[target], result[index]]; }
  if (result.every((word, index) => word === words[index])) [result[0], result[1]] = [result[1], result[0]];
  return result;
}
function ExerciseCardContent({ exercise, onDone, compact = false }: { exercise: Exercise; onDone?: (correct: boolean) => void; compact?: boolean }) {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bank] = useState(() => shuffleSentenceTokens(exercise.words || []));
  const [checked, setChecked] = useState<boolean | null>(null);
  const { record } = useProgress();
  const isOptions = !!exercise.options, isOrder = exercise.type === "sentence_order";
  const answer = isOrder ? selected.join(" ") : value;
  const valid = [exercise.answer, ...(exercise.acceptedAnswers || [])].some(item => normalize(item) === normalize(answer));
  const remainingWords = bank.filter((word, index) => bank.slice(0, index).filter(item => item === word).length >= selected.filter(item => item === word).length);
  function check() { if (!answer) return; setChecked(valid); record(exercise.id, valid, exercise); }
  function next() { onDone?.(!!checked); setChecked(null); setValue(""); setSelected([]); }
  return <div className={`exercise-card ${compact ? "compact" : ""}`}>
    <div className="eyebrow">{exercise.level} · {exercise.category} · {exercise.type.replaceAll("_", " ")}</div>
    <h2>{isOrder ? "Arrange the words into the correct sentence." : exercise.prompt}</h2>
    {isOrder && <p className="order-instruction">Sentence Ordering</p>}
    {exercise.englishHelp && <p className="english-help"><span>English meaning</span>{exercise.englishHelp}</p>}
    {isOrder && <div className="order"><div className="answer-zone">{selected.length ? selected.map((word, index) => <button key={`${word}-${index}`} onClick={() => checked === null && setSelected(selected.filter((_, itemIndex) => itemIndex !== index))}>{word}</button>) : <span>Choose words below …</span>}</div><div className="word-bank">{remainingWords.map((word, index) => <button disabled={checked !== null} key={`${word}-${index}`} onClick={() => setSelected([...selected, word])}>{word}</button>)}</div>{checked === null && <div className="order-tools"><button className="secondary" disabled={!selected.length} onClick={() => setSelected(selected.slice(0, -1))}>Undo</button><button className="secondary" disabled={!selected.length} onClick={() => setSelected([])}>Reset</button></div>}</div>}
    {isOptions && <div className="options">{exercise.options!.map(option => <button key={option} className={value === option ? "selected" : ""} onClick={() => checked === null && setValue(option)}>{option}</button>)}</div>}
    {!isOptions && !isOrder && <input autoFocus value={value} disabled={checked !== null} onChange={event => setValue(event.target.value)} onKeyDown={event => { if (event.key === "Enter") checked === null ? check() : next(); }} placeholder="Antwort eingeben …" />}
    {checked !== null && <div className={`feedback ${checked ? "correct" : "wrong"}`}><strong>{checked ? "✓ Correct" : "✕ Not quite."}</strong>{isOrder && <><p>Correct sentence: <b>{exercise.answer}</b></p>{exercise.answerEnglish && <p className="feedback-english"><b>English:</b> {exercise.answerEnglish}</p>}</>}{!checked && !isOrder && <><p>Richtige Antwort: <b>{exercise.answer}</b></p>{exercise.answerEnglish && <p className="feedback-english"><b>English:</b> {exercise.answerEnglish}</p>}</>}<p>{exercise.explanation}</p>{exercise.translation && <small>{exercise.translation}</small>}</div>}
    <div className="exercise-actions">{checked === null ? <button className="primary" onClick={check}>Antwort prüfen <kbd>Enter</kbd></button> : onDone && <button className="primary" onClick={next}>Weiter →</button>}</div>
  </div>;
}
export function ExerciseCard(props: { exercise: Exercise; onDone?: (correct: boolean) => void; compact?: boolean }) {
  return <ExerciseCardContent key={props.exercise.id} {...props} />;
}
