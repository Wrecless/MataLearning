# Mr. Mata Learning Hub — visual system

## Direction and scope

Preserve the existing dark, Matrix-inspired classroom terminal identity. This is a framework and routing migration, not a redesign. The audience is secondary computer science students; fast task discovery, readable instructions, keyboard controls and clear feedback take priority over decoration.

## Palette

- Canvas: `#020806` — deep green-black.
- Panel: `#05100c` — game and navigation surfaces.
- Foreground: `#f1fff6` — primary copy.
- Muted: `#a6c6b3` — supporting copy.
- Accent: `#32f584` — focus, selection and success.
- Warning: `#f5c15b` — comparisons and teaching hints.

Expose these as Tailwind theme tokens. Keep incumbent game-specific teaching colors and illustrations intact.

## Typography

Use Space Grotesk for display, loaded through `next/font`; JetBrains Mono for code and numeric data. Use the readable platform sans stack for body copy. Body text is 16px with relaxed instruction leading; display sizes follow 30/36/48/72/96px responsive steps. Do not substitute a new typographic identity during migration.

## Layout and rhythm

Preserve the left-aligned layout: a 292px topic sidebar next to the game on desktop, and a collapsed menu above content on mobile. Main gap is 20px; outer padding is 14px on mobile and 20px on desktop. Panels use 10px radius; buttons and controls use 8px. Controls have visible keyboard focus and at least 44px touch targets where the game layout allows.

## Motion and state

Keep short, action-led comparison/swap and feedback transitions. Respect reduced motion. Show an accessible loading state while each game bundle loads; provide recovery links for errors and missing routes. Never server-render random game setup and then hydrate a different random state.

## V0.13 teaching surfaces

- Mode: Operate. Keep the terminal palette and typography; spend visual emphasis on the active circuit and the student’s answer, not extra decoration.
- Add a searchable, topic-filtered game library as a flat linked list below the homepage introduction. Show all playable games, clear empty-state recovery, and browser-saved completion. Avoid a grid of identical feature cards.
- Logic Gates uses a circuit-first teaching layout: inputs, named gate/circuit and output prediction, followed by a reference truth table, explanation and glossary. Choices and next/reset controls remain keyboard accessible; progress advances explicitly after a correct answer.
- Preserve readable 320px layouts: headings wrap inside the available column and launch controls fit within the panel. No horizontal clipping as a substitute for responsiveness.
- Keep the topic sidebar visible while desktop users scroll the game library. Bound it to the viewport with its own overflow for expanded categories; preserve the collapsible top menu on mobile.

## Routing

Use real Next.js links, active-page semantics and shareable `/games/<slug>` routes. Keep the sidebar mounted between games. Existing `mata-hub:completed-games` localStorage IDs remain unchanged; SSR renders a stable empty progress snapshot and hydrates saved browser progress afterward.
