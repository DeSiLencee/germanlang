import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin, REPORT_ADMIN_UID } from "@/lib/firebase/admin";
export async function authorizeAdmin(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  const admin = getFirebaseAdmin();
  if (!admin) return { error: NextResponse.json({ error: "Firebase Admin is not configured." }, { status: 503 }) };
  try { const token = await admin.auth.verifyIdToken(header.slice(7)); if (token.uid !== REPORT_ADMIN_UID) return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) }; return { admin, token }; }
  catch { return { error: NextResponse.json({ error: "Invalid authentication token." }, { status: 401 }) }; }
}
export function reportRange(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from"), to = request.nextUrl.searchParams.get("to"), uid = request.nextUrl.searchParams.get("uid");
  if (!uid || !from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return null;
  return { uid, from, to };
}
