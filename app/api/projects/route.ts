// Always fresh: an edit in Firestore shows on the next request.
export async function GET() {
  try {
    const { getProjects } = await import("../../lib/projects");
    return Response.json(await getProjects(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not read projects from Firestore", error);
    return Response.json({ error: error instanceof Error ? error.message.slice(0, 300) : "Unknown error" }, { status: 500 });
  }
}
