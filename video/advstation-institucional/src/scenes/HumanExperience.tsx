import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CinematicImage} from '../components/CinematicImage';
import {EditorialHeadline} from '../components/Editorial';
import {PHOTOS} from '../data/assets';
import {C} from '../theme/colors';
import {prog} from '../theme/animation';

/** CENA 08 — A experiência jurídica continua no centro. */
export const HumanExperience: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 16), background: C.navy}}>
      <CinematicImage src={PHOTOS.s08.src} desc={PHOTOS.s08.desc} dur={210} cam={{s0: 1, s1: 1.06}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(14,27,51,.82) 0%, rgba(14,27,51,.45) 50%, rgba(14,27,51,.1) 100%)'}} />
      <EditorialHeadline text="A tecnologia apoia." start={8} x={150} y={420} width={1500} size={76} exit={84} />
      <EditorialHeadline text="A experiência jurídica|continua no [centro]." start={92} x={150} y={360} width={1600} size={70} lineScale={[1, 1.22]} lineStagger={12} exit={168} />
      <AbsoluteFill style={{background: C.navy, opacity: prog(f, 172, 38)}} />
    </AbsoluteFill>
  );
};
