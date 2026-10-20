# Web App Game PRD Draft v0.1

Source: [Web App Game PRD Draft v0.1](https://chatgpt.com/space/page_a792609a9b7481918e26c19147e15b29)

**Status:** Draft v0.1

**Primary user:** Naomi, age 4

**Scope:** Personal-use web adaptation of the physical game

This draft distinguishes ideas discussed in the project from proposed implementation choices. Exact card sets and puzzle rules still need to be checked against the physical game.

# 1 Product purpose

Make the game immediately available to play by removing the physical setup and card-sorting burden, while preserving opportunities for Naomi to reason, experiment, organize her work, and develop her own strategies.

The app should support both independent play and guided learning. Its guidance should adapt as she becomes comfortable with the interface and more capable at solving puzzles.

**Speed is not a primary objective.** Successful play includes thoughtful exploration, changing an approach, and solving with increasing independence.

# 2 Problem

The physical game requires organizing many cards before play. That preparation creates enough friction that the game sometimes does not get played.

Moving it to a screen solves setup, but also changes the activity:

- The interface determines which cards are visible and accessible.

- Automatic organization can remove decisions the child previously made.

- Feedback and hints can help learning, but can also reveal the reasoning prematurely.

- Difficulty using a mouse or touchscreen can look like difficulty understanding the puzzle.

The product must account for these changes deliberately.

# 3 Goals and boundaries

| Goals | Outside the initial scope |
|---|---|
| Start a puzzle without sorting physical cards | Commercial launch, payments, or account management |
| Preserve the core matrix-classification activity | Reproducing every physical card set immediately |
| Let Naomi choose and change her approach | Leaderboards, speed scores, or competitive play |
| Offer adjustable help and room for trial and error | Formal assessment of cognitive development |
| Support a parent guiding or observing play | A general-purpose conversational tutor |
| Make subtle changes in strategy observable | Claiming that game performance proves broader learning gains |

# 4 Core game model

The working model from our conversations is a **4×4 matrix game** in which cards belong in cells according to the combination of row and column criteria. Attributes may include shape, color, and size.

Before implementation, confirm whether the 4×4 dimensions include headers, how each chosen set defines its criteria, and which cells are playable.

**Proposed first-version rules:**

1. Load a validated puzzle with visible row and column criteria.

2. Present the cards needed for that puzzle.

3. Let the player choose a card and place it in a cell.

4. Evaluate placement using explicit puzzle rules.

5. Complete the puzzle when all required cells contain valid cards.

Correctness must be deterministic. A voice or AI component may explain a rule, but must not decide whether a placement is valid.

# 5 Main experience

1. **Choose a puzzle.** A parent selects a set or difficulty; the app prepares the board and cards.

2. **Choose a layout.** Naomi can use scattered cards or a stack.

3. **Play.** She selects cards and places them on the board in any order.

4. **Explore or ask for help.** She can reconsider, undo, shuffle, switch layouts, or request a hint.

5. **Finish or pause.** Completion receives a brief acknowledgment. An unfinished puzzle can be resumed.

No reading should be necessary for the core play loop.

# 6 Functional requirements

## 6.1 Board and interaction

| Requirement | Acceptance criteria |
|---|---|
| Clear row and column criteria | Criteria remain visible while selecting and placing cards. |
| Flexible placement order | Any available card can be placed in any playable cell; the app does not enforce a solving sequence. |
| Selection and placement | Support click/tap to select, then click/tap to place. Clearly show the selected card and allow cancellation. |
| Reversible actions | Allow undo and moving a previously placed card. |
| Touch and mouse support | Core actions work without hover, precise dragging, or keyboard input. |
| Stable layout | Board positions remain stable during feedback and guidance. |

**Proposed default:** Two-step selection and placement, because it avoids requiring a continuous drag. Drag and drop remains an interaction to try with Naomi before deciding whether to include it.

## 6.2 Card presentation

**Discussed requirement:** Support both a stack and scattered cards, with basic shuffle controls.

| Mode | Intended experience |
|---|---|
| Scattered cards | Multiple cards are visible, allowing comparison, scanning, and choosing an order. |
| Stack | The player works from the top card, reducing the number of simultaneous choices. |

Additional requirements:

- Switching layouts preserves board progress.

- Shuffling changes unplaced-card order only.

- Scattered cards remain individually selectable and visually distinguishable.

- The app does not automatically group cards by their solution attributes.

**Open decision:** Whether stack mode permits skipping a card, looking ahead, or browsing the stack. These controls materially affect the strategies available.

## 6.3 Feedback and mistakes

Feedback should be understandable and calm, without time pressure or penalties.

**Proposed initial behavior:**

- Correct placement: brief visual acknowledgment.

- Incorrect placement: clear, neutral feedback without automatically showing the answer.

- The child can retry or request help.

- Repeated mistakes may trigger an offer of assistance, depending on the selected guidance setting.

**Open decision:** Whether incorrect cards return to the tray immediately or can remain provisionally on the board. Provisional placement supports later reconsideration but requires a clear checking interaction.

# 7 Guidance and learning

## 7.1 Separate interface help from puzzle help

The app must distinguish two different needs:

- **Interface help:** “Tap a card, then tap a square.”

- **Reasoning help:** “Which row matches its color?”

Early sessions may need substantial interface support while still leaving the puzzle reasoning to Naomi.

## 7.2 Guidance settings

The need for adjustable guidance was discussed. The following modes are a proposed implementation:

| Mode | Behavior |
|---|---|
| On request | Puzzle hints appear only when requested. |
| Gentle support | The app offers help after repeated unsuccessful attempts. |
| Guided play | The app proactively breaks reasoning into smaller steps. |

A parent can change the setting during play. Pausing or thinking should not, by itself, trigger an answer.

## 7.3 Hint progression

Hints should move from a small prompt toward explicit assistance:

1. Invite attention to the relevant criteria.

2. Ask about one attribute.

3. Ask about the second attribute.

4. Highlight the relevant row or column.

5. Highlight their intersection or narrow the available choices.

6. Reveal and explain the answer when explicitly requested.

The precise order should be tested; the app need not always start from the same step.

Hints must work whether the child starts with a card or an empty square. They should support different valid solving approaches.

## 7.4 Adaptation and fading

**Discussed direction:** Give more support when needed, then reduce it as competence develops.

**Proposed rules:**

- Track interface assistance separately from reasoning hints.

- Offer stronger support after repeated errors on the same task.

- Reduce proactive guidance after successful independent placements.

- Keep help available even after it has faded.

- Let the parent override adaptation.

- Never silently change puzzle rules or card positions.

These are product hypotheses to evaluate through observation, not established evidence of learning effectiveness.

# 8 Strategy and executive skills

The web adaptation should preserve room for choices such as:

- Working through cards one at a time.

- Searching for a card that fits a chosen empty square.

- Completing a row or column.

- Placing easy cards first and returning to harder ones.

- Comparing attributes before committing.

- Revising an approach after a mistake.

Stack and scattered layouts create different opportunities. They should be choices the child can explore, rather than a hierarchy in which one is presented as better.

**Proposed observation model:** Record actions and hint use, while keeping interpretation cautious. A sequence of placements may suggest a strategy, but does not establish what the child was thinking.

# 9 Voice interaction

**Discussed direction:** Naomi can speak to the app, ask for help, and receive adaptive guidance resembling an adult guiding her through play.

**Proposed first voice scope:**

- “Help me.”

- “Say it again.”

- “Shuffle.”

- “Show the cards.”

- “Make a stack.”

- “Undo.”

Requirements:

- Voice is optional; every essential action remains available on screen.

- Listening state is obvious.

- Guidance is brief and can be interrupted.

- Unrecognized speech does not change the game.

- Voice actions use the same validated controls as touch actions.

- No raw audio is retained by default.

**Language decision:** Confirm Hebrew, English, or both before authoring prompts and selecting speech support.

# 10 Parent controls and progress

**Proposed minimum controls:**

- Puzzle/set selection.

- Guidance mode.

- Voice on/off and language.

- Restart, pause, and resume.

- A brief session summary.

A useful summary should distinguish:

- Independent correct placements.

- Placements completed after hints.

- Requested and proactive help.

- Retries and corrections.

- Layout changes.

Avoid a single score that mixes speed, accuracy, and assistance. The parent should be able to see what happened without treating the summary as a developmental assessment.

# 11 Delivery scope

## First playable version

- One validated puzzle family.

- Matrix board and card tray.

- Scattered and stack layouts.

- Shuffle.

- Two-step selection and placement.

- Reversible moves.

- Deterministic validation.

- On-request visual hints.

- Basic parent settings and local resume.

## Guided version

- Graduated hints.

- Separate interface coaching.

- Adjustable proactive assistance.

- Basic session summaries.

- Spoken guidance.

## Adaptive voice version

- Spoken requests.

- Guidance fading.

- Additional validated puzzle families.

- More nuanced observation of play patterns.

Voice remains part of the product direction; this sequence allows the core interaction and puzzle behavior to be evaluated first.

# 12 Validation and success criteria

The first evaluation should use short observed sessions with Naomi.

| Question | Evidence to look for |
|---|---|
| Has setup friction been removed? | A parent can begin a prepared puzzle without sorting cards. |
| Can she operate the interface? | After initial coaching, she selects, places, and changes cards independently. |
| Does she retain agency? | She chooses cards, placement order, layouts, and whether to seek help. |
| Do hints support the next step? | She can continue after a prompt without always needing the answer revealed. |
| Is independence increasing? | Comparable puzzles require less interface help or fewer reasoning hints over repeated sessions. |
| Are different strategies possible? | The interface accommodates both card-first and square-first play. |

Completion time may help diagnose interaction friction, but should not become the child’s performance target.

# 13 Decisions needed before implementation

1. **Exact rules and board structure:** Validate against the physical game.

2. **Initial content:** Choose the first puzzle family and its attributes.

3. **Primary device:** Tablet, laptop, or both; this affects layout and interaction testing.

4. **Mistake handling:** Immediate return versus provisional placement.

5. **Stack behavior:** Top-card only, skipping, or browsing.

6. **Language:** Hebrew, English, or bilingual.

7. **Default guidance:** On-request or gentle support.

8. **Voice scope:** Spoken guidance first, or speech input in the initial release.

The central design requirement is to remove preparation work while preserving meaningful decisions during play.
