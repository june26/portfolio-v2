import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";

// Server only. Never import this file from a client component: it holds the service account.
export const SESSION_COOKIE = "mailbox_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day, then sign in again

function getAdminApp() {
  if (getApps().length) return getApp();

  // The service account JSON, base64 encoded, so it fits on one line of .env.
  const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString();
  return initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());

// Only your own verified Google account may open the mailbox.
export function isAdminAccount(token: DecodedIdToken) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail) && token.email_verified === true && token.email?.toLowerCase() === adminEmail;
}

// True when the request carries a valid, not revoked session cookie of the admin.
export async function hasAdminSession(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  try {
    const token = await adminAuth().verifySessionCookie(sessionCookie, true);
    return isAdminAccount(token);
  } catch {
    return false;
  }
}

// Requests that change something must come from this same site (extra protection on top of SameSite=Strict).
export function isSameSiteRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === null || origin === request.nextUrl.origin;
}
