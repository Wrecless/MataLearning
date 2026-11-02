import {
  Binary,
  Braces,
  Code2,
  Divide,
  ListOrdered,
  Percent,
  Route,
  Search,
  Shuffle,
} from "lucide-react";

export type GameId =
  | "bubble"
  | "binary"
  | "logic"
  | "search"
  | "selection"
  | "insertion"
  | "pathfinding"
  | "modulo"
  | "dividend"
  | "packet-routing";

export interface Game {
  id: GameId;
  slug: string;
  title: string;
  description: string;
  status: "Ready" | "Soon";
  icon: typeof Binary;
  difficulty: "Beginner" | "Intermediate";
  estimatedMinutes: number;
}

export const games: Game[] = [
  {
    id: "bubble",
    slug: "bubble-sort",
    title: "Bubble Sort Lab",
    description: "Manual adjacent swaps",
    status: "Ready",
    icon: Binary,
    difficulty: "Beginner",
    estimatedMinutes: 5,
  },
  {
    id: "binary",
    slug: "binary-builder",
    title: "Binary Builder",
    description: "Place values and conversion",
    status: "Ready",
    icon: Code2,
    difficulty: "Beginner",
    estimatedMinutes: 5,
  },
  {
    id: "logic",
    slug: "logic-gates",
    title: "Logic Gates",
    description: "Truth tables and circuits",
    status: "Soon",
    icon: Braces,
    difficulty: "Beginner",
    estimatedMinutes: 5,
  },
  {
    id: "search",
    slug: "search-sprint",
    title: "Search Sprint",
    description: "Linear and binary search",
    status: "Ready",
    icon: Search,
    difficulty: "Beginner",
    estimatedMinutes: 5,
  },
  {
    id: "selection",
    slug: "selection-sort",
    title: "Selection Sort Showdown",
    description: "Find the smallest value",
    status: "Ready",
    icon: ListOrdered,
    difficulty: "Beginner",
    estimatedMinutes: 5,
  },
  {
    id: "insertion",
    slug: "insertion-sort",
    title: "Insertion Sort Cards",
    description: "Insert into sorted order",
    status: "Ready",
    icon: Shuffle,
    difficulty: "Intermediate",
    estimatedMinutes: 6,
  },
  {
    id: "pathfinding",
    slug: "pathfinding-grid",
    title: "Pathfinding Grid",
    description: "Breadth-first search",
    status: "Ready",
    icon: Route,
    difficulty: "Intermediate",
    estimatedMinutes: 8,
  },
  {
    id: "modulo",
    slug: "modulo-mastery",
    title: "Modulo Mastery",
    description: "Remainders and cycles",
    status: "Ready",
    icon: Percent,
    difficulty: "Beginner",
    estimatedMinutes: 4,
  },
  {
    id: "dividend",
    slug: "dividend-builder",
    title: "Dividend Builder",
    description: "Division terms and quotients",
    status: "Ready",
    icon: Divide,
    difficulty: "Beginner",
    estimatedMinutes: 4,
  },
  {
    id: "packet-routing",
    slug: "packet-routing-race",
    title: "Packet Routing Race",
    description: "Routers, links, and packets",
    status: "Ready",
    icon: Route,
    difficulty: "Intermediate",
    estimatedMinutes: 10,
  },
];

export const gameCategories = [
  {
    id: "algorithms",
    title: "Algorithms",
    description: "Sorting and searching",
    games: games.filter((game) =>
      ["bubble", "search", "selection", "insertion", "pathfinding"].includes(
        game.id,
      ),
    ),
  },
  {
    id: "data-representation",
    title: "Data Representation",
    description: "Binary and number systems",
    games: games.filter((game) => ["binary"].includes(game.id)),
  },
  {
    id: "logic",
    title: "Logic",
    description: "Boolean reasoning",
    games: games.filter((game) => ["logic"].includes(game.id)),
  },
  {
    id: "computational-mathematics",
    title: "Computational Mathematics",
    description: "Modulo and division",
    games: games.filter((game) => ["modulo", "dividend"].includes(game.id)),
  },
  {
    id: "networking",
    title: "Networking",
    description: "Packets and routing",
    games: games.filter((game) => ["packet-routing"].includes(game.id)),
  },
];
