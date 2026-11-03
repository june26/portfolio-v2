import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "David J. — Frontend Engineer Portfolio",
  description:
    "Portfolio of David J., a frontend engineer building fast, accessible interface systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={interTight.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.min.css"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
