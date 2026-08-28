"use client";
export function SessionHeader({ title, current, total, exitHref, hasProgress = false }: { title: string; current: number; total: number; exitHref: string; hasProgress?: boolean }) {
  const leave = () => { if (hasProgress && !window.confirm("Leave this session?\n\nYour completed answers have been saved, but this session will end.")) return; window.location.assign(exitHref); };
  return <div className="minimal-session-header"><button aria-label="Exit session" onClick={leave}>← <span>Exit</span></button><strong>{title}</strong><b>{current} / {total}</b></div>;
}
