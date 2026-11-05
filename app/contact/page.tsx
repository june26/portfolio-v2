import type { Metadata } from "next";
import Portfolio from "../components/Portfolio";

export const metadata: Metadata = {
  title: "Let's Talk",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <Portfolio />;
}
