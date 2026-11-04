"use client";

import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import type { Project } from "../data/projects";
import ProjectCard from "./ProjectCard";
import ReelItem from "./ReelItem";
import ReelSkeleton from "./ReelSkeleton";

const CARD_SIZE =
  "[--card-width:min(48vw,280px)] md:[--card-width:min(calc(100vw_-_48px),clamp(240px,50vh,420px))]";
// Slight overshoot, so the reel settles with a small bounce.
const STEP_SPRING = { type: "spring", stiffness: 200, damping: 20 } as const;
const MIN_WHEEL_STRENGTH = 4;
// Trackpad inertia keeps sending small, shrinking events after you lift your fingers (can last ~1s).
// Only a pause this long, or a clearly stronger push, counts as a new scroll.
const NEW_SCROLL_GAP_MS = 150;
const NEW_PUSH_STRENGTH = 40;
// After a step, ignore input briefly so one swipe can never move two projects.
const STEP_COOLDOWN_MS = 300;
const MIN_SWIPE_PX = 30;
const DESKTOP_VISIBLE_SIDES = 3;
const MOBILE_VISIBLE_SIDES = 3;

type ProjectReelProps = {
  // undefined = still loading (skeleton), null = could not load
  projects: Project[] | null | undefined;
  onOpenProject: (project: Project, cardRect: DOMRect) => void;
};

export default function ProjectReel({ projects, onOpenProject }: ProjectReelProps) {
  // The reel shows 3 cards on each side of the center one, so a short list would run into itself behind the
  // center card. Going around the list twice gives every card enough room. Both copies open the same project.
  const loadedProjects = projects ?? [];
  const loopedProjects = [...loadedProjects, ...loadedProjects];
  const reelRef = useRef<HTMLElement>(null);
  const reelPosition = useMotionValue(0);
  const visibleSides = useMotionValue(DESKTOP_VISIBLE_SIDES);
  // Phones slide the cards left and right, desktop stacks them up and down.
  const isHorizontal = useMotionValue(1);

  // Desktop shows 3 cards on each side of the center card, mobile only 2.
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const updateLayout = () => {
      visibleSides.set(desktopQuery.matches ? DESKTOP_VISIBLE_SIDES : MOBILE_VISIBLE_SIDES);
      isHorizontal.set(desktopQuery.matches ? 0 : 1);
    };

    updateLayout();
    desktopQuery.addEventListener("change", updateLayout);
    return () => desktopQuery.removeEventListener("change", updateLayout);
  }, [visibleSides, isHorizontal]);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

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
    // After a step, stay locked until the wheel goes quiet, so trackpad inertia can't trigger a second step.
    let isLocked = false;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      // Sideways reel: follow whichever way the wheel or trackpad moves more.
      const isSideways = isHorizontal.get() === 1 && Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = isSideways ? event.deltaX : event.deltaY;
      const strength = Math.abs(delta);
      const now = performance.now();
      const wasQuiet = now - lastWheelTime > NEW_SCROLL_GAP_MS;
      const isClearlyNewPush = strength >= NEW_PUSH_STRENGTH && strength > lastWheelStrength * 1.5;
      lastWheelTime = now;
      lastWheelStrength = strength;

      if (wasQuiet || isClearlyNewPush) isLocked = false;
      if (isLocked || strength < MIN_WHEEL_STRENGTH) return;

      isLocked = true;
      step(Math.sign(delta));
    };

    let touchStart: { x: number; y: number } | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (touchStart === null) return;

      // Swiping left goes to the next project (like turning a page), swiping up does the same when vertical.
      const swipe = isHorizontal.get() === 1
        ? touchStart.x - event.touches[0].clientX
        : touchStart.y - event.touches[0].clientY;
      if (Math.abs(swipe) < MIN_SWIPE_PX) return;

      step(Math.sign(swipe));
      touchStart = null; // one step per swipe
    };

    reel.addEventListener("wheel", handleWheel, { passive: false });
    reel.addEventListener("touchstart", handleTouchStart, { passive: true });
    reel.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      moveAnimation?.stop();
      reel.removeEventListener("wheel", handleWheel);
      reel.removeEventListener("touchstart", handleTouchStart);
      reel.removeEventListener("touchmove", handleTouchMove);
    };
  }, [reelPosition, isHorizontal]);

  return (
    <main
      ref={reelRef}
      className={`${CARD_SIZE} relative isolate min-h-0 w-full flex-1 touch-none overflow-hidden md:w-[58%] md:flex-none`}
    >
      <AnimatePresence>{projects === undefined && <ReelSkeleton key="skeleton" />}</AnimatePresence>
      {(projects === null || projects?.length === 0) && (
        <p className="absolute inset-0 flex items-center justify-center text-[12px] uppercase tracking-widest text-foreground-400">
          {projects === null ? "Could not load projects" : "No projects yet"}
        </p>
      )}
      {/* The cards fade in once the projects are here, as the skeleton fades out. */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        {loopedProjects.map((project, index) => (
          <ReelItem
            key={`${project.name}-${index}`}
            index={index}
            count={loopedProjects.length}
            reelPosition={reelPosition}
            visibleSides={visibleSides}
            isHorizontal={isHorizontal}
          >
            <ProjectCard
              project={project}
              position={(index % loadedProjects.length) + 1}
              total={loadedProjects.length}
              onOpen={onOpenProject}
            />
          </ReelItem>
        ))}
      </motion.div>
    </main>
  );
}
