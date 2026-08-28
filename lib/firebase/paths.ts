export const firebasePaths = {
  user: (uid: string) => `users/${uid}`,
  progress: (uid: string) => `users/${uid}/progress/main`,
  vocabulary: (uid: string, itemId: string) => `users/${uid}/vocabularyProgress/${itemId}`,
  grammar: (uid: string, itemId: string) => `users/${uid}/grammarProgress/${itemId}`,
  review: (uid: string, itemId: string) => `users/${uid}/reviewItems/${itemId}`,
  attempts: (uid: string) => `users/${uid}/exerciseAttempts`,
};
