"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { socials } from "../data/profile";
import { saveContactMessage } from "../lib/firebase";
import PageHeader from "./PageHeader";
import SentModal from "./SentModal";
import SocialLink from "./SocialLink";

const FIELD_CLASS =
  "w-full border-b border-background-200 bg-transparent py-3 text-[14px] text-foreground-950 outline-none transition-colors placeholder:text-foreground-400 focus:border-foreground-950";

type SendStatus = "idle" | "sending" | "sent" | "failed";

// The "sent" state is shown by the thank-you modal, so the button just goes back to normal.
const BUTTON_LABEL: Record<SendStatus, string> = {
  idle: "Send message",
  sending: "Sending…",
  sent: "Send message",
  failed: "Failed, try again",
};

export default function ContactPage({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [senderName, setSenderName] = useState("");
  const isSending = status === "sending";

  const sendMessage = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    // Real visitors never see this hidden field, only bots fill it in.
    if (data.get("website")) return;

    setStatus("sending");
    try {
      await saveContactMessage({
        name: String(data.get("name")),
        email: String(data.get("email")),
        subject: String(data.get("subject")),
        message: String(data.get("message")),
      });
      setSenderName(String(data.get("name")));
      form.reset();
      setStatus("sent");
    } catch (error) {
      console.error("Could not send the message:", error);
      setStatus("failed");
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Contact" onBack={onBack} />
      <SentModal isOpen={status === "sent"} name={senderName} onClose={() => setStatus("idle")} />

      <div className="flex flex-1 flex-col md:flex-row">
        <section className="flex flex-col gap-8 px-6 py-10 md:w-[42%] md:justify-center md:px-12 xl:px-20">
          {/* On desktop the heading floats just above the links, so the links stay lined up with the form. */}
          <div className="relative flex max-w-80 flex-col gap-3">
            <div className="mb-5 md:absolute md:bottom-full md:left-0 md:mb-10 md:w-max">
              <h2 className="text-[30px] leading-tight tracking-tight text-foreground-950 md:text-[42px]">
                Let’s talk<span className="text-foreground-400">.</span>
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-foreground-400">
                Find me on these, or send a message.
              </p>
            </div>
            {socials.map((social) => (
              <SocialLink key={social.label} {...social} />
            ))}
          </div>
        </section>

        <section className="flex items-center px-6 pb-12 md:w-[58%] md:px-12 md:py-10 xl:px-20">
          <form
            className="flex w-full max-w-lg flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(event.currentTarget);
            }}
          >
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            <input name="name" type="text" required placeholder="Name" className={FIELD_CLASS} />
            <input name="email" type="email" required placeholder="Email" className={FIELD_CLASS} />
            <input name="subject" type="text" required maxLength={150} placeholder="Subject" className={FIELD_CLASS} />
            <textarea name="message" required rows={5} placeholder="Message" className={`${FIELD_CLASS} resize-none`} />

            <motion.button
              type="submit"
              disabled={isSending}
              whileHover={isSending ? undefined : { scale: 1.03 }}
              whileTap={isSending ? undefined : { scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="flex h-12 cursor-pointer items-center disabled:cursor-not-allowed disabled:opacity-50 justify-center gap-2 self-start rounded-full bg-foreground-950 px-7 text-[13px] font-medium tracking-wide text-background-50"
            >
              {BUTTON_LABEL[status]}
              <i className="ri-send-plane-line text-[15px]" />
            </motion.button>
          </form>
        </section>
      </div>
    </div>
  );
}
