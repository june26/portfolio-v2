"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Project } from "../data/projects";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import ProjectDetail from "./ProjectDetail";
import ProjectReel from "./ProjectReel";
import Sidebar from "./Sidebar";

type PageName = "home" | "about" | "contact";

// The address bar follows what is on screen (/about, /contact, /projects/<slug>), so every view can be
// opened directly, shared, and counted as its own page by the analytics.
function readPath(pathname: string): { page: PageName; projectSlug: string | null } {
  if (pathname === "/about") return { page: "about", projectSlug: null };
  if (pathname === "/contact") return { page: "contact", projectSlug: null };

  const projectSlug = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  return { page: "home", projectSlug: projectSlug ? decodeURIComponent(projectSlug) : null };
}

// Opened straight from a link there is no card to grow from, so grow from the middle of the screen.
const getMiddleOfScreen = () => new DOMRect(window.innerWidth / 2 - 100, window.innerHeight / 2 - 75, 200, 150);

// Changes the address without reloading the page, so the animations keep running.
function goTo(path: string) {
  if (window.location.pathname !== path) window.history.pushState(null, "", path);
}

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

// Projects come from Firestore through the API, fetched fresh on every visit. Returns null when it can't load.
async function loadProjects(): Promise<Project[] | null> {
  try {
    const response = await fetch("/api/projects", { cache: "no-store" });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

export default function Portfolio() {
  // undefined = still loading, null = could not load
  const [projects, setProjects] = useState<Project[] | null | undefined>(undefined);
  useEffect(() => {
    loadProjects().then(setProjects);
  }, []);

  const { page: currentPage, projectSlug } = readPath(usePathname());
  const goHome = () => goTo("/");

  // Where the clicked card was on screen, so the project page can grow out of it.
  const [clickedCardRect, setClickedCardRect] = useState<DOMRect | null>(null);
  const openProject = projects?.find((project) => project.slug === projectSlug);

  return (
    <div className="relative h-dvh overflow-hidden">
      <Panel name="home" currentPage={currentPage}>
        <div className="mx-auto flex h-full w-full max-w-420 flex-col md:flex-row">
          <Sidebar
            onOpenAbout={() => goTo("/about")}
            onOpenContact={() => goTo("/contact")}
          />
          <ProjectReel projects={projects} onOpenProject={(project, rect) => {
              setClickedCardRect(rect);
              goTo(`/projects/${project.slug}`);
            }} />
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
          key="project-detail"
          projects={projects}
          project={openProject}
          cardRect={clickedCardRect ?? getMiddleOfScreen()}
          onNavigate={(project) => goTo(`/projects/${project.slug}`)}
          onClose={goHome}
        />
      )}
    </div>
  );
}
