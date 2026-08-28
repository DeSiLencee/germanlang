"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { grammarWordCategories, grammarWords } from "@/data/grammar-words";
import { useProgress } from "@/lib/progress";
import { Level } from "@/types";

export default function GrammarWordsPage() {
  const [level, setLevel] = useState<Level | "All">("All"), [category, setCategory] = useState("All");
  const { progress } = useProgress();
  const filtered = useMemo(() => grammarWords.filter(word => (level === "All" || word.level === level) && (category === "All" || word.category === category)), [category, level]);
  const attempted = filtered.filter(word => (progress.grammarWordStats?.[word.id]?.attempts || 0) > 0).length;
  const params = new URLSearchParams({ level, category });
  return <div className="page app-page grammar-words-home"><div className="simple-heading"><div className="eyebrow">Grammar vocabulary</div><h1>Grammar Words</h1><p>Learn the small words that control German sentence structure.</p></div><section className="card start-panel"><label>Level</label><div className="segmented">{(["All", "A1", "A2", "B1"] as const).map(item => <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>{item}</button>)}</div><label htmlFor="grammar-word-category">Category</label><select id="grammar-word-category" value={category} onChange={event => setCategory(event.target.value)}><option>All</option>{grammarWordCategories.map(item => <option key={item}>{item}</option>)}</select><div className="grammar-word-overview"><span><strong>{filtered.length}</strong> cards</span><span><strong>{attempted}</strong> practiced</span></div><Link className="button primary start-main-action" href={`/grammar-words/study?${params}`}>Start Cards →</Link></section><div className="grammar-category-grid">{grammarWordCategories.map(item => { const count = grammarWords.filter(word => word.category === item).length; return <Link className="card" key={item} href={`/grammar-words/study?category=${encodeURIComponent(item)}&level=All`}><strong>{item}</strong><span>{count} words</span><b>Open →</b></Link>; })}</div></div>;
}
