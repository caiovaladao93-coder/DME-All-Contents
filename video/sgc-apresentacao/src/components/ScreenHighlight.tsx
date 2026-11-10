import React from 'react';
import {C} from '../theme/colors';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';

/** Borda laranja que destaca uma área da interface (sem alterar o conteúdo). */
export const ScreenHighlight: React.FC<{f: number; start: number; out?: number; x: number; y: number; w: number; h: number; r?: number; pad?: number}> =
  ({f, start, out, x, y, w, h, r = 14, pad = 8}) => {
    const p = prog(f, start, 15, EASE_OUT);
    const q = out != null ? prog(f, out, 12, EASE_IN) : 0;
    if (p <= 0 || q >= 1) return null;
    const s = 1.04 - 0.04 * p;
    return <div style={{position: 'absolute', left: x - pad, top: y - pad, width: w + 2 * pad, height: h + 2 * pad, borderRadius: r + pad,
      border: `3px solid ${C.orange}`, boxShadow: '0 0 0 6px rgba(248,106,20,.14)', opacity: p * (1 - q), transform: `scale(${s})`}} />;
  };

/** Passagem de luz (brilho que atravessa um botão). */
export const LightSweep: React.FC<{f: number; start: number; dur?: number; r?: number}> = ({f, start, dur = 20, r = 12}) => {
  const p = prog(f, start, dur, (t) => t);
  if (p <= 0 || p >= 1) return null;
  return <div style={{position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: -20, bottom: -20, width: 90, left: `${-20 + p * 140}%`, transform: 'skewX(-20deg)',
      background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))'}} /></div>;
};
