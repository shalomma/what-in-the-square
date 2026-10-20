'use client';

import { useEffect, useRef, useState, useId, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { COLORS, SHAPES, SAVE_KEY, LEVELS, LEVEL_AXES, LEVEL_NAMES, clueLabel, progressKey, isValidPlacement, cardsFor, createGame, isComplete, parseProgress, packProgress, switchLevel, place, remaining, returnCard, shuffleRemaining, refreshCharacters, skipTop, undo, type Card, type Feature, type Level, type Color, type GameState, type Language, type LevelGames, type Mode, type Shape, type Size } from '@/lib/game';

import { HeartCelebration } from './heart-celebration';
import { CardArt, CHARACTER_NAMES, characterName } from './card-art';

const words = {
  en: {
    levels: 'Choose a level', level: 'Level', previousLevel: 'Previous level', nextLevel: 'Next level', levelProgress: 'Progress is saved for each level.',
    refreshCharacters: 'Refresh characters',
    brand: 'what in the square', parent: 'For grown-ups', eyebrow: 'A LITTLE ROOM TO THINK',
    title: 'Every card has', titleEnd: 'a little home.', intro: 'Explore the clues. Find a place. Make it your own.',
    board: 'Find the square', tray: 'Your little collection', scatter: 'Spread out', stack: 'Make a stack',
    cardsLeft: 'cards to explore', cardLeft: 'card to explore', complete: 'All at home',
    shuffle: 'Shuffle', skip: 'Next card', undo: 'Undo', hint: 'A little hint', more: 'Another hint',
    idle: 'Pick a card, then find its square.', chosen: 'Now find a square with the same color and shape.',
    squareChosen: 'Find a card with this row’s color and this column’s shape.',
    correct: 'A lovely fit. What’s next?', wrong: 'Have another look at the color and shape.',
    occupied: 'There’s already a card here. Try an empty square.',
    hintColor: 'Look at the color on the left. Which row matches?',
    hintShape: 'Now look at the shapes along the top. Which column matches?',
    hintMeet: 'Follow the color and shape. Where do they meet?',
    welcome: 'No rush. There’s room to try.', footer: 'A little curiosity goes a long way.',
    finished: 'Look what you figured out.', finishBody: 'Every color and shape found its place. Ready to explore again?',
    again: 'Play again', explore: 'Look at the board', back: 'Back to cards', cancel: 'Cancel selection',
    settingsTitle: 'A little space for grown-ups', settingsBody: 'Keep it simple. Leave room for discovery.',
    puzzle: 'Puzzle size', size2: 'A gentle start', size3: 'Room to explore', size4: 'A bigger puzzle',
    language: 'Language', session: 'This puzzle', independent: 'Placed independently', supported: 'Placed with a hint',
    hints: 'Hints requested', retries: 'Try-again moments', note: 'A record of play, not a score or a developmental assessment.',
    newPuzzle: 'Start a fresh puzzle', resetNote: 'Starting fresh replaces only the selected level’s puzzle on this device.',
    done: 'Back to play', saved: 'Progress stays on this device', savingFailed: 'Progress can’t be saved in this browser. You can still play.',
    loadFailed: 'Saved progress could not be opened. A fresh puzzle is ready.',
    starter: 'Colors & shapes', how: 'How to play', howTitle: 'Two little clues. One little home.',
    howBody: 'The color on the left tells you the row. The shape at the top tells you the column. Tap a card, then tap where they meet. You can also start with an empty square and look for its card.',
    howExtra: 'Tap a placed card to select it, then use Back to cards to reconsider. Undo is always there. Switch between spread and stack whenever you like.',
    skipNote: 'You can come back to this card later.', pause: 'Pause', pauseTitle: 'A little pause.', pauseBody: 'Your puzzle will be here when you’re ready.', resume: 'Keep exploring',
    colorNames: { coral: 'coral', blue: 'blue', gold: 'gold', green: 'green' },
    shapeNames: { circle: 'circle', triangle: 'triangle', square: 'square', diamond: 'diamond' },
  },
  he: {
    levels: 'בחירת שלב', level: 'שלב', previousLevel: 'השלב הקודם', nextLevel: 'השלב הבא', levelProgress: 'ההתקדמות נשמרת בכל שלב בנפרד.',
    refreshCharacters: 'החלפת דמויות',
    brand: 'מה במשבצת', parent: 'להורים', eyebrow: 'קצת מקום למחשבה',
    title: 'לכל כרטיס יש', titleEnd: 'מקום משלו.', intro: 'מגלים רמזים. מוצאים מקום. משחקים בדרך שלך.',
    board: 'מוצאים את המשבצת', tray: 'האוסף הקטן שלך', scatter: 'מפזרים', stack: 'עורמים',
    cardsLeft: 'כרטיסים לגלות', cardLeft: 'כרטיס לגלות', complete: 'הכול במקום',
    shuffle: 'מערבבים', skip: 'הכרטיס הבא', undo: 'ביטול צעד', hint: 'רמז קטן', more: 'עוד רמז',
    idle: 'בוחרים כרטיס, ואז מוצאים את המשבצת שלו.', chosen: 'עכשיו מחפשים משבצת עם אותו צבע ואותה צורה.',
    squareChosen: 'מחפשים כרטיס עם הצבע של השורה והצורה של העמודה.',
    correct: 'מתאים בדיוק. מה עכשיו?', wrong: 'נסתכל שוב על הצבע ועל הצורה.',
    occupied: 'כבר יש כאן כרטיס. ננסה משבצת ריקה.',
    hintColor: 'נסתכל על הצבע בצד שמאל. איזו שורה מתאימה?',
    hintShape: 'עכשיו נסתכל על הצורות למעלה. איזו עמודה מתאימה?',
    hintMeet: 'עוקבים אחרי הצבע והצורה. איפה הם נפגשים?',
    welcome: 'אין מה למהר. אפשר לנסות.', footer: 'כל גילוי מתחיל בקצת סקרנות.',
    finished: 'איזה יופי, מצאת הכול.', finishBody: 'כל צבע וכל צורה מצאו את המקום שלהם. נרצה לגלות שוב?',
    again: 'משחקים שוב', explore: 'מסתכלים על הלוח', back: 'בחזרה לכרטיסים', cancel: 'ביטול בחירה',
    settingsTitle: 'קצת מקום להורים', settingsBody: 'משחק פשוט, עם מקום לגילוי עצמאי.',
    puzzle: 'גודל הלוח', size2: 'התחלה קלה', size3: 'מקום לגלות', size4: 'לוח גדול יותר',
    language: 'שפה', session: 'המשחק הזה', independent: 'הונחו באופן עצמאי', supported: 'הונחו בעזרת רמז',
    hints: 'רמזים שהתבקשו', retries: 'ניסיונות נוספים', note: 'תיאור המשחק בלבד, לא ציון ולא הערכה התפתחותית.',
    newPuzzle: 'מתחילים משחק חדש', resetNote: 'משחק חדש יחליף רק את הלוח של השלב שנבחר במכשיר הזה.',
    done: 'בחזרה למשחק', saved: 'ההתקדמות נשמרת במכשיר הזה', savingFailed: 'אי אפשר לשמור בדפדפן הזה. עדיין אפשר לשחק.',
    loadFailed: 'לא הצלחנו לפתוח את המשחק השמור. לוח חדש מחכה לך.',
    starter: 'צבעים וצורות', how: 'איך משחקים', howTitle: 'שני רמזים. מקום אחד.',
    howBody: 'הצבע בצד שמאל מסמן את השורה. הצורה למעלה מסמנת את העמודה. לוחצים על כרטיס, ואז על המשבצת שבה הם נפגשים. אפשר גם להתחיל במשבצת ריקה ולחפש את הכרטיס שלה.',
    howExtra: 'אפשר לבחור כרטיס שכבר הונח ולהחזיר אותו לכרטיסים. תמיד אפשר לבטל צעד. אפשר לעבור בין פיזור לערימה בכל שלב.',
    skipNote: 'אפשר לחזור לכרטיס הזה אחר כך.', pause: 'הפסקה', pauseTitle: 'הפסקה קטנה.', pauseBody: 'הלוח יחכה כאן כשנרצה להמשיך.', resume: 'ממשיכים לגלות',
    colorNames: { coral: 'אלמוג', blue: 'כחול', gold: 'זהב', green: 'ירוק' },
    shapeNames: { circle: 'עיגול', triangle: 'משולש', square: 'ריבוע', diamond: 'מעוין' },
  },
} as const;

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    settings: <><path d="M9 4h6l1 3 3 1v6l-3 1-1 3H9l-1-3-3-1V8l3-1z"/><circle cx="12" cy="11" r="3"/></>,
    shuffle: <><path d="M3 6h3c4 0 7 12 11 12h4m-4-4 4 4-4 4M3 18h3c1.5 0 3-2 4-4m4-4c1-2 2-4 4-4h3m-4-4 4 4-4 4"/></>,
    undo: <><path d="m8 5-5 5 5 5M3 10h10a6 6 0 0 1 0 12"/></>,
    bulb: <><path d="M8 16c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8M8 16h8M9 20h6M12 3v2"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    spread: <><rect x="2" y="7" width="7" height="11" rx="2" transform="rotate(-12 5 12)"/><rect x="14" y="5" width="7" height="11" rx="2" transform="rotate(12 17 10)"/></>,
    stack: <><path d="m6 4 12-1 1 4M3 8l13-1 1 4"/><rect x="4" y="11" width="14" height="10" rx="2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 4m0 3v.5"/></>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
    leaf: <><path d="M20 3C6 2 2 10 7 15s13 1 13-12ZM4 20 16 8"/></>,
    return: <><path d="m8 3-5 5 5 5M3 8h12a6 6 0 0 1 0 12h-3"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.help}</svg>;
}

function Symbol({ shape, color, header = false, quantity = 1, scale = 3, direction, fill = 0 }: { shape: Shape; color?: Color; header?: boolean; quantity?: number; scale?: number; direction?: number; fill?: number }) {
  const id = useId().replace(/:/g, '');
  const ink = color ? `var(--${color})` : 'currentColor';
  const props = { fill: header || fill === 3 ? 'none' : fill ? `url(#${id})` : ink, stroke: ink, strokeWidth: header || fill === 3 ? 3.5 : 1, strokeLinejoin: 'round' as const };
  const positions = quantity === 1 ? [[40,40]] : quantity === 2 ? [[21,40],[59,40]] : quantity === 3 ? [[40,20],[21,58],[59,58]] : [[21,21],[59,21],[21,59],[59,59]];
  return <svg className={header ? 'shape shape-header' : 'shape'} viewBox="0 0 80 80" aria-hidden="true">
    <defs><pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fffefa"/>{fill === 1 ? <path d="M-3 3 3-3M0 12 12 0M9 15 15 9" stroke={ink} strokeWidth="5"/> : <circle cx="6" cy="6" r="3" fill={ink}/>}</pattern></defs>
    {positions.map(([x,y], i) => <g key={i} transform={`translate(${x} ${y}) scale(${(quantity > 1 ? .46 : 1) * [.38,.58,.78,1][scale]}) translate(-40 -40)`}>
      {direction !== undefined ? <path d="M40 8 69 39H53V71H27V39H11Z" transform={`rotate(${direction * 90} 40 40)`} {...props}/> : <>
        {shape === 'circle' && <circle cx="40" cy="40" r="27" {...props}/>}
        {shape === 'triangle' && <path d="M40 10 71 66H9Z" {...props}/>}
        {shape === 'square' && <rect x="15" y="15" width="50" height="50" rx="8" {...props}/>}
        {shape === 'diamond' && <path d="M40 7 73 40 40 73 7 40Z" {...props}/>}
      </>}
    </g>)}
  </svg>;
}
function CardSymbol({ card, level, characters }: { card: Card; level: Level; characters?: number[] }) {
  if (level <= 1) return <CardArt card={card} level={level} characters={characters}/>;
  return <Symbol {...card} direction={level === 5 ? card.direction : undefined}/>;
}
function Clue({ feature, index, characters = false, characterSelection, colors = COLORS }: { feature: Feature; index: number; characters?: boolean; characterSelection?: number[]; colors?: readonly Color[] }) {
  if (characters && feature === 'shape') return <CardArt card={cardsFor(4, 1, colors)[index]} level={1} characters={characterSelection} neutral/>;
  if (feature === 'color') return <span className="color-dot" style={{ background: `var(--${colors[index]})` }}/>;
  return <Symbol shape={feature === 'shape' ? SHAPES[index] : 'circle'} header={feature === 'shape'}
    color={feature === 'shape' ? undefined : 'green'} quantity={feature === 'quantity' ? index + 1 : 1}
    scale={feature === 'scale' ? index : 3} direction={feature === 'direction' ? index : undefined} fill={feature === 'fill' ? index : 0}/>;
}

export default function Game() {
  // Start with deterministic markup so browser storage never changes server rendering.
  const [game, setGame] = useState<GameState>(() => createGame(3, () => 0.5, 0));
  const [levelGames, setLevelGames] = useState<LevelGames>({});
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('scatter');
  const [language, setLanguage] = useState<Language>('en');
  const [selected, setSelected] = useState<string | null>(null);
  const [heldPointer, setHeldPointer] = useState<{ x: number; y: number; size: number } | null>(null);
  const [focusCell, setFocusCell] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintCard, setHintCard] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'chosen' | 'squareChosen' | 'correct' | 'wrong' | 'occupied' | 'skipNote'>('idle');
  const [storageIssue, setStorageIssue] = useState<'savingFailed' | 'loadFailed' | null>(null);
  const [panel, setPanel] = useState<'settings' | 'how' | 'paused' | null>(null);
  const [draftSize, setDraftSize] = useState<Size>(3);
  const [celebrate, setCelebrate] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const wasComplete = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  const reducedMotion = useReducedMotion();
  const t = words[language];
  const cards = cardsFor(game.size, game.level, game.colors);
  const axes = LEVEL_AXES[game.level];
  const levelName = LEVEL_NAMES[language][game.level];
  const label = (feature: Feature, index: number) => {
    if (game.level <= 1 && feature === 'color') return (language === 'en'
      ? ['pink', 'blue', 'yellow', 'mint green', 'purple'] : ['ורוד', 'כחול', 'צהוב', 'ירוק מנטה', 'סגול'])[COLORS.indexOf(game.colors?.[index] ?? COLORS[index])];
    if (game.level === 1 && feature === 'shape') return CHARACTER_NAMES[language][game.characters?.[index] ?? index];
    return clueLabel(feature, index, language);
  };
  const rowLabel = (row: number) => axes.row ? label(axes.row, row) : '';
  const columnLabel = (column: number) => label(axes.column, column);
  const ruleText = language === 'en'
    ? axes.row ? 'Match the clue on the left and the clue above. Find where they meet.' : 'Match the color above. Any empty square beneath it fits.'
    : axes.row ? 'מתאימים לרמז משמאל ולרמז למעלה. מוצאים איפה הם נפגשים.' : 'מתאימים לצבע למעלה. כל משבצת ריקה מתחתיו מתאימה.';
  const left = remaining(game);
  const count = game.board.filter(Boolean).length;
  const complete = isComplete(game);
  const hintTarget = cards.find(c => c.id === hintCard);
  const cardName = (id: string) => {
    const c = cards.find(c => c.id === id)!;
    if (game.level === 0) return `${columnLabel(c.column)} · ${characterName(c, game.level, language, game.characters)}`;
    return [rowLabel(c.row), columnLabel(c.column)].filter(Boolean).join(' · ');
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const saved = raw ? parseProgress(raw) : null;
      if (saved) { setGame(saved.game); setLevelGames(saved.levels); setMode(saved.mode); setLanguage(saved.language); setDraftSize(saved.game.size); wasComplete.current = isComplete(saved.game); }
      else { setGame(createGame(3, Math.random, 0)); if (raw) setStorageIssue('loadFailed'); }
    } catch { setGame(createGame(3, Math.random, 0)); setStorageIssue('savingFailed'); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(packProgress({ game, mode, language }, levelGames))); }
    catch { setStorageIssue('savingFailed'); }
  }, [game, levelGames, mode, language, ready]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (panel || celebrate) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else dialog.current?.close();
  }, [panel, celebrate]);

  useEffect(() => {
    if (!ready) return;
    if (complete && !wasComplete.current) { setCelebrate(true); setSelected(null); setFocusCell(null); }
    wasComplete.current = complete;
  }, [complete, ready]);

  useEffect(() => {
    if (!selected || panel || celebrate) { setHeldPointer(null); return; }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const size = document.querySelector('[data-cell]')?.getBoundingClientRect().width ?? 80;
      setHeldPointer({ x: event.clientX, y: event.clientY, size });
    };
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null); setHeldPointer(null); setFocusCell(null);
        setHintLevel(0); setHintCard(null); setFeedback('idle');
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('keydown', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('keydown', cancel);
    };
  }, [selected, panel, celebrate]);

  const grabPointer = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!event.detail || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const size = document.querySelector('[data-cell]')?.getBoundingClientRect().width ?? 80;
    setHeldPointer({ x: event.clientX, y: event.clientY, size });
  };
  const clear = () => { setSelected(null); setHeldPointer(null); setFocusCell(null); setHintLevel(0); setHintCard(null); setFeedback('idle'); };
  const attempt = (id: string, cell: number) => {
    // Unlock sound inside the placement gesture, before the completion effect.
    try {
      if (!audio.current && typeof AudioContext !== 'undefined') audio.current = new AudioContext();
      void audio.current?.resume().catch(() => {});
    } catch { /* The puzzle still works when audio is unavailable. */ }
    const result = place(game, id, cell);
    setGame(result.state);
    if (result.outcome === 'correct') { clear(); setFeedback('correct'); }
    else if (result.outcome === 'incorrect') { setHintLevel(0); setFeedback('wrong'); }
    else if (result.outcome === 'occupied') setFeedback('occupied');
  };
  const chooseCard = (id: string) => {
    if (focusCell !== null) { attempt(id, focusCell); return; }
    if (selected === id) { clear(); return; }
    setSelected(id); setHintLevel(0); setHintCard(null); setFeedback('chosen');
  };
  const chooseCell = (cell: number) => {
    if (selected) {
      if (game.board[cell] === selected) { clear(); return; }
      attempt(selected, cell); return;
    }
    if (game.board[cell]) { chooseCard(game.board[cell]!); return; }
    if (focusCell === cell) { clear(); return; }
    setFocusCell(cell); setHintLevel(0); setHintCard(null); setFeedback('squareChosen');
  };
  const requestHint = () => {
    if (complete) return;
    const id = selected ?? (focusCell !== null ? left.find(id => isValidPlacement(game.size, id, focusCell, game.level)) : left[0]);
    if (!id) return;
    if (selected === null && focusCell === null) setSelected(id);
    setHintCard(id); setHintLevel(level => hintCard === id ? Math.min(level + 1, 3) : 1);
    setGame(g => ({ ...g, hintedCards: [...new Set([...g.hintedCards, id])], stats: { ...g.stats, hints: g.stats.hints + 1 } }));
  };
  const startFresh = (size: Size) => {
    const fresh = createGame(size, Math.random, game.level);
    setLevelGames(levels => ({ ...levels, [progressKey(game.level, game.size)]: game, [progressKey(game.level, size)]: fresh }));
    setGame(fresh); setDraftSize(size); clear(); setCelebrate(false); setPanel(null); wasComplete.current = false;
  };
  const goToLevel = (level: Level) => {
    const next = switchLevel(game, levelGames, level);
    const size = next.game.size;
    setLevelGames(next.levels); setGame(next.game); setDraftSize(size);
    clear(); setCelebrate(false); setPanel(null); wasComplete.current = isComplete(next.game);
  };
  const nextLevel = LEVELS[game.level + 1];
  const closePanel = () => { setPanel(null); setCelebrate(false); };
  const hintMessages = language === 'en'
    ? [axes.row ? `Look for the row: ${hintTarget ? rowLabel(hintTarget.row) : ''}.` : `Look for the color above: ${hintTarget ? columnLabel(hintTarget.column) : ''}.`, axes.row ? `Now find the column: ${hintTarget ? columnLabel(hintTarget.column) : ''}.` : 'Any empty square in that column fits.', axes.row ? 'Where do the two clues meet?' : 'Try a highlighted empty square.']
    : [axes.row ? `מחפשים את השורה: ${hintTarget ? rowLabel(hintTarget.row) : ''}.` : `מחפשים את הצבע למעלה: ${hintTarget ? columnLabel(hintTarget.column) : ''}.`, axes.row ? `עכשיו מחפשים את העמודה: ${hintTarget ? columnLabel(hintTarget.column) : ''}.` : 'כל משבצת ריקה בעמודה מתאימה.', axes.row ? 'איפה שני הרמזים נפגשים?' : 'אפשר לנסות משבצת ריקה מוארת.'];
  const announcement = hintLevel ? hintMessages[hintLevel - 1] : complete ? t.complete : ['chosen', 'squareChosen', 'wrong'].includes(feedback) ? ruleText : t[feedback];

  return <main className={`app-shell${game.level <= 1 ? ' glitter-theme' : ''}`} onClick={event => {
    if (selected && !(event.target as Element).closest('button, a, dialog')) clear();
  }} dir={language === 'he' ? 'rtl' : 'ltr'}>
    {selected && heldPointer && !panel && !celebrate && <div
      className="held-card"
      aria-hidden="true"
      style={{ position: 'fixed', left: heldPointer.x, top: heldPointer.y,
        width: heldPointer.size, height: heldPointer.size, transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', zIndex: 1000, display: 'grid', placeItems: 'center',
        background: 'var(--paper, #fffefa)', borderRadius: 16,
        boxShadow: '0 8px 24px #0002', padding: 8, boxSizing: 'border-box' }}
    ><CardSymbol card={cards.find(card => card.id === selected)!} level={game.level} characters={game.characters}/></div>}
    <header className="site-header flex items-center justify-between">
      <a className="brand" href="/" aria-label={t.brand}>
        <span className="brand-mark" aria-hidden="true"><i/><i/><i/><i/></span>
        <span>{t.brand}<span className="brand-period">.</span></span>
      </a>
      <div className="header-actions">
        <button className="icon-button help-button" aria-label={t.how} onClick={() => setPanel('how')}><Icon name="help"/></button>
        <button className="parent-button" onClick={() => { setDraftSize(game.size); setPanel('settings'); }}><Icon name="settings"/><span>{t.parent}</span></button>
      </div>
    </header>

    <section className="intro flex items-end justify-between">
      <div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}<br/><em>{t.titleEnd}</em></h1><p className="intro-copy">{t.intro}</p></div>
      <div className="intro-flower" aria-hidden="true"><svg viewBox="0 0 120 120"><g fill="currentColor"><ellipse cx="60" cy="31" rx="16" ry="27"/><ellipse cx="60" cy="89" rx="16" ry="27"/><ellipse cx="31" cy="60" rx="27" ry="16"/><ellipse cx="89" cy="60" rx="27" ry="16"/><ellipse cx="39" cy="39" rx="16" ry="26" transform="rotate(-45 39 39)"/><ellipse cx="81" cy="81" rx="16" ry="26" transform="rotate(-45 81 81)"/><ellipse cx="81" cy="39" rx="16" ry="26" transform="rotate(45 81 39)"/><ellipse cx="39" cy="81" rx="16" ry="26" transform="rotate(45 39 81)"/></g><circle cx="60" cy="60" r="19" fill="#f6f4ed"/><path d="M51 58h1m16 0h1m-15 9q6 6 12 0" fill="none" stroke="#2d5649" strokeWidth="3" strokeLinecap="round"/></svg></div>
    </section>

    {storageIssue && <p className="storage-notice" role="status">{t[storageIssue]}</p>}

    <nav className="level-navigation" aria-label={t.levels}>
      <div className="level-controls">
        <button className="icon-button level-previous" aria-label={t.previousLevel} disabled={!ready || game.level === 0} onClick={() => goToLevel((game.level - 1) as Level)}><Icon name="arrow"/></button>
        <div className="level-tabs">
          {LEVELS.map(level => {
            const levelGame = level === game.level ? game : levelGames[progressKey(level, game.size)];
            const finished = levelGame && isComplete(levelGame);
            return <button key={level} aria-current={level === game.level ? 'step' : undefined} aria-label={`${t.level} ${level} · ${LEVEL_NAMES[language][level]}${finished ? ` · ${t.complete}` : ''}`} disabled={!ready} onClick={() => goToLevel(level)}>
              <span className="level-number">{finished ? <Icon name="check" size={14}/> : level}</span><span>{LEVEL_NAMES[language][level]}</span>
            </button>;
          })}
        </div>
        <button className="icon-button level-next" aria-label={t.nextLevel} disabled={!ready || nextLevel === undefined} onClick={() => nextLevel !== undefined && goToLevel(nextLevel)}><Icon name="arrow"/></button>
      </div>
      <div className="level-summary">
        <p>{t.level} {game.level} · {levelName}. {t.levelProgress}</p>
        {game.level <= 1 && <button className="refresh-characters" disabled={!ready} onClick={() => {
          setGame(g => refreshCharacters(g)); clear();
        }}><Icon name="refresh" size={18}/>{t.refreshCharacters}</button>}
      </div>
    </nav>

    <section className="play-space" data-size={game.size} aria-label={levelName} aria-busy={!ready}>
      <div className="board-panel">
        <div className="panel-heading"><div><p className="section-kicker">{levelName}</p><h2>{t.board}</h2></div><span className="puzzle-size" dir="ltr">{game.size} × {game.size}</span></div>
        <div className={`board ${game.level === 0 ? 'single-clue' : ''}`} role="group" aria-label={t.board} dir="ltr" style={{ '--size': game.size } as CSSProperties}>
          {axes.row && <div className="corner-mark" aria-hidden="true"><span>↘</span></div>}
          {Array.from({ length: game.size }, (_, column) => <div className={`column-header ${hintTarget && (game.level === 0 || hintLevel >= 2) && hintTarget.column === column ? 'hint-header' : ''}`} key={column} aria-label={columnLabel(column)}><Clue feature={axes.column} index={column} characters={game.level === 1} characterSelection={game.characters} colors={game.colors}/></div>)}
          {Array.from({ length: game.size }, (_, row) => <div className="board-row" key={row}>
            {axes.row && <div className={`row-header ${hintTarget && hintTarget.row === row ? 'hint-header' : ''}`} aria-label={rowLabel(row)}><Clue feature={axes.row} index={row} characters={game.level === 1} characterSelection={game.characters} colors={game.colors}/></div>}
            {Array.from({ length: game.size }, (_, column) => {
              const cell = row * game.size + column;
              const id = game.board[cell];
              const card = id ? cards.find(c => c.id === id) : null;
              const hinted = hintTarget && hintLevel >= 3 && (game.level === 0 ? !id : hintTarget.row === row) && hintTarget.column === column;
              return <button key={cell} data-cell={cell} className={`board-cell ${id ? 'filled' : ''} ${selected && id === selected ? 'selected' : ''} ${focusCell === cell ? 'focused' : ''} ${hinted ? 'hint-cell' : ''}`}
                aria-label={`${[rowLabel(row), columnLabel(column)].filter(Boolean).join(' · ')} · ${row + 1}, ${column + 1}${id ? ` · ${t.complete}` : ''}`}
                aria-pressed={focusCell === cell || (id !== null && selected === id)} disabled={!ready}
                onClick={event => { if (!selected && id) grabPointer(event); chooseCell(cell); }}>
                {card ? <motion.span className="placed-symbol" style={{ visibility: selected === id && heldPointer ? 'hidden' : 'visible' }} initial={reducedMotion ? false : { scale: .65, opacity: .4 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .2 }} key={id}><CardSymbol card={card} level={game.level} characters={game.characters}/></motion.span> : <span className="cell-dot" aria-hidden="true"/>}
              </button>;
            })}
          </div>)}
        </div>
        <div className="board-bottom">
          <div className="progress" role="progressbar" aria-label={t.board} aria-valuenow={count} aria-valuemin={0} aria-valuemax={game.size ** 2}>
            {Array.from({ length: game.size ** 2 }, (_, i) => <i key={i} className={i < count ? 'done' : ''}/>)}
          </div>
          <span className="progress-count" dir="ltr">{count}<span> / {game.size ** 2}</span></span>
        </div>
      </div>

      <aside className="collection-panel">
        <div className="collection-heading"><div><p className="section-kicker">{left.length === 0 ? t.complete : `${left.length} ${left.length === 1 ? t.cardLeft : t.cardsLeft}`}</p><h2>{t.tray}</h2></div><span className="little-spark" aria-hidden="true">✳</span></div>
        <div className="layout-toggle" role="group" aria-label={`${t.scatter} / ${t.stack}`}>
          <button aria-pressed={mode === 'scatter'} onClick={() => { setMode('scatter'); clear(); }}><Icon name="spread"/>{t.scatter}</button>
          <button aria-pressed={mode === 'stack'} onClick={() => { setMode('stack'); clear(); }}><Icon name="stack"/>{t.stack}</button>
        </div>

        <div className={`card-area ${mode === 'stack' ? 'stack-area' : 'scatter-area'} ${complete ? 'empty-area' : ''}`}>
          {complete ? <div className="tray-complete"><span className="complete-leaf"><Icon name="leaf" size={46}/></span><p>{t.complete}</p><button className="text-button" onClick={() => startFresh(game.size)}>{t.again}<Icon name="arrow" size={18}/></button></div> : <>
            {mode === 'stack' && <><div className="stack-shadow second"/><div className="stack-shadow first"/></>}
            <AnimatePresence initial={false}>
              {(mode === 'stack' ? left.slice(0, 1) : left).map(id => {
                const card = cards.find(c => c.id === id)!;
                return <motion.button key={id} layout={!reducedMotion} className={`play-card ${selected === id ? 'selected' : ''}`} data-card={id}
                  style={{ '--tilt': `${((card.row * 3 + card.column * 2) % 5) - 2}deg` } as CSSProperties}
                  aria-label={cardName(id)} aria-pressed={selected === id} disabled={!ready}
                  initial={false} animate={{ opacity: selected === id && heldPointer ? .15 : 1, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: .8 }}
                  transition={{ duration: .18 }} onClick={event => { if (focusCell === null && selected !== id) grabPointer(event); chooseCard(id); }}><CardSymbol card={card} level={game.level} characters={game.characters}/><span className="card-grain" aria-hidden="true"/></motion.button>;
              })}
            </AnimatePresence>
          </>}
        </div>

        <div className="collection-controls">
          <button className="quiet-button" onClick={() => { setGame(g => shuffleRemaining(g)); clear(); }} disabled={left.length < 2 || !ready}><Icon name="shuffle" size={18}/>{t.shuffle}</button>
          {mode === 'stack' && <button className="quiet-button" onClick={() => { setGame(g => skipTop(g)); clear(); setFeedback('skipNote'); }} disabled={left.length < 2 || !ready}>{t.skip}<Icon name="arrow" size={18}/></button>}
          {mode === 'scatter' && <span className="collection-decoration" aria-hidden="true">· · ·</span>}
        </div>
      </aside>
    </section>

    <section className={`guidance ${feedback === 'wrong' ? 'try-again' : ''}`} aria-label={t.hint}>
      <div className="guidance-copy"><span className="guidance-icon" aria-hidden="true"><Icon name={complete || feedback === 'correct' ? 'check' : hintLevel ? 'bulb' : 'leaf'} size={24}/></span><p role="status" aria-live="polite" aria-atomic="true">{announcement}</p></div>
      <div className="game-actions">
        {selected && game.board.includes(selected) && <button className="quiet-button" onClick={() => { setGame(g => returnCard(g, selected)); clear(); }}><Icon name="return"/>{t.back}</button>}
        {(selected || focusCell !== null) && <button className="icon-button cancel-button" aria-label={t.cancel} onClick={clear}><Icon name="close" size={18}/></button>}
        <button className="undo-button" onClick={() => { setGame(g => undo(g)); clear(); }} disabled={!game.history.length || !ready}><Icon name="undo"/><span>{t.undo}</span></button>
        <button className="hint-button" onClick={requestHint} disabled={complete || !ready}><Icon name="bulb"/><span>{hintLevel ? t.more : t.hint}</span></button>
      </div>
    </section>

    <footer className="site-footer"><span><i className="saved-dot"/>{storageIssue ? t.welcome : t.saved}</span><span className="footer-thought">{t.footer}</span><button className="quiet-button" onClick={() => setPanel('paused')}><Icon name="pause" size={15}/>{t.pause}</button></footer>

    <dialog ref={dialog} className={`modal ${celebrate ? 'celebration' : ''}`} onCancel={closePanel} onClose={closePanel} dir={language === 'he' ? 'rtl' : 'ltr'}>
      <button className="icon-button modal-close" aria-label={t.done} onClick={closePanel}><Icon name="close"/></button>
      {celebrate && <HeartCelebration audio={audio.current} language={language}/>}
      {celebrate ? <><span className="finish-spark" aria-hidden="true">✳</span><p className="eyebrow">{t.complete}</p><h2>{t.finished}</h2><p>{levelName} · {t.complete}</p>{nextLevel !== undefined && <button className="primary-button" onClick={() => goToLevel(nextLevel)}>{t.nextLevel}<Icon name="arrow"/></button>}<button className="primary-button" onClick={() => startFresh(game.size)}>{t.again}<Icon name="arrow"/></button><button className="text-button" onClick={closePanel}>{t.explore}</button></> : panel === 'settings' ? <>
        <p className="eyebrow">{t.parent}</p><h2>{t.settingsTitle}</h2><p className="modal-description">{t.settingsBody}</p>
        <fieldset><legend>{t.puzzle}</legend><div className="size-options">{([2, 3, 4] as const).map(size => <button key={size} aria-pressed={draftSize === size} onClick={() => setDraftSize(size)}><strong dir="ltr">{size} × {size}</strong><span>{t[`size${size}`]}</span></button>)}</div></fieldset>
        <fieldset><legend>{t.language}</legend><div className="language-options"><button aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button><button aria-pressed={language === 'he'} onClick={() => setLanguage('he')}>עברית</button></div></fieldset>
        <div className="session-summary"><h3>{t.session}</h3><dl><div><dt>{t.independent}</dt><dd>{count - game.assisted.length}</dd></div><div><dt>{t.supported}</dt><dd>{game.assisted.length}</dd></div><div><dt>{t.hints}</dt><dd>{game.stats.hints}</dd></div><div><dt>{t.retries}</dt><dd>{game.stats.mistakes}</dd></div></dl><p>{t.note}</p></div>
        <p className="reset-note">{t.resetNote}</p><button className="primary-button" onClick={() => startFresh(draftSize)}>{t.newPuzzle}<Icon name="arrow"/></button><button className="text-button" onClick={closePanel}>{t.done}</button>
      </> : panel === 'how' ? <><p className="eyebrow">{t.how}</p><h2>{levelName}</h2><div className="how-example" aria-hidden="true">{axes.row && <><Clue feature={axes.row} index={0} characters={game.level === 1} characterSelection={game.characters} colors={game.colors}/><span>+</span></>}<Clue feature={axes.column} index={0} characters={game.level === 1} characterSelection={game.characters} colors={game.colors}/><span>=</span><CardSymbol card={cards[0]} level={game.level} characters={game.characters}/></div><p>{ruleText}</p><p>{t.howExtra}</p><button className="primary-button" onClick={closePanel}>{t.done}<Icon name="arrow"/></button></> : <><span className="finish-spark" aria-hidden="true"><Icon name="pause" size={40}/></span><h2>{t.pauseTitle}</h2><p>{t.pauseBody}</p><button className="primary-button" onClick={closePanel}>{t.resume}<Icon name="arrow"/></button></>}
    </dialog>
  </main>;
}
