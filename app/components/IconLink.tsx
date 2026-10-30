"use client";

import { motion } from "motion/react";

type IconLinkProps = {
  label: string;
  iconClass: string;
  onClick: () => void;
};

const POP = { type: "spring", stiffness: 500, damping: 18 } as const;

// Round icon button: grows on hover, squishes on press while the icon pops.
export default function IconLink({ label, iconClass, onClick }: IconLinkProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover="hover"
      whileTap="tap"
      variants={{ hover: { scale: 1.08 }, tap: { scale: 0.88 } }}
      transition={POP}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-background-200 bg-background-100 text-foreground-700 transition-colors hover:border-foreground-950 hover:bg-foreground-950 hover:text-background-50 md:h-12 md:w-12"
    >
      <motion.i
        className={`${iconClass} text-[18px]`}
        variants={{ tap: { scale: 1.3, rotate: -10 } }}
        transition={POP}
      />
    </motion.button>
  );
}
