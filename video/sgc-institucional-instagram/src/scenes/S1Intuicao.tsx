import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {Plate} from '../components/Plates';
import {Scrim} from '../components/NavyStage';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {SCENES} from '../data/storyboard';

/** CENA 01 · Intuição não basta. Plano médio fechado (~35°, 50 mm simulada), aproximação 100% → 106%. */
export const S1Intuicao: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.s1.dur;
  const born = prog(f, 26, 16, EASE_OUT); // a linha nasce sob o título
  const cross = prog(f, D - 18, 18, EASE_IO); // e atravessa o quadro (transição)
  const w = lerp(240 * born, 1080, cross), x = lerp(90, 0, cross), y = lerp(866, 960, cross);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CinematicImage f={f} dur={D + 16} s0={1} s1={1.06} x0={0} x1={-24} origin="60% 55%" style={{opacity: prog(f, 0, 8, (t) => t)}}>
        <Plate k="office" />
      </CinematicImage>
      <Scrim top={0.7} bottom={0.5} />
      <div style={{position: 'absolute', left: 90, top: 340, opacity: 1 - prog(f, D - 14, 12)}}>
        <AnimatedHeadline f={f} start={8} stagger={4} text="INTUIÇÃO|NÃO|[BASTA.]" size={156} lineHeight={1.0} />
      </div>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: 3, background: C.orange, boxShadow: cross > 0 ? '0 0 18px rgba(248,106,20,.45)' : undefined}} />
    </div>
  );
};
