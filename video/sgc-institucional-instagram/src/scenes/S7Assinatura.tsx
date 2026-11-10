import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD} from '../theme/typography';
import {EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {NavyStage} from '../components/NavyStage';
import {BrandSignature} from '../components/BrandSignature';
import {wordAt} from '../data/narration';

/** CENA 07 · Assinatura: linha laranja atravessa, logo oficial por máscara horizontal, duas frases e quadro estável. */
export const S7Assinatura: React.FC = () => {
  const f = useCurrentFrame();
  const line = prog(f, 0, 16, EASE_IO);
  const reveal = prog(f, 10, 26, EASE_OUT);
  const a = prog(f, wordAt('s7', 'clareza') - 4, 16, EASE_OUT), b = prog(f, wordAt('s7', 'direção') - 4, 16, EASE_OUT);
  const H = 600, W = H * 532 / 700;
  const t: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 52, letterSpacing: '.1em', paddingLeft: '.1em', color: '#fff'};
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <NavyStage f={f} glowY={1500} glow={0.8} />
      {line < 1 ? <div style={{position: 'absolute', top: 1000, left: 0, width: 1080 * line, height: 3, background: C.orange}} /> : null}
      <div style={{position: 'absolute', left: 540 - W / 2, top: 390, width: W, height: H, opacity: reveal, clipPath: `inset(0 ${(50 - 50 * reveal).toFixed(2)}% 0 ${(50 - 50 * reveal).toFixed(2)}%)`}}>
        <BrandSignature height={H} /></div>
      <div style={{...t, top: 1120, opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>CLAREZA PARA DECIDIR.</div>
      <div style={{position: 'absolute', left: 540 - 160 * a, top: 1206, width: 320 * a, height: 3, background: C.orange}} />
      <div style={{...t, top: 1244, opacity: b, transform: `translateY(${(1 - b) * 16}px)`}}>DIREÇÃO PARA <span style={{color: C.orange}}>CRESCER.</span></div>
    </div>
  );
};
