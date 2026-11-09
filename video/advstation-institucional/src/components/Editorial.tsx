import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';
import {SANS, SERIF} from '../theme/typography';

/* Sintaxe: "|" quebra linha; [palavra] = destaque dourado. */
const parse = (line: string) => {
  let acc = false;
  return line.split(' ').filter(Boolean).map((raw) => {
    let t = raw;
    if (t.startsWith('[')) {acc = true; t = t.slice(1);}
    const end = t.includes(']');
    t = t.replace(']', '');
    const w = {t, acc};
    if (end) acc = false;
    return w;
  });
};

/**
 * EditorialHeadline — títulos serifados por máscara elegante (12–20 frames, 15–30 px, opacidade 0→1).
 * modes[i] = 'fade' | 'mask' por linha. Sem bounce, sem rotação.
 */
export const EditorialHeadline: React.FC<{
  text: string; start: number; x: number; y: number; width: number; size?: number; align?: 'left' | 'center' | 'right';
  modes?: Array<'fade' | 'mask'>; lineStagger?: number; exit?: number; color?: string; weight?: number; lineScale?: number[]; uppercase?: boolean;
}> = ({text, start, x, y, width, size = 88, align = 'left', modes, lineStagger = 10, exit, color = C.white, weight = 700, lineScale, uppercase = true}) => {
  const f = useCurrentFrame();
  const q = exit == null ? 0 : prog(f, exit, 12, EASE_IN);
  const lines = text.split('|');
  return (
    <div style={{position: 'absolute', left: x, top: y, width, textAlign: align, fontFamily: SERIF, fontWeight: weight, fontSize: size, lineHeight: 1.04,
      color, textTransform: uppercase ? 'uppercase' : 'none', letterSpacing: '0.005em', opacity: 1 - q, transform: `translateY(${(-q * 14).toFixed(1)}px)`,
      filter: q > 0.01 ? `blur(${(q * 5).toFixed(1)}px)` : undefined}}>
      {lines.map((line, i) => {
        const s = start + i * lineStagger;
        const p = prog(f, s, 18, EASE_OUT);
        const mode = modes?.[i] ?? 'mask';
        const clip = mode === 'mask' ? `inset(-10% ${(100 - p * 100).toFixed(2)}% -10% 0)` : undefined;
        return (
          <div key={i} style={{fontSize: lineScale?.[i] ? `${lineScale[i]}em` : undefined, whiteSpace: 'nowrap'}}>
            <span style={{display: 'inline-block', clipPath: clip, opacity: mode === 'fade' ? p : Math.min(1, p * 1.6),
              transform: `translateY(${((1 - p) * 22).toFixed(1)}px)`}}>
              {parse(line).map((w, j, arr) => (
                <span key={j} style={{color: w.acc ? C.gold : undefined}}>{w.t}{j < arr.length - 1 ? ' ' : ''}</span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Rótulo dourado (manual: 22 px, tracking 0,26em). */
export const GoldLabel: React.FC<{text: string; start: number; x: number; y: number; exit?: number; align?: 'left' | 'center'; width?: number}> = ({text, start, x, y, exit, align = 'left', width}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 16);
  const q = exit == null ? 0 : prog(f, exit, 10, EASE_IN);
  return (
    <div style={{position: 'absolute', left: x, top: y, width, textAlign: align, display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', alignItems: 'center', gap: 16,
      opacity: p * (1 - q), transform: `translateY(${((1 - p) * 14).toFixed(1)}px)`}}>
      <span style={{width: 46 * p, height: 2, background: C.gold}} />
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '.26em', color: C.gold, textTransform: 'uppercase'}}>{text}</span>
    </div>
  );
};

/** GoldAccentLine — linha dourada fina desenhada da esquerda; ponto opcional percorrendo. */
export const GoldAccentLine: React.FC<{x: number; y: number; w: number; start: number; dur?: number; dotAt?: number; exit?: number}> = ({x, y, w, start, dur = 20, dotAt, exit}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, dur);
  const q = exit == null ? 0 : prog(f, exit, 10, EASE_IN);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 2, opacity: 1 - q}}>
      <div style={{width: `${p * 100}%`, height: 2, background: C.gold}} />
      {dotAt != null ? <div style={{position: 'absolute', top: -5, left: dotAt * w - 6, width: 12, height: 12, borderRadius: 6, background: C.gold, boxShadow: '0 0 0 4px rgba(194,155,60,.25)'}} /> : null}
    </div>
  );
};

/** FeatureLabel — etiqueta (cartão) de informação. */
export const FeatureLabel: React.FC<{text: string; x: number; y: number; opacity?: number; style?: React.CSSProperties; dark?: boolean}> = ({text, x, y, opacity = 1, style, dark}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '16px 26px', borderRadius: 14, opacity,
    background: dark ? 'rgba(22,40,74,.9)' : 'rgba(255,255,255,.94)', border: dark ? '1px solid rgba(194,155,60,.6)' : '1px solid rgba(22,40,74,.12)',
    boxShadow: '0 18px 40px rgba(0,0,0,.35)', whiteSpace: 'nowrap', ...style}}>
    <span style={{width: 10, height: 10, borderRadius: 5, background: C.gold}} />
    <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '.16em', color: dark ? C.white : C.navy}}>{text}</span>
  </div>
);
