import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/firebase/admin-request";
export async function GET(request: NextRequest) {
  const access = await authorizeAdmin(request); if (access.error) return access.error;
  const users = [], auth = access.admin!.auth; let token: string | undefined;
  do { const page = await auth.listUsers(1000, token); users.push(...page.users.map(user => ({ uid: user.uid, email: user.email || "", displayName: user.displayName || "" }))); token = page.pageToken; } while (token);
  return NextResponse.json({ users });
}
