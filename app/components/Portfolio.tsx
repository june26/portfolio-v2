"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import ProjectReel from "./ProjectReel";
import Sidebar from "./Sidebar";

type PageName = "home" | "about" | "contact";

// Where each panel sits for the current page: About slides up from below, Contact slides down from above.
const PANEL_Y: Record<PageName, Record<PageName, string>> = {
  home: { home: "0%", about: "-100%", contact: "100%" },
  about: { home: "100%", about: "0%", contact: "100%" },
  contact: { home: "-100%", about: "-100%", contact: "0%" },
};

type PanelProps = {
  name: PageName;
  currentPage: PageName;
  children: ReactNode;
};

function Panel({ name, currentPage, children }: PanelProps) {
  return (
    <motion.div
      initial={false}
      animate={{ y: PANEL_Y[name][currentPage] }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      inert={currentPage !== name}
      className="absolute inset-0 overflow-y-auto overscroll-contain bg-background-50"
    >
      {children}
    </motion.div>
  );
}

export default function Portfolio() {
  const [currentPage, setCurrentPage] = useState<PageName>("home");
  const goHome = () => setCurrentPage("home");

  return (
    <div className="relative h-dvh overflow-hidden">
      <Panel name="home" currentPage={currentPage}>
        <div className="mx-auto flex h-full w-full max-w-420 flex-col md:flex-row">
          <Sidebar
            onOpenAbout={() => setCurrentPage("about")}
            onOpenContact={() => setCurrentPage("contact")}
          />
          <ProjectReel />
        </div>
      </Panel>

      <Panel name="about" currentPage={currentPage}>
        <AboutPage onBack={goHome} />
      </Panel>

      <Panel name="contact" currentPage={currentPage}>
        <ContactPage onBack={goHome} />
      </Panel>
    </div>
  );
}
