import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENT_TEXT, C} from '../theme/colors';
import {EASE_IN, EASE_OUT, ENTER, EXIT, STAGGER, prog} from '../theme/motion';
import {TITLE_STYLE} from '../theme/typography';

/* Sintaxe de texto: "|" quebra linha; [palavra] recebe destaque; {palavra} recebe escala maior. */
type Word = {t: string; acc: boolean; big: boolean};
export const parse = (spec: string): Word[][] => {
  let acc = false;
  let big = false;
  return spec.split('|').map((line) =>
    line
      .split(' ')
      .filter(Boolean)
      .map((raw) => {
        let t = raw;
        if (t.startsWith('[')) {acc = true; t = t.slice(1);}
        if (t.startsWith('{')) {big = true; t = t.slice(1);}
        const endAcc = t.includes(']');
        const endBig = t.includes('}');
        t = t.replace(']', '').replace('}', '');
        const w = {t, acc, big};
        if (endAcc) acc = false;
        if (endBig) big = false;
        return w;
      }),
  );
};

const exitAmount = (f: number, exit?: number, dur = EXIT) => (exit == null ? 0 : prog(f, exit, dur, EASE_IN));

/** RevealText — bloco inteiro: opacidade + deslocamento vertical (+ blur opcional). */
export const RevealText: React.FC<{
  children: React.ReactNode; start: number; dur?: number; dy?: number; dx?: number; blur?: number;
  exit?: number; style?: React.CSSProperties;
}> = ({children, start, dur = ENTER, dy = 25, dx = 0, blur = 0, exit, style}) => {
  const f = useCurrentFrame();
  const e = prog(f, start, dur);
  const q = exitAmount(f, exit);
  return (
    <div style={{
      position: 'absolute', ...style, opacity: e * (1 - q),
      transform: `translate(${((1 - e) * dx).toFixed(2)}px, ${((1 - e) * dy - q * 18).toFixed(2)}px)`,
      filter: blur * (1 - e) + q * 6 > 0.05 ? `blur(${(blur * (1 - e) + q * 6).toFixed(2)}px)` : undefined,
    }}>{children}</div>
  );
};

/** StaggeredWords / WordSequence — revelação palavra a palavra. */
export const StaggeredWords: React.FC<{
  text: string; start: number; stagger?: number; dur?: number; dy?: number; blur?: number; exit?: number;
  style?: React.CSSProperties; size?: number; bigScale?: number; align?: 'left' | 'center';
  accentStyle?: React.CSSProperties;
}> = ({text, start, stagger = STAGGER, dur = ENTER, dy = 30, blur = 6, exit, style, size = 88, bigScale = 1.3, align = 'center', accentStyle = ACCENT_TEXT}) => {
  const f = useCurrentFrame();
  const lines = parse(text);
  const q = exitAmount(f, exit);
  let i = 0;
  return (
    <div style={{position: 'absolute', left: 90, width: 900, textAlign: align, ...TITLE_STYLE, fontSize: size, ...style}}>
      {lines.map((line, li) => (
        <div key={li} style={{whiteSpace: 'nowrap'}}>
          {line.map((w, wi) => {
            const e = prog(f, start + (i++) * stagger, dur);
            const b = blur * (1 - e) + q * 6;
            return (
              <span key={wi} style={{
                display: 'inline-block', marginRight: '0.24em', fontSize: w.big ? `${bigScale}em` : undefined,
                opacity: e * (1 - q), transform: `translateY(${((1 - e) * dy - q * 18).toFixed(2)}px)`,
                filter: b > 0.05 ? `blur(${b.toFixed(2)}px)` : undefined,
                ...(w.acc ? accentStyle : {}),
              }}>{w.t}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
export const WordSequence = StaggeredWords;

/** MaskedHeadline — cada linha é descoberta por uma máscara (horizontal ou vertical) com borda de luz. */
export const MaskedHeadline: React.FC<{
  text: string; start: number; dur?: number; lineStagger?: number; direction?: 'x' | 'y'; exit?: number;
  size?: number; style?: React.CSSProperties; bigScale?: number; lightEdge?: boolean;
}> = ({text, start, dur = 20, lineStagger = 6, direction = 'x', exit, size = 88, style, bigScale = 1.3, lightEdge = true}) => {
  const f = useCurrentFrame();
  const lines = parse(text);
  const q = exitAmount(f, exit);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, textAlign: 'center', ...TITLE_STYLE, fontSize: size, ...style, opacity: 1 - q,
      filter: q > 0.01 ? `blur(${(q * 6).toFixed(2)}px)` : undefined, transform: `translateY(${(-q * 18).toFixed(2)}px)`}}>
      {lines.map((line, li) => {
        const p = prog(f, start + li * lineStagger, dur);
        const big = line.some((w) => w.big);
        const clip = direction === 'x' ? `inset(-20% ${(100 - p * 100).toFixed(2)}% -20% 0)` : `inset(${(100 - p * 100).toFixed(2)}% 0 -20% 0)`;
        return (
          <div key={li} style={{display: 'block', whiteSpace: 'nowrap', fontSize: big ? `${bigScale}em` : undefined}}>
            <div style={{position: 'relative', display: 'inline-block'}}>
              <div style={{clipPath: clip, transform: direction === 'y' ? `translateY(${((1 - p) * 20).toFixed(2)}px)` : undefined}}>
                {line.map((w, wi) => (
                  <span key={wi} style={{marginRight: wi < line.length - 1 ? '0.24em' : 0, ...(w.acc ? ACCENT_TEXT : {})}}>{w.t}</span>
                ))}
              </div>
              {lightEdge && direction === 'x' && p > 0.01 && p < 0.99 ? (
                <div style={{position: 'absolute', top: '6%', bottom: '6%', left: `${(p * 100).toFixed(2)}%`, width: 3,
                  background: 'linear-gradient(180deg,rgba(255,255,255,0),#FFFFFF 50%,rgba(255,255,255,0))',
                  boxShadow: '0 0 18px 4px rgba(120,160,205,.35)', opacity: Math.sin(p * Math.PI)}} />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** UnderlineReveal — linha que cresce da esquerda para a direita. */
export const UnderlineReveal: React.FC<{start: number; dur?: number; x: number; y: number; width: number; thickness?: number;
  color?: string; exit?: number; extendTo?: {start: number; dur: number}}> = ({start, dur = 18, x, y, width, thickness = 3, color = C.accent, exit, extendTo}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, dur);
  const q = exitAmount(f, exit);
  const ext = extendTo ? prog(f, extendTo.start, extendTo.dur) : 0;
  const left = x * (1 - ext);
  const w = (width * p) * (1 - ext) + 1080 * ext;
  return <div style={{position: 'absolute', left, top: y, width: w, height: thickness, background: color, opacity: 1 - q, borderRadius: 2}} />;
};
