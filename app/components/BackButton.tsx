"use client";

import { motion } from "motion/react";

const POP = { type: "spring", stiffness: 500, damping: 18 } as const;

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      variants={{ tap: { scale: 0.92 } }}
      transition={POP}
      className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-background-200 px-4 text-[12px] font-medium tracking-wide text-foreground-700 transition-colors hover:border-foreground-950 hover:bg-foreground-950 hover:text-background-50"
    >
      <motion.i
        className="ri-arrow-left-line text-[15px]"
        variants={{ hover: { x: -3 }, tap: { x: -6 } }}
        transition={POP}
      />
      Back
    </motion.button>
  );
}
