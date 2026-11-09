import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {Selo, Vinheta} from '../components/Brand';
import {AnimatedStationLine, Seg} from '../components/StationMap';
import {C} from '../theme/colors';
import {wordAt} from '../data/narration';
import {EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {SANS, SERIF} from '../theme/typography';

// Linha superior (Maternidade Legal) entra pela esquerda; inferior (Previdenciário Geral) pela direita.
const UP: Seg[] = [[[-40, 400], [400, 400], [700, 540], [960, 540]]];
const DOWN: Seg[] = [[[1960, 680], [1520, 680], [1220, 540], [960, 540]]];
export const VINHETA_T0 = 64; // frame local em que a vinheta original começa

/**
 * CENA 09 — Assinatura institucional e CTA.
 * As duas linhas convergem para a estação central (ponto dourado; a logo NÃO é montada a partir delas).
 * O ponto abre o fundo creme e a VINHETA ORIGINAL roda com título, selos dos dois produtos e CTA.
 */
export const BrandSignature: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 0, 40, EASE_IO);
  const dot = prog(f, 38, 14, EASE_OUT);
  const iris = prog(f, 52, 22, EASE_IO);
  const cta = prog(f, Math.max(VINHETA_T0 + 150, wordAt('signature', 'conheça') - 6), 18);
  return (
    <AbsoluteFill>
      <NavyBackground />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <AnimatedStationLine segs={UP} draw={draw} />
        <AnimatedStationLine segs={DOWN} draw={draw} />
        <circle cx={960} cy={540} r={12 * dot} fill={C.gold} />
        <circle cx={960} cy={540} r={26 * dot} fill="none" stroke="rgba(194,155,60,.4)" strokeWidth={2} />
      </svg>
      {f >= 52 ? (
        <AbsoluteFill style={{clipPath: iris < 1 ? `circle(${(iris * 1150).toFixed(1)}px at 960px 540px)` : undefined}}>
          <Vinheta t0={VINHETA_T0}
            titulo="Duas soluções especializadas."
            subtitulo="Uma mesma visão de gestão."
            selos={<><Selo produto="maternidade" nome="Maternidade Legal" /><Selo produto="previdenciario" nome="Previdenciário Geral" /></>}
            extra={
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', opacity: cta, transform: `translateY(${((1 - cta) * 16).toFixed(1)}px)`}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '.26em', color: C.vNavy}}>CONHEÇA NOSSAS SOLUÇÕES</div>
                <div style={{marginTop: 8, fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: C.gold}}>advstation.io</div>
              </div>
            } />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
