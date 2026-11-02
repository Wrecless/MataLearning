import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import HubShell from "@/components/HubShell";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--type-display",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--type-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mr. Mata Learning Hub",
    template: "%s | Mr. Mata Learning Hub",
  },
  description:
    "Practise computer science through interactive games: sorting, searching, binary, modulo, division and packet routing.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-50 focus:rounded-lg focus:bg-accent focus:p-3 focus:text-canvas"
        >
          Skip to content
        </a>
        <HubShell>{children}</HubShell>
      </body>
    </html>
  );
}
