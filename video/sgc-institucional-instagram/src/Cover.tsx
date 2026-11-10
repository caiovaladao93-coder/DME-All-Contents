import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts, HEAD, UI} from './theme/typography';
import {C} from './theme/colors';
import {Plate} from './components/Plates';
import {Scrim} from './components/NavyStage';
import {BrandSignature} from './components/BrandSignature';

loadFonts();
/** Capa do Instagram (1080×1920; o recorte 3:4 central da grade mantém título e marca). */
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, transform: 'scale(1.04)'}}><Plate k="office" /></div>
    <Scrim top={0.75} bottom={0.8} />
    <div style={{position: 'absolute', left: 90, top: 340, fontFamily: HEAD, fontWeight: 800, fontSize: 156, lineHeight: 1, letterSpacing: '-.02em', color: '#fff'}}>
      INTUIÇÃO<br />NÃO<br /><span style={{color: C.orange}}>BASTA.</span></div>
    <div style={{position: 'absolute', left: 90, top: 866, width: 240, height: 3, background: C.orange}} />
    <div style={{position: 'absolute', left: 90, top: 910, fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: '.18em', color: 'rgba(255,255,255,.8)'}}>GESTÃO COM MÉTODO</div>
    <div style={{position: 'absolute', left: 90, top: 1290}}><BrandSignature height={300} /></div>
  </AbsoluteFill>
);
