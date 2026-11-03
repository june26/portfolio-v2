import { Suspense } from "react";
import Portfolio from "./components/Portfolio";
import { getProjects } from "./lib/projects";

async function PortfolioWithProjects() {
  return <Portfolio projects={await getProjects()} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-dvh bg-background-50" />}>
      <PortfolioWithProjects />
    </Suspense>
  );
}
