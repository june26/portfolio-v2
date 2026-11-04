import { Suspense } from "react";
import Portfolio from "../../components/Portfolio";

// The address is only known when someone opens it, so the page waits inside Suspense.
export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-background-50" />}>
      <Portfolio />
    </Suspense>
  );
}
