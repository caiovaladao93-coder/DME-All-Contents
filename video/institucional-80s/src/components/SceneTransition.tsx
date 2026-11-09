import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EASE_IO, prog} from '../theme/motion';

/** Máscara vertical: um retângulo grafite desliza lateralmente (mesma duração e curva em todas as trocas). */
export const WIPE_DUR = 16;
export const GraphiteWipe: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at - WIPE_DUR / 2, WIPE_DUR, EASE_IO);
  if (p <= 0 || p >= 1) return null;
  const x = 1080 - p * 2300; // entra pela direita, cobre, sai pela esquerda
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 0, left: x, width: 1220, height: 1920,
        background: 'linear-gradient(90deg,#15181B,#20252B 40%,#1A1D20)', boxShadow: '0 0 80px rgba(0,0,0,.7)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 3, height: 1920, background: 'linear-gradient(180deg,rgba(160,190,225,0),rgba(160,190,225,.7),rgba(160,190,225,0))'}} />
      </div>
    </AbsoluteFill>
  );
};

/** Revela a cena a partir de uma linha horizontal (continuação da passagem de luz). */
export const lineReveal = (f: number, start: number, dur: number, y: number) => {
  const p = prog(f, start, dur, EASE_IO);
  const top = (y / 1920) * 100 * (1 - p);
  const bottom = ((1920 - y) / 1920) * 100 * (1 - p);
  return p >= 1 ? undefined : `inset(${top.toFixed(2)}% 0 ${bottom.toFixed(2)}% 0)`;
};
