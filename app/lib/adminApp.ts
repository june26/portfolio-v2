import { cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server only. Never import this file from a client component: it holds the service account.
// The service account JSON is base64 encoded, so it fits on one line of .env.
export function getServiceAccount() {
  const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString();
  return JSON.parse(json) as { project_id: string; private_key: string };
}

function getAdminApp() {
  if (getApps().length) return getApp();
  return initializeApp({ credential: cert(getServiceAccount() as unknown as ServiceAccount) });
}

export const adminDb = () => getFirestore(getAdminApp());
