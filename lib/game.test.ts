import { describe, expect, it } from 'vitest';
import { cardsFor, createGame, isComplete, isValidPlacement, parseSaved, place, remaining, returnCard, shuffled, shuffleRemaining, skipTop, undo } from './game';

describe('puzzle rules', () => {
  it.each([2, 3, 4] as const)('gives every card exactly one correct square on a %s board', size => {
    const cards = cardsFor(size);
    expect(new Set(cards.map(c => c.id)).size).toBe(size ** 2);
    for (const card of cards) {
      const matches = Array.from({ length: size ** 2 }, (_, cell) => cell).filter(cell => isValidPlacement(size, card.id, cell));
      expect(matches).toEqual([card.row * size + card.column]);
    }
  });
  it('rejects mistakes without losing cards or revealing the answer', () => {
    const game = createGame(3);
    const result = place(game, '0-0', 1);
    expect(result.outcome).toBe('incorrect');
    expect(result.state.board).toEqual(game.board);
    expect(remaining(result.state)).toHaveLength(9);
    expect(result.state.stats.mistakes).toBe(1);
    expect(game.stats.mistakes).toBe(0);
  });
  it('completes only after the entire board is correctly filled', () => {
    let game = createGame(3);
    for (const c of cardsFor(3)) {
      expect(isComplete(game)).toBe(false);
      game = place(game, c.id, c.row * 3 + c.column).state;
    }
    expect(isComplete(game)).toBe(true);
    expect(remaining(game)).toEqual([]);
    expect(isComplete(undo(game))).toBe(false);
  });
  it('can return a placed card and undo both the return and its original placement', () => {
    const empty = createGame(2);
    const placed = place(empty, '0-0', 0, true).state;
    const returned = returnCard(placed, '0-0');
    expect(returned.board[0]).toBeNull();
    expect(returned.assisted).toEqual([]);
    const restored = undo(returned);
    expect(restored.board).toEqual(placed.board);
    expect(restored.assisted).toEqual(['0-0']);
    expect(undo(restored).board).toEqual(empty.board);
  });
  it('does not overwrite an occupied cell or accept unknown card IDs', () => {
    const game = place(createGame(2), '0-0', 0).state;
    expect(place(game, '0-1', 0).outcome).toBe('occupied');
    expect(place(game, 'unknown', 2).state).toBe(game);
    expect(place(game, '1-0', -1).state).toBe(game);
    expect(place(game, '0-0', 0).outcome).toBe('unchanged');
  });
  it('shuffle and skip preserve progress and card inventory', () => {
    const game = place(createGame(3), '0-0', 0).state;
    const shuffledGame = shuffleRemaining(game, () => 0);
    expect(shuffledGame.board).toEqual(game.board);
    expect([...remaining(shuffledGame)].sort()).toEqual([...remaining(game)].sort());
    expect(remaining(skipTop(game))).toEqual([...remaining(game).slice(1), remaining(game)[0]]);
    expect([...shuffled([1, 2, 3])].sort()).toEqual([1, 2, 3]);
  });
});

describe('saved progress', () => {
  const save = { game: place(createGame(3), '0-0', 0, true).state, mode: 'scatter', language: 'en' };
  it('round-trips a game including undo history', () => expect(parseSaved(JSON.stringify(save))).toEqual(save));
  it('rejects malformed JSON and invalid versions', () => {
    expect(parseSaved('{')).toBeNull();
    expect(parseSaved(JSON.stringify({ ...save, game: { ...save.game, version: 2 } }))).toBeNull();
  });
  it('rejects impossible boards, invalid history, duplicate cards and missing metrics', () => {
    for (const patch of [
      { board: ['0-1', ...save.game.board.slice(1)] },
      { history: [{ board: [], assisted: [] }] },
      { order: Array(9).fill('0-0') },
      { stats: {} },
      { assisted: ['1-0'] },
    ]) expect(parseSaved(JSON.stringify({ ...save, game: { ...save.game, ...patch } }))).toBeNull();
  });
});
