"use client";

import dynamic from "next/dynamic";
import type { GameId } from "@/data/games";

function GameLoading() {
  return (
    <p role="status" className="panel p-6 text-muted">
      Loading game…
    </p>
  );
}

// Random challenges start in the browser, avoiding mismatched server/client puzzles.
// Each import becomes a separate chunk; visiting one game does not load every game.
const screens = {
  "logic-ii": dynamic(() => import("./LogicGatesIIGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  logic: dynamic(() => import("./LogicGatesGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  bubble: dynamic(() => import("./BubbleSortGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  binary: dynamic(() => import("./BinaryBuilderGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  search: dynamic(() => import("./SearchSprintGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  selection: dynamic(() => import("./SelectionSortGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  insertion: dynamic(() => import("./InsertionSortGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  pathfinding: dynamic(() => import("./PathfindingGridGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  modulo: dynamic(() => import("./ModuloMasteryGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  dividend: dynamic(() => import("./DividendBuilderGame"), {
    ssr: false,
    loading: GameLoading,
  }),
  "packet-routing": dynamic(() => import("./PacketRoutingRaceGame"), {
    ssr: false,
    loading: GameLoading,
  }),
};

export default function GameScreen({
  gameId,
  title,
}: {
  gameId: GameId;
  title: string;
}) {
  // Ready games resolve to their own lazy-loaded screen.
  const Screen = screens[gameId];
  return (
    <div aria-label={title}>
      <Screen />
    </div>
  );
}
