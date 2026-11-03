"use client";

import Link from "next/link";
import { ArrowRight, Check, Search } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { gameCategories, games } from "../data/games";
import { useCompletedGames } from "../utils/progress";

const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

const playableGames = games.filter((game) => game.status === "Ready");
const topics = new Map(
  gameCategories.flatMap((category) =>
    category.games.map((game) => [game.id, category] as const),
  ),
);

export default function GameLibrary() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerSnapshot,
  );
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const completedGames = useCompletedGames();
  const search = query.trim().toLowerCase();
  const filteredGames = playableGames.filter((game) => {
    const category = topics.get(game.id);
    const text =
      `${game.title} ${game.description} ${category?.title ?? ""} ${game.difficulty}`.toLowerCase();
    return (!topic || category?.id === topic) && text.includes(search);
  });

  function clearFilters() {
    setQuery("");
    setTopic("");
  }

  return (
    <section
      id="game-library"
      aria-label="Game library"
      className="panel mt-5 scroll-mt-5 p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Choose a game
          </h2>
          <p className="mt-2 max-w-prose text-muted">
            Find a topic to practise. Each game has its own link, so you can
            return to a challenge or share it with your class.
          </p>
        </div>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-muted"
        >
          {filteredGames.length} of {playableGames.length} games
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)]">
        <div className="min-w-0">
          <label
            htmlFor="game-search"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Find a game
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-3 top-3.5 text-muted"
            />
            <input
              id="game-search"
              disabled={!hydrated}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try binary, sorting or logic"
              className="min-h-11 w-full min-w-0 rounded-lg border border-accent/25 bg-canvas py-2.5 pl-10 pr-3 text-foreground placeholder:text-muted/80"
            />
          </div>
        </div>
        <div className="min-w-0">
          <label
            htmlFor="game-topic"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Topic
          </label>
          <select
            id="game-topic"
            disabled={!hydrated}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="min-h-11 w-full min-w-0 rounded-lg border border-accent/25 bg-canvas px-3 py-2.5 text-foreground"
          >
            <option value="">All topics</option>
            {gameCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(query || topic) && (
        <button
          type="button"
          onClick={clearFilters}
          className="icon-button mt-4"
        >
          Clear filters
        </button>
      )}

      {filteredGames.length === 0 ? (
        <div className="py-10 text-muted">
          <h3 className="text-lg font-semibold text-foreground">
            No games match your search.
          </h3>
          <p className="mt-2">
            Try another name or clear the filters to see every game.
          </p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-accent/15">
          {filteredGames.map((game) => (
            <li key={game.id}>
              <Link
                href={`/games/${game.slug}`}
                aria-label={`Play ${game.title}`}
                className="group grid min-h-20 gap-3 rounded-sm py-5 transition-colors hover:text-accent sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-accent">
                    {game.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{game.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    {topics.get(game.id)?.title} · {game.difficulty} ·{" "}
                    {game.estimatedMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-accent">
                  {completedGames.has(game.id) && (
                    <span className="inline-flex items-center gap-1.5">
                      <Check size={15} aria-hidden="true" />
                      Completed
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    Play
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
