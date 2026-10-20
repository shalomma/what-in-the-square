import { describe, expect, it } from 'vitest';
import { cardsFor, createGame, isComplete, isValidPlacement, parseSaved, place, remaining, returnCard, shuffled, shuffleRemaining, refreshCharacters, skipTop, undo } from './game';

describe('puzzle rules', () => {
  it.each([2, 3, 4] as const)('refreshes %s characters without resetting the puzzle, even when randomness repeats', size => {
    for (const level of [0, 1] as const) {
      const game = place(createGame(size, () => .5, level), '0-0', 0).state;
      const refreshed = refreshCharacters(game, () => .5);
      expect(new Set(refreshed.characters).size).toBe(size);
      expect(refreshed.characters?.some(index => !game.characters!.includes(index))).toBe(true);
      const { characters: beforeCharacters, ...before } = game;
      const { characters: afterCharacters, ...after } = refreshed;
      expect(after).toEqual(before);
      expect(parseSaved(JSON.stringify({ game: refreshed, mode: 'scatter', language: 'en' }))?.game).toEqual(refreshed);
    }
  });
  it.each([2, 3, 4] as const)('selects %s distinct characters and keeps them stable throughout a puzzle', size => {
    for (const level of [0, 1] as const) {
      const game = createGame(size, () => 0, level);
      const other = createGame(size, () => .999, level);
      expect(game.characters).toHaveLength(size);
      expect(new Set(game.characters).size).toBe(size);
      expect(new Set(game.colors).size).toBe(size);
      expect(game.colors).toHaveLength(size);
      expect(other.characters).not.toEqual(game.characters);
      const placed = place(game, '0-0', 0).state;
      expect(shuffleRemaining(placed).characters).toEqual(game.characters);
      expect(shuffleRemaining(placed).colors).toEqual(game.colors);
      expect(undo(placed).characters).toEqual(game.characters);
      const saved = { game: placed, mode: 'scatter', language: 'en' };
      expect(parseSaved(JSON.stringify(saved))?.game.characters).toEqual(game.characters);
      expect(parseSaved(JSON.stringify(saved))?.game.colors).toEqual(game.colors);
      const { characters: _, ...legacy } = game;
      expect(parseSaved(JSON.stringify({ ...saved, game: legacy }))).not.toBeNull();
      for (const characters of [[0, 0], [6, 1], 'heart', [0, 1, 2, 3, 4]]) {
        expect(parseSaved(JSON.stringify({ ...saved, game: { ...game, characters } }))).toBeNull();
      }
      for (const colors of [['purple', 'purple'], ['orange', 'blue'], 'purple', []]) {
        expect(parseSaved(JSON.stringify({ ...saved, game: { ...game, colors } }))).toBeNull();
      }
    }
  });
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

import { LEVELS, LEVEL_AXES, packProgress, parseProgress, switchLevel } from './game';

describe('clue levels', () => {
  it.each(LEVELS)('supports the correct placements and completion at level %s in every board size', level => {
    for (const size of [2, 3, 4] as const) {
      let game = createGame(size, Math.random, level);
      for (const card of cardsFor(size, level)) {
        const valid = Array.from({ length: size ** 2 }, (_, i) => i).filter(i => isValidPlacement(size, card.id, i, level));
        expect(valid).toHaveLength(level === 0 ? size : 1);
        const cell = (level === 0 ? size - card.row - 1 : card.row) * size + card.column;
        const result = place(game, card.id, cell);
        expect(result.outcome).toBe('correct');
        game = result.state;
      }
      expect(isComplete(game)).toBe(true);
      const saved = { game, mode: 'scatter' as const, language: 'he' as const };
      expect(parseSaved(JSON.stringify(saved))).toEqual(saved);
      expect(isComplete(undo(game))).toBe(false);
    }
  });
  it('ignores vertical card order in the single-clue level and rejects a different color column', () => {
    const game = createGame(3, Math.random, 0);
    expect(place(game, '0-0', 6).outcome).toBe('correct');
    expect(place(game, '0-0', 7).outcome).toBe('incorrect');
    expect(LEVEL_AXES[0].row).toBeNull();
  });
  it('cards encode each clue combination, including swapped axes', () => {
    expect(cardsFor(3, 2).find(c => c.id === '1-2')).toMatchObject({ color: 'blue', quantity: 3 });
    expect(cardsFor(3, 3).find(c => c.id === '1-2')).toMatchObject({ shape: 'triangle', quantity: 3 });
    expect(cardsFor(3, 4).find(c => c.id === '1-2')).toMatchObject({ scale: 1, shape: 'square' });
    expect(cardsFor(3, 5).find(c => c.id === '1-2')).toMatchObject({ color: 'blue', direction: 2 });
    expect(cardsFor(3, 6).find(c => c.id === '1-2')).toMatchObject({ fill: 1, shape: 'square' });
    expect(cardsFor(3, 7).find(c => c.id === '1-2')).toMatchObject({ shape: 'triangle', color: 'gold' });
  });
  it('restores independent progress when switching clue families and sizes', () => {
    const first = place(createGame(3, Math.random, 0), '0-0', 6, true).state;
    const second = switchLevel(first, {}, 2);
    const progressed = place(second.game, '1-1', 4).state;
    const small = switchLevel(progressed, second.levels, 2, 2);
    const back = switchLevel(small.game, small.levels, 0, 3);
    expect(back.game).toEqual(first);
    const saved = packProgress({ game: back.game, mode: 'stack', language: 'he' }, back.levels);
    const restored = parseProgress(JSON.stringify(saved))!;
    expect(restored).toEqual(saved);
    expect(switchLevel(restored.game, restored.levels, 2, 3).game).toEqual(progressed);
  });
  it('migrates the original color and shape save to level 1', () => {
    const game = place(createGame(3), '0-0', 0).state;
    const { level: _level, ...legacy } = game;
    const restored = parseProgress(JSON.stringify({ game: legacy, levels: { 3: legacy }, mode: 'scatter', language: 'en' }))!;
    expect(restored.game.level).toBe(1);
    expect(restored.levels['1:3']?.board[0]).toBe('0-0');
  });
  it('rejects invalid level identities and mismatched progress keys', () => {
    const saved = { game: createGame(3), mode: 'scatter', language: 'en' };
    expect(parseSaved(JSON.stringify({ ...saved, game: { ...saved.game, level: 8 } }))).toBeNull();
    expect(parseProgress(JSON.stringify({ ...saved, levels: { '2:3': saved.game } }))).toBeNull();
  });
});
