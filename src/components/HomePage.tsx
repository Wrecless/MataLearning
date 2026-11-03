"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Binary, Play, Sparkles } from "lucide-react";
import HeroBubbleSortDemo from "./HeroBubbleSortDemo";
import GameLibrary from "./GameLibrary";
import { games } from "../data/games";
import { useCompletedGames } from "../utils/progress";

export default function HomePage({
  readyGameCount,
}: {
  readyGameCount: number;
}) {
  const readyGameLabel = `${readyGameCount} ${readyGameCount === 1 ? "game" : "games"} ready`;
  const completedGames = useCompletedGames();
  const completedCount = games.filter(
    (game) => game.status === "Ready" && completedGames.has(game.id),
  ).length;
  const allComplete = completedCount > 0 && completedCount >= readyGameCount;

  return (
    <>
      <section className="home-shell" aria-labelledby="home-title">
        <div className="relative z-10 min-w-0 max-w-[850px] self-center">
          <div className="inline-flex items-center gap-3 rounded-lg border border-[#a8ffd0]/20 bg-black/25 px-3 py-2.5 font-mono text-sm font-extrabold text-[#32f584]">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-[#32f584]" />
              <span className="size-2 rounded-full bg-[#f5c15b]" />
              <span className="size-2 rounded-full bg-[#29d6c5]" />
            </span>
            <span>~/classroom/games</span>
          </div>

          <h1
            id="home-title"
            className="font-display mt-7 max-w-[890px] break-words text-4xl font-extrabold leading-none text-[#f1fff6] drop-shadow-[0_0_34px_rgba(50,245,132,0.18)] sm:text-5xl md:text-7xl xl:text-7xl 2xl:text-8xl"
          >
            Welcome to Mr. Mata Learning Hub
          </h1>
          <p className="mt-5 max-w-[700px] text-lg font-semibold leading-relaxed text-[#c9e9d5]">
            A friendly corner of the web for practising computer science through
            small, focused games. Pick a challenge, think like a programmer, and
            learn by doing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/games/bubble-sort"
              className="launch-button w-full min-w-0 px-3 text-center text-sm sm:w-auto sm:px-5 sm:text-base"
            >
              <Play size={20} />
              Launch Bubble Sort Lab
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/games/binary-builder"
              className="launch-button w-full min-w-0 px-3 text-center text-sm sm:w-auto sm:px-5 sm:text-base border-[#f5c15b]/50 bg-none bg-[#f5c15b]/15 text-[#ffe7a9] shadow-none hover:bg-[#f5c15b]/20"
            >
              <Binary size={20} />
              Launch Binary Builder
              <ArrowRight size={18} />
            </Link>
            <div className="inline-flex items-center gap-2 text-sm font-extrabold text-[#e7c985]">
              <Sparkles size={18} />
              <span>Classroom friendly and free to access</span>
            </div>
          </div>

          <a href="#game-library" className="icon-button mt-6 w-full sm:w-auto">
            Browse all {readyGameCount} games
          </a>

          {completedCount > 0 && (
            <div className="mt-6 max-w-[520px]">
              <div className="flex items-center justify-between text-sm font-black uppercase text-[#a6c6b3]">
                <span>Your progress</span>
                <span className="text-[#32f584]">
                  {completedCount}/{readyGameCount} completed
                </span>
              </div>
              <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-[#effff6]/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#32f584] to-[#f5c15b] transition-[width]"
                  style={{
                    width: `${Math.round((completedCount / readyGameCount) * 100)}%`,
                  }}
                />
              </div>
              {allComplete && (
                <p className="mt-3 text-base font-extrabold text-[#a8ffd0]">
                  Every ready game complete. Nice work, keep sharpening your
                  skills on a replay.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="home-side-rail">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-black uppercase tracking-wide">
            <MetaPill accent>{readyGameLabel}</MetaPill>
            <MetaPill>Sorting &amp; searching</MetaPill>
            <MetaPill>Built for secondary CS</MetaPill>
          </div>

          <div>
            <span className="ui-label">Live preview: bubble sort</span>
            <HeroBubbleSortDemo />
          </div>
        </div>
      </section>
      <GameLibrary />
    </>
  );
}

function MetaPill({
  accent = false,
  children,
}: {
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 ${
        accent
          ? "border-[#32f584]/40 bg-[#32f584]/10 text-[#32f584]"
          : "border-[#93ffc2]/20 bg-[#effff6]/5 text-[#a6c6b3]"
      }`}
    >
      {children}
    </span>
  );
}
