"use client";

import { motion } from "motion/react";
import { profile } from "../data/profile";
import IconLink from "./IconLink";

type SidebarProps = {
  onOpenAbout: () => void;
  onOpenContact: () => void;
};

export default function Sidebar({ onOpenAbout, onOpenContact }: SidebarProps) {
  return (
    <aside className="shrink-0 px-6 pb-4 pt-10 md:flex md:h-full md:w-[42%] md:items-center md:justify-center md:px-12 md:pb-0 md:pt-0 xl:px-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-[26px] font-medium leading-tight tracking-tight text-foreground-950 md:text-[26px] lg:text-[42px]">
          {profile.name}
        </h1>
        <p className="mt-1 md:mt-0 text-[22px] leading-tight tracking-tight text-foreground-400 md:text-[20px] tracking-wider font-extralight">
          {profile.role}
        </p>

        <div className="mt-7 flex items-center gap-3">
          <IconLink label="About" iconClass="ri-user-line" onClick={onOpenAbout} />
          <IconLink label="Contact" iconClass="ri-chat-3-line" onClick={onOpenContact} />
        </div>
      </motion.div>
    </aside>
  );
}
