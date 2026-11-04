"use client";

import { motion } from "motion/react";

const SLOTS = [
  { x: -1.9, y: -1.5, scale: 0.8, opacity: 0.3 },
  { x: -1.05, y: -0.78, scale: 0.9, opacity: 0.6 },
  { x: 0, y: 0, scale: 1, opacity: 1 },
  { x: 1.05, y: 0.78, scale: 0.9, opacity: 0.6 },
  { x: 1.9, y: 1.5, scale: 0.8, opacity: 0.3 },
];

export default function ReelSkeleton() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {SLOTS.map(({ x, y, scale, opacity }) => (
        <div
          key={x}
          className="absolute aspect-[3/4] w-full max-w-(--card-width) translate-x-[calc(var(--card-width)*var(--x))] md:aspect-[4/3] md:translate-x-0 md:translate-y-[calc(var(--card-width)*var(--y))]"
          style={{ "--x": x, "--y": y, scale, opacity } as React.CSSProperties}
        >
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-background-200">
            <motion.div
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-background-50/70 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.3 }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}
