import { getProjects } from "../../../lib/projects";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getProjects()).find((item) => item.slug === slug);
  return project ? Response.json(project) : Response.json({ error: "Not found" }, { status: 404 });
}
