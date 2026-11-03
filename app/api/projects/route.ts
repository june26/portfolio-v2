import { getProjects } from "../../lib/projects";

export async function GET() {
  return Response.json(await getProjects());
}
