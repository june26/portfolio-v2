import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseApp } from "./firebase";

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string; // empty for messages sent before the form had a subject
  message: string;
  createdAt: number | null; // milliseconds
  isRead: boolean;
};

export const getSubjectLabel = (message: Message) => message.subject || "(no subject)";

// Phones open the Gmail app (or whichever mail app is set up). Computers open Gmail in a new browser tab.
export function openReply(message: Message) {
  const subject = `Re: ${getSubjectLabel(message)}`;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (isTouchDevice) {
    window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
    return;
  }

  const params = new URLSearchParams({ view: "cm", fs: "1", to: message.email, su: subject });
  window.open(`https://mail.google.com/mail/?${params}`, "_blank", "noopener,noreferrer");
}

// Signs in with Google only to prove who you are. The server turns that into an HttpOnly cookie,
// then the browser forgets the Google session, so no token stays where JavaScript can read it.
export async function signInAsAdmin() {
  const auth = getAuth(getFirebaseApp());
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  const idToken = await user.getIdToken();
  await signOut(auth);

  const response = await fetch("/api/mailbox/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error("This account is not allowed.");
}

export async function signOutAdmin() {
  await fetch("/api/mailbox/session", { method: "DELETE" });
}

export async function checkSession(): Promise<boolean> {
  const response = await fetch("/api/mailbox/session", { cache: "no-store" });
  if (!response.ok) return false;

  const { signedIn } = await response.json();
  return signedIn === true;
}

export async function fetchMessages(): Promise<Message[] | null> {
  const response = await fetch("/api/mailbox/messages", { cache: "no-store" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not load messages.");

  const { messages } = await response.json();
  return messages;
}

export async function setMessageRead(id: string, isRead: boolean) {
  await fetch(`/api/mailbox/messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isRead }),
  });
}
