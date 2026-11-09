import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MaskedHeadline, RevealText, StaggeredWords} from '../components/AnimatedText';
import {CinematicImage} from '../components/CinematicImage';
import {OfficeNight} from '../components/Illustrations';
import {LightSweep} from '../components/LightSweep';
import {ASSETS} from '../data/assets';
import {SCENES} from '../data/scenes';
import {prog} from '../theme/motion';
import {TITLE_STYLE} from '../theme/typography';

export const HOOK_LINE_Y = 962; // linha de luz que atravessa "MELHOR" e abre a cena 02

export const Scene01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const dur = SCENES.s01Hook.dur;
  const fadeIn = 1 - prog(f, 0, 8);
  const darken = prog(f, 116, 14) * 0.32;
  return (
    <AbsoluteFill>
      <CinematicImage src={ASSETS.images.s01 ?? undefined} dur={dur} cam={{s0: 1, s1: 1.06, x0: 0, x1: -30}}>
        <OfficeNight />
      </CinematicImage>
      <AbsoluteFill style={{background: `rgba(6,7,8,${((ASSETS.images.s01 ? 0.08 : 0.25) + darken).toFixed(3)})`}} />
      {/* área de leitura: escurece o centro sem apagar a luz do monitor */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 16% at 50% 50%, rgba(6,7,8,.72), rgba(6,7,8,0) 100%)'}} />

      {/* 00:00–00:02 */}
      <RevealText start={8} dur={15} dy={25} exit={52} style={{left: 90, width: 900, top: 900, textAlign: 'center', ...TITLE_STYLE, fontSize: 88}}>
        SUA EMPRESA
      </RevealText>

      {/* 00:02–00:04 — máscara horizontal com borda de luz */}
      <MaskedHeadline text="NÃO PRECISA|{TRABALHAR}|{MAIS.}" start={60} dur={18} lineStagger={7} exit={110} size={84} bigScale={1.36} style={{top: 760}} />

      {/* 00:04–00:06 — revelação por palavras (4 frames) */}
      <StaggeredWords text="PRECISA OPERAR|[{MELHOR.}]" start={122} stagger={4} dur={15} size={78} bigScale={1.55} style={{top: 836}} />

      {/* linha de luz atravessa "MELHOR" e permanece como horizonte da próxima cena */}
      <LightSweep y={HOOK_LINE_Y} start={150} dur={24} persist persistOpacity={0.55} />
      <AbsoluteFill style={{background: '#060708', opacity: fadeIn}} />
    </AbsoluteFill>
  );
};
