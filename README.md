# Deutschwerk

A responsive German learning application with A1–B1 vocabulary, Grammar Words, grammar lessons, German for IT, dialogues, flashcards, sentence ordering, practice, progress tracking, Firebase Authentication, and cross-device Firestore synchronization.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Firebase setup

1. Open Firebase Console and create or select a project.
2. Open **Project settings → General → Your apps**, choose **Web**, and register the app.
3. Copy the six web configuration values into `.env.local` using the names in `.env.example`.
4. Open **Build → Authentication → Get started → Sign-in method** and enable **Email/Password** only.
5. Open **Build → Firestore Database → Create database**. Choose the region closest to the learners.
6. Publish [firestore.rules](firestore.rules) in **Firestore Database → Rules**, or run `firebase deploy --only firestore:rules` after selecting the project with Firebase CLI.
7. For Vercel, add the same six public variables under **Project Settings → Environment Variables**, then redeploy.
8. In **Authentication → Settings → Authorized domains**, add the deployed Vercel domain. Firebase includes `localhost` for development projects by default; add it if it is absent.

Required environment variables:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

These are normal Firebase web client configuration values. No Firebase Admin key is used or exposed. Email verification is not required by the application. It can be introduced later from Firebase Authentication settings and the signup flow.

## User data model

Shared learning content remains in `data/` and is bundled read-only with the application. User-owned Firestore data is scoped below the authenticated UID:

```text
users/{uid}
users/{uid}/progress/main
users/{uid}/vocabularyProgress/{itemId}
users/{uid}/grammarProgress/{itemId}
users/{uid}/reviewItems/{itemId}
users/{uid}/exerciseAttempts/{attemptId}
```

The main progress document provides an efficient real-time snapshot for the UI. Event-specific subcollections preserve vocabulary state, grammar-word statistics, review items, and exercise history without moving the large shared course catalog into Firestore. Security Rules allow a user to access only their own document tree.

Firestore is the persistent source of truth. Browser storage is used only as a per-user resilience cache and for the explicit one-time import of progress created by older anonymous versions. Existing local progress is never silently deleted.

## Content tools

```bash
npm run import:wordlists
npm run validate:wordlists
npm run validate:it
npm run validate:grammar
npm run validate:grammar-words
```

The vocabulary API filters and paginates the static Goethe, custom, and German-for-IT datasets. Authentication and progress do not require copying this shared content into Firestore.
