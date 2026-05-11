# Mr. Mata Learning Hub

A dark, Matrix-inspired learning games hub for secondary computer science students. The site uses a terminal-style visual identity with grouped teaching games and a browser tab icon that matches the hub mark.

Live site: https://mr-mata-learning-hub.vercel.app

## Teaching Games

Games are organised by topic in the sidebar.

### Algorithms

- **Bubble Sort Lab**: practise bubble sort by manually comparing adjacent values and choosing whether to swap.
- **Search Sprint**: practise linear search and binary search by choosing the next item to inspect.
- **Selection Sort Showdown**: practise selection sort by finding the smallest unsorted value each pass.
- **Insertion Sort Cards**: practise insertion sort by placing each new value into a sorted hand.
- **Pathfinding Grid**: practise breadth-first search by expanding grid cells in queue order.

### Data Representation

- **Binary Builder**: practise 8-bit binary place values by matching a target decimal number.

### Computational Mathematics

- **Modulo Mastery**: practise modulo by finding the remainder after division.
- **Dividend Builder**: practise constructing the dividend from divisor, quotient, and remainder.

### Logic

- **Logic Gates**: coming soon.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Lucide React icons
- Vercel static deployment

## Source Structure

```text
src/
  components/    React UI components and game screens
  data/          Sidebar game/category metadata
  utils/         Game logic helpers
  App.jsx        App shell and routing state
  index.css      Tailwind entry point and shared component classes
  main.jsx       React entry point
```

## Branding

- Theme: dark terminal interface with green Matrix-inspired accents.
- Tab title: `Mr. Mata Learning Hub`.
- Tab icon: terminal prompt mark matching the site sidebar logo.

## Development

```bash
npm install
npm run dev
```

The local dev server runs at:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

The production output is generated in `dist`.

## Deployment

The app is deployed on Vercel as a static Vite site.
