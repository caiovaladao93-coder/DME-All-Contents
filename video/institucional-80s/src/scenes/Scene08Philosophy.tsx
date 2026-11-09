import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {StaggeredWords} from '../components/AnimatedText';
import {CinematicImage} from '../components/CinematicImage';
import {OfficeBright} from '../components/Illustrations';
import {ASSETS} from '../data/assets';
import {prog} from '../theme/motion';

export const Scene08Philosophy: React.FC = () => {
  const f = useCurrentFrame();
  const lines = 1 - prog(f, 6, 56);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 16)}}>
      <CinematicImage src={ASSETS.images.s08 ?? undefined} dur={150} cam={{s0: 1.06, s1: 1.0, x0: 20, x1: -40}}
        grade="linear-gradient(180deg,rgba(6,7,8,.6) 0%,rgba(6,7,8,.1) 40%,rgba(6,7,8,.2) 70%,rgba(6,7,8,.55) 100%)"><OfficeBright /></CinematicImage>
      {/* tecnologia presente no ambiente: linhas azuis finas que se recolhem */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: lines}}>
        {[[0, 1120, 1080, 1090], [0, 1260, 1080, 1230], [200, 0, 200, 1920], [880, 0, 880, 1920], [0, 700, 1080, 640]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(120,165,215,.55)" strokeWidth={1.5} strokeDasharray="6 10" />
        ))}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 18% at 50% 44%, rgba(6,7,8,.6), rgba(6,7,8,0) 100%)'}} />
      <StaggeredWords text="A TECNOLOGIA|TRABALHA." start={8} size={84} exit={66} style={{top: 760}} />
      <StaggeredWords text="O SEU NEGÓCIO|[{AVANÇA.}]" start={76} size={80} bigScale={1.4} dy={35} style={{top: 740}} />
      <AbsoluteFill style={{background: '#0A0B0C', opacity: prog(f, 126, 24)}} />
    </AbsoluteFill>
  );
};
