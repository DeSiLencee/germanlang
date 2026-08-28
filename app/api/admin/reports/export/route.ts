import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, reportRange } from "@/lib/firebase/admin-request";
const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"','""')}"`;
export async function GET(request: NextRequest) {
  const access = await authorizeAdmin(request); if (access.error) return access.error;
  const range = reportRange(request); if (!range) return NextResponse.json({ error: "Valid uid, from and to are required." }, { status: 400 });
  const target = await access.admin!.auth.getUser(range.uid).catch(() => null); if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const snapshot = await access.admin!.db.collection("users").doc(range.uid).collection("dailyActivity").where("date", ">=", range.from).where("date", "<=", range.to).orderBy("date").get();
  const header = ["Date","User Email","User UID","First Activity","Last Activity","Active Study Minutes","Questions Answered","Cards Studied","Review Items Completed","Correct Answers","Incorrect Answers","Accuracy"];
  const rows = snapshot.docs.map(item => { const day=item.data(), total=(day.correctAnswers||0)+(day.incorrectAnswers||0), accuracy=total?`${Math.round((day.correctAnswers||0)/total*100)}%`:""; return [day.date,target.email||"",target.uid,day.firstActivityAt?.toDate?.().toISOString()||"",day.lastActivityAt?.toDate?.().toISOString()||"",Math.round((day.activeStudySeconds||0)/60),day.questionsAnswered||0,day.cardsStudied||0,day.reviewItemsCompleted||0,day.correctAnswers||0,day.incorrectAnswers||0,accuracy].map(csv).join(","); });
  const name=(target.email||target.uid).split("@")[0].replace(/[^a-z0-9_-]/gi,"-");
  return new NextResponse(`\uFEFF${header.map(csv).join(",")}\r\n${rows.join("\r\n")}`, { headers: { "content-type":"text/csv; charset=utf-8", "content-disposition":`attachment; filename="study-report-${name}-${range.from}-to-${range.to}.csv"`, "cache-control":"no-store" } });
}
