"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const friendlyError = (message: string) => {
  const value = message.toLowerCase();
  if (value.includes("invalid-credential") || value.includes("wrong-password") || value.includes("user-not-found")) return "Incorrect email or password.";
  if (value.includes("email-already-in-use")) return "An account already exists for this email.";
  if (value.includes("weak-password")) return "Please choose a password with at least 6 characters.";
  if (value.includes("invalid-email")) return "Enter a valid email address.";
  if (value.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (value.includes("network") || value.includes("fetch")) return "Could not reach the server. Check your connection and try again.";
  return "Authentication could not be completed. Please check your details and try again.";
};
export default function AuthPage() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [displayName, setDisplayName] = useState(""), [message, setMessage] = useState(""), [error, setError] = useState(false), [busy, setBusy] = useState(false);
  const { configured, signIn, signUp } = useAuth();
  async function submit(mode: "login" | "signup") {
    setMessage(""); setError(false);
    if (!email.trim() || !password) { setError(true); setMessage("Enter your email and password."); return; }
    if (!configured) { setError(true); setMessage("Firebase configuration is missing. Add the public Firebase web configuration to the environment."); return; }
    setBusy(true);
    try {
      if (mode === "login") await signIn(email.trim(), password); else await signUp(email.trim(), password, displayName.trim());
    } catch (caught) { setError(true); setMessage(friendlyError(caught instanceof Error ? caught.message : "network")); }
    finally { setBusy(false); }
  }
  return <div className="page auth-page"><section className="card auth-card"><div className="auth-mark">DW</div><div className="eyebrow">Deutschwerk account</div><h1>Continue learning</h1><p>Your progress follows you across your phone and computer.</p><label htmlFor="display-name">Display name <small>optional, used when creating an account</small></label><input id="display-name" autoComplete="name" value={displayName} onChange={event => setDisplayName(event.target.value)} placeholder="Name"/><label htmlFor="email">Email</label><input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} onKeyDown={event => event.key === "Enter" && submit("login")} placeholder="At least 6 characters"/>{message && <div className={`auth-message ${error ? "error" : "success"}`} role="status">{message}</div>}<button className="primary" disabled={busy} onClick={() => submit("login")}>{busy ? "Please wait…" : "Sign In"}</button><button className="secondary" disabled={busy} onClick={() => submit("signup")}>Create Account</button></section></div>;
}
