"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { projects as localProjects, type Project } from "../data/projects";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import ProjectDetail from "./ProjectDetail";
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

async function loadProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects", { cache: "no-store" });
    const list: Project[] = await response.json();
    return response.ok && list.length > 0 ? list : localProjects;
  } catch {
    return localProjects;
  }
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    loadProjects().then(setProjects);
  }, []);

  const [currentPage, setCurrentPage] = useState<PageName>("home");
  const goHome = () => setCurrentPage("home");


  const [openProject, setOpenProject] = useState<{ project: Project; cardRect: DOMRect } | null>(null);
  const closeProject = () => setOpenProject(null);

  return (
    <div className="relative h-dvh overflow-hidden">
      <Panel name="home" currentPage={currentPage}>
        <div className="mx-auto flex h-full w-full max-w-420 flex-col md:flex-row">
          <Sidebar
            onOpenAbout={() => setCurrentPage("about")}
            onOpenContact={() => setCurrentPage("contact")}
          />
          {projects ? (
            <ProjectReel projects={projects} onOpenProject={(project, cardRect) => setOpenProject({ project, cardRect })} />
          ) : (
            <main className="min-h-0 w-full flex-1 md:w-[58%] md:flex-none" />
          )}
        </div>
      </Panel>

      <Panel name="about" currentPage={currentPage}>
        <AboutPage onBack={goHome} />
      </Panel>

      <Panel name="contact" currentPage={currentPage}>
        <ContactPage onBack={goHome} />
      </Panel>

      {openProject && projects && (
        <ProjectDetail
          key={openProject.project.name}
          projects={projects}
          openedProject={openProject.project}
          cardRect={openProject.cardRect}
          onClose={closeProject}
        />
      )}
    </div>
  );
}
