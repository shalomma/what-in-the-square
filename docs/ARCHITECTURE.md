# System architecture

This first version is a browser application. Hosting delivers the app; the browser owns play and saved progress. Next.js provides the project structure and build, with no application backend needed yet.

## Responsibilities

| Part | Owns | Does not own |
|---|---|---|
| Game interface | Board, card selection, layouts, feedback, settings, English/Hebrew presentation | Deciding whether an answer is correct |
| Rules engine | Puzzle cards, valid placements, undo, completion, remaining-card inventory | Rendering, browser APIs, networking |
| Local persistence | Saving and restoring one puzzle on this browser and origin | Accounts or cross-device synchronization |
| Static hosting | Delivering HTML, JavaScript, CSS | Receiving gameplay data |

The interface is in `app/game.tsx`. The independent engine is in `lib/game.ts`. The interface's persistence boundary is the only code that reads or writes browser storage.

## A move through the system

1. A player selects a card and square in either order.
2. The interface sends the proposed move to the rules engine.
3. The engine checks both attributes and returns the result and next game state.
4. The interface renders the result and saves that state locally.

The same result is produced without a server or model. Mistakes keep the card available and do not change the board. A successful move adds an undo snapshot. Hints are explicit player requests and never place the answer.

## Deployment

The source is a Next.js App Router project using React, TypeScript, Tailwind CSS, and Motion. It currently builds as a static export. Vercel remains the intended primary deployment option; the exported output can also be served elsewhere for review. Browser data belongs to the origin on which the app runs, so changing hosts does not transfer progress.

## Future boundaries

Voice AI is product-deferred and has no placeholder runtime code. When defined, add a separate assistant integration that receives a deliberate game-state view and invokes the existing validated game actions. A backend would then authorize provider sessions and protect secrets. That change will require removing static-only export if the backend lives in Next.js.

A database and identity system become useful if cross-device progress is needed. That is a separate decision from voice; neither is necessary for local play. The rules engine should remain independent of either addition.

## What to learn from this version

- Domain rules stay separate from the visual interface.
- UI state and durable game state have different lifetimes.
- A frontend framework does not require an application backend.
- Persistence and hosting are separate: serving the app does not imply storing its users' data.
- A future model can request actions without becoming the authority for correctness.

## Clue families and board size

Levels 0–7 are puzzle definitions, independent of board size. Each definition chooses the feature represented by each axis: color, shape, quantity, size, direction, or fill. Level 0 has only a top clue row: all empty positions beneath the same color accept interchangeable cards. Levels 1–7 combine two features, including swapped axes in level 7.

The deterministic engine creates the card inventory and validates placements. The interface draws the same features as visual clues and cards, and uses the current definition for instructions, accessible labels, and progressive hints. No AI or server is involved.

Browser storage saves progress by `level:size`, retaining board state, undo history, and hint attribution. Original saves migrate to level 1 (colors and shapes). Navigation preserves progress; starting fresh replaces only the selected family and size.
