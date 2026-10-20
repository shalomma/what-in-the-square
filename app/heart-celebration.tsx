'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function HeartCharacter({ color = '#ec7898' }: { color?: string }) {
  return <svg className="shape" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 82C39 73 12 55 12 33C12 12 39 8 50 29C61 8 88 12 88 33C88 55 61 73 50 82Z" fill={color} stroke="#fff9" strokeWidth="2"/>
    <path d="M23 28q4-9 13-7" fill="none" stroke="#fff9" strokeWidth="4" strokeLinecap="round"/>
    <g fill="#343044"><ellipse cx="36" cy="44" rx="3" ry="4"/><ellipse cx="64" cy="44" rx="3" ry="4"/></g>
    <g fill="#fff8"><ellipse cx="28" cy="54" rx="6" ry="3"/><ellipse cx="72" cy="54" rx="6" ry="3"/></g>
    <path d="M43 57q7 8 14 0M17 59l-8 5m74-5 8 5" fill="none" stroke="#343044" strokeWidth="2.5" strokeLinecap="round"/>
    <g fill="#fff"><path d="m23 36 1-4 1 4 4 1-4 1-1 4-1-4-4-1ZM73 24l1-4 1 4 4 1-4 1-1 4-1-4-4-1Z"/></g>
  </svg>;
}

const palette = ['#ef759b', '#a78bda', '#edb844', '#77bca7', '#72aee0'];
const melody = [72,76,79,76,74,77,81,77,76,79,84,83,81,79,76,79,72];

export function HeartCelebration({ audio, language }: { audio: AudioContext | null; language: 'en' | 'he' }) {
  const reduced = useReducedMotion();
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (!audio || muted) return;
    const bus = audio.createGain();
    bus.gain.value = .12;
    bus.connect(audio.destination);
    const oscillators: OscillatorNode[] = [];
    const start = audio.currentTime + .05;
    const note = (midi: number, at: number, length: number, volume: number) => {
      const oscillator = audio.createOscillator();
      const envelope = audio.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(volume, at + .015);
      envelope.gain.exponentialRampToValueAtTime(.001, at + length);
      oscillator.connect(envelope); envelope.connect(bus);
      oscillator.start(at); oscillator.stop(at + length + .02);
      oscillators.push(oscillator);
    };
    melody.forEach((pitch, i) => note(pitch, start + i * .24, i === melody.length - 1 ? .9 : .21, .6));
    [48,53,55,48].forEach((bass, beat) => {
      [bass, bass + 7, bass + 12].forEach(pitch => note(pitch, start + beat * .96, .8, .18));
    });
    return () => { oscillators.forEach(node => { try { node.stop(); } catch {} node.disconnect(); }); bus.disconnect(); };
  }, [audio, muted]);
  return <>
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {Array.from({ length: reduced ? 5 : 16 }, (_, i) => <motion.div key={i}
        style={{ position: 'absolute', left: `${4 + (i * 29) % 88}%`, width: 58 + i % 3 * 12, top: reduced ? `${12 + i * 16}%` : -150 }}
        initial={reduced ? { opacity: 0 } : { y: 0 }}
        animate={reduced ? { opacity: 1 } : { y: '120vh' }}
        transition={reduced ? { duration: .4 } : { duration: 5 + i % 4 * .6, delay: i * .19, ease: 'linear' }}>
        <motion.div animate={reduced ? {} : { rotate: [-9, 9, -9], x: [-10, 10, -10] }} transition={{ duration: 2.4 + i % 3 * .3, repeat: 4 }}>
          <svg viewBox="0 0 100 142" width="100%">
            <path d="M8 43C8-9 92-9 92 43Q78 33 64 43Q50 33 36 43Q22 33 8 43Z" fill={palette[(i+1)%5]} stroke="#fff" strokeWidth="2"/>
            <path d="M36 43Q35 12 50 5Q65 12 64 43M8 43l31 49m-3-49 9 49m19-49-9 49m37-49L61 92" stroke="#fff" strokeWidth="1.7" fill="none"/>
            <svg x="15" y="72" width="70" height="70" viewBox="0 0 100 100"><HeartCharacter color={palette[i%5]}/></svg>
          </svg>
        </motion.div>
      </motion.div>)}
    </div>
    <button className="quiet-button" style={{ position: 'relative', zIndex: 1 }} onClick={() => setMuted(value => !value)} aria-pressed={muted}>
      {language === 'he' ? muted ? 'מפעילים מוזיקה' : 'משתיקים מוזיקה' : muted ? 'Music on' : 'Mute music'}
    </button>
  </>;
}
