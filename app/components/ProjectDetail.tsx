"use client";

import { animate, motion, useMotionValue, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { projects, type Project } from "../data/projects";

type ProjectDetailProps = {
  // The project whose card was clicked, and where that card was on screen.
  openedProject: Project;
  cardRect: DOMRect;
  onClose: () => void;
};

const FLY_TRANSITION = { duration: 0.75, ease: [0.65, 0, 0.35, 1] } as const;
const FADE_IN_DELAY_S = 0.3;
const SPRING = { type: "spring", stiffness: 500, damping: 22 } as const;
const LABEL_CLASS = "text-[10px] uppercase tracking-widest text-foreground-400";
const CARD_RADIUS = 12;
const COVER_TOP_RADIUS = 16;
const LAND_FALLBACK_MS = 250;

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, onClick, children }: ToolbarButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      transition={SPRING}
      className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-[12px] font-medium text-foreground-700 transition-colors hover:bg-foreground-950 hover:text-background-50"
    >
      {children}
    </motion.button>
  );
}

export default function ProjectDetail({ openedProject, cardRect, onClose }: ProjectDetailProps) {
  const [currentProject, setCurrentProject] = useState(openedProject);
  // The first project grows out of its card; after paging to another one, new projects just rise in.
  const [hasPaged, setHasPaged] = useState(false);
  const currentIndex = projects.findIndex((project) => project.name === currentProject.name);
  const counter = `${String(currentIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;

  const goToProject = (direction: number) => {
    const nextIndex = (currentIndex + direction + projects.length) % projects.length;
    setCurrentProject(projects[nextIndex]);
    setHasPaged(true);
  };

  const meta = [
    { label: "Client", value: currentProject.client },
    { label: "Role", value: currentProject.role },
    { label: "Year", value: currentProject.year },
    { label: "Scope", value: currentProject.category },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  // The flying copy only exists while it is flying, so it can never stay stuck in front of the page.
  const [isFlying, setIsFlying] = useState(true);

  // A copy of the card image that really resizes (position + size, not a stretched transform)
  // between the card and the cover, so the image is never distorted while it grows or shrinks.
  const flyTop = useMotionValue(cardRect.top);
  const flyLeft = useMotionValue(cardRect.left);
  const flyWidth = useMotionValue(cardRect.width);
  const flyHeight = useMotionValue(cardRect.height);
  const flyTopRadius = useMotionValue(CARD_RADIUS);
  const flyBottomRadius = useMotionValue(CARD_RADIUS);
  const flyOpacity = useMotionValue(1);
  const coverOpacity = useMotionValue(0); // the real cover, shown once the flying copy has landed
  const coverDetailsOpacity = useMotionValue(0); // gradient, title and year on the cover
  const backgroundOpacity = useMotionValue(0);
  const contentOpacity = useMotionValue(1);

  const flyTo = (rect: { top: number; left: number; width: number; height: number }, topRadius: number, bottomRadius: number) =>
    Promise.all([
      animate(flyTop, rect.top, FLY_TRANSITION),
      animate(flyLeft, rect.left, FLY_TRANSITION),
      animate(flyWidth, rect.width, FLY_TRANSITION),
      animate(flyHeight, rect.height, FLY_TRANSITION),
      animate(flyTopRadius, topRadius, FLY_TRANSITION),
      animate(flyBottomRadius, bottomRadius, FLY_TRANSITION),
    ]);

  // Hands over from the flying copy to the real cover. Safe to call more than once.
  const landCover = () => {
    if (isClosingRef.current || flyOpacity.get() === 0) return;

    coverOpacity.set(1);
    flyOpacity.set(0);
    setIsFlying(false);
    animate(coverDetailsOpacity, 1, { duration: 0.4 });
  };

  // Opening: grow from the card to the cover while the page fades in around it.
  useLayoutEffect(() => {
    const cover = coverRef.current;
    if (!cover) return;

    const coverRect = cover.getBoundingClientRect();
    animate(backgroundOpacity, 1, FLY_TRANSITION);
    flyTo(coverRect, COVER_TOP_RADIUS, 0).then(landCover);

    // Some browsers skip the animation callback (e.g. while scrolling), which would leave the flying copy
    // stuck on top of the page. So hand over again shortly after the flight should have ended.
    const landLater = setTimeout(landCover, FLY_TRANSITION.duration * 1000 + LAND_FALLBACK_MS);
    return () => clearTimeout(landLater);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on mount
  }, []);

  // Closing: shrink the cover back into its card while the page fades out.
  const close = () => {
    const cover = coverRef.current;
    const scroller = scrollRef.current;
    if (isClosingRef.current || !cover || !scroller) return;
    isClosingRef.current = true;

    scroller.scrollTo({ top: 0 });
    const coverRect = cover.getBoundingClientRect();
    flyTop.set(coverRect.top);
    flyLeft.set(coverRect.left);
    flyWidth.set(coverRect.width);
    flyHeight.set(coverRect.height);
    flyTopRadius.set(COVER_TOP_RADIUS);
    flyBottomRadius.set(0);
    flyOpacity.set(1);
    coverOpacity.set(0);
    setIsFlying(true);

    // The card may have moved since it was clicked, so measure it again. The reel has two copies of every
    // project, so take the copy closest to where the clicked card was.
    const cardCenter = cardRect.top + cardRect.height / 2;
    const copies = [...document.querySelectorAll(`button[aria-label="Open project ${currentProject.name}"]`)];
    const distanceFromClickedCard = (copy: Element) => {
      const rect = copy.getBoundingClientRect();
      return Math.abs(rect.top + rect.height / 2 - cardCenter) + Math.abs(rect.left + rect.width / 2 - (cardRect.left + cardRect.width / 2));
    };
    const card = copies.sort((a, b) => distanceFromClickedCard(a) - distanceFromClickedCard(b))[0];
    const targetRect = (card ?? document.body).getBoundingClientRect();
    animate(contentOpacity, 0, { duration: 0.25 });
    animate(backgroundOpacity, 0, FLY_TRANSITION);
    flyTo(targetRect, CARD_RADIUS, CARD_RADIUS).then(onClose);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  });

  return (
    <div ref={scrollRef} className="fixed inset-0 z-50 overflow-y-auto">
      {/* The page background fades on its own, so it never fades the image flying in. */}
      <motion.div className="fixed inset-0 bg-background-50" style={{ opacity: backgroundOpacity }} />

      <motion.div style={{ opacity: contentOpacity }} className="relative mx-auto w-full max-w-245 px-4 pb-10 md:px-6">
        <motion.nav
          className="sticky top-4 z-10 mx-auto mt-4 flex w-fit items-center gap-1 rounded-full border border-background-200 bg-background-50/80 p-1 backdrop-blur"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0, transition: { ...FLY_TRANSITION, delay: FADE_IN_DELAY_S } }}
        >
          <ToolbarButton label="All work" onClick={close}>
            <i className="ri-arrow-left-line text-[15px]" />
            All work
          </ToolbarButton>
          <span className="px-2 text-[10px] uppercase tracking-widest text-foreground-400">{counter}</span>
          <ToolbarButton label="Previous project" onClick={() => goToProject(-1)}>
            <i className="ri-arrow-up-line text-[15px]" />
          </ToolbarButton>
          <ToolbarButton label="Next project" onClick={() => goToProject(1)}>
            <i className="ri-arrow-down-line text-[15px]" />
          </ToolbarButton>
          <ToolbarButton label="Close project" onClick={close}>
            <i className="ri-close-line text-[15px]" />
          </ToolbarButton>
        </motion.nav>

        <motion.article
          key={currentProject.name}
          className="relative mt-4"
          initial={hasPaged ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0, transition: FLY_TRANSITION }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl border border-background-200 bg-white/50"
            initial={hasPaged ? false : { opacity: 0 }}
            animate={{ opacity: 1, transition: { ...FLY_TRANSITION, delay: FADE_IN_DELAY_S } }}
          />

          <motion.div
            ref={coverRef}
            style={hasPaged ? undefined : { opacity: coverOpacity }}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-background-200 md:aspect-[16/9]"
          >
            <Image
              src={currentProject.imageUrl}
              alt={`${currentProject.name} — ${currentProject.category}`}
              fill
              priority
              sizes="980px"
              className="object-cover object-top"
            />
            <motion.div style={hasPaged ? undefined : { opacity: coverDetailsOpacity }} className="absolute inset-0">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground-950/70 via-foreground-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-9">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background-50/70">{currentProject.category}</p>
                  <h2 className="mt-2 text-[34px] leading-none tracking-tight text-background-50 md:text-[46px]">
                    {currentProject.name}
                  </h2>
                </div>
                <span className="flex h-8 items-center rounded-full bg-background-50/20 px-4 text-[10px] uppercase tracking-[0.2em] text-background-50 backdrop-blur-sm">
                  {currentProject.year}
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative grid grid-cols-1 gap-10 p-5 md:grid-cols-12 md:gap-14 md:p-9"
            initial={hasPaged ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { ...FLY_TRANSITION, delay: FADE_IN_DELAY_S } }}
          >
            <dl className="h-fit divide-y divide-background-200 border-y border-background-200 md:col-span-4">
              {meta.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-4 py-4">
                  <dt className={LABEL_CLASS}>{item.label}</dt>
                  <dd className="text-right text-[14px] text-foreground-950">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="md:col-span-8">
              <p className="text-[20px] leading-snug tracking-tight text-foreground-950 md:text-[22px]">
                {currentProject.summary}
              </p>
              <div className="mt-6 space-y-4">
                {currentProject.narrative.map((paragraph) => (
                  <p key={paragraph} className="text-[14.5px] leading-[1.8] text-foreground-700">
                    {paragraph}
                  </p>
                ))}
              </div>

              <p className={`${LABEL_CLASS} mt-8`}>Built with</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {currentProject.stack.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border border-background-200 bg-background-100 px-4 py-1.5 text-[12.5px] text-foreground-700"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.article>
      </motion.div>

      {isFlying && (
        <FlyingCover
          project={currentProject}
          style={{
            top: flyTop,
            left: flyLeft,
            width: flyWidth,
            height: flyHeight,
            borderTopLeftRadius: flyTopRadius,
            borderTopRightRadius: flyTopRadius,
            borderBottomLeftRadius: flyBottomRadius,
            borderBottomRightRadius: flyBottomRadius,
            opacity: flyOpacity,
          }}
        />
      )}
    </div>
  );
}

type FlyingCoverProps = {
  project: Project;
  style: Record<string, MotionValue<number>>;
};

function FlyingCover({ project, style }: FlyingCoverProps) {
  return (
    <motion.div className="pointer-events-none fixed z-60 overflow-hidden bg-background-200" style={style}>
      <Image
        src={project.imageUrl}
        alt=""
        fill
        sizes="980px"
        className="object-cover object-top"
      />
    </motion.div>
  );
}
