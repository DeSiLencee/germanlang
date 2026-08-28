"use client";
import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import type { VocabularyItem } from "@/types";
type Result = {
  items: VocabularyItem[];
  total: number;
  page: number;
  pages: number;
  categories: string[];
  counts: Record<string, number>;
};
const empty: Result = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  categories: [],
  counts: {},
};
export default function Vocabulary() {
  const [q, setQ] = useState("");
  const search = useDeferredValue(q);
  const [level, setLevel] = useState("All"),
    [category, setCategory] = useState("All"),
    [source, setSource] = useState("All"),
    [status, setStatus] = useState("All");
  const [page, setPage] = useState(1),
    [result, setResult] = useState<Result>(empty);
  const { progress, toggleWord } = useProgress();
  useEffect(() => {
    const params = new URLSearchParams({
      q: search,
      level,
      category,
      source,
      status,
      page: String(page),
      pageSize: "48",
    });
    if (status !== "All")
      params.set("learned", progress.learnedWords.join(","));
    const controller = new AbortController();
    fetch(`/api/vocabulary?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setResult)
      .catch(() => {});
    return () => controller.abort();
  }, [search, level, category, source, status, page, progress.learnedWords]);
  function reset(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }
  const studyParams = new URLSearchParams({ level, category, source, status: status === "Not learned" ? "New" : status });
  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h1>Vocabulary</h1>
          <p>
            {result.counts.all || "…"} Goethe and curated words for German life
            and work.
          </p>
        </div>
        <Link className="button primary" href={`/vocabulary/study?${studyParams}`}>Study as Cards →</Link>
      </div>
      <div className="filters">
        <input
          placeholder="Search German, English, or Turkish…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select value={level} onChange={(e) => reset(setLevel, e.target.value)}>
          <option>All</option>
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
        </select>
        <select
          value={category}
          onChange={(e) => reset(setCategory, e.target.value)}
        >
          <option>All</option>
          {result.categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => reset(setSource, e.target.value)}
        >
          <option value="All">All sources</option>
          <option value="goethe">Goethe</option>
          <option value="custom_it">German for IT</option>
          <option value="custom">Custom</option>
        </select>
        <select
          value={status}
          onChange={(e) => reset(setStatus, e.target.value)}
        >
          <option>All</option>
          <option>Learned</option>
          <option>Not learned</option>
        </select>
      </div>
      <p style={{ color: "var(--muted)" }}>
        {result.total} words · page {result.page} of {result.pages}
      </p>
      <div className="grid vocab-grid">
        {result.items.map((v) => (
          <article className="card vocab-card" key={v.id}>
            <button
              className="learn"
              title="Mark learned"
              onClick={() => toggleWord(v.id, v.level)}
            >
              {progress.learnedWords.includes(v.id) ? "✓" : "○"}
            </button>
            <div className="pills">
              <span className="pill">{v.level}</span>
              <span className="pill">{v.category}</span>
              <span className="pill">
                {v.source === "goethe"
                  ? "Goethe"
                  : v.source === "german-for-it" || v.source === "custom_it"
                    ? "German for IT"
                    : "Custom"}
              </span>
            </div>
            <h3 className="word">
              {v.article} {v.german}
            </h3>
            <p className="english-help">
              <span>English</span>
              {v.englishMeaning || "Meaning pending review"}
            </p>
            {v.plural && (
              <p>
                Plural: <b>{v.plural}</b>
              </p>
            )}
            {v.turkish && (
              <p>
                🇹🇷 <b>{v.turkish}</b>
              </p>
            )}
            {v.exampleSentence && (
              <blockquote>
                {v.exampleSentence}
                {v.exampleEnglishTranslation && (
                  <small className="example-english">
                    <b>English:</b> {v.exampleEnglishTranslation}
                  </small>
                )}
                {v.exampleTranslation && (
                  <small>Türkçe: {v.exampleTranslation}</small>
                )}
              </blockquote>
            )}
            <div className="vocab-card-actions">
              <Link className="button secondary" href={`/vocabulary/study?id=${encodeURIComponent(v.id)}`}>Study</Link>
              <Link className="button primary" href={`/vocabulary/study?id=${encodeURIComponent(v.id)}&mode=practice`}>Practice</Link>
            </div>
          </article>
        ))}
      </div>
      <div className="pagination">
        <button
          className="secondary"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ← Previous
        </button>
        <span>
          {page} / {result.pages}
        </span>
        <button
          className="secondary"
          disabled={page >= result.pages}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
