"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { games } from "@/data/games";
import { getRainContent } from "@/data/rainContent";
import GameSidebar from "./GameSidebar";

export default function HubShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeView =
    games.find((game) => pathname === `/games/${game.slug}`)?.id ?? "home";
  return (
    <div className="relative grid min-h-screen content-start gap-5 overflow-hidden p-3.5 lg:grid-cols-[292px_minmax(0,1fr)] lg:p-5">
      <div
        className="matrix-rain"
        aria-hidden="true"
        data-rain={getRainContent(activeView)}
      />
      <GameSidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex min-w-0 flex-col"
      >
        {children}
      </main>
    </div>
  );
}
