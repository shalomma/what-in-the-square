# Glitter foam card artwork

`public/art/glitter-foam-characters-v2.png` was created using the built-in imagegen tool from the user's supplied `K · Glitter foam.png` reference. It contains six columns (princess, flower, unicorn, butterfly, heart, star) and five rows (pink, blue, yellow, mint green, purple). The application crops cells through SVG viewBoxes; no external image service is required.

Each fresh puzzle in levels 0–1 randomly selects 2–4 distinct characters from all six, matching the board size. It also randomly selects the same number of distinct colors from all five. The selection is saved with that puzzle and survives shuffling, undo, level switching, and reloading. Level 0 matches only color; Level 1 matches color and character. Older saved puzzles retain a deterministic fallback. Levels 2–7 retain geometric symbols because their clues depend on quantity, size, direction, or fill. Accessible names and Hebrew translations match the displayed characters and colors. Existing saved puzzle coordinates are preserved.

The full generation prompt is in `artwork-prompt-v2.txt` (original atlas prompt: `artwork-prompt.txt`).
