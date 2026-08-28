"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
export function Header() {
  const [dark, setDark] = useState(false), [open, setOpen] = useState(false);
  const { user, signOut } = useAuth(), { progress, localProgressAvailable, importLocalProgress } = useProgress();
  return <header className="app-header"><Link href="/" className="mobile-brand">Deutschwerk</Link><div className="header-actions"><span className="header-level">{progress.currentLevel || "A2"}</span><button aria-label="Toggle color theme" onClick={() => { document.documentElement.classList.toggle("dark"); setDark(value => !value); }}>{dark ? "☀" : "☾"}</button><div className="account-menu"><button className="avatar" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>{user?.email?.slice(0,2).toUpperCase() || "ME"}</button>{open && <div className="account-popover"><small>Signed in as</small><strong>{user?.email}</strong>{localProgressAvailable && <button onClick={importLocalProgress}>Import Local Progress</button>}<Link href="/settings" onClick={() => setOpen(false)}>Settings</Link><button onClick={signOut}>Sign Out</button></div>}</div></div></header>;
}
