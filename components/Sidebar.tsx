"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [["□", "Study", "/study"], ["✦", "Practice", "/practice"], ["⌘", "IT German", "/it"], ["Aa", "Grammar Words", "/grammar-words"], ["↗", "Progress", "/progress"], ["⚙", "Settings", "/settings"]];
export function Sidebar() {
  const path = usePathname();
  return <aside className="sidebar compact-sidebar"><Link href="/" className="brand"><span>DW</span><div>Deutschwerk<small>Learn one thing at a time.</small></div></Link><nav>{links.map(([icon, label, href]) => <Link key={href} href={href} className={path === href || (href !== "/" && path.startsWith(`${href}/`)) ? "active" : ""}><b>{icon}</b>{label}</Link>)}</nav></aside>;
}
