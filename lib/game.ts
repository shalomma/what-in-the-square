/** The rules engine has no React, storage, network, or AI dependency. */
export const COLORS = ['coral', 'blue', 'gold', 'green'] as const;
export const SHAPES = ['circle', 'triangle', 'square', 'diamond'] as const;
export type Color = typeof COLORS[number];
export type Shape = typeof SHAPES[number];
export type Size = 2 | 3 | 4;
export type Mode = 'scatter' | 'stack';
export type Language = 'en' | 'he';
export type Card = { id: string; row: number; column: number; color: Color; shape: Shape };
export type Board = (string | null)[];
type Snapshot = { board: Board; assisted: string[] };
export type GameState = Snapshot & {
  version: 1; size: Size; order: string[]; history: Snapshot[];
  hintedCards: string[];
  stats: { mistakes: number; hints: number; undos: number };
};
export type SavedGame = { game: GameState; mode: Mode; language: Language };
export const SAVE_KEY = 'what-in-the-square:v1';

export function cardsFor(size: Size): Card[] {
  return COLORS.slice(0, size).flatMap((color, row) => SHAPES.slice(0, size).map((shape, column) => ({
    id: `${row}-${column}`, row, column, color, shape,
  })));
}

export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createGame(size: Size = 3, random = Math.random): GameState {
  return { version: 1, size, order: shuffled(cardsFor(size).map(c => c.id), random),
    board: Array(size * size).fill(null), assisted: [], hintedCards: [], history: [],
    stats: { mistakes: 0, hints: 0, undos: 0 } };
}

export function remaining(state: GameState): string[] {
  return state.order.filter(id => !state.board.includes(id));
}

export function isComplete(state: GameState): boolean {
  return state.board.length === state.size ** 2 && state.board.every((id, cell) =>
    id !== null && isValidPlacement(state.size, id, cell));
}

export function isValidPlacement(size: Size, cardId: string, cell: number): boolean {
  const card = cardsFor(size).find(c => c.id === cardId);
  return !!card && Number.isInteger(cell) && cell >= 0 && cell < size ** 2 &&
    card.row === Math.floor(cell / size) && card.column === cell % size;
}

export function place(state: GameState, cardId: string, cell: number, hinted = false):
  { state: GameState; outcome: 'correct' | 'incorrect' | 'occupied' | 'unchanged' } {
  if (!cardsFor(state.size).some(c => c.id === cardId) || !Number.isInteger(cell) || cell < 0 || cell >= state.size ** 2)
    return { state, outcome: 'unchanged' };
  if (state.board[cell] === cardId) return { state, outcome: 'unchanged' };
  if (state.board[cell] !== null) return { state, outcome: 'occupied' };
  if (!isValidPlacement(state.size, cardId, cell))
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
    const g = value?.game;
    if (!g || g.version !== 1 || ![2, 3, 4].includes(g.size) || !['scatter', 'stack'].includes(value.mode) || !['en', 'he'].includes(value.language)) return null;
    const ids = cardsFor(g.size).map(c => c.id);
    const snapshotValid = (s: Snapshot) => s && Array.isArray(s.board) && s.board.length === ids.length &&
      s.board.every((id, cell) => id === null || (typeof id === 'string' && isValidPlacement(g.size, id, cell))) &&
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
