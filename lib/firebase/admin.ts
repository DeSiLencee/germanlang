import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

export const REPORT_ADMIN_UID = process.env.REPORT_ADMIN_UID || "hvOiRdfeysSqP9waV9QSJB6wiKz2";
let app: App | null = null;
export function getFirebaseAdmin(): { auth: Auth; db: Firestore } | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  app ||= getApps().length ? getApp() : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  return { auth: getAuth(app), db: getFirestore(app) };
}
