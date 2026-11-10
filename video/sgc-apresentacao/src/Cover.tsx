import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts, HEAD, UI} from './theme/typography';
import {C} from './theme/colors';
import {BrandSignature} from './components/BrandSignature';
import {NavyStage} from './scenes/BrandIntroduction';

loadFonts();
/** Capa horizontal 1920×1080: pergunta do gancho + marca. */
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <NavyStage f={0} glowX={1450} glowY={760} />
    <div style={{position: 'absolute', left: 150, top: 300}}>
      <div style={{width: 180, height: 3, background: C.orange}} />
      <div style={{marginTop: 34, fontFamily: HEAD, fontWeight: 600, fontSize: 50, letterSpacing: '.06em', color: 'rgba(255,255,255,.82)'}}>VOCÊ SABE COMO ESTÁ</div>
      <div style={{marginTop: 18, fontFamily: HEAD, fontWeight: 800, fontSize: 104, lineHeight: 1.04, letterSpacing: '-.02em', color: '#fff'}}>
        A <span style={{color: C.orange}}>SAÚDE</span> DA<br />SUA EMPRESA?</div>
      <div style={{marginTop: 40, fontFamily: UI, fontWeight: 700, fontSize: 22, letterSpacing: '.22em', color: 'rgba(255,255,255,.55)'}}>DIAGNÓSTICO INICIAL DE GESTÃO</div>
    </div>
    <div style={{position: 'absolute', left: 1330, top: 250}}><BrandSignature height={560} /></div>
  </AbsoluteFill>
);
