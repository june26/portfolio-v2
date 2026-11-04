import type { Project } from "../data/projects";
import { adminDb } from "./adminApp";

// Server only. Projects live in the Firestore "projects" collection (document id = slug, `order` sorts them).
const toText = (value: unknown) => (typeof value === "string" ? value : "");
const toTextList = (value: unknown) => (Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);

function toProject(slug: string, data: FirebaseFirestore.DocumentData): Project {
  return {
    slug,
    name: toText(data.name),
    category: toText(data.category),
    imageUrl: toText(data.imageUrl),
    year: toText(data.year),
    role: toText(data.role),
    stack: toTextList(data.stack),
    summary: toText(data.summary),
    client: toText(data.client),
    company: toText(data.company),
    scope: toTextList(data.scope),
    narrative: toTextList(data.narrative),
  };
}

// Not cached on purpose: an edit in Firestore shows on the next request, with no redeploy.
export async function getProjects(): Promise<Project[]> {
  const snapshot = await adminDb().collection("projects").orderBy("order").get();
  return snapshot.docs
    .map((doc) => toProject(doc.id, doc.data()))
    .filter((project) => project.name && project.imageUrl); // skip half-filled documents
}
