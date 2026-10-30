"use client";

import { motion } from "motion/react";
import Image from "next/image";
import type { Project } from "../data/projects";

type ProjectCardProps = {
  project: Project;
  position: number;
  total: number;
};

export default function ProjectCard({ project, position, total }: ProjectCardProps) {
  const label = `${String(position).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <motion.button
      type="button"
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      aria-label={`Open project ${project.name}`}
      className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl bg-background-200 text-left"
    >
      <motion.div
        className="absolute inset-0"
        variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          src={project.imageUrl}
          alt={`${project.name} — ${project.category}`}
          fill
          sizes="420px"
          loading="eager"
          className="object-cover object-top"
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground-950/55 via-foreground-950/5 to-transparent" />

      <span className="absolute right-3 top-3 flex h-6 items-center rounded-full bg-background-50/85 px-2.5 text-[9.5px] uppercase tracking-widest text-foreground-700 backdrop-blur-sm">
        {label}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-background-50">{project.name}</p>
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-widest text-background-50/70">
            {project.category}
          </p>
        </div>
        <motion.i
          className="ri-arrow-right-up-line shrink-0 text-[15px] text-background-50/80"
          variants={{ rest: { x: 0, y: 0 }, hover: { x: 2, y: -2 } }}
        />
      </div>
    </motion.button>
  );
}
