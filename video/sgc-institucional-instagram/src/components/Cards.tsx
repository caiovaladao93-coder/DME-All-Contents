import React from 'react';
import {C} from '../theme/colors';
import {HEAD} from '../theme/typography';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';

/** Cartão minimalista grafite-azulado translúcido, com linha laranja inferior desenhada (SVG). */
export const PillarCard: React.FC<{f: number; start: number; out?: number; cx: number; cy: number; w: number; h?: number; label: string; size?: number;
  outline?: number; mask?: 'down' | 'fade'; style?: React.CSSProperties}> =
  ({f, start, out, cx, cy, w, h = 116, label, size = 34, outline = 0, mask = 'fade', style}) => {
    const p = prog(f, start, 16, EASE_OUT);
    const q = out != null ? prog(f, out, 12, EASE_IN) : 0;
    const line = prog(f, start + 6, 16, EASE_OUT);
    if (p <= 0 || q >= 1) return null;
    const clip = mask === 'down' ? `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0 round 18px)` : undefined;
    return (
      <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2 + (mask === 'fade' ? (1 - p) * 20 : 0), width: w, height: h, opacity: (mask === 'fade' ? p : 1) * (1 - q), clipPath: clip, ...style}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: 'linear-gradient(160deg, rgba(28,40,66,.86), rgba(14,24,44,.86))',
          border: `${outline > 0 ? 2.5 : 1.5}px solid ${outline > 0 ? `rgba(248,106,20,${0.3 + 0.7 * outline})` : 'rgba(190,205,235,.22)'}`,
          boxShadow: '0 24px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07)', backdropFilter: 'blur(8px)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: size,
          letterSpacing: '.08em', paddingLeft: '.08em', color: '#fff', whiteSpace: 'nowrap'}}>{label}</div>
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={w * .18} y1={h - 18} x2={w * .82} y2={h - 18} pathLength={1} stroke={C.orange} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - line} />
        </svg>
      </div>
    );
  };

/** Linha fina de conexão desenhada (path SVG com pathLength=1). */
export const Connector: React.FC<{d: string; v: number; color?: string; width?: number; dash?: boolean; opacity?: number}> = ({d, v, color = C.orange, width = 2.5, opacity = 1}) =>
  v <= 0 ? null : <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - v} opacity={opacity} />;

/** Ponto luminoso que percorre um caminho vertical (sem neon: núcleo laranja com halo curto). */
export const Spark: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => o <= 0 ? null : (
  <div style={{position: 'absolute', left: x - 9, top: y - 9, width: 18, height: 18, borderRadius: '50%', opacity: o,
    background: 'radial-gradient(circle at 40% 40%, #FFE2CC, #F86A14 60%, #B34A0A)', boxShadow: '0 0 14px rgba(248,106,20,.55)'}} />
);
