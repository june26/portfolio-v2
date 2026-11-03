"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type SentModalProps = {
  isOpen: boolean;
  name: string;
  onClose: () => void;
};

export default function SentModal({ isOpen, name, onClose }: SentModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  // The server has no document to attach to, and nothing is open yet anyway.
  if (typeof document === "undefined") return null;

  // Rendered on the page itself, so it covers everything no matter which panel it was opened from.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-70 flex items-center justify-center bg-foreground-950/30 px-6 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Message sent"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-background-200 bg-background-50 px-8 pb-8 pt-10 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground-950">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-background-50"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                />
              </svg>
            </span>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <h2 className="mt-6 text-[24px] leading-tight tracking-tight text-foreground-950">
                Thank you{name ? `, ${name}` : ""}
                <span className="text-foreground-400">.</span>
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground-400">
                Your message is on its way. I’ll get back to you soon.
              </p>
            </motion.div>

            <motion.button
              type="button"
              autoFocus
              onClick={onClose}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="mt-8 h-11 cursor-pointer rounded-full bg-foreground-950 px-7 text-[13px] font-medium tracking-wide text-background-50"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
