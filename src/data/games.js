import { Binary, Braces, Code2, Divide, ListOrdered, Percent, Route, Search, Shuffle } from 'lucide-react';

export const games = [
  {
    id: 'bubble',
    title: 'Bubble Sort Lab',
    description: 'Manual adjacent swaps',
    status: 'Ready',
    icon: Binary,
  },
  {
    id: 'binary',
    title: 'Binary Builder',
    description: 'Place values and conversion',
    status: 'Ready',
    icon: Code2,
  },
  {
    id: 'logic',
    title: 'Logic Gates',
    description: 'Truth tables and circuits',
    status: 'Soon',
    icon: Braces,
  },
  {
    id: 'search',
    title: 'Search Sprint',
    description: 'Linear and binary search',
    status: 'Ready',
    icon: Search,
  },
  {
    id: 'selection',
    title: 'Selection Sort Showdown',
    description: 'Find the smallest value',
    status: 'Ready',
    icon: ListOrdered,
  },
  {
    id: 'insertion',
    title: 'Insertion Sort Cards',
    description: 'Insert into sorted order',
    status: 'Ready',
    icon: Shuffle,
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding Grid',
    description: 'Breadth-first search',
    status: 'Ready',
    icon: Route,
  },
  {
    id: 'modulo',
    title: 'Modulo Mastery',
    description: 'Remainders and cycles',
    status: 'Ready',
    icon: Percent,
  },
  {
    id: 'dividend',
    title: 'Dividend Builder',
    description: 'Division terms and quotients',
    status: 'Ready',
    icon: Divide,
  },
  {
    id: 'packet-routing',
    title: 'Packet Routing Race',
    description: 'Routers, links, and packets',
    status: 'Ready',
    icon: Route,
  },
];

export const gameCategories = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Sorting and searching',
    games: games.filter((game) =>
      ['bubble', 'search', 'selection', 'insertion', 'pathfinding'].includes(game.id),
    ),
  },
  {
    id: 'data-representation',
    title: 'Data Representation',
    description: 'Binary and number systems',
    games: games.filter((game) => ['binary'].includes(game.id)),
  },
  {
    id: 'logic',
    title: 'Logic',
    description: 'Boolean reasoning',
    games: games.filter((game) => ['logic'].includes(game.id)),
  },
  {
    id: 'computational-mathematics',
    title: 'Computational Mathematics',
    description: 'Modulo and division',
    games: games.filter((game) => ['modulo', 'dividend'].includes(game.id)),
  },
  {
    id: 'networking',
    title: 'Networking',
    description: 'Packets and routing',
    games: games.filter((game) => ['packet-routing'].includes(game.id)),
  },
];
