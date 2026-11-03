// One-time copy of app/data/projects.ts into Firestore. Run: npm run seed:projects
// Reads the service account from .env. Overwrites documents with the same slug.
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../app/data/projects.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { projects } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString());
const db = getFirestore(initializeApp({ credential: cert(serviceAccount) }));

const batch = db.batch();
projects.forEach((project, index) => {
  const slug = project.name.toLowerCase().replace(/\s+/g, "-");
  batch.set(db.collection("projects").doc(slug), { ...project, order: index + 1 });
});
await batch.commit();
console.log(`Saved ${projects.length} projects to Firestore.`);
