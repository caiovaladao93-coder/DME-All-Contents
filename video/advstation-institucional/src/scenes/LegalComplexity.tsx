import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CinematicImage} from '../components/CinematicImage';
import {EditorialHeadline, FeatureLabel} from '../components/Editorial';
import {PHOTOS} from '../data/assets';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';

type Card = {t: string; at: number; from: [number, number]; a: [number, number]; b: [number, number]};
// a = posição durante a tomada; b = posições "desconectadas" (sem sobreposição) na 3ª tomada
const CARDS: Card[] = [
  {t: 'CLIENTES', at: 12, from: [-420, 0], a: [170, 250], b: [150, 170]},
  {t: 'DOCUMENTOS', at: 12, from: [420, 0], a: [1280, 560], b: [1370, 250]},
  {t: 'ETAPAS', at: 100, from: [0, -60], a: [1250, 240], b: [260, 560]},
  {t: 'PRAZOS', at: 108, from: [0, 60], a: [300, 640], b: [1330, 640]},
  {t: 'TAREFAS', at: 116, from: [0, 60], a: [790, 420], b: [800, 770]},
];

/** Máscara lateral (≈15 frames) revelando a tomada seguinte. */
const lateral = (f: number, at: number) => {
  const p = prog(f, at, 15, EASE_IO);
  return p >= 1 ? undefined : `inset(0 0 0 ${(100 - p * 100).toFixed(2)}%)`;
};

/** CENA 02 — A complexidade operacional. */
export const LegalComplexity: React.FC = () => {
  const f = useCurrentFrame();
  const scatter = prog(f, 180, 24, EASE_IO);
  const dark = prog(f, 246, 16);
  const conv = prog(f, 276, 24, EASE_IN);
  return (
    <AbsoluteFill style={{background: C.navyDeep, clipPath: lateral(f, 0)}}>
      <CinematicImage src={PHOTOS.s02a.src} desc={PHOTOS.s02a.desc} dur={110} cam={{s0: 1, s1: 1.06}} />
      {f >= 88 ? <AbsoluteFill style={{clipPath: lateral(f, 90)}}><CinematicImage src={PHOTOS.s02b.src} desc={PHOTOS.s02b.desc} dur={110} cam={{s0: 1.07, s1: 1.01}} /></AbsoluteFill> : null}
      {f >= 178 ? <AbsoluteFill style={{clipPath: lateral(f, 180)}}><CinematicImage src={PHOTOS.s02c.src} desc={PHOTOS.s02c.desc} dur={130} cam={{s0: 1, s1: 1.07, x0: 20, x1: -20}} /></AbsoluteFill> : null}
      <AbsoluteFill style={{background: `rgba(14,27,51,${(0.25 + dark * 0.62).toFixed(3)})`}} />
      {CARDS.map((c, i) => {
        const e = prog(f, c.at, 20, EASE_OUT);
        const x = lerp(c.a[0], c.b[0], scatter), y = lerp(c.a[1], c.b[1], scatter);
        // convergência: trajetórias curvas para o centro (960, 470)
        const cx = lerp(x, 960 - 120, conv) + Math.sin(conv * Math.PI) * (i % 2 ? 140 : -140);
        const cy = lerp(y, 470, conv);
        return <FeatureLabel key={c.t} text={c.t} x={cx + (1 - e) * c.from[0]} y={cy + (1 - e) * c.from[1]}
          opacity={e * lerp(1, 0.35, dark) * (1 - prog(f, 288, 12))} style={{transform: `scale(${lerp(1, 0.4, conv)})`}} />;
      })}
      <EditorialHeadline text="Quando tudo fica disperso,|a gestão perde [clareza]." start={252} x={150} y={380} width={1620} size={78} align="center" lineStagger={10} />
    </AbsoluteFill>
  );
};
