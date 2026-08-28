import { NextRequest, NextResponse } from "next/server";
import type { VocabularyItem } from "@/types";
import { vocabulary as custom } from "@/data/vocabulary";
import a1 from "@/data/generated/goethe-a1.json";
import a2 from "@/data/generated/goethe-a2.json";
import b1 from "@/data/generated/goethe-b1.json";
const all = [...custom, ...a1, ...a2, ...b1] as VocabularyItem[];
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") || "").toLocaleLowerCase("de-DE");
  const id = params.get("id");
  const level = params.get("level") || "All";
  const category = params.get("category") || "All";
  const source = params.get("source") || "All";
  const status = params.get("status") || "All";
  const learned = new Set((params.get("learned") || "").split(",").filter(Boolean));
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(5000, Math.max(12, Number(params.get("pageSize")) || 48));
  const selected = id ? all.find(word => word.id === id) : undefined;
  const candidates = selected ? [selected, ...all.filter(word => word.id !== selected.id && word.level === selected.level && (word.category === selected.category || word.partOfSpeech === selected.partOfSpeech)).slice(0, 48)] : all;
  const filtered = candidates.filter(word => (level === "All" || word.level === level) && (category === "All" || word.category === category) && (source === "All" || word.source === source) && (status === "All" || (status === "Learned") === learned.has(word.id)) && `${word.article || ""} ${word.german} ${word.englishMeaning} ${word.turkish || ""} ${word.exampleSentence || ""}`.toLocaleLowerCase("de-DE").includes(query));
  const categories = [...new Set(all.filter(word => level === "All" || word.level === level).map(word => word.category))].sort();
  const start = (page - 1) * pageSize;
  return NextResponse.json({ items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize, pages: Math.max(1, Math.ceil(filtered.length / pageSize)), categories, counts: { all: all.length, A1: all.filter(word => word.level === "A1").length, A2: all.filter(word => word.level === "A2").length, B1: all.filter(word => word.level === "B1").length } });
}
