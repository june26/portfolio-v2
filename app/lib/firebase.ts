import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const SAVE_TIMEOUT_MS = 10_000;

type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function getFirebaseApp() {
  if (getApps().length) return getApp();

  const app = initializeApp(firebaseConfig);

  // App Check proves the request comes from this website (Fraud Defense, formerly reCAPTCHA Enterprise),
  // so scripts can't spam Firestore.
  // Skipped until a site key is set, so the form keeps working while App Check is being set up.
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (recaptchaSiteKey) {
    // Setting a debug token in .env skips reCAPTCHA on localhost. Use the same fixed token in the Firebase console.
    // Leave it out of .env to test the real reCAPTCHA check locally (needs "localhost" in the key's domains).
    const debugToken = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
    if (process.env.NODE_ENV === "development" && debugToken) {
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string }).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }

  return app;
}

// Saves the message in the "messages" collection. Read them in the Firebase console (Firestore Database).
export async function saveContactMessage({ name, email, subject, message }: ContactMessage) {
  const app = getFirebaseApp();
  const saving = addDoc(collection(getFirestore(app), "messages"), {
    name,
    email,
    subject,
    message,
    createdAt: serverTimestamp(),
  });

  // Firestore keeps retrying silently when it can't reach the server (offline, blocked by an ad blocker),
  // so give up after a while instead of leaving the form on "Sending…" forever.
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Could not reach Firestore in time")), SAVE_TIMEOUT_MS),
  );
  await Promise.race([saving, timeout]);
}
