"use client";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { Level } from "@/types";
export default function SettingsPage() {
  const { user, signOut } = useAuth(), { progress, setCurrentLevel, localProgressAvailable, importLocalProgress } = useProgress();
  return <div className="page app-page"><div className="simple-heading"><h1>Settings</h1><p>Keep the learning experience comfortable and personal.</p></div><section className="card start-panel"><div><strong>Account</strong><p className="muted">{user?.email}</p></div><label>Current level</label><div className="segmented">{(["A1","A2","B1"] as Level[]).map(level => <button key={level} className={(progress.currentLevel || "A2") === level ? "active" : ""} onClick={() => setCurrentLevel(level)}>{level}</button>)}</div>{localProgressAvailable && <div><strong>Local progress detected</strong><p className="muted">Import the progress previously stored in this browser into your account.</p><button className="secondary" onClick={importLocalProgress}>Import My Progress</button></div>}<div><strong>Appearance</strong><p className="muted">Use the theme button in the compact header to switch between light and dark mode.</p></div><button className="secondary" onClick={signOut}>Sign Out</button></section></div>;
}
