"use client";

import { motion } from "motion/react";

type SocialLinkProps = {
  label: string;
  iconClass: string;
  url: string;
};

const POP = { type: "spring", stiffness: 500, damping: 22 } as const;

export default function SocialLink({ label, iconClass, url }: SocialLinkProps) {
  return (
    <motion.a
      href={url}
      target={url.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      variants={{ hover: { x: 4 } }}
      transition={POP}
      className="group flex items-center gap-4 rounded-xl border border-background-200 bg-background-100 px-4 py-3.5 text-foreground-700 transition-colors hover:border-foreground-950 hover:bg-foreground-950 hover:text-background-50"
    >
      <i className={`${iconClass} text-[18px]`} />
      <span className="flex-1 text-[14px] font-medium">{label}</span>
      <motion.i
        className="ri-arrow-right-up-line text-[15px] opacity-60"
        variants={{ hover: { x: 2, y: -2 } }}
        transition={POP}
      />
    </motion.a>
  );
}
