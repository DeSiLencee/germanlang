"use client";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
export default function HomePage() {
  const { progress } = useProgress();
  const accuracy = progress.attempts ? Math.round(progress.correct / progress.attempts * 100) : 0, continuation = progress.continuation;
  return <div className="page home-simple"><div className="home-intro"><small>GERMAN LEARNING</small><h1>Ready for the next step?</h1><p>Current level <strong>{continuation?.level || "A2"}</strong></p><Link className="button primary home-continue" href={continuation?.href || "/study?level=A2"}>{continuation ? `Continue ${continuation.label}` : "Continue studying"} →</Link></div><div className="quick-actions"><Link href="/study"><b>□</b><span>Flashcards<small>Study words</small></span></Link><Link href="/practice"><b>✦</b><span>Practice<small>20 questions</small></span></Link><Link href="/grammar-words"><b>Aa</b><span>Grammar Words<small>Sentence building blocks</small></span></Link><Link href="/it"><b>⌘</b><span>German for IT<small>Work vocabulary</small></span></Link></div><div className="home-metrics"><span>Today <b>{progress.dailyCount} questions</b></span><span>Accuracy <b>{accuracy}%</b></span></div></div>;
}
