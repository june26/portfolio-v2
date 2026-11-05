import type { Metadata } from "next";
import Portfolio from "../components/Portfolio";

export const metadata: Metadata = {
  title: "About me",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <Portfolio />;
}
