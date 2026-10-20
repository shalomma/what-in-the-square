/** The rules engine has no React, storage, network, or AI dependency. */
export const COLORS = ['coral', 'blue', 'gold', 'green', 'purple'] as const;
export const SHAPES = ['circle', 'triangle', 'square', 'diamond'] as const;
export const CHARACTERS = ['princess', 'flower', 'unicorn', 'butterfly', 'heart', 'star'] as const;
export type Color = typeof COLORS[number];
export type Shape = typeof SHAPES[number];
export type Size = 2 | 3 | 4;
export type Mode = 'scatter' | 'stack';
export type Language = 'en' | 'he';
export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Feature = 'color' | 'shape' | 'quantity' | 'scale' | 'direction' | 'fill';
export const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7] as const;
export const LEVEL_AXES: Record<Level, { row: Feature | null; column: Feature }> = {
  0: { row: null, column: 'color' }, 1: { row: 'color', column: 'shape' },
  2: { row: 'color', column: 'quantity' }, 3: { row: 'shape', column: 'quantity' },
  4: { row: 'scale', column: 'shape' }, 5: { row: 'color', column: 'direction' },
  6: { row: 'fill', column: 'shape' }, 7: { row: 'shape', column: 'color' },
};
export type Card = { id: string; row: number; column: number; color: Color; shape: Shape;
  quantity: number; scale: number; direction: number; fill: number };
export function clueLabel(feature: Feature, index: number, language: Language): string {
  const labels = {
    en: { color: ['coral', 'blue', 'gold', 'green', 'purple'], shape: [...SHAPES], quantity: ['one', 'two', 'three', 'four'], scale: ['small', 'medium', 'large', 'very large'], direction: ['up', 'right', 'down', 'left'], fill: ['solid', 'striped', 'dotted', 'outline'] },
    he: { color: ['אלמוג', 'כחול', 'זהב', 'ירוק', 'סגול'], shape: ['עיגול', 'משולש', 'ריבוע', 'מעוין'], quantity: ['אחד', 'שניים', 'שלושה', 'ארבעה'], scale: ['קטן', 'בינוני', 'גדול', 'גדול מאוד'], direction: ['למעלה', 'ימינה', 'למטה', 'שמאלה'], fill: ['מלא', 'פסים', 'נקודות', 'מסגרת'] },
  };
  return labels[language][feature][index];
}
export const LEVEL_NAMES = {
  en: ['One clue: colors', 'Colors & characters', 'Colors & quantities', 'Shapes & quantities', 'Sizes & shapes', 'Colors & directions', 'Fills & shapes', 'Shapes & colors'],
  he: ['רמז אחד: צבעים', 'צבעים ודמויות', 'צבעים וכמויות', 'צורות וכמויות', 'גדלים וצורות', 'צבעים וכיוונים', 'מילויים וצורות', 'צורות וצבעים'],
};
export type Board = (string | null)[];
type Snapshot = { board: Board; assisted: string[] };
export type GameState = Snapshot & {
  version: 1; level: Level; size: Size; order: string[]; history: Snapshot[];
  hintedCards: string[];
  characters?: number[];
  colors?: Color[];
  stats: { mistakes: number; hints: number; undos: number };
};
export type SavedGame = { game: GameState; mode: Mode; language: Language };
export type LevelGames = Partial<Record<string, GameState>>;
export const LEVEL_SIZES = [2, 3, 4] as const;
export const SAVE_KEY = 'what-in-the-square:v1';

export function cardsFor(size: Size, level: Level = 1, colors: readonly Color[] = COLORS): Card[] {
  const axes = LEVEL_AXES[level];
  return Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size), column = i % size;
    const card: Card = { id: `${row}-${column}`, row, column, color: 'green', shape: 'circle', quantity: 1, scale: 3, direction: 0, fill: 0 };
    for (const [feature, index] of [[axes.row, row], [axes.column, column]] as const) {
      if (feature === 'color') card.color = colors[index];
      else if (feature === 'shape') card.shape = SHAPES[index];
      else if (feature === 'quantity') card.quantity = index + 1;
      else if (feature) card[feature] = index;
    }
    return card;
  });
}

export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createGame(size: Size = 3, random = Math.random, level: Level = 1): GameState {
  return { version: 1, level, size, order: shuffled(cardsFor(size, level).map(c => c.id), random),
    ...(level <= 1 ? {
      characters: shuffled(CHARACTERS.map((_, index) => index), random).slice(0, size),
      colors: shuffled(COLORS, random).slice(0, size),
    } : {}),
    board: Array(size * size).fill(null), assisted: [], hintedCards: [], history: [],
    stats: { mistakes: 0, hints: 0, undos: 0 } };
}

export function remaining(state: GameState): string[] {
  return state.order.filter(id => !state.board.includes(id));
}

export function refreshCharacters(state: GameState, random = Math.random): GameState {
  if (state.level > 1) return state;
  const previous = state.characters ?? (state.level === 0 ? [4, 1, 2, 3] : [0, 1, 2, 3]).slice(0, state.size);
  const pool = CHARACTERS.map((_, index) => index);
  const characters = shuffled(pool, random).slice(0, state.size);
  // A refresh must introduce a different character, even if chance repeats the set.
  if (characters.every(index => previous.includes(index))) {
    characters[state.size - 1] = shuffled(pool.filter(index => !previous.includes(index)), random)[0];
  }
  return { ...state, characters };
}

export function isComplete(state: GameState): boolean {
  return state.board.length === state.size ** 2 && state.board.every((id, cell) =>
    id !== null && isValidPlacement(state.size, id, cell, state.level));
}

export function isValidPlacement(size: Size, cardId: string, cell: number, level: Level = 1): boolean {
  const card = cardsFor(size, level).find(c => c.id === cardId);
  return !!card && Number.isInteger(cell) && cell >= 0 && cell < size ** 2 &&
    (level === 0 || card.row === Math.floor(cell / size)) && card.column === cell % size;
}

export function place(state: GameState, cardId: string, cell: number, hinted = false):
  { state: GameState; outcome: 'correct' | 'incorrect' | 'occupied' | 'unchanged' } {
  if (!cardsFor(state.size, state.level).some(c => c.id === cardId) || !Number.isInteger(cell) || cell < 0 || cell >= state.size ** 2)
    return { state, outcome: 'unchanged' };
  if (state.board[cell] === cardId) return { state, outcome: 'unchanged' };
  if (state.board[cell] !== null) return { state, outcome: 'occupied' };
  if (!isValidPlacement(state.size, cardId, cell, state.level))
    return { state: { ...state, stats: { ...state.stats, mistakes: state.stats.mistakes + 1 } }, outcome: 'incorrect' };
  const board = state.board.map(id => id === cardId ? null : id);
  board[cell] = cardId;
  return { state: { ...state, board,
    assisted: hinted || state.hintedCards.includes(cardId) ? [...new Set([...state.assisted, cardId])] : state.assisted,
    history: [...state.history, { board: [...state.board], assisted: [...state.assisted] }],
  }, outcome: 'correct' };
}

export function returnCard(state: GameState, cardId: string): GameState {
  if (!state.board.includes(cardId)) return state;
  return { ...state, board: state.board.map(id => id === cardId ? null : id),
    assisted: state.assisted.filter(id => id !== cardId),
    history: [...state.history, { board: [...state.board], assisted: [...state.assisted] }] };
}

export function undo(state: GameState): GameState {
  const last = state.history.at(-1);
  if (!last) return state;
  return { ...state, board: [...last.board], assisted: [...last.assisted], history: state.history.slice(0, -1),
    stats: { ...state.stats, undos: state.stats.undos + 1 } };
}

export function shuffleRemaining(state: GameState, random = Math.random): GameState {
  const unplaced = shuffled(remaining(state), random);
  let next = 0;
  return { ...state, order: state.order.map(id => state.board.includes(id) ? id : unplaced[next++]) };
}

export function skipTop(state: GameState): GameState {
  const ids = remaining(state);
  if (ids.length < 2) return state;
  return { ...state, order: [...state.order.filter(id => id !== ids[0]), ids[0]] };
}

export function parseSaved(raw: string): SavedGame | null {
  try {
    const value = JSON.parse(raw);
    const g = value?.game ? { ...value.game, level: value.game.level ?? 1 } : null;
    if (!g || !LEVELS.includes(g.level) || g.version !== 1 || ![2, 3, 4].includes(g.size) || !['scatter', 'stack'].includes(value.mode) || !['en', 'he'].includes(value.language)) return null;
    if (g.characters !== undefined && (!Array.isArray(g.characters) || g.characters.length !== g.size ||
      new Set(g.characters).size !== g.size || !g.characters.every((index: number) => Number.isInteger(index) && index >= 0 && index < CHARACTERS.length))) return null;
    if (g.colors !== undefined && (!Array.isArray(g.colors) || g.colors.length !== g.size ||
      new Set(g.colors).size !== g.size || !g.colors.every((color: Color) => COLORS.includes(color)))) return null;
    const ids = cardsFor(g.size, g.level).map(c => c.id);
    const snapshotValid = (s: Snapshot) => s && Array.isArray(s.board) && s.board.length === ids.length &&
      s.board.every((id, cell) => id === null || (typeof id === 'string' && isValidPlacement(g.size, id, cell, g.level))) &&
      new Set(s.board.filter(Boolean)).size === s.board.filter(Boolean).length &&
      Array.isArray(s.assisted) && new Set(s.assisted).size === s.assisted.length &&
      s.assisted.every(id => typeof id === 'string' && s.board.includes(id));
    if (!snapshotValid(g) || !Array.isArray(g.order) || g.order.length !== ids.length ||
      new Set(g.order).size !== ids.length || !g.order.every((id: string) => ids.includes(id)) ||
      !Array.isArray(g.hintedCards) || !g.hintedCards.every((id: string) => ids.includes(id)) ||
      !Array.isArray(g.history) || g.history.length > 10000 || !g.history.every(snapshotValid) || !g.stats ||
      !['mistakes', 'hints', 'undos'].every(key => Number.isSafeInteger(g.stats[key]) && g.stats[key] >= 0)) return null;
    return { game: g, mode: value.mode, language: value.language };
  } catch { return null; }
}

/** Progress is independent for every combination of clue family and board size. */
export const progressKey = (level: Level, size: Size) => `${level}:${size}`;
export function switchLevel(game: GameState, levels: LevelGames, level: Level, size: Size = game.size): { game: GameState; levels: LevelGames } {
  if (level === game.level && size === game.size) return { game, levels };
  return { game: levels[progressKey(level, size)] ?? createGame(size, Math.random, level),
    levels: { ...levels, [progressKey(game.level, game.size)]: game } };
}
export function packProgress(saved: SavedGame, levels: LevelGames) {
  return { ...saved, levels: { ...levels, [progressKey(saved.game.level, saved.game.size)]: saved.game } };
}
export function parseProgress(raw: string): (SavedGame & { levels: LevelGames }) | null {
  const saved = parseSaved(raw);
  if (!saved) return null;
  try {
    const value = JSON.parse(raw);
    const levels: LevelGames = {};
    if (value.levels !== undefined) {
      if (!value.levels || typeof value.levels !== 'object' || Array.isArray(value.levels)) return null;
      for (const [key, game] of Object.entries(value.levels)) {
        const parsed = parseSaved(JSON.stringify({ ...saved, game }));
        if (!parsed) return null;
        const expected = progressKey(parsed.game.level, parsed.game.size);
        if (key !== expected && key !== String(parsed.game.size)) return null;
        levels[expected] = parsed.game;
      }
    }
    return packProgress(saved, levels);
  } catch { return null; }
}
