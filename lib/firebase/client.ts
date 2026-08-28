import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigured = Object.values(config).every(Boolean);
let app: FirebaseApp | null = null, auth: Auth | null = null, db: Firestore | null = null, persistenceConfigured = false;
export function getFirebase() {
  if (!firebaseConfigured) return null;
  app ||= getApps().length ? getApp() : initializeApp(config);
  auth ||= getAuth(app); db ||= getFirestore(app);
  if (!persistenceConfigured) { persistenceConfigured = true; void setPersistence(auth, browserLocalPersistence).catch(() => { persistenceConfigured = false; }); }
  return { app, auth, db };
}
