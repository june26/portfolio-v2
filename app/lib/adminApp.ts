import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server only. Never import this file from a client component: it holds the service account.
// Kept apart from admin.ts so reading Firestore never loads firebase-admin/auth (it needs a newer Node).
function getAdminApp() {
  if (getApps().length) return getApp();

  // The service account JSON, base64 encoded, so it fits on one line of .env.
  const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString();
  return initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
}

export const adminApp = getAdminApp;
export const adminDb = () => getFirestore(getAdminApp());
