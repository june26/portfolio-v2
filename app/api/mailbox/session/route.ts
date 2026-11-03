import { NextResponse, type NextRequest } from "next/server";
import {
  adminAuth,
  isAdminAccount,
  isSameSiteRequest,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "../../../lib/admin";

// The Google sign-in must be this recent, so a stolen old token can't start a session.
const MAX_SIGN_IN_AGE_SECONDS = 5 * 60;

// Sign in: trade the Google ID token for an HttpOnly session cookie that JavaScript can never read.
export async function POST(request: NextRequest) {
  if (!isSameSiteRequest(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { idToken } = await request.json().catch(() => ({ idToken: undefined }));
  if (typeof idToken !== "string") return NextResponse.json({ error: "missing token" }, { status: 400 });

  try {
    const token = await adminAuth().verifyIdToken(idToken, true);
    const signedInSecondsAgo = Date.now() / 1000 - token.auth_time;
    if (!isAdminAccount(token) || signedInSecondsAgo > MAX_SIGN_IN_AGE_SECONDS) {
      return NextResponse.json({ error: "not allowed" }, { status: 403 });
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }
}

// Sign out: clear the cookie.
export async function DELETE(request: NextRequest) {
  if (!isSameSiteRequest(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
