import type { Project } from "../data/projects";
import { adminDb } from "./adminApp";

// Server only. Projects live in the Firestore "projects" collection (document id = slug, `order` sorts them).
const toText = (value: unknown) => (typeof value === "string" ? value : "");
const toTextList = (value: unknown) => (Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);

function toProject(data: FirebaseFirestore.DocumentData): Project {
  return {
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

export type ProjectWithSlug = Project & { slug: string };

// Not cached on purpose: an edit in Firestore shows on the next request, with no redeploy.
export async function getProjects(): Promise<ProjectWithSlug[]> {
  const snapshot = await adminDb().collection("projects").orderBy("order").get();
  return snapshot.docs
    .map((doc) => ({ slug: doc.id, ...toProject(doc.data()) }))
    .filter((project) => project.name && project.imageUrl); // skip half-filled documents
}
