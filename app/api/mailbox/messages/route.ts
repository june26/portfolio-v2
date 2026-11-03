import { NextResponse, type NextRequest } from "next/server";
import { adminDb, hasAdminSession } from "../../../lib/admin";

const MAX_MESSAGES = 200;

export async function GET(request: NextRequest) {
  if (!(await hasAdminSession(request))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const snapshot = await adminDb()
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(MAX_MESSAGES)
    .get();

  const messages = snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      subject: String(data.subject ?? ""),
      message: String(data.message ?? ""),
      createdAt: data.createdAt?.toMillis?.() ?? null,
      isRead: data.isRead === true,
    };
  });

  return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}
