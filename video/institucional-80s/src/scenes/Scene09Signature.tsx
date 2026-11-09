import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandLogo} from '../components/BrandLogo';
import {LightSweep} from '../components/LightSweep';
import {ACCENT_TEXT, C} from '../theme/colors';
import {prog} from '../theme/motion';
import {FONT_UI} from '../theme/typography';

export const SIG_LOGO = {w: 540, top: 600};

export const Slogan: React.FC<{f: number; s1: number; s2: number; opacity?: number}> = ({f, s1, s2, opacity = 1}) => {
  const e1 = prog(f, s1, 16);
  const e2 = prog(f, s2, 16);
  const st: React.CSSProperties = {position: 'absolute', left: 90, width: 900, textAlign: 'center', fontFamily: FONT_UI, fontWeight: 700, fontSize: 44, letterSpacing: '.1em', color: '#E6EAEE'};
  return (
    <div style={{opacity}}>
      <div style={{...st, top: 1150, opacity: e1, transform: `translateY(${((1 - e1) * 15).toFixed(1)}px)`}}>AUTOMATIZAMOS PROCESSOS.</div>
      <div style={{...st, top: 1216, opacity: e2, transform: `translateY(${((1 - e2) * 15).toFixed(1)}px)`}}>DEVOLVEMOS <span style={{...ACCENT_TEXT, fontWeight: 700}}>TEMPO.</span></div>
    </div>
  );
};

export const SignatureBg: React.FC = () => (
  <>
    <AbsoluteFill style={{background: C.carbonDeep}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 35% at 50% 48%, rgba(32,37,43,.95), rgba(6,7,8,0) 75%)'}} />
  </>
);

export const Scene09Signature: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 8)}}>
      <SignatureBg />
      <LightSweep y={858} start={0} dur={24} thickness={2} />
      <BrandLogo id="s09" width={SIG_LOGO.w} revealStart={14} revealDur={30} sheenStart={48} sheenDur={28} style={{left: 540 - SIG_LOGO.w / 2, top: SIG_LOGO.top}} />
      <Slogan f={f} s1={58} s2={68} />
    </AbsoluteFill>
  );
};
