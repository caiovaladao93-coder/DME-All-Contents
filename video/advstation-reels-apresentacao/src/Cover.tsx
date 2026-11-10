import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFonts} from './components/Fonts';
import {C} from './theme/colors';
import {SANS, SERIF} from './theme/typography';
import {Atmos} from './components/Vertical';
import {A_PATH, Selo} from './components/Brand';

loadFonts();
/** Capa do Instagram 1080×1920 (o recorte 3:4 central, y 240–1680, mantém título, tela e marca). */
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Atmos />
    <div style={{position: 'absolute', left: 90, top: 300, display: 'flex', alignItems: 'center', gap: 18}}>
      <span style={{width: 56, height: 3, background: C.gold}} /><span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '.26em', color: C.gold}}>ADV STATION</span></div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 360, fontFamily: SERIF, fontWeight: 700, fontSize: 112, lineHeight: 1.04, color: '#fff'}}>
      Cada cliente,<br />uma <span style={{color: C.gold}}>etapa.</span></div>
    <div style={{position: 'absolute', left: 90, top: 660, width: 900, height: 620, borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,.55)'}}>
      <Img src={staticFile('assets/maternidade-legal/protocolo.png')} style={{position: 'absolute', left: -320 * 1.14, top: -100 * 1.14, width: 1918 * 1.14}} /></div>
    <div style={{position: 'absolute', left: 90, top: 1320, display: 'flex', gap: 14}}><Selo produto="maternidade" nome="Maternidade Legal" /><Selo produto="previdenciario" nome="Previdenciário Geral" /></div>
    <div style={{position: 'absolute', left: 90, top: 1440, display: 'flex', alignItems: 'center', gap: 20}}>
      <svg viewBox="0 0 100 100" width={86} height={86}><path d={A_PATH} fill="#fff" /><rect x={9} y={79} width={82} height={8} rx={4} fill={C.gold} /></svg>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: '.32em', color: '#fff'}}>ADV STATION</span></div>
  </AbsoluteFill>
);
