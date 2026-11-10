import React from 'react';
import {EASE_IO, lerp, prog} from '../theme/animation';

/**
 * Plano "fotográfico" gerado em código (não há fotos neste filme): aplica dolly-in (escala + translação),
 * parallax por camada e desfoque atmosférico. depth 0 = fundo (move menos), 1 = primeiro plano.
 */
export const CinematicImage: React.FC<{f: number; dur: number; s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number;
  origin?: string; children: React.ReactNode; style?: React.CSSProperties}> =
  ({f, dur, s0 = 1, s1 = 1.06, x0 = 0, x1 = 0, y0 = 0, y1 = 0, origin = '50% 50%', children, style}) => {
    const p = prog(f, 0, dur, EASE_IO);
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: origin,
          transform: `translate(${lerp(x0, x1, p).toFixed(2)}px, ${lerp(y0, y1, p).toFixed(2)}px) scale(${lerp(s0, s1, p).toFixed(4)})`}}>{children}</div>
      </div>
    );
  };

/** Camada com parallax: desloca proporcionalmente à profundidade. */
export const Layer: React.FC<{f: number; dur: number; depth: number; dx?: number; dy?: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties}> =
  ({f, dur, depth, dx = -30, dy = 0, blur = 0, children, style}) => {
    const p = prog(f, 0, dur, EASE_IO);
    return <div style={{position: 'absolute', inset: 0, transform: `translate(${(dx * depth * p).toFixed(2)}px, ${(dy * depth * p).toFixed(2)}px)`,
      filter: blur ? `blur(${blur}px)` : undefined, ...style}}>{children}</div>;
  };
