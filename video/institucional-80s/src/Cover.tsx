import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StaggeredWords} from './components/AnimatedText';
import {BrandLogo} from './components/BrandLogo';
import {CinematicImage, Grain, Vignette} from './components/CinematicImage';
import {loadFonts} from './components/Fonts';
import {OfficeNight} from './components/Illustrations';
import {ASSETS} from './data/assets';
import {C} from './theme/colors';

loadFonts();

/** Capa do Instagram (1080x1920): logo oficial + título forte. */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    <CinematicImage src={ASSETS.images.s01 ?? undefined} startFrom={60} dur={1} cam={{s0: 1.04, s1: 1.04}}><OfficeNight /></CinematicImage>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,7,8,.7) 0%, rgba(6,7,8,.45) 45%, rgba(6,7,8,.85) 100%)'}} />
    <BrandLogo id="cover" width={300} revealStart={-100} style={{left: 390, top: 330}} />
    <StaggeredWords text="SUA EMPRESA|PODE OPERAR|[{MELHOR.}]" start={-100} size={98} bigScale={1.3} style={{top: 760}} />
    <div style={{position: 'absolute', left: 480, top: 1240, width: 120, height: 3, background: C.accent}} />
    <Vignette strength={0.5} />
    <Grain />
  </AbsoluteFill>
);
