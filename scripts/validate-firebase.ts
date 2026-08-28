import { readFileSync } from "node:fs";
import { firebasePaths } from "../lib/firebase/paths";
const rules = readFileSync("firestore.rules", "utf8"), env = readFileSync(".env.example", "utf8"), packageFile = readFileSync("package.json", "utf8");
const required = ["NEXT_PUBLIC_FIREBASE_API_KEY","NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN","NEXT_PUBLIC_FIREBASE_PROJECT_ID","NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET","NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID","NEXT_PUBLIC_FIREBASE_APP_ID","NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"];
const errors: string[] = [];
if (!rules.includes("request.auth.uid == userId")) errors.push("Firestore rules do not enforce UID ownership.");
if (!rules.includes("match /users/{userId}")) errors.push("Firestore rules do not scope user documents.");
for (const variable of required) if (!env.includes(`${variable}=`)) errors.push(`Missing ${variable}`);
if (!packageFile.includes('"firebase"')) errors.push("Firebase SDK is missing.");
if (/supabase/i.test(packageFile) || /supabase/i.test(env)) errors.push("Supabase configuration remains active.");
const a = firebasePaths.progress("account-a"), b = firebasePaths.progress("account-b");
if (a === b || !a.startsWith("users/account-a/") || !b.startsWith("users/account-b/")) errors.push("Two-account paths are not isolated.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Firebase configuration and UID isolation validated (${a} ≠ ${b}).`);
