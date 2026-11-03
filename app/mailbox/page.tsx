import type { Metadata } from "next";
import Mailbox from "../components/Mailbox";

// A private page: keep it out of search results.
export const metadata: Metadata = {
  title: "Mailbox",
  robots: { index: false, follow: false },
};

export default function MailboxPage() {
  return <Mailbox />;
}
