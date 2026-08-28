"use client";
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseConfigured, getFirebase } from "@/lib/firebase/client";

type AuthState = { user: User | null; loading: boolean; configured: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (email: string, password: string, displayName?: string) => Promise<void>; signOut: () => Promise<void> };
const unavailable = async () => { throw new Error("firebase/configuration-missing"); };
const AuthContext = createContext<AuthState>({ user: null, loading: true, configured: false, signIn: unavailable, signUp: unavailable, signOut: unavailable });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(), router = useRouter(), firebase = useMemo(() => getFirebase(), []);
  const [user, setUser] = useState<User | null>(null), [loading, setLoading] = useState(() => !!firebase);
  useEffect(() => firebase ? onAuthStateChanged(firebase.auth, next => { setUser(next); setLoading(false); }) : undefined, [firebase]);
  useEffect(() => { if (loading) return; if (!user && pathname !== "/auth") router.replace("/auth"); if (user && pathname === "/auth") router.replace("/"); }, [loading, pathname, router, user]);
  const value = useMemo<AuthState>(() => ({
    user, loading, configured: firebaseConfigured,
    signIn: async (email, password) => { if (!firebase) return unavailable(); await signInWithEmailAndPassword(firebase.auth, email, password); },
    signUp: async (email, password, displayName) => { if (!firebase) return unavailable(); const result = await createUserWithEmailAndPassword(firebase.auth, email, password); if (displayName) await updateProfile(result.user, { displayName }); await setDoc(doc(firebase.db, "users", result.user.uid), { displayName: displayName || null, currentLevel: "A2", createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() }, { merge: true }); },
    signOut: async () => { if (firebase) await firebaseSignOut(firebase.auth); router.replace("/auth"); },
  }), [firebase, loading, router, user]);
  if (loading || (!user && pathname !== "/auth") || (user && pathname === "/auth")) return <div className="auth-loading"><span>Deutschwerk</span><small>Restoring your session…</small></div>;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
