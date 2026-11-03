import { cacheLife } from "next/cache";
import { projects as fallbackProjects, type Project } from "../data/projects";
import { adminDb } from "./admin";

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
    scope: toTextList(data.scope),
    narrative: toTextList(data.narrative),
  };
}

// Errors are thrown out of the cached function on purpose, so a failed read is never cached.
async function readProjects() {
  "use cache";
  cacheLife("minutes");

  const snapshot = await adminDb().collection("projects").orderBy("order").get();
  return snapshot.docs
    .map((doc) => ({ slug: doc.id, ...toProject(doc.data()) }))
    .filter((project) => project.name && project.imageUrl); // skip half-filled documents
}

export type ProjectWithSlug = Project & { slug: string };

// Falls back to the local list while Firestore is empty or unreachable, so the site never shows nothing.
export async function getProjects(): Promise<ProjectWithSlug[]> {
  try {
    const list = await readProjects();
    if (list.length > 0) return list;
  } catch (error) {
    console.error("Could not read projects from Firestore, using the local list", error);
  }
  return fallbackProjects.map((project) => ({ ...project, slug: project.name.toLowerCase().replace(/\s+/g, "-") }));
}
