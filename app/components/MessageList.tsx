"use client";

import { motion } from "motion/react";
import { getSubjectLabel, type Message } from "../lib/mailbox";

type MessageListProps = {
  messages: Message[];
  selectedId: string | null;
  onSelect: (message: Message) => void;
};

// Today shows the time, older messages show the date.
function formatListTime(milliseconds: number | null) {
  if (milliseconds === null) return "";

  const date = new Date(milliseconds);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function MessageList({ messages, selectedId, onSelect }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="px-6 py-10 text-[13px] text-foreground-400">No messages yet.</p>;
  }

  return (
    <ul>
      {messages.map((message) => {
        const isSelected = message.id === selectedId;
        return (
          <li key={message.id}>
            <motion.button
              type="button"
              onClick={() => onSelect(message)}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`flex w-full cursor-pointer items-start gap-3 border-b border-background-200 px-5 py-4 text-left transition-colors hover:bg-background-100 ${
                isSelected ? "bg-background-100" : ""
              }`}
            >
              {/* A dot marks a new message that has not been opened yet. */}
              <span className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                {!message.isRead && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="h-2 w-2 rounded-full bg-foreground-950"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span
                    className={`truncate text-[14px] text-foreground-950 ${message.isRead ? "" : "font-semibold"}`}
                  >
                    {message.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-foreground-400">{formatListTime(message.createdAt)}</span>
                </span>
                <span
                  className={`mt-0.5 block truncate text-[13px] text-foreground-950 ${message.isRead ? "" : "font-medium"}`}
                >
                  {getSubjectLabel(message)}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-foreground-400">{message.message}</span>
              </span>
            </motion.button>
          </li>
        );
      })}
    </ul>
  );
}
