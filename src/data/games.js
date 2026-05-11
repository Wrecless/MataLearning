import { Binary, Braces, Code2, Divide, Percent, Terminal } from 'lucide-react';

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
    status: 'Soon',
    icon: Terminal,
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
];

export const gameCategories = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Sorting and searching',
    games: games.filter((game) => ['bubble', 'search'].includes(game.id)),
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
];
