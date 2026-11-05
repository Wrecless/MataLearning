# Mr. Mata Learning Hub

A dark, Matrix-inspired learning games hub for secondary computer science students. The site uses a terminal-style visual identity with grouped teaching games and a browser tab icon that matches the hub mark.

Live site: https://mr-mata-learning-hub.vercel.app

## Teaching Games

Games are organised by topic in the sidebar and in the searchable homepage library. Search by game name, concept or topic; combine a query with a topic filter, clear empty searches, and see completed games without losing replay access.

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

### Networking

- **IPv4 Address Lab**: check valid IPv4 addresses, build binary octets with place-value switches, recognise private/public examples and compare devices on a /24 subnet. Ten challenges, teaching hints, a glossary and independent completion tracking.
- **Packet Routing Race**: practise routing packets through three increasingly complex network stages while avoiding broken and congested links, then reassemble delivered packets at the server.

### Logic

- **Logic Gates**: predict outputs for AND, OR, NOT, XOR, NAND, NOR and XNOR gates, then trace combined circuits. Uses traditional shaped gate symbols with truth-table references, hints, explanations and saved completion.
- **Logic Gates II**: recognise all seven gate symbols, then trace mixed XOR/NOT, NAND/OR and XNOR/AND circuits. Includes an expandable all-gate symbol guide, keyboard controls and independent completion tracking.

## Tech Stack

- Next.js 16 App Router with React 19
- Strict TypeScript
- Tailwind CSS 4
- Lucide React icons
- Vercel deployment

## Source Structure

```text
src/
  app/                  Next.js layouts, pages, loading/error/404 UI
    games/[slug]/       Individual statically generated game routes
    globals.css         Tailwind entry point and shared theme
  components/           Interactive game screens and navigation
  data/                 Typed game/category metadata
  types/                Shared game UI types
  utils/                Typed game logic and SSR-safe browser progress
tests/
  e2e/                  Desktop and mobile browser tests
```

## Branding

- Theme: dark terminal interface with green Matrix-inspired accents.
- Website release: `V0.15`, derived from `package.json` (`0.15.0`) in the shared sidebar.
- Tab title: `Mr. Mata Learning Hub`.
- Tab icon: terminal prompt mark matching the site sidebar logo.

## Development

```bash
npm ci
npm run dev
```

The local dev server runs at:

```text
http://127.0.0.1:3000
```

## Build

```bash
npm run build
```

The production output is generated in `.next`. Run `npm start` after building to exercise the production server.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
# In another terminal, start npm run dev (or npm start after building):
npm run test:e2e
```

Browser tests use Microsoft Edge on Windows and Playwright Chromium on other systems (`npx playwright install chromium`). Set `PLAYWRIGHT_BASE_URL` to test a preview or another local port.

## Individual game URLs

All game links are real Next.js links. They work when opened directly, shared, refreshed, or visited using browser back/forward.

| Game                    | Path                         |
| ----------------------- | ---------------------------- |
| Bubble Sort Lab         | `/games/bubble-sort`         |
| Binary Builder          | `/games/binary-builder`      |
| Search Sprint           | `/games/search-sprint`       |
| Selection Sort Showdown | `/games/selection-sort`      |
| Insertion Sort Cards    | `/games/insertion-sort`      |
| Pathfinding Grid        | `/games/pathfinding-grid`    |
| Modulo Mastery          | `/games/modulo-mastery`      |
| Dividend Builder        | `/games/dividend-builder`    |
| IPv4 Address Lab        | `/games/ipv4-address-lab`    |
| Packet Routing Race     | `/games/packet-routing-race` |
| Logic Gates             | `/games/logic-gates`         |
| Logic Gates II          | `/games/logic-gates-ii`      |

Completion progress stays in the same browser under the original `mata-hub:completed-games` key, using unchanged game IDs. No account, database, or environment variables are required. Progress does not move between different domains or browser profiles.

## Deployment

`vercel.json` explicitly selects Next.js, `npm ci`, `npm run build`, and `.next`, overriding the old Vite build/output settings. Do not add a catch-all SPA rewrite: Next.js handles game pages and returns real 404s for unknown URLs.

Keep the existing GitHub repository connected to the existing Vercel project. The `main` branch is production. Per the owner’s delivery preference, verified changes are committed and pushed directly to `main`; use a feature branch or pull request only when explicitly requested. Keep lint, typecheck, unit/browser tests, production build and visual checks before pushing.

Production site: https://mr-mata-learning-hub.vercel.app. Updates appear after the `main` deployment completes.

IPv4 Address Lab uses canonical dotted-decimal notation and the private ranges defined by [RFC 1918](https://www.rfc-editor.org/rfc/rfc1918#section-3). Subnet challenges explicitly use a /24 mask; they do not imply that all networks share that boundary.

Gate glyphs are original scalable SVG drawings of traditional distinctive-shape symbols, including inversion bubbles and the extra XOR/XNOR input curve. Symbol conventions were checked against [Electronics Club’s gate reference](https://electronicsclub.info/gates.htm).
