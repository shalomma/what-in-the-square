import { COLORS, SHAPES, type Card, type Language, type Level } from '@/lib/game';

export const CHARACTER_NAMES = {
  en: ['princess', 'flower', 'unicorn', 'butterfly', 'heart', 'star'],
  he: ['נסיכה', 'פרח', 'חד־קרן', 'פרפר', 'לב', 'כוכב'],
} as const;

// Saved puzzles from before character selection retain a deterministic fallback.
export function characterIndex(card: Card, level: Level, characters?: number[]) {
  const slot = level === 0 ? card.row : SHAPES.indexOf(card.shape);
  return characters?.[slot] ?? (level === 0 ? [4, 1, 2, 3][slot] : slot);
}

export function characterName(card: Card, level: Level, language: Language, characters?: number[]) {
  return CHARACTER_NAMES[language][characterIndex(card, level, characters)];
}

export function CardArt({ card, level, characters, neutral = false }: { card: Card; level: Level; characters?: number[]; neutral?: boolean }) {
  const column = characterIndex(card, level, characters);
  const row = COLORS.indexOf(card.color);
  // Crop between the actual subject baselines, avoiding neighboring sprites.
  const boundaries = column === 0 ? [0, 232, 459, 689, 915, 1145]
    : column === 1 ? [0, 240, 470, 696, 925, 1145]
    : column === 2 ? [0, 240, 467, 693, 917, 1145] : [0, 235, 465, 695, 925, 1145];
  const columns = [0, 229, 450, 696, 936, 1160, 1374];
  return <svg className={`card-art${neutral ? ' character-clue' : ''}`}
    viewBox={`${columns[column]} ${boundaries[row]} ${columns[column + 1] - columns[column]} ${boundaries[row + 1] - boundaries[row]}`} aria-hidden="true">
    <image href="/art/glitter-foam-characters-v2.png" width="1374" height="1145"/>
  </svg>;
}
