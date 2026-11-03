"use client";

import { motion, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

type ReelItemProps = {
  index: number;
  count: number;
  // Which project the reel is on, e.g. 2.4 = a bit past project 3 (index 2). Keeps growing, never resets.
  reelPosition: MotionValue<number>;
  // How many cards stay visible on each side of the center one (3 on desktop, 2 on mobile).
  visibleSides: MotionValue<number>;
  // 1 on phones (cards slide left and right), 0 on desktop (cards stack up and down).
  isHorizontal: MotionValue<number>;
  children: ReactNode;
};

// Cover Flow, like the old iPod: the center card is flat and big, and the cards next to it are turned almost
// edge-on, so they show as thin slivers packed tightly together.
const SIDE_TILT_DEGREES = 78;
// Distances are in card widths, measured from the center card: the first sliver sits right at the edge of the
// center card, then each next one is only a little further away.
const STACK_GAPS = {
  vertical: { first: 0.46, next: 0.13 },
  horizontal: { first: 0.62, next: 0.16 },
};
// How far the side cards sit behind the center card, in card widths. Without this, their near edge would
// come out wider than the center card.
const SIDE_DEPTH = 0.45;
const SCALE_LOSS_PER_CARD = 0.03;
// The cards next to the center stay fully solid, like the iPod. Only the last visible ones fade away.
const FIRST_SIDE_OPACITY = 1;
// Only an item this close to the center (in projects) can be clicked.
const CLICKABLE_DISTANCE = 0.25;

// How many projects this item is from the center, wrapped so the list loops forever: -count/2 .. count/2.
function getOffsetFromCenter(index: number, position: number, count: number) {
  const offset = (index - position) % count;
  const wrapped = ((offset + count * 1.5) % count) - count / 2;
  return wrapped;
}

// Distance from the center in card widths (negative = above or left of the center).
function getStackDistance(offset: number, isHorizontal: number) {
  const { first, next } = isHorizontal === 1 ? STACK_GAPS.horizontal : STACK_GAPS.vertical;
  const cardsAway = Math.abs(offset);
  const distance = cardsAway <= 1 ? cardsAway * first : first + (cardsAway - 1) * next;
  return Math.sign(offset) * distance;
}

export default function ReelItem({ index, count, reelPosition, visibleSides, isHorizontal, children }: ReelItemProps) {
  const offset = useTransform(reelPosition, (position) => getOffsetFromCenter(index, position, count));
  const cardsAway = useTransform(offset, (value) => Math.abs(value));

  // The distance from the center goes into x when sideways, and into y when vertical.
  const distance = (value: number, horizontal: number) => `calc(${getStackDistance(value, horizontal)} * var(--card-width))`;
  const x = useTransform([offset, isHorizontal], ([value, horizontal]: number[]) => (horizontal === 1 ? distance(value, horizontal) : 0));
  const y = useTransform([offset, isHorizontal], ([value, horizontal]: number[]) => (horizontal === 1 ? 0 : distance(value, horizontal)));

  // The edge next to the center card tucks away and the outer edge comes forward, like the iPod.
  const tilt = useTransform(offset, (value) => -Math.max(-1, Math.min(1, value)) * SIDE_TILT_DEGREES);
  const rotateX = useTransform([tilt, isHorizontal], ([degrees, horizontal]: number[]) => (horizontal === 1 ? 0 : degrees));
  const rotateY = useTransform([tilt, isHorizontal], ([degrees, horizontal]: number[]) => (horizontal === 1 ? degrees : 0));

  const z = useTransform(cardsAway, (value) => `calc(${-Math.min(value, 1) * SIDE_DEPTH} * var(--card-width))`);
  const scale = useTransform(cardsAway, (value) => 1 - Math.min(value, 3) * SCALE_LOSS_PER_CARD);
  const opacity = useTransform([cardsAway, visibleSides], ([away, sides]: number[]) => {
    // Fully faded just past the last visible card, and always before the list wraps around.
    const fadeEnd = Math.min(sides + 1, count / 2);
    if (away <= 1) return 1 - away * (1 - FIRST_SIDE_OPACITY);
    return Math.max(0, (FIRST_SIDE_OPACITY * (fadeEnd - away)) / (fadeEnd - 1));
  });
  // Only the center card shows its text and badge, and rounded corners. The slivers are plain pictures.
  const detailOpacity = useTransform(cardsAway, (value) => Math.max(0, 1 - value * 3));
  // Cards closer to the center sit on top of the ones behind them.
  const zIndex = useTransform(cardsAway, (value) => Math.round(100 - value * 10));
  const pointerEvents = useTransform(cardsAway, (value) => (value < CLICKABLE_DISTANCE ? "auto" : "none"));

  // Every item fills the reel with its card in the middle, then slides away from the middle by x or y.
  return (
    <motion.section
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ perspective: 1400, x, y, zIndex }}
    >
      <motion.div
        className="w-full max-w-(--card-width)"
        style={{ z, rotateX, rotateY, scale, opacity, pointerEvents, "--detail-opacity": detailOpacity } as MotionStyle}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
