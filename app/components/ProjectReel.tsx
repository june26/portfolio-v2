"use client";

import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard";
import ReelItem from "./ReelItem";

// Card width follows the window height but never gets tiny (e.g. when devtools is open)
// and never wider than a phone screen. The space between cards follows the card width.
const REEL_SIZE_VARS = {
  "--card-width": "min(calc(100vw - 48px), clamp(240px, 50vh, 420px))",
  "--reel-pitch": "calc(var(--card-width) * 0.92)",
} as CSSProperties;
// Slight overshoot, so the reel settles with a small bounce.
const STEP_SPRING = { type: "spring", stiffness: 200, damping: 20 } as const;
const MIN_WHEEL_STRENGTH = 4;
// Trackpad inertia keeps sending small, shrinking events after you lift your fingers.
// Only a pause this long, or a clearly stronger push, counts as a new scroll.
const NEW_SCROLL_GAP_MS = 80;
// After a step, ignore input briefly so one swipe can never move two projects.
const STEP_COOLDOWN_MS = 300;
const MIN_SWIPE_PX = 30;

export default function ProjectReel() {
  const reelRef = useRef<HTMLElement>(null);
  const reelPosition = useMotionValue(0);
  // Hidden until mounted, then faded in, so reloads never show a flash.
  const reelOpacity = useMotionValue(0);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    const fadeIn = animate(reelOpacity, 1, { duration: 0.8, ease: "easeOut" });

    // No native scrolling here: each wheel scroll or swipe moves the reel exactly one project.
    let targetIndex = Math.round(reelPosition.get());
    let moveAnimation: ReturnType<typeof animate> | undefined;
    let lastStepTime = 0;

    const step = (direction: number) => {
      const now = performance.now();
      if (now - lastStepTime < STEP_COOLDOWN_MS) return;

      lastStepTime = now;
      targetIndex += direction;
      moveAnimation?.stop();
      moveAnimation = animate(reelPosition, targetIndex, STEP_SPRING);
    };

    let lastWheelTime = 0;
    let lastWheelStrength = 0;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const strength = Math.abs(event.deltaY);
      const now = performance.now();
      const isNewScroll = now - lastWheelTime > NEW_SCROLL_GAP_MS || strength > lastWheelStrength * 1.5;
      lastWheelTime = now;
      lastWheelStrength = strength;

      if (isNewScroll && strength >= MIN_WHEEL_STRENGTH) step(Math.sign(event.deltaY));
    };

    let touchStartY: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY === null) return;

      const swipe = touchStartY - event.touches[0].clientY;
      if (Math.abs(swipe) < MIN_SWIPE_PX) return;

      step(Math.sign(swipe));
      touchStartY = null; // one step per swipe
    };

    reel.addEventListener("wheel", handleWheel, { passive: false });
    reel.addEventListener("touchstart", handleTouchStart, { passive: true });
    reel.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      fadeIn.stop();
      moveAnimation?.stop();
      reel.removeEventListener("wheel", handleWheel);
      reel.removeEventListener("touchstart", handleTouchStart);
      reel.removeEventListener("touchmove", handleTouchMove);
    };
  }, [reelPosition, reelOpacity]);

  return (
    <main
      ref={reelRef}
      style={REEL_SIZE_VARS}
      className="relative min-h-0 w-full flex-1 touch-none overflow-hidden md:w-[58%] md:flex-none"
    >
      <motion.div style={{ opacity: reelOpacity }}>
        {projects.map((project, index) => (
          <ReelItem key={project.name} index={index} count={projects.length} reelPosition={reelPosition}>
            <ProjectCard project={project} position={index + 1} total={projects.length} />
          </ReelItem>
        ))}
      </motion.div>
    </main>
  );
}
