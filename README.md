# What in the Square

A calm matrix puzzle game for children. Match each card to the intersection of its color row and shape column. The first playable implementation uses original color-and-shape content; it does not claim to reproduce the physical game's unconfirmed rules.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:4173. No API keys or environment variables are required.

```sh
npm run typecheck
npm test
npm run build
```

The build exports a static application to `out/`. Deploy the project to Vercel with its Next.js preset, or serve `out/` through a static host. Do not use `next start` for this static export.

## Implemented

- Original color × shape puzzles with 2×2, 3×3, or 4×4 playable cells (headers are additional).
- Card-first or empty-square-first tap/click placement, cancellation, and neutral mistake feedback.
- Spread and stack layouts; stack permits sending the top card to the bottom.
- Shuffle remaining cards, return placed cards to the tray, and undo.
- Three levels of on-request visual hints: color, shape, intersection.
- Pause, resume, restart, and basic parent observations.
- English and Hebrew interface, with a fixed left-to-right puzzle coordinate system in both languages.
- Local saved progress, settings, hint attribution, and undo history.
- Keyboard-operable buttons, visible focus, modal focus containment, and reduced-motion support.

Voice AI is deferred. There are no model integrations, server APIs, user accounts, external analytics, or database in this version.

## Architecture and product decisions

Read [Architecture](docs/ARCHITECTURE.md) for the system-level view, responsibilities, data flow, and future boundaries. [Implementation decisions](docs/IMPLEMENTATION.md) records the choices made where the [PRD](docs/PRD.md) remains open.

## Saved progress

One active puzzle is stored in browser localStorage. It is specific to the browser and origin. Clearing browser data removes it; opening another device or another deployment URL starts separately. Starting a fresh puzzle explicitly replaces the previous one. Invalid saved data falls back to a fresh game with a visible notice; unavailable storage does not prevent play.
