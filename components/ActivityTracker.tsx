"use client";
import { useEffect, useRef } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth";
import { getFirebase } from "@/lib/firebase/client";

export type LearningActivity = { questionsAnswered?: number; cardsStudied?: number; reviewItemsCompleted?: number; correctAnswers?: number; incorrectAnswers?: number };
export function recordLearningActivity(detail: LearningActivity = {}) { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("learning-activity", { detail })); }
const istanbulDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year:"numeric",month:"2-digit",day:"2-digit" }).format(new Date());

export function ActivityTracker() {
  const { user } = useAuth(), last = useRef<number | null>(null), seconds = useRef(0), counters = useRef<LearningActivity>({}), flushing = useRef(false);
  useEffect(() => {
    if (!user) return;
    const meaningful = (detail: LearningActivity = {}) => { if (document.hidden) return; const now=Date.now(); if (last.current && now-last.current <= 180000) seconds.current += Math.max(0,Math.round((now-last.current)/1000)); last.current=now; for (const [key,value] of Object.entries(detail)) counters.current[key as keyof LearningActivity]=(counters.current[key as keyof LearningActivity]||0)+(value||0); };
    const flush = async () => { if (flushing.current || (!seconds.current && !Object.values(counters.current).some(Boolean))) return; const firebase=getFirebase(); if (!firebase) return; flushing.current=true; const elapsed=seconds.current, values={...counters.current}; seconds.current=0;counters.current={}; try { const ref=doc(firebase.db,"users",user.uid,"dailyActivity",istanbulDate()); await runTransaction(firebase.db,async transaction=>{ const current=await transaction.get(ref), data=current.data()||{}; transaction.set(ref,{date:istanbulDate(),firstActivityAt:data.firstActivityAt||serverTimestamp(),lastActivityAt:serverTimestamp(),activeStudySeconds:(data.activeStudySeconds||0)+elapsed,questionsAnswered:(data.questionsAnswered||0)+(values.questionsAnswered||0),cardsStudied:(data.cardsStudied||0)+(values.cardsStudied||0),reviewItemsCompleted:(data.reviewItemsCompleted||0)+(values.reviewItemsCompleted||0),correctAnswers:(data.correctAnswers||0)+(values.correctAnswers||0),incorrectAnswers:(data.incorrectAnswers||0)+(values.incorrectAnswers||0),updatedAt:serverTimestamp()},{merge:true}); }); } catch { seconds.current+=elapsed; for(const [key,value] of Object.entries(values)) counters.current[key as keyof LearningActivity]=(counters.current[key as keyof LearningActivity]||0)+(value||0); } finally { flushing.current=false; } };
    const custom=(event:Event)=>meaningful((event as CustomEvent<LearningActivity>).detail||{}), interaction=(event:Event)=>{ const target=event.target as HTMLElement; if(target.closest(".exercise-card,.vocab-flashcard,.grammar-word-card,.dialogue-lines")) meaningful(); }, visibility=()=>{ if(document.hidden)void flush();last.current=null; };
    window.addEventListener("learning-activity",custom);window.addEventListener("activity-flush",()=>void flush());document.addEventListener("pointerdown",interaction,{passive:true});document.addEventListener("keydown",interaction);document.addEventListener("visibilitychange",visibility);const timer=window.setInterval(()=>void flush(),45000);last.current=null;
    return()=>{window.removeEventListener("learning-activity",custom);document.removeEventListener("pointerdown",interaction);document.removeEventListener("keydown",interaction);document.removeEventListener("visibilitychange",visibility);window.clearInterval(timer);void flush();};
  },[user]);
  return null;
}
