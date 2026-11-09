import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DarkVignette, Grain, NavyBackground} from './components/Atmosphere';
import {BrandMark} from './components/Brand';
import {loadFonts} from './components/Fonts';
import {AnimatedStationLine, linePoint, LOWER, Station, UPPER} from './components/StationMap';
import {C} from './theme/colors';
import {SANS, SERIF} from './theme/typography';

loadFonts();

/** Capa horizontal 1920×1080: marca original, mapa das duas estações e mensagem central. */
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <NavyBackground />
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, transform: 'translate(-180px, 130px)'}}>
      <AnimatedStationLine segs={UPPER} draw={0.6} />
      <AnimatedStationLine segs={LOWER} draw={0.6} />
      <Station p={linePoint(UPPER, 0.5)} label="MATERNIDADE LEGAL" labelSide="right" />
      <Station p={linePoint(LOWER, 0.5)} label="PREVIDENCIÁRIO GERAL" labelSide="right" />
    </svg>
    <div style={{position: 'absolute', left: 150, top: 150}}><BrandMark size={150} variant="dark" nameSize={34} style={{alignItems: 'flex-start'}} /></div>
    <div style={{position: 'absolute', left: 150, top: 470, width: 760, fontFamily: SERIF, fontWeight: 700, fontSize: 76, lineHeight: 1.04, color: C.white, textTransform: 'uppercase'}}>
      Cada benefício<br />tem seu <span style={{color: C.gold}}>caminho.</span>
    </div>
    <div style={{position: 'absolute', left: 150, top: 680, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: '#C9D2E0'}}>Duas soluções especializadas. Uma mesma visão de gestão.</div>
    <DarkVignette strength={0.35} />
    <Grain />
  </AbsoluteFill>
);
