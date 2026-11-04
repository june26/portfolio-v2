import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { adminDb, getServiceAccount } from "./adminApp";

// Server only. Never import this file from a client component: it holds the service account.
// Sign in is checked with `jose` directly. The Firebase admin auth library is not used, because it
// fails to load on Vercel.
export const SESSION_COOKIE = "mailbox_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day, then sign in again
export { adminDb };

const SESSION_ISSUER = "mailbox";
const GOOGLE_SIGN_IN_KEYS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

type GoogleSignIn = { sub?: string; email?: string; email_verified?: boolean; auth_time?: number };

// Checks the ID token that Google gave after sign in: right signature, issued for this Firebase project,
// not expired. `keys` can be swapped in tests.
export async function verifyGoogleSignIn(idToken: string, keys: Parameters<typeof jwtVerify>[1] = GOOGLE_SIGN_IN_KEYS) {
  const { project_id: projectId } = getServiceAccount();
  const { payload } = await jwtVerify(idToken, keys, {
    algorithms: ["RS256"],
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  return payload as GoogleSignIn;
}

// Only your own verified Google account may open the mailbox.
export function isAdminAccount(token: GoogleSignIn) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail) && token.email_verified === true && token.email?.toLowerCase() === adminEmail;
}

// The session is a signed token in an HttpOnly cookie. It is signed with the service account's private
// key, which only the server has, so nobody else can make one.
const sessionKey = () => new TextEncoder().encode(getServiceAccount().private_key);

export function createSessionToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionKey());
}

// True when the request carries a valid, not expired session cookie of the admin.
export async function hasAdminSession(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  try {
    const { payload } = await jwtVerify(sessionCookie, sessionKey(), { algorithms: ["HS256"], issuer: SESSION_ISSUER });
    return isAdminAccount({ email: String(payload.email ?? ""), email_verified: true });
  } catch {
    return false;
  }
}

// Requests that change something must come from this same site (extra protection on top of SameSite=Strict).
export function isSameSiteRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === null || origin === request.nextUrl.origin;
}
