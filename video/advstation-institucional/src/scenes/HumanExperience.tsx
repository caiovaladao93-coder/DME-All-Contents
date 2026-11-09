import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline} from '../components/Editorial';
import {SCREENS} from '../data/assets';
import {C} from '../theme/colors';
import {EASE_IO, lerp, prog} from '../theme/animation';

/**
 * CENA 08 — A experiência jurídica continua no centro. Sem pessoas:
 * as telas (a tecnologia) recuam para as laterais, desfocadas, e abrem o centro para a frase.
 */
const Panel: React.FC<{src: string; side: -1 | 1; p: number}> = ({src, side, p}) => (
  <div style={{position: 'absolute', top: 250, left: side < 0 ? lerp(330, -260, p) : lerp(630, 1220, p), width: 960, height: 540, borderRadius: 16, overflow: 'hidden',
    transform: `perspective(1600px) rotateY(${side * lerp(0, 28, p)}deg) scale(${lerp(0.9, 0.82, p)})`, filter: `blur(${(p * 6).toFixed(1)}px)`, opacity: lerp(0.9, 0.45, p),
    boxShadow: '0 40px 90px rgba(0,0,0,.5)'}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%'}} />
    <div style={{position: 'absolute', inset: 0, background: 'rgba(14,27,51,.35)'}} />
  </div>
);

export const HumanExperience: React.FC = () => {
  const f = useCurrentFrame();
  const apart = prog(f, 80, 50, EASE_IO);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 16)}}>
      <NavyBackground />
      <Panel src={SCREENS.mlDashboard.src!} side={-1} p={apart} />
      <Panel src={SCREENS.pgDashboard.src!} side={1} p={apart} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 45% at 50% 50%, rgba(194,155,60,${(0.16 * apart).toFixed(3)}), rgba(22,40,74,0) 70%)`}} />
      <AbsoluteFill style={{background: `rgba(14,27,51,${(0.35 - 0.15 * apart).toFixed(3)})`}} />
      <EditorialHeadline text="A tecnologia apoia." start={8} x={150} y={460} width={1620} size={78} align="center" exit={84} />
      <EditorialHeadline text="A experiência jurídica|continua no [centro]." start={96} x={150} y={400} width={1620} size={70} align="center" lineScale={[1, 1.22]} lineStagger={12} exit={168} />
      <AbsoluteFill style={{background: C.navy, opacity: prog(f, 172, 38)}} />
    </AbsoluteFill>
  );
};
