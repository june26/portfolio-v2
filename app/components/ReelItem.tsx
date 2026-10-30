"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

type ReelItemProps = {
  index: number;
  count: number;
  // Which project the reel is on, e.g. 2.4 = a bit past project 3 (index 2). Keeps growing, never resets.
  reelPosition: MotionValue<number>;
  children: ReactNode;
};

const MAX_TILT_DEGREES = 46;
const MIN_SCALE = 0.84;
const MIN_OPACITY = 0.34;
// An item this many projects away from the center is fully tilted and faded.
const FAR_DISTANCE = 1.1;
// Only an item this close to the center (in projects) can be clicked.
const CLICKABLE_DISTANCE = 0.25;

// How many projects this item is from the center, wrapped so the list loops forever: -count/2 .. count/2.
function getOffsetFromCenter(index: number, position: number, count: number) {
  const offset = (index - position) % count;
  const wrapped = ((offset + count * 1.5) % count) - count / 2;
  return wrapped;
}

export default function ReelItem({ index, count, reelPosition, children }: ReelItemProps) {
  const offset = useTransform(reelPosition, (position) => getOffsetFromCenter(index, position, count));
  const distance = useTransform(offset, (value) => Math.max(-1, Math.min(1, value / FAR_DISTANCE)));

  const y = useTransform(offset, (value) => `calc(${value} * var(--reel-pitch))`);
  const tilt = useTransform(distance, (value) => value * MAX_TILT_DEGREES);
  const scale = useTransform(distance, (value) => 1 - Math.abs(value) * (1 - MIN_SCALE));
  const opacity = useTransform(distance, (value) => 1 - Math.abs(value) * (1 - MIN_OPACITY));
  const pointerEvents = useTransform(offset, (value) =>
    Math.abs(value) < CLICKABLE_DISTANCE ? "auto" : "none",
  );

  return (
    <motion.section
      className="absolute inset-x-0 top-1/2 flex items-center justify-center"
      style={{ height: "var(--reel-pitch)", marginTop: "calc(var(--reel-pitch) / -2)", perspective: 1400, y }}
    >
      <motion.div
        className="w-full max-w-(--card-width)"
        style={{ rotateX: tilt, scale, opacity, pointerEvents }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
