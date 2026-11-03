"use client";

import { motion, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

type ReelItemProps = {
  index: number;
  count: number;
  // Which project the reel is on, e.g. 2.4 = a bit past project 3 (index 2). Keeps growing, never resets.
  reelPosition: MotionValue<number>;
  // How many cards stay visible on each side of the center one.
  visibleSides: MotionValue<number>;
  // 1 on phones (cards slide left and right), 0 on desktop (cards stack up and down).
  isHorizontal: MotionValue<number>;
  children: ReactNode;
};

// Desktop (vertical): Cover Flow with roomy gaps, and every card keeps its text.
// Phone (sideways): like the old iPod, thin solid slivers packed tightly, plain pictures.
// Distances are in card widths, measured from the center card.
const LOOKS = {
  vertical: {
    tiltDegrees: 62,
    tiltDirection: 1,
    firstGap: 0.58, // center card to the first neighbor
    nextGap: 0.14, // each neighbor after that
    depth: 0, // how far the side cards sit behind the center card
    scaleLossPerCard: 0.06,
    firstNeighborOpacity: 0.9,
    fadeEndPastLastSide: 0, // fully faded this many cards past the last visible side
    plainSides: false, // true = side cards lose their text, badge and rounded corners
  },
  horizontal: {
    tiltDegrees: 78,
    tiltDirection: -1,
    firstGap: 0.62,
    nextGap: 0.16,
    depth: 0.45,
    scaleLossPerCard: 0.03,
    firstNeighborOpacity: 1,
    fadeEndPastLastSide: 1,
    plainSides: true,
  },
};
// Only an item this close to the center (in projects) can be clicked.
const CLICKABLE_DISTANCE = 0.25;

const getLook = (isHorizontal: number) => (isHorizontal === 1 ? LOOKS.horizontal : LOOKS.vertical);

// How many projects this item is from the center, wrapped so the list loops forever: -count/2 .. count/2.
function getOffsetFromCenter(index: number, position: number, count: number) {
  const offset = (index - position) % count;
  const wrapped = ((offset + count * 1.5) % count) - count / 2;
  return wrapped;
}

// Distance from the center in card widths (negative = above or left of the center).
function getStackDistance(offset: number, isHorizontal: number) {
  const { firstGap, nextGap } = getLook(isHorizontal);
  const cardsAway = Math.abs(offset);
  const distance = cardsAway <= 1 ? cardsAway * firstGap : firstGap + (cardsAway - 1) * nextGap;
  return Math.sign(offset) * distance;
}

export default function ReelItem({ index, count, reelPosition, visibleSides, isHorizontal, children }: ReelItemProps) {
  const offset = useTransform(reelPosition, (position) => getOffsetFromCenter(index, position, count));
  const cardsAway = useTransform(offset, (value) => Math.abs(value));

  // The distance from the center goes into x when sideways, and into y when vertical.
  const distance = (value: number, horizontal: number) =>
    `calc(${getStackDistance(value, horizontal)} * var(--card-width))`;
  const x = useTransform([offset, isHorizontal], ([value, horizontal]: number[]) =>
    horizontal === 1 ? distance(value, horizontal) : 0,
  );
  const y = useTransform([offset, isHorizontal], ([value, horizontal]: number[]) =>
    horizontal === 1 ? 0 : distance(value, horizontal),
  );

  const tilt = useTransform([offset, isHorizontal], ([value, horizontal]: number[]) => {
    const { tiltDegrees, tiltDirection } = getLook(horizontal);
    return Math.max(-1, Math.min(1, value)) * tiltDegrees * tiltDirection;
  });
  const rotateX = useTransform([tilt, isHorizontal], ([degrees, horizontal]: number[]) =>
    horizontal === 1 ? 0 : degrees,
  );
  const rotateY = useTransform([tilt, isHorizontal], ([degrees, horizontal]: number[]) =>
    horizontal === 1 ? degrees : 0,
  );

  const z = useTransform(
    [cardsAway, isHorizontal],
    ([value, horizontal]: number[]) => `calc(${-Math.min(value, 1) * getLook(horizontal).depth} * var(--card-width))`,
  );
  const scale = useTransform(
    [cardsAway, isHorizontal],
    ([value, horizontal]: number[]) => 1 - Math.min(value, 3) * getLook(horizontal).scaleLossPerCard,
  );
  const opacity = useTransform([cardsAway, visibleSides, isHorizontal], ([away, sides, horizontal]: number[]) => {
    const { firstNeighborOpacity, fadeEndPastLastSide } = getLook(horizontal);
    // Fully faded just past the last visible card, and always before the list wraps around.
    const fadeEnd = Math.min(sides + fadeEndPastLastSide, count / 2);
    if (away <= 1) return 1 - away * (1 - firstNeighborOpacity);
    return Math.max(0, (firstNeighborOpacity * (fadeEnd - away)) / (fadeEnd - 1));
  });
  // When the sides are plain pictures, only the center card keeps its text, badge and rounded corners.
  const detailOpacity = useTransform([cardsAway, isHorizontal], ([value, horizontal]: number[]) =>
    getLook(horizontal).plainSides ? Math.max(0, 1 - value * 3) : 1,
  );
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
