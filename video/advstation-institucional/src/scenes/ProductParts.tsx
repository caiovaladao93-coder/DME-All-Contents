import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';
import {SANS, SERIF} from '../theme/typography';

/** Manchete sobre telas (manual): painel marinho com borda esquerda dourada, rótulo 22 px / 0,26em, manchete serif 50 px / 1,08. */
export const ScreenHeadline: React.FC<{label: string; text: string; x: number; y: number; w: number; start: number; exit?: number}> = ({label, text, x, y, w, start, exit}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 18, EASE_OUT);
  const q = exit == null ? 0 : prog(f, exit, 10, EASE_IN);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, padding: '22px 30px 24px', background: 'rgba(22,40,74,.94)', borderLeft: `5px solid ${C.gold}`,
      borderRadius: '0 12px 12px 0', boxShadow: '0 24px 60px rgba(0,0,0,.45)', opacity: p * (1 - q), transform: `translateY(${((1 - p) * 24).toFixed(1)}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '.26em', color: C.gold}}>{label}</div>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1.08, color: C.white, marginTop: 10, textTransform: 'uppercase'}}>{text}</div>
    </div>
  );
};

/** Coluna de identificação do produto (rótulo, nome, subtítulo). */
export const ProductTitle: React.FC<{n: string; name: React.ReactNode; sub: string; x: number; y: number; w: number; start: number; align?: 'left' | 'right'}> = ({n, name, sub, x, y, w, start, align = 'left'}) => {
  const f = useCurrentFrame();
  const a = prog(f, start, 16), b = prog(f, start + 8, 18), c = prog(f, start + 18, 16);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: align}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', opacity: a}}>
        <span style={{width: 40 * a, height: 2, background: C.gold}} />
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '.26em', color: C.gold}}>{n}</span>
      </div>
      <div style={{marginTop: 18, fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1.06, color: C.white, textTransform: 'uppercase',
        clipPath: `inset(-10% ${(100 - b * 100).toFixed(1)}% -10% 0)`, transform: `translateY(${((1 - b) * 20).toFixed(1)}px)`}}>{name}</div>
      <div style={{marginTop: 18, fontFamily: SANS, fontWeight: 600, fontSize: 28, lineHeight: 1.35, color: '#C9D2E0', opacity: c,
        transform: `translateY(${((1 - c) * 14).toFixed(1)}px)`}}>{sub}</div>
    </div>
  );
};

/** Linha do tempo CONCEITUAL do fluxo (identificada como ilustração, não como ação automática do sistema). */
export const FlowTimeline: React.FC<{x: number; y: number; start: number; steps: Array<{t: string; sub?: string}>; exit?: number}> = ({x, y, start, steps, exit}) => {
  const f = useCurrentFrame();
  const q = exit == null ? 0 : prog(f, exit, 10, EASE_IN);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: 1 - q}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 16, letterSpacing: '.2em', color: '#8FA0BC', opacity: prog(f, start, 12), marginBottom: 18}}>ILUSTRAÇÃO DO FLUXO</div>
      {steps.map((s, i) => {
        const p = prog(f, start + 6 + i * 14, 16);
        const l = prog(f, start + 14 + i * 14, 14);
        return (
          <div key={i} style={{position: 'relative', height: i < steps.length - 1 ? 96 : 70, opacity: p, transform: `translateX(${((1 - p) * -20).toFixed(1)}px)`}}>
            <span style={{position: 'absolute', left: 0, top: 4, width: 22, height: 22, borderRadius: 11, border: `3px solid ${C.gold}`, background: i === steps.length - 1 ? C.gold : C.navy}} />
            {i < steps.length - 1 ? <span style={{position: 'absolute', left: 10, top: 30, width: 2, height: 62 * l, background: C.gold}} /> : null}
            <div style={{marginLeft: 44, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '.16em', color: C.white}}>{s.t}</div>
            {s.sub ? <div style={{marginLeft: 44, marginTop: 6, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.gold}}>{s.sub}</div> : null}
          </div>
        );
      })}
    </div>
  );
};
