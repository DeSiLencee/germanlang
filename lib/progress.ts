"use client";
import { useEffect, useState } from "react";
import { Exercise, Level, Progress } from "@/types";
import { grammarTopics } from "@/data/grammar/topics";
import { useAuth } from "@/lib/auth";
import { getFirebase } from "@/lib/firebase/client";
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
const initial: Progress = {
  completedLessons: [],
  attempts: 0,
  correct: 0,
  learnedWords: [],
  review: [],
  streak: 1,
  lastActive: "",
  dailyCount: 0,
};
const KEY = "deutschwerk-progress-v1";
export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);
  const [localProgressAvailable, setLocalProgressAvailable] = useState(false);
  useEffect(() => {
    if (!user) return;
    const firebase = getFirebase(), cacheKey = `${KEY}-cache-${user.uid}`;
    if (!firebase) return;
    return onSnapshot(doc(firebase.db, "users", user.uid, "progress", "main"), snapshot => {
      setLocalProgressAvailable(!!localStorage.getItem(KEY));
      const state = snapshot.data()?.state as Progress | undefined;
      if (state) setProgress({ ...initial, ...state });
      setReady(true);
    }, () => { const cached = localStorage.getItem(cacheKey); if (cached) setProgress({ ...initial, ...JSON.parse(cached) }); setReady(true); });
  }, [user]);
  const save = (next: Progress) => {
    setProgress(next);
    const clean = JSON.parse(JSON.stringify(next)) as Progress;
    if (user) localStorage.setItem(`${KEY}-cache-${user.uid}`, JSON.stringify(clean));
    const firebase = getFirebase();
    if (firebase && user) void setDoc(doc(firebase.db, "users", user.uid, "progress", "main"), { state: clean, lastStudyType: clean.continuation?.type || null, lastLevel: clean.continuation?.level || null, lastCategory: clean.continuation?.category || null, lastContentId: clean.continuation?.contentId || null, lastRoute: clean.continuation?.href || null, updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() }, { merge: true });
    window.dispatchEvent(new Event("progress-updated"));
  };
  const record = (exerciseId: string, correct: boolean, exercise?: Exercise) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const old = progress.review.find((r) => r.exerciseId === exerciseId);
    let review = progress.review.filter((r) => r.exerciseId !== exerciseId);
    if (!correct || old) {
      const wrong = (old?.incorrectCount || 0) + (correct ? 0 : 1),
        right = (old?.correctCount || 0) + (correct ? 1 : 0);
      const days = correct ? Math.min(14, Math.max(2, right * 2)) : 1;
      review.push({
        exerciseId,
        exercise: exercise || old?.exercise,
        incorrectCount: wrong,
        correctCount: right,
        difficulty: Math.max(1, wrong - right),
        lastReviewedAt: now.toISOString(),
        nextReviewAt: new Date(now.getTime() + days * 86400000).toISOString(),
      });
    }
    const technical =
      !!exercise?.technical || exerciseId.startsWith("it-") || /^e(19|2[0-8])$/.test(exerciseId);
    const itCategoryStats = { ...(progress.itCategoryStats || {}) };
    if (technical && exercise?.category) {
      const previous = itCategoryStats[exercise.category] || { attempts: 0, correct: 0 };
      itCategoryStats[exercise.category] = { attempts: previous.attempts + 1, correct: previous.correct + (correct ? 1 : 0) };
    }
    const grammarTopic = grammarTopics.find((topic) =>
      topic.exerciseIds.includes(exerciseId),
    );
    const grammarStats = { ...(progress.grammarStats || {}) };
    const grammarWordStats = { ...(progress.grammarWordStats || {}) };
    if (grammarTopic) {
      const previous = grammarStats[grammarTopic.id] || {
        attempts: 0,
        correct: 0,
      };
      grammarStats[grammarTopic.id] = {
        attempts: previous.attempts + 1,
        correct: previous.correct + (correct ? 1 : 0),
      };
    }
    if (exerciseId.startsWith("gw-")) {
      const grammarWordId = exerciseId.split("-").slice(1, -1).join("-");
      const previous = grammarWordStats[grammarWordId] || { attempts: 0, correct: 0 };
      grammarWordStats[grammarWordId] = { attempts: previous.attempts + 1, correct: previous.correct + (correct ? 1 : 0) };
    }
    save({
      ...progress,
      attempts: progress.attempts + 1,
      correct: progress.correct + (correct ? 1 : 0),
      itAttempts: (progress.itAttempts || 0) + (technical ? 1 : 0),
      itCorrect: (progress.itCorrect || 0) + (technical && correct ? 1 : 0),
      itCategoryStats,
      grammarStats,
      grammarWordStats,
      dailyCount: progress.lastActive === date ? progress.dailyCount + 1 : 1,
      lastActive: date,
      streak:
        progress.lastActive === date ? progress.streak : progress.streak + 1,
      review,
    });
    const firebase = getFirebase();
    if (firebase && user) {
      void addDoc(collection(firebase.db, "users", user.uid, "exerciseAttempts"), { exerciseId, contentId: exercise?.id || null, correct, sessionType: exercise?.technical ? "it" : exercise?.category || "practice", createdAt: serverTimestamp() });
      const item = review.find(entry => entry.exerciseId === exerciseId), reviewRef = doc(firebase.db, "users", user.uid, "reviewItems", exerciseId);
      if (item) void setDoc(reviewRef, { ...JSON.parse(JSON.stringify(item)), updatedAt: serverTimestamp() }, { merge: true }); else void deleteDoc(reviewRef);
      const grammarWordId = exerciseId.startsWith("gw-") ? exerciseId.split("-").slice(1,-1).join("-") : null;
      if (grammarWordId) void setDoc(doc(firebase.db, "users", user.uid, "grammarProgress", grammarWordId), { ...(grammarWordStats[grammarWordId] || {}), updatedAt: serverTimestamp() }, { merge: true });
    }
  };
  const setContinuation = (continuation: NonNullable<Progress["continuation"]>) => save({ ...progress, continuation });
  const setCurrentLevel = (level: Level) => { save({ ...progress, currentLevel: level }); const firebase = getFirebase(); if (firebase && user) void setDoc(doc(firebase.db, "users", user.uid), { currentLevel: level, updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() }, { merge: true }); };
  const importLocalProgress = () => {
    const saved = localStorage.getItem(KEY);
    if (!saved) return;
    try { const imported = { ...initial, ...JSON.parse(saved), continuation: progress.continuation }; save(imported); setLocalProgressAvailable(false); localStorage.setItem(`${KEY}-imported-${user?.uid}`, "true"); } catch { /* Preserve invalid legacy data without importing it. */ }
  };
  const rateWord = (id: string, rating: "again" | "hard" | "good" | "easy", level: Level, exercise?: Exercise) => {
    const now = new Date();
    const correct = rating === "good" || rating === "easy";
    const prior = progress.vocabularyReview?.[id];
    const days = rating === "again" ? 1 : rating === "hard" ? 2 : rating === "good" ? 5 : 14;
    const status = rating === "again" ? "review" : rating === "hard" ? "learning" : "learned";
    const vocabularyReview = { ...(progress.vocabularyReview || {}), [id]: { status, attempts: (prior?.attempts || 0) + 1, correct: (prior?.correct || 0) + (correct ? 1 : 0), lastReviewedAt: now.toISOString(), nextReviewAt: new Date(now.getTime() + days * 86400000).toISOString() } } satisfies NonNullable<Progress["vocabularyReview"]>;
    const learned = new Set(progress.learnedWords);
    if (status === "learned") learned.add(id); else learned.delete(id);
    const learnedWordLevels = { ...(progress.learnedWordLevels || {}) };
    if (progress.learnedWords.includes(id) !== learned.has(id)) learnedWordLevels[level] = Math.max(0, (learnedWordLevels[level] || 0) + (learned.has(id) ? 1 : -1));
    let review = progress.review.filter(item => !item.exerciseId.startsWith(`vocab-${id}-`));
    if ((rating === "again" || rating === "hard") && exercise) {
      const previous = progress.review.find(item => item.exerciseId === exercise.id);
      review.push({ exerciseId: exercise.id, exercise, incorrectCount: (previous?.incorrectCount || 0) + (rating === "again" ? 1 : 0), correctCount: previous?.correctCount || 0, difficulty: rating === "again" ? Math.max(2, (previous?.difficulty || 1) + 1) : Math.max(1, previous?.difficulty || 1), lastReviewedAt: now.toISOString(), nextReviewAt: new Date(now.getTime() + days * 86400000).toISOString() });
    }
    save({ ...progress, vocabularyReview, learnedWords: [...learned], learnedWordLevels, review });
    const firebase = getFirebase();
    if (firebase && user) {
      const state = vocabularyReview[id];
      void setDoc(doc(firebase.db, "users", user.uid, "vocabularyProgress", id), { status: state.status, timesSeen: state.attempts, correctCount: state.correct, incorrectCount: state.attempts - state.correct, lastReviewedAt: state.lastReviewedAt, nextReviewAt: state.nextReviewAt, mastery: state.attempts ? state.correct / state.attempts : 0, updatedAt: serverTimestamp() }, { merge: true });
      const reviewItem = review.find(item => item.exerciseId.startsWith(`vocab-${id}-`));
      if (reviewItem) void setDoc(doc(firebase.db, "users", user.uid, "reviewItems", reviewItem.exerciseId), { ...JSON.parse(JSON.stringify(reviewItem)), updatedAt: serverTimestamp() }, { merge: true });
    }
  };
  const toggleWord = (id: string, level?: "A1" | "A2" | "B1") => {
    const removing = progress.learnedWords.includes(id);
    const learnedWordLevels = { ...(progress.learnedWordLevels || {}) };
    if (level)
      learnedWordLevels[level] = Math.max(
        0,
        (learnedWordLevels[level] || 0) + (removing ? -1 : 1),
      );
    save({
      ...progress,
      learnedWords: removing
        ? progress.learnedWords.filter((x) => x !== id)
        : [...progress.learnedWords, id],
      learnedWordLevels,
    });
  };
  const completeLesson = (id: string) => {
    if (!progress.completedLessons.includes(id))
      save({
        ...progress,
        completedLessons: [...progress.completedLessons, id],
      });
  };
  const completeDialogue = (id: string) => {
    if (!(progress.completedDialogues || []).includes(id))
      save({
        ...progress,
        completedDialogues: [...(progress.completedDialogues || []), id],
      });
  };
  return {
    progress,
    ready,
    record,
    rateWord,
    toggleWord,
    completeLesson,
    completeDialogue,
    setContinuation,
    setCurrentLevel,
    localProgressAvailable: localProgressAvailable && !localStorage.getItem(`${KEY}-imported-${user?.uid}`),
    importLocalProgress,
  };
}
export function normalize(s: string) {
  return s
    .toLocaleLowerCase("de-DE")
    .trim()
    .replace(/[.!?,;:]/g, "")
    .replace(/\s+/g, " ");
}
