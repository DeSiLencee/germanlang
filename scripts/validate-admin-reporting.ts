import { readFileSync } from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8"), errors:string[]=[];
const adminUid="hvOiRdfeysSqP9waV9QSJB6wiKz2", auth=read("lib/firebase/admin-request.ts"), rules=read("firestore.rules"), env=read(".env.example"), client=read("app/admin/reports/page.tsx"), paths=read("lib/firebase/paths.ts");
for(const route of ["app/api/admin/users/route.ts","app/api/admin/reports/route.ts","app/api/admin/reports/export/route.ts"]){const source=read(route);if(!source.includes("authorizeAdmin(request)"))errors.push(`${route} does not authorize the caller.`);}
if(!auth.includes("verifyIdToken")||!auth.includes("REPORT_ADMIN_UID"))errors.push("Admin token/UID verification is missing.");
if(!client.includes("REPORT_ADMIN_UID")||!paths.includes(adminUid))errors.push("Client route guard does not use the canonical admin UID.");
if(!rules.includes("request.auth.uid == userId"))errors.push("Normal user isolation rule is missing.");
for(const name of ["FIREBASE_ADMIN_PROJECT_ID","FIREBASE_ADMIN_CLIENT_EMAIL","FIREBASE_ADMIN_PRIVATE_KEY","REPORT_ADMIN_UID"]){if(!env.includes(`${name}=`))errors.push(`Missing server environment placeholder: ${name}`);if(env.includes(`NEXT_PUBLIC_${name}`))errors.push(`${name} is incorrectly public.`);}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("Admin UID enforcement, server token verification, API guards, private environment names, and owner-only Firestore rules validated.");
