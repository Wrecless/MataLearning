"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Game } from "../data/games";
import {
  Check,
  ChevronDown,
  Code2,
  Home,
  Lock,
  Menu,
  Terminal,
  X,
} from "lucide-react";
import { useState } from "react";
import { gameCategories } from "../data/games";
import { version } from "../../package.json";
import { useCompletedGames } from "../utils/progress";

export default function GameSidebar() {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );
  const [isNavOpen, setIsNavOpen] = useState(false);
  const completedGames = useCompletedGames();

  function toggleCategory(categoryId: string) {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !(
        current[categoryId] ??
        gameCategories
          .find((category) => category.id === categoryId)
          ?.games.some((game) => pathname === `/games/${game.slug}`)
      ),
    }));
  }

  function selectView() {
    setIsNavOpen(false);
  }

  return (
    <aside className="panel relative z-10 flex min-h-0 flex-col p-4 lg:sticky lg:top-5 lg:self-start lg:max-h-[calc(100dvh-40px)] lg:overflow-y-auto lg:min-h-[calc(100dvh-40px)]">
      <div className="flex items-center gap-3 border-b border-[#93ffc2]/20 pb-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-[#32f584]/60 bg-[#32f584]/10 text-[#32f584] shadow-[0_0_30px_rgba(50,245,132,0.16)]">
          <Terminal size={23} />
        </div>
        <div className="min-w-0">
          <strong className="block text-lg font-black text-[#f1fff6]">
            Mr. Mata
          </strong>
          <span className="block text-sm font-bold text-[#a6c6b3]">
            Learning Hub
          </span>
          <span
            className="mt-1 block font-mono text-xs text-muted"
            aria-label={`Website version ${version}`}
          >
            V{version.replace(/\.0$/, "")}
          </span>
        </div>
        <button
          type="button"
          className="icon-button ml-auto lg:hidden"
          onClick={() => setIsNavOpen((current) => !current)}
          aria-expanded={isNavOpen}
          aria-controls="game-nav"
        >
          {isNavOpen ? <X size={18} /> : <Menu size={18} />}
          <span className="sr-only">Toggle games menu</span>
        </button>
      </div>

      <nav
        aria-label="Games"
        id="game-nav"
        className={`mt-4 gap-2.5 ${isNavOpen ? "grid" : "hidden"} lg:grid`}
      >
        <Link
          href="/"
          className={`nav-item ${pathname === "/" ? "active" : ""}`}
          aria-current={pathname === "/" ? "page" : undefined}
          onClick={selectView}
        >
          <Home size={18} />
          <span>Home</span>
        </Link>

        <div className="console-label mt-2">Teaching Games</div>

        {gameCategories.map((category) => {
          const isOpen =
            openCategories[category.id] ??
            category.games.some((game) => pathname === `/games/${game.slug}`);

          return (
            <div className="grid gap-2" key={category.id}>
              <button
                type="button"
                className="category-toggle"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isOpen}
              >
                <span className="grid gap-1">
                  <strong>{category.title}</strong>
                  <small>{category.description}</small>
                </span>
                <ChevronDown
                  className={`text-[#32f584] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  size={18}
                />
              </button>

              {isOpen && (
                <div className="grid gap-2 border-l border-[#32f584]/25 pl-3.5">
                  {category.games.map((game) => (
                    <GameNavItem
                      active={pathname === `/games/${game.slug}`}
                      completed={completedGames.has(game.id)}
                      game={game}
                      key={game.id}
                      onSelect={selectView}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto hidden gap-2.5 rounded-lg border border-[#f5c15b]/30 bg-[#f5c15b]/10 p-3 text-[#f5c15b] lg:flex">
        <Code2 size={18} />
        <p className="m-0 text-sm font-bold leading-relaxed text-[#e4c98d]">
          More computer science games can be added here as the hub grows.
        </p>
      </div>
    </aside>
  );
}

function GameNavItem({
  active,
  completed,
  game,
  onSelect,
}: {
  active: boolean;
  completed: boolean;
  game: Game;
  onSelect: () => void;
}) {
  const Icon = game.icon;
  const ready = game.status === "Ready";

  return (
    <Link
      href={`/games/${game.slug}`}
      className={`game-nav-item ${active ? "active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 text-[#32f584]">
        <Icon size={18} />
      </span>
      <span className="grid min-w-0 gap-1">
        <strong className="truncate text-sm font-black">{game.title}</strong>
        <small className="truncate text-xs font-bold text-[#6c8b78]">
          {game.description}
        </small>
        <small className="truncate font-mono text-[0.68rem] font-black uppercase tracking-wide text-[#7fa08c]">
          {game.difficulty} · {game.estimatedMinutes} min
        </small>
      </span>
      {!ready && (
        <span className="status-chip soon" title="Coming soon">
          <Lock size={13} />
        </span>
      )}
      {ready && completed && (
        <span className="status-chip done" title="Completed">
          <Check size={13} />
        </span>
      )}
    </Link>
  );
}
