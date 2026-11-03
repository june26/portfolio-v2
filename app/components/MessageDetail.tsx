"use client";

import { motion } from "motion/react";
import { getSubjectLabel, openReply, type Message } from "../lib/mailbox";

type MessageDetailProps = {
  message: Message;
  onBack: () => void;
  onMarkUnread: () => void;
};

type ActionButtonProps = {
  label: string;
  iconClass: string;
  onClick: () => void;
  className?: string;
};

function ActionButton({ label, iconClass, onClick, className = "" }: ActionButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground-700 transition-colors hover:bg-background-100 ${className}`}
    >
      <i className={`${iconClass} text-[18px]`} />
    </motion.button>
  );
}

export default function MessageDetail({ message, onBack, onMarkUnread }: MessageDetailProps) {
  const sentAt = message.createdAt
    ? new Date(message.createdAt).toLocaleString([], { dateStyle: "long", timeStyle: "short" })
    : "";

  return (
    <motion.article
      key={message.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex h-full flex-col"
    >
      {/* Top bar, like a chat app: who it is from on the left, actions on the right. */}
      <header className="flex items-center gap-3 border-b border-background-200 px-4 py-3 md:px-6">
        <ActionButton label="Back to inbox" iconClass="ri-arrow-left-line" onClick={onBack} className="md:hidden" />

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground-950 text-[14px] font-medium uppercase text-background-50">
          {message.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-foreground-950">{message.name}</p>
          <p className="truncate text-[12px] text-foreground-400">{message.email}</p>
        </div>

        <ActionButton label="Reply in Gmail" iconClass="ri-reply-line" onClick={() => openReply(message)} />
        <ActionButton label="Mark as unread" iconClass="ri-mail-unread-line" onClick={onMarkUnread} />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-[26px] font-medium leading-tight tracking-tight text-foreground-950 md:text-[32px]">
            {getSubjectLabel(message)}
          </h2>
          <p className="mt-3 text-[12px] uppercase tracking-widest text-foreground-400">{sentAt}</p>

          <div className="my-8 h-px bg-background-200" />

          {/* Plain text only: the message is never rendered as HTML. */}
          <p className="whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground-950">
            {message.message}
          </p>

          <motion.button
            type="button"
            onClick={() => openReply(message)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="mt-12 flex h-12 cursor-pointer items-center gap-2 rounded-full bg-foreground-950 px-7 text-[13px] font-medium tracking-wide text-background-50"
          >
            <i className="ri-mail-send-line text-[15px]" />
            Reply in Gmail
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
