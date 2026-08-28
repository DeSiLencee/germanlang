"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PracticeSession } from "@/components/PracticeSession";
import { exercises } from "@/data/content";
import { shuffleExercises } from "@/lib/practice-session";
function ITSession() {
  const search = useSearchParams();
  const category = search.get("category") || "All IT";
  const count = Math.min(30, Math.max(10, Number(search.get("count")) || 20));
  const session = useMemo(() => {
    const pool = exercises.filter(exercise => exercise.technical && (category === "All IT" || exercise.category === category));
    const shuffled = shuffleExercises(pool);
    const seen = new Set<string>();
    const varied = shuffled.filter(exercise => { const key = exercise.id.replace(/-(meaning|article|translation)$/," ").trim(); if (seen.has(key)) return false; seen.add(key); return true; });
    return [...varied, ...shuffled.filter(exercise => !varied.includes(exercise))].slice(0, count);
  }, [category, count]);
  return <PracticeSession title={`German for IT · ${category}`} initialExercises={session} exitHref="/it" />;
}
export default function ITPracticePage() { return <div className="page"><Suspense fallback={<div className="card review-empty">Preparing IT practice…</div>}><ITSession /></Suspense></div>; }
