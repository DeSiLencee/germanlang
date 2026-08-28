"use client";
import { useState } from "react";
import Link from "next/link";
import { dialogues } from "@/data/content";
import { itCategories } from "@/data/it/catalog";
import { useProgress } from "@/lib/progress";
export default function Dialogues() {
  const [technical, setTechnical] = useState<"all" | "daily" | "it">("all");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState("All");
  const [show, setShow] = useState<Record<string, boolean>>({});
  const { progress, completeDialogue } = useProgress();
  const list = dialogues.filter(
    (d) =>
      (technical === "all" || (technical === "it") === !!d.technical) &&
      (level === "All" || d.level === level) &&
      (category === "All" || d.category === category),
  );
  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h1>Dialogues</h1>
          <p>Read natural German conversations with subtle English support.</p>
        </div>
      </div>
      <div className="filters">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>All</option>
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
        </select>
        {technical === "it" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {itCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
      <div className="filters">
        <button
          className={technical === "all" ? "primary" : "secondary"}
          onClick={() => {
            setTechnical("all");
            setCategory("All");
          }}
        >
          All
        </button>
        <button
          className={technical === "daily" ? "primary" : "secondary"}
          onClick={() => {
            setTechnical("daily");
            setCategory("All");
          }}
        >
          Daily German
        </button>
        <button
          className={technical === "it" ? "primary" : "secondary"}
          onClick={() => {
            setTechnical("it");
            setCategory("All");
          }}
        >
          Technical
        </button>
      </div>
      <div className="grid dialogue-grid">
        {list.map((d) => (
          <article className="card" key={d.id}>
            <div className="pills">
              <span className="pill">{d.level}</span>
              <span className="pill">{d.category}</span>
            </div>
            <h2>{d.title}</h2>
            <div className="dialogue-lines">
              {d.lines.map((l, i) => (
                <div className="line" key={i}>
                  <strong>{l.speaker}</strong>
                  <p>{l.text}</p>
                  <small className="dialogue-english">
                    <b>English:</b> {l.englishTranslation}
                  </small>
                  {show[d.id] && l.translation && (
                    <small className="turkish-help">
                      Türkçe: {l.translation}
                    </small>
                  )}
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <Link className="button secondary" href={`/dialogues/${d.id}`}>Open &amp; practice</Link>
              {d.lines.some((l) => l.translation) && (
                <button
                  className="secondary"
                  onClick={() => setShow({ ...show, [d.id]: !show[d.id] })}
                >
                  {show[d.id] ? "Hide" : "Show"} Turkish
                </button>
              )}
              {d.technical && (
                <button
                  className={
                    (progress.completedDialogues || []).includes(d.id)
                      ? "secondary"
                      : "primary"
                  }
                  onClick={() => completeDialogue(d.id)}
                >
                  {(progress.completedDialogues || []).includes(d.id)
                    ? "✓ Practiced"
                    : "Mark practiced"}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
