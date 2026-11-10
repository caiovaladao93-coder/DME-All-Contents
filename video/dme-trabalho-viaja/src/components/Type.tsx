import React from 'react';
import {Img, staticFile} from 'remotion';
import TL from '../data/timeline.json';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IN, EASE_OUT, P} from '../theme/motion';

/** Título de destaque (Space Grotesk 76 px; reduzido porque a legenda está presente): revelação por máscara, ~16 quadros. */
export const Headline: React.FC<{t: number; tin: number; tout: number; text: string; accent?: string; top?: number; size?: number}> = ({t, tin, tout, text, accent, top = 250, size = 76}) => {
  const p = P(t, tin, .55), q = P(t, tout, .3, EASE_IN);
  if (p <= 0 || q >= 1) return null;
  const parts = accent ? text.split(accent) : [text];
  return (
    <div style={{position: 'absolute', left: 100, right: 100, top, textAlign: 'center', overflow: 'hidden', paddingBottom: 12}}>
      <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: size, lineHeight: 1.05, letterSpacing: '-.025em', color: C.ink,
        transform: `translateY(${((1 - p) * 110 - q * 40).toFixed(1)}%)`, opacity: Math.min(1, p * 4) * (1 - q), filter: (1 - p) * 8 > .2 ? `blur(${((1 - p) * 8).toFixed(1)}px)` : undefined}}>
        {accent ? <>{parts[0]}<span style={{color: C.accent}}>{accent}</span>{parts[1]}</> : text}
      </div>
    </div>
  );
};

/** Legenda sincronizada à locução: 1–2 linhas por bloco, quebra por unidade de sentido (Manrope 46 px). */
export const Captions: React.FC<{t: number; hideFrom: number}> = ({t, hideFrom}) => {
  const c = (TL.captions as any[]).find((x) => t >= x.start - .05 && t < x.end + .05 && x.start < hideFrom);
  if (!c) return null;
  const e = P(t, c.start - .05, .18), q = P(t, c.end - .05, .12, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 100, right: 100, top: 1370, display: 'flex', justifyContent: 'center', opacity: e * (1 - q)}}>
      <div style={{maxWidth: 880, padding: '14px 26px', borderRadius: 18, background: 'rgba(10,11,12,.72)', border: '1px solid rgba(192,198,204,.12)',
        fontFamily: UI, fontWeight: 600, fontSize: 46, lineHeight: 1.22, color: C.ink, textAlign: 'center'}}>{c.text}</div>
    </div>
  );
};

/** Logo oficial (video/brand/dme-logo.svg) sem redesenho: revelação por máscara horizontal. */
export const Logo: React.FC<{t: number; tin: number; width: number; top: number}> = ({t, tin, width, top}) => {
  const p = P(t, tin, .8);
  return (
    <div style={{position: 'absolute', left: 540 - width / 2, top, width, height: width * 610 / 750, clipPath: `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`, opacity: Math.min(1, p * 3)}}>
      <Img src={staticFile('assets/logo/dme-logo.svg')} style={{width: '100%', height: '100%'}} />
    </div>
  );
};
export const _ease = EASE_OUT;
