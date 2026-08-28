"use client";
import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { Level } from "@/types";
const categories = ["All", "Everyday Life", "Work", "Food", "Home", "Transportation", "Networking", "Help Desk", "Firewalls & Security"];
export default function StudyPage() {
  const { progress, setContinuation } = useProgress();
  const [level, setLevel] = useState<Level>(progress.currentLevel || "A2"), [category, setCategory] = useState("All"), [source, setSource] = useState("All");
  const params = new URLSearchParams({ level, category, source }), href = `/vocabulary/study?${params}`;
  const remember = () => setContinuation({ type: source === "custom_it" ? "it-vocabulary" : "vocabulary", label: source === "custom_it" ? `German for IT${category === "All" ? "" : ` · ${category}`}` : `${level} Vocabulary${category === "All" ? "" : ` · ${category}`}`, href, level, category, updatedAt: new Date().toISOString() });
  return <div className="page app-page"><div className="simple-heading"><h1>Study</h1><p>Choose a deck and start immediately.</p></div><section className="card start-panel"><label>Level</label><div className="segmented">{(["A1", "A2", "B1"] as Level[]).map(item => <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>{item}</button>)}</div><label htmlFor="study-category">Category</label><select id="study-category" value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select><label htmlFor="study-source">Source</label><select id="study-source" value={source} onChange={event => setSource(event.target.value)}><option value="All">All vocabulary</option><option value="goethe">Goethe</option><option value="custom">Custom</option><option value="custom_it">German for IT</option></select><Link className="button primary start-main-action" href={href} onClick={remember}>Start Flashcards →</Link></section><p className="simple-secondary-link">Prefer browsing? <Link href="/vocabulary">Open vocabulary list</Link> · <Link href="/grammar">Grammar topics</Link> · <Link href="/grammar-words">Grammar Words</Link> · <Link href="/dialogues">Dialogues</Link></p></div>;
}
