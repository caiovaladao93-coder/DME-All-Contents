import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {InterfaceWindow, Seal, Skel} from '../components/InterfaceWindow';
import {ScreenHighlight, LightSweep} from '../components/ScreenHighlight';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {BrandCorner, NavyStage} from './BrandIntroduction';
import {AREA, ResultScreen} from './ResultScreen';
import {SCENES} from '../data/storyboard';
import {END_K, END_X} from './Unlock';

const K1 = 0.78, WX1 = 110, WY = 210;

/** Documento PDF como símbolo vetorial (não é um relatório inventado). */
const PdfDoc: React.FC = () => (
  <div style={{position: 'relative', width: 380, height: 490}}>
    <div style={{position: 'absolute', inset: 0, background: '#fff', borderRadius: 14, clipPath: 'polygon(0 0, 82% 0, 100% 14%, 100% 100%, 0 100%)', boxShadow: '0 40px 80px rgba(0,0,0,.5)'}} />
    <div style={{position: 'absolute', right: 0, top: 0, width: '18%', height: '14%', background: '#D5DCE6', borderBottomLeftRadius: 12}} />
    <div style={{position: 'absolute', left: 36, top: 40, padding: '8px 16px', borderRadius: 8, background: C.orange, fontFamily: HEAD, fontWeight: 800, fontSize: 26, color: C.navy}}>PDF</div>
    <div style={{position: 'absolute', left: 36, right: 36, top: 120}}>
      <Skel w="80%" h={18} c="rgba(10,32,72,.7)" /><Skel w="56%" h={12} style={{marginTop: 14}} />
      <div style={{display: 'flex', gap: 20, marginTop: 34, alignItems: 'center'}}>
        <svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r="44" fill="none" stroke="rgba(10,32,72,.1)" strokeWidth="12" />
          <circle cx="55" cy="55" r="44" fill="none" stroke={C.orange} strokeWidth="12" pathLength={1} strokeDasharray=".72 1" strokeLinecap="round" transform="rotate(-90 55 55)" /></svg>
        <div style={{flex: 1}}><Skel w="90%" /><Skel w="70%" style={{marginTop: 12}} /><Skel w="80%" style={{marginTop: 12}} /></div></div>
      {[0, 1, 2, 3].map((i) => <Skel key={i} w={['94%', '84%', '90%', '62%'][i]} h={11} style={{marginTop: i ? 14 : 34}} />)}
    </div>
  </div>
);

export const PDF: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.pdf.dur;
  const lay = prog(f, 0, 24, EASE_IO); // parte do enquadramento final do desbloqueio
  const K = lerp(END_K, K1, lay), WX = lerp(END_X, WX1, lay);
  const appr = prog(f, 14, 36, EASE_IO);
  const doc = prog(f, 36, 26, EASE_OUT);
  const out = prog(f, D - 14, 14, EASE_IN);
  // aproximação do botão "Baixar PDF"
  const bx = WX + AREA.pdf.x * K + AREA.pdf.w * K / 2, by = WY + 48 * K + AREA.pdf.y * K + AREA.pdf.h * K / 2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: prog(f, 0, 12)}}>
      <NavyStage f={f} glowX={1450} glowY={500} />
      <BrandCorner />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${bx}px ${by}px`, transform: `scale(${lerp(1, 1.12, appr) * lerp(1, 0.94, prog(f, 44, 40, EASE_IO))})`, opacity: 1 - out * 0.8}}>
        <div style={{position: 'absolute', left: WX, top: WY, width: 1344, height: 790, transform: `scale(${K})`, transformOrigin: '0 0'}}>
          <InterfaceWindow x={0} y={0} w={1344} h={790}>
            <ResultScreen blur={0} showButton={false} showPdf title="Seu diagnóstico" />
            <ScreenHighlight f={f} start={12} x={AREA.pdf.x} y={AREA.pdf.y} w={AREA.pdf.w} h={AREA.pdf.h} r={12} pad={6} />
            <div style={{position: 'absolute', left: AREA.pdf.x, top: AREA.pdf.y, width: AREA.pdf.w, height: AREA.pdf.h}}><LightSweep f={f} start={22} dur={18} /></div>
          </InterfaceWindow>
        </div>
        <Seal text="Exemplo ilustrativo" style={{left: WX, top: WY + 790 * K + 16, opacity: prog(f, 16, 10)}} />
      </div>
      <div style={{position: 'absolute', left: 1290, top: 150, opacity: doc * (1 - out), transform: `translate(${(1 - doc) * -120}px, ${(1 - doc) * 30}px) rotate(${(1 - doc) * -6 + Math.sin(f / 20) * 0.6}deg) scale(${0.85 + 0.15 * doc})`}}>
        <PdfDoc /></div>
      <div style={{position: 'absolute', left: 1290, top: 690, opacity: 1 - out}}>
        <AnimatedHeadline f={f} start={58} text="SEU DIAGNÓSTICO.|EM SUAS [MÃOS.]" size={50} />
      </div>
    </div>
  );
};
