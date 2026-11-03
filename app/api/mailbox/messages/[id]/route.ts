import { NextResponse, type NextRequest } from "next/server";
import { adminDb, hasAdminSession, isSameSiteRequest } from "../../../../lib/admin";

// Marks one message as read or unread. That is the only thing that can be changed.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameSiteRequest(request) || !(await hasAdminSession(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { isRead } = await request.json().catch(() => ({ isRead: undefined }));
  if (typeof isRead !== "boolean") return NextResponse.json({ error: "isRead must be true or false" }, { status: 400 });

  const { id } = await params;
  await adminDb().collection("messages").doc(id).update({ isRead });
  return NextResponse.json({ ok: true });
}
