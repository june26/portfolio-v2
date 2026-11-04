"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { checkSession, fetchMessages, setMessageRead, signInAsAdmin, signOutAdmin, type Message } from "../lib/mailbox";
import MessageDetail from "./MessageDetail";
import MessageList from "./MessageList";

const REFRESH_EVERY_MS = 30_000;

type SessionState = "checking" | "signedOut" | "signedIn";

export default function Mailbox() {
  const [session, setSession] = useState<SessionState>("checking");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signInError, setSignInError] = useState("");

  // null means the server has no valid session for us, so show the sign in screen.
  const showMessages = useCallback((loaded: Message[] | null) => {
    if (loaded === null) return setSession("signedOut");

    setMessages(loaded);
    setSession("signedIn");
  }, []);

  // First ask only "am I signed in?". The inbox is never requested before that is a yes.
  useEffect(() => {
    checkSession()
      .then((signedIn) => (signedIn ? fetchMessages() : null))
      .then(showMessages)
      .catch(() => setSession("signedOut"));
  }, [showMessages]);

  // Once signed in, keep the list fresh. If a refresh fails, keep what is on screen.
  useEffect(() => {
    if (session !== "signedIn") return;

    const refresh = setInterval(() => fetchMessages().then(showMessages).catch(() => {}), REFRESH_EVERY_MS);
    return () => clearInterval(refresh);
  }, [session, showMessages]);

  const signIn = async () => {
    setSignInError("");
    try {
      await signInAsAdmin();
      showMessages(await fetchMessages());
    } catch {
      setSignInError("This Google account is not allowed to open the mailbox.");
    }
  };

  const signOut = async () => {
    await signOutAdmin();
    setMessages([]);
    setSelectedId(null);
    setSession("signedOut");
  };

  const updateRead = (id: string, isRead: boolean) => {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, isRead } : message)));
    setMessageRead(id, isRead);
  };

  const openMessage = (message: Message) => {
    setSelectedId(message.id);
    if (!message.isRead) updateRead(message.id, true);
  };

  const markUnread = (id: string) => {
    updateRead(id, false);
    setSelectedId(null);
  };

  if (session === "checking") return <main className="h-dvh bg-background-50" />;

  if (session === "signedOut") {
    return (
      <main className="flex h-dvh items-center justify-center bg-background-50 px-6">
        <div className="flex w-full max-w-xs flex-col items-center text-center">
          <h1 className="text-[28px] tracking-tight text-foreground-950">
            Mailbox<span className="text-foreground-400">.</span>
          </h1>
          <p className="mt-2 text-[14px] text-foreground-400">Private. Sign in to read your messages.</p>

          <motion.button
            type="button"
            onClick={signIn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="mt-8 flex h-12 cursor-pointer items-center gap-2 rounded-full bg-foreground-950 px-7 text-[13px] font-medium tracking-wide text-background-50"
          >
            <i className="ri-google-fill text-[15px]" />
            Sign in with Google
          </motion.button>

          {signInError && <p className="mt-4 text-[13px] text-foreground-700">{signInError}</p>}
        </div>
      </main>
    );
  }

  const selectedMessage = messages.find((message) => message.id === selectedId) ?? null;
  const unreadCount = messages.filter((message) => !message.isRead).length;

  return (
    <main className="mx-auto flex h-dvh max-w-420 bg-background-50">
      {/* On a phone only one side shows at a time, like a chat app. */}
      <aside
        className={`h-full w-full flex-col border-r border-background-200 md:flex md:w-90 md:shrink-0 ${
          selectedMessage ? "hidden" : "flex"
        }`}
      >
        <header className="flex items-center justify-between border-b border-background-200 px-5 py-5">
          <div>
            <h1 className="text-[18px] tracking-tight text-foreground-950">Inbox</h1>
            <p className="text-[12px] text-foreground-400">{unreadCount} new</p>
          </div>
          <motion.button
            type="button"
            onClick={signOut}
            whileTap={{ scale: 0.94 }}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-background-200 px-4 text-[12px] text-foreground-700 hover:bg-background-100"
          >
            <i className="ri-logout-box-r-line" />
            Sign out
          </motion.button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} selectedId={selectedId} onSelect={openMessage} />
        </div>
      </aside>

      <section className={`h-full min-w-0 flex-1 md:block ${selectedMessage ? "block" : "hidden"}`}>
        {selectedMessage ? (
          <MessageDetail
            message={selectedMessage}
            onBack={() => setSelectedId(null)}
            onMarkUnread={() => markUnread(selectedMessage.id)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] text-foreground-400">
            Select a message to read it.
          </div>
        )}
      </section>
    </main>
  );
}
