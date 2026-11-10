import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HEAD} from '../theme/typography';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {Plate} from '../components/Plates';
import {Scrim} from '../components/NavyStage';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

/** CENA 06 · Nossa filosofia: plano aberto diante da janela, travelling lateral; escurece até o fundo institucional. */
export const S6Filosofia: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.s6.dur;
  const tExige = wordAt('s6', 'exige', 1);
  const out1 = tExige - 12;
  const h = prog(f, tExige - 4, 14, EASE_OUT); // revelação horizontal de 14 quadros
  const dark = prog(f, D - 26, 26, EASE_IO);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: prog(f, 0, 14)}}>
      <CinematicImage f={f} dur={D + 16} s0={1.12} s1={1.12} x0={60} x1={-60}><Plate k="window" /></CinematicImage>
      <Scrim top={0.6} bottom={0.75} />
      <div style={{position: 'absolute', inset: 0, background: '#0A2048', opacity: dark * 0.96}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640}}>
        <AnimatedHeadline f={f} start={4} out={out1} text="CRESCER EXIGE|MAIS DO QUE|ESFORÇO." size={92} align="center" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 132, lineHeight: 1.02, letterSpacing: '-.02em',
        color: '#fff', clipPath: `inset(0 ${((1 - h) * 100).toFixed(2)}% 0 0)`, opacity: h > 0 ? 1 : 0}}>
        EXIGE<br /><span style={{color: C.orange}}>MÉTODO.</span>
      </div>
    </div>
  );
};
