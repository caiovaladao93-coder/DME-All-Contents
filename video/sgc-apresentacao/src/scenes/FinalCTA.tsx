import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD} from '../theme/typography';
import {EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {BrandSignature} from '../components/BrandSignature';
import {OrangeAccentLine} from '../components/OrangeAccentLine';
import {NavyStage} from './BrandIntroduction';

export const FinalCTA: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = prog(f, 4, 26, EASE_IO);
  const sig = prog(f, 30, 16, EASE_OUT);
  const cta = prog(f, 58, 16, EASE_OUT);
  const H = 400, W = H * 532 / 700;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: prog(f, 0, 14)}}>
      <NavyStage f={f} glowX={960} glowY={980} />
      <div style={{position: 'absolute', left: 960 - W / 2, top: 110, width: W, height: H, opacity: reveal,
        clipPath: `inset(0 ${(50 - 50 * reveal).toFixed(2)}% 0 ${(50 - 50 * reveal).toFixed(2)}%)`}}>
        <BrandSignature height={H} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 588, textAlign: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 50, letterSpacing: '.16em', paddingLeft: '.16em',
        color: '#fff', opacity: sig, transform: `translateY(${(1 - sig) * 15}px)`}}>GESTÃO COM CLAREZA.</div>
      <OrangeAccentLine f={f} start={40} dur={20} width={360} x={960} y={668} align="center" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 724, display: 'flex', justifyContent: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 15}px)`}}>
        <div style={{padding: '24px 48px', borderRadius: 999, background: C.orange, fontFamily: HEAD, fontWeight: 800, fontSize: 40, letterSpacing: '.02em', color: C.navy,
          boxShadow: '0 20px 50px rgba(0,0,0,.35)'}}>DESCUBRA A SAÚDE DA SUA EMPRESA.</div>
      </div>
    </div>
  );
};
