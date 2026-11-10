import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {Plate} from '../components/Plates';
import {NavyStage, Scrim} from '../components/NavyStage';
import {BrandSignature} from '../components/BrandSignature';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {OrangeAccentLine} from '../components/OrangeAccentLine';
import {SCENES} from '../data/storyboard';

/** CENA 02 · Quem é a SGC. Logo oficial (máscara horizontal + opacidade), ~30 quadros visível, depois a reunião. */
export const S2QuemSomos: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.s2.dur;
  const conv = prog(f, 0, 12, EASE_IO); // a linha da cena anterior converge para o centro
  const reveal = prog(f, 8, 22, EASE_OUT);
  const shrink = prog(f, 62, 26, EASE_IO);
  const photo = prog(f, 66, 24, EASE_IO);
  const H = lerp(640, 300, shrink);
  const top = lerp(520, 300, shrink);
  const out = prog(f, 150, 24, EASE_IN); // a marca cede lugar à reunião
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <NavyStage f={f} glowY={980} />
      <div style={{position: 'absolute', inset: 0, opacity: photo}}>
        <CinematicImage f={f - 66} dur={D - 50} s0={1.08} s1={1.08} x0={40} x1={-40}><Plate k="meeting" /></CinematicImage>
        <Scrim top={0.75} bottom={0.85} />
      </div>
      {conv < 1 ? <div style={{position: 'absolute', top: 959, left: lerp(0, 540, conv), width: lerp(1080, 0, conv), height: 3, background: C.orange}} /> : null}
      <div style={{position: 'absolute', left: 540 - H * 532 / 700 / 2, top, width: H * 532 / 700, height: H, opacity: reveal * (1 - out),
        clipPath: `inset(0 ${(50 - 50 * reveal).toFixed(2)}% 0 ${(50 - 50 * reveal).toFixed(2)}%)`}}>
        <BrandSignature height={H} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240}}>
        <AnimatedHeadline f={f} start={88} text="GESTÃO|[COM MÉTODO.]" size={104} align="center" />
        <OrangeAccentLine f={f} start={104} dur={18} width={300} x={540} y={240} align="center" />
      </div>
    </div>
  );
};
