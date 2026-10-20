# First playable implementation decisions

The source PRD remains Draft v0.1. These are reversible implementation choices for this prototype, not confirmation of the physical game's content.

| Open topic | Current implementation |
|---|---|
| Board dimensions | Default 3×3 playable cells plus headers; parent can start 2×2 or 4×4 |
| Initial puzzle family | Original color-by-shape matrix; every card has exactly one valid square |
| Input | Tap/click to select then place; empty-square-first also works |
| Mistakes | Board stays unchanged; neutral feedback; card stays available |
| Revising a move | Select a placed card and return it to the tray; undo restores either operation |
| Stack | Top card only, with optional skip to bottom; full tray available through layout switch |
| Guidance | On request only; highlight row, then column, then intersection |
| Language | English by default; Hebrew available in parent settings |
| Puzzle coordinates | Colors remain on the left in both languages; shapes remain at the top |
| Storage | One active puzzle and preferences on this browser/origin |
| AI and voice | Deferred per user instruction on 20 October 2026 |

The scatter tray uses a shuffled, slightly rotated grid of individually selectable cards. It preserves card order through placements and layout changes. Shuffle explicitly changes only remaining cards. Skip explicitly rotates the remaining-card order.

Parent observations show currently placed cards with or without prior requested help, plus total hints and wrong attempts during this puzzle. A card is conservatively marked assisted after any hint for it, even after undo or returning it to the tray. No inferred cognitive ability, strategy classification, speed score, or cross-session analytics are implemented.

## Validation

Automated engine tests cover one-solution-per-card for all three sizes, wrong placement, occupied targets, card conservation, completion, undo, return-to-tray, shuffling, skipping, and malformed saved data. Browser checks exercise the actual interface separately. Manual testing with Naomi and physical-game rule validation are still required.
