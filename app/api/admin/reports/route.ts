import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, reportRange } from "@/lib/firebase/admin-request";
export async function GET(request: NextRequest) {
  const access = await authorizeAdmin(request); if (access.error) return access.error;
  const range = reportRange(request); if (!range) return NextResponse.json({ error: "Valid uid, from and to are required." }, { status: 400 });
  const target = await access.admin!.auth.getUser(range.uid).catch(() => null); if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const snapshot = await access.admin!.db.collection("users").doc(range.uid).collection("dailyActivity").where("date", ">=", range.from).where("date", "<=", range.to).orderBy("date").get();
  return NextResponse.json({ user: { uid: target.uid, email: target.email || "", displayName: target.displayName || "" }, days: snapshot.docs.map(item => ({ id: item.id, ...item.data(), firstActivityAt: item.data().firstActivityAt?.toDate?.().toISOString() || null, lastActivityAt: item.data().lastActivityAt?.toDate?.().toISOString() || null, updatedAt: item.data().updatedAt?.toDate?.().toISOString() || null })) });
}
