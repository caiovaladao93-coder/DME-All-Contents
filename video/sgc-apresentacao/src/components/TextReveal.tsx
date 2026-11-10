import React from 'react';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';

/** MaskedText: o texto sobe de dentro de uma máscara (revelação vertical). 12 a 18 quadros. */
export const MaskedText: React.FC<{f: number; start: number; dur?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> =
  ({f, start, dur = 16, out, children, style}) => {
    const p = prog(f, start, dur, EASE_OUT);
    const q = out != null ? prog(f, out, 12, EASE_IN) : 0;
    return (
      <div style={{overflow: 'hidden', paddingBottom: '0.08em', ...style}}>
        <div style={{transform: `translateY(${((1 - p) * 125 - q * 40).toFixed(2)}%)`, opacity: Math.min(1, p * 5) * (1 - q)}}>{children}</div>
      </div>
    );
  };

/** TextReveal: fade com leve subida e desfoque, para textos de apoio. */
export const TextReveal: React.FC<{f: number; start: number; dur?: number; dy?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> =
  ({f, start, dur = 15, dy = 20, out, children, style}) => {
    const p = prog(f, start, dur, EASE_OUT);
    const q = out != null ? prog(f, out, 12, EASE_IN) : 0;
    return <div style={{opacity: p * (1 - q), transform: `translateY(${((1 - p) * dy - q * 12).toFixed(2)}px)`, filter: `blur(${((1 - p) * 6).toFixed(2)}px)`, ...style}}>{children}</div>;
  };
