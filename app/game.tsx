'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { COLORS, SHAPES, SAVE_KEY, cardsFor, createGame, isComplete, parseSaved, place, remaining, returnCard, shuffleRemaining, skipTop, undo, type Color, type GameState, type Language, type Mode, type Shape, type Size } from '@/lib/game';

const words = {
  en: {
    brand: 'what in the square', parent: 'For grown-ups', eyebrow: 'A LITTLE ROOM TO THINK',
    title: 'Every card has', titleEnd: 'a little home.', intro: 'Match a color. Find a shape. Make it your own.',
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
    newPuzzle: 'Start a fresh puzzle', resetNote: 'Starting fresh replaces the current puzzle on this device.',
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
    brand: 'מה במשבצת', parent: 'להורים', eyebrow: 'קצת מקום למחשבה',
    title: 'לכל כרטיס יש', titleEnd: 'מקום משלו.', intro: 'מוצאים צבע. מזהים צורה. משחקים בדרך שלך.',
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
    newPuzzle: 'מתחילים משחק חדש', resetNote: 'משחק חדש יחליף את הלוח הנוכחי במכשיר הזה.',
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
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.help}</svg>;
}

function Symbol({ shape, color, header = false }: { shape: Shape; color?: Color; header?: boolean }) {
  const props = { fill: color ? `var(--${color})` : 'none', stroke: header ? 'currentColor' : 'none', strokeWidth: 3.5, strokeLinejoin: 'round' as const };
  return <svg className={header ? 'shape shape-header' : 'shape'} viewBox="0 0 80 80" aria-hidden="true">
    {shape === 'circle' && <circle cx="40" cy="40" r="27" {...props}/>}
    {shape === 'triangle' && <path d="M40 10 71 66H9Z" {...props}/>}
    {shape === 'square' && <rect x="15" y="15" width="50" height="50" rx="8" {...props}/>}
    {shape === 'diamond' && <path d="M40 7 73 40 40 73 7 40Z" {...props}/>}
    {!header && <ellipse cx="28" cy="26" rx="4" ry="6" fill="white" opacity=".2" transform="rotate(35 28 26)"/>}
  </svg>;
}

export default function Game() {
  // Start with deterministic markup so browser storage never changes server rendering.
  const [game, setGame] = useState<GameState>(() => createGame(3, () => 0.5));
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('scatter');
  const [language, setLanguage] = useState<Language>('en');
  const [selected, setSelected] = useState<string | null>(null);
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
  const reducedMotion = useReducedMotion();
  const t = words[language];
  const cards = cardsFor(game.size);
  const left = remaining(game);
  const count = game.board.filter(Boolean).length;
  const complete = isComplete(game);
  const hintTarget = cards.find(c => c.id === hintCard);
  const cardName = (id: string) => {
    const c = cards.find(c => c.id === id)!;
    return `${t.colorNames[c.color]} · ${t.shapeNames[c.shape]}`;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const saved = raw ? parseSaved(raw) : null;
      if (saved) { setGame(saved.game); setMode(saved.mode); setLanguage(saved.language); setDraftSize(saved.game.size); wasComplete.current = isComplete(saved.game); }
      else { setGame(createGame()); if (raw) setStorageIssue('loadFailed'); }
    } catch { setGame(createGame()); setStorageIssue('savingFailed'); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ game, mode, language })); }
    catch { setStorageIssue('savingFailed'); }
  }, [game, mode, language, ready]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (panel || celebrate) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else dialog.current?.close();
  }, [panel, celebrate]);

  useEffect(() => {
    if (complete && !wasComplete.current) { setCelebrate(true); setSelected(null); setFocusCell(null); }
    wasComplete.current = complete;
  }, [complete]);

  const clear = () => { setSelected(null); setFocusCell(null); setHintLevel(0); setHintCard(null); setFeedback('idle'); };
  const attempt = (id: string, cell: number) => {
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
    const id = selected ?? (focusCell !== null ? `${Math.floor(focusCell / game.size)}-${focusCell % game.size}` : left[0]);
    if (!id) return;
    if (selected === null && focusCell === null) setSelected(id);
    setHintCard(id); setHintLevel(level => hintCard === id ? Math.min(level + 1, 3) : 1);
    setGame(g => ({ ...g, hintedCards: [...new Set([...g.hintedCards, id])], stats: { ...g.stats, hints: g.stats.hints + 1 } }));
  };
  const startFresh = (size: Size) => {
    setGame(createGame(size)); setDraftSize(size); clear(); setCelebrate(false); setPanel(null); wasComplete.current = false;
  };
  const closePanel = () => { setPanel(null); setCelebrate(false); };
  const announcement = hintLevel ? [t.hintColor, t.hintShape, t.hintMeet][hintLevel - 1] : complete ? t.complete : t[feedback];

  return <main className="app-shell" dir={language === 'he' ? 'rtl' : 'ltr'}>
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

    <section className="play-space" data-size={game.size} aria-label={t.starter} aria-busy={!ready}>
      <div className="board-panel">
        <div className="panel-heading"><div><p className="section-kicker">{t.starter}</p><h2>{t.board}</h2></div><span className="puzzle-size" dir="ltr">{game.size} × {game.size}</span></div>
        <div className="board" role="group" aria-label={t.board} dir="ltr" style={{ '--size': game.size } as CSSProperties}>
          <div className="corner-mark" aria-hidden="true"><span>↘</span></div>
          {SHAPES.slice(0, game.size).map((shape, column) => <div className={`column-header ${hintTarget && hintLevel >= 2 && hintTarget.column === column ? 'hint-header' : ''}`} key={shape} aria-label={t.shapeNames[shape]}><Symbol shape={shape} header/></div>)}
          {COLORS.slice(0, game.size).map((color, row) => <div className="board-row" key={color}>
            <div className={`row-header ${hintTarget && hintTarget.row === row ? 'hint-header' : ''}`} aria-label={t.colorNames[color]}><span className="color-dot" style={{ background: `var(--${color})` }}/></div>
            {SHAPES.slice(0, game.size).map((_, column) => {
              const cell = row * game.size + column;
              const id = game.board[cell];
              const card = id ? cards.find(c => c.id === id) : null;
              const hinted = hintTarget && hintLevel >= 3 && hintTarget.row === row && hintTarget.column === column;
              return <button key={cell} data-cell={cell} className={`board-cell ${id ? 'filled' : ''} ${selected && id === selected ? 'selected' : ''} ${focusCell === cell ? 'focused' : ''} ${hinted ? 'hint-cell' : ''}`}
                aria-label={`${t.colorNames[color]} · ${t.shapeNames[SHAPES[column]]}${id ? ` · ${t.complete}` : ''}`}
                aria-pressed={focusCell === cell || (id !== null && selected === id)} disabled={!ready}
                onClick={() => chooseCell(cell)}>
                {card ? <motion.span className="placed-symbol" initial={reducedMotion ? false : { scale: .65, opacity: .4 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .2 }} key={id}><Symbol shape={card.shape} color={card.color}/></motion.span> : <span className="cell-dot" aria-hidden="true"/>}
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
                  initial={false} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: .8 }}
                  transition={{ duration: .18 }} onClick={() => chooseCard(id)}><Symbol color={card.color} shape={card.shape}/><span className="card-grain" aria-hidden="true"/></motion.button>;
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
      {celebrate ? <><span className="finish-spark" aria-hidden="true">✳</span><p className="eyebrow">{t.complete}</p><h2>{t.finished}</h2><p>{t.finishBody}</p><button className="primary-button" onClick={() => startFresh(game.size)}>{t.again}<Icon name="arrow"/></button><button className="text-button" onClick={closePanel}>{t.explore}</button></> : panel === 'settings' ? <>
        <p className="eyebrow">{t.parent}</p><h2>{t.settingsTitle}</h2><p className="modal-description">{t.settingsBody}</p>
        <fieldset><legend>{t.puzzle}</legend><div className="size-options">{([2, 3, 4] as const).map(size => <button key={size} aria-pressed={draftSize === size} onClick={() => setDraftSize(size)}><strong dir="ltr">{size} × {size}</strong><span>{t[`size${size}`]}</span></button>)}</div></fieldset>
        <fieldset><legend>{t.language}</legend><div className="language-options"><button aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button><button aria-pressed={language === 'he'} onClick={() => setLanguage('he')}>עברית</button></div></fieldset>
        <div className="session-summary"><h3>{t.session}</h3><dl><div><dt>{t.independent}</dt><dd>{count - game.assisted.length}</dd></div><div><dt>{t.supported}</dt><dd>{game.assisted.length}</dd></div><div><dt>{t.hints}</dt><dd>{game.stats.hints}</dd></div><div><dt>{t.retries}</dt><dd>{game.stats.mistakes}</dd></div></dl><p>{t.note}</p></div>
        <p className="reset-note">{t.resetNote}</p><button className="primary-button" onClick={() => startFresh(draftSize)}>{t.newPuzzle}<Icon name="arrow"/></button><button className="text-button" onClick={closePanel}>{t.done}</button>
      </> : panel === 'how' ? <><p className="eyebrow">{t.how}</p><h2>{t.howTitle}</h2><div className="how-example" aria-hidden="true"><span className="color-dot" style={{ background: 'var(--coral)' }}/><span>+</span><Symbol shape="triangle" header/><span>=</span><Symbol shape="triangle" color="coral"/></div><p>{t.howBody}</p><p>{t.howExtra}</p><button className="primary-button" onClick={closePanel}>{t.done}<Icon name="arrow"/></button></> : <><span className="finish-spark" aria-hidden="true"><Icon name="pause" size={40}/></span><h2>{t.pauseTitle}</h2><p>{t.pauseBody}</p><button className="primary-button" onClick={closePanel}>{t.resume}<Icon name="arrow"/></button></>}
    </dialog>
  </main>;
}
