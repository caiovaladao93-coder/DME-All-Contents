import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline, GoldLabel} from '../components/Editorial';
import {ProductScreenshot} from '../components/ProductScreenshot';
import {SCREENS} from '../data/assets';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/animation';

const W = 780, H = 470, Y = 330;
const L = {x: 960 - 30 - W, y: Y, w: W, h: H};
const R = {x: 960 + 30, y: Y, w: W, h: H};

/**
 * CENA 06 — Duas soluções, uma mesma visão (ProductComparison).
 * Colunas simétricas com o Dashboard Executivo REAL de cada produto (capturas diferentes).
 */
export const TwoProducts: React.FC = () => {
  const f = useCurrentFrame();
  const a = prog(f, 0, 60, EASE_IO);
  const b = prog(f, 60, 60, EASE_IO);
  const div = prog(f, 10, 40, EASE_IO);
  const cam = lerp(1.03, 0.97, prog(f, 200, 100, EASE_IO));
  const recede = prog(f, 282, 18, EASE_IN);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      <AbsoluteFill style={{transform: `scale(${cam * lerp(1, 0.94, recede)})`, opacity: lerp(1, 0.55, recede)}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={960} y1={Y - 40} x2={960} y2={Y - 40 + (H + 80) * div} stroke={C.gold} strokeWidth={2} />
        </svg>
        <div style={{position: 'absolute', inset: 0, opacity: a, transform: `translateX(${((1 - a) * -260).toFixed(1)}px)`}}>
          <ProductScreenshot screen={SCREENS.mlDashboard} product="Maternidade Legal" {...L} focus={[{at: 150, dur: 120, s: 1.12, cx: 1000, cy: 330}]} />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: b, transform: `translateX(${((1 - b) * 260).toFixed(1)}px)`}}>
          <ProductScreenshot screen={SCREENS.pgDashboard} product="Previdenciário Geral" {...R} focus={[{at: 150, dur: 120, s: 1.12, cx: 1000, cy: 330}]} />
        </div>
        <GoldLabel text="Maternidade Legal" start={130} x={L.x} y={Y - 52} width={W} />
        <GoldLabel text="Previdenciário Geral" start={138} x={R.x} y={Y - 52} width={W} />
      </AbsoluteFill>
      <EditorialHeadline text="Duas soluções.|Uma mesma visão de gestão." start={204} x={150} y={96} width={1620} size={62} align="center" lineStagger={10} />
    </AbsoluteFill>
  );
};
