import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {InterfaceWindow, Seal, Skel} from '../components/InterfaceWindow';
import {ScreenHighlight} from '../components/ScreenHighlight';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {BrandCorner, NavyStage} from './BrandIntroduction';
import {PageHeader} from './Questions';
import {AREA, ResultScreen} from './ResultScreen';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

const CO = {x: 150, y: 250, w: 700, h: 700}; // checkout
const RS = {x: 1010, y: 250, w: 1060, h: 585}; // resultado (janela em escala 0,79)
const RSK = 1060 / 1344;
/** Estado final = estado inicial da cena do PDF (janela centralizada), para a dissolução ser contínua. */
export const END_K = 0.962, END_X = (1920 - 1344 * END_K) / 2, END_Y = 210;

/** Checkout gerado: só a etapa de pagamento, sem confirmação de transação. */
const Checkout: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: C.bg}}>
    <PageHeader />
    <div style={{position: 'absolute', left: 50, right: 50, top: 110, background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 20px 50px rgba(10,32,72,.10)'}}>
      <div style={{fontFamily: UI, fontWeight: 700, fontSize: 18, letterSpacing: '.14em', color: C.gray}}>PAGAMENTO ÚNICO</div>
      <div style={{marginTop: 14, fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.navy}}>Diagnóstico inicial de gestão</div>
      <div style={{marginTop: 18, display: 'inline-block', padding: '6px 18px 10px', borderRadius: 14, border: `2.5px solid ${C.orange}`, fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: C.navy}}>R$ 49,90</div>
      <div style={{marginTop: 34, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
        {[0, 1].map((i) => <div key={i} style={{height: 64, borderRadius: 12, border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', padding: '0 20px'}}><Skel w={140} /></div>)}</div>
      <div style={{marginTop: 16, height: 64, borderRadius: 12, border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', padding: '0 20px'}}><Skel w={260} /></div>
      <div style={{marginTop: 26, height: 66, borderRadius: 12, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 700, fontSize: 22, color: '#fff'}}>Continuar para o pagamento</div>
    </div>
  </div>
);

export const Unlock: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.unlock.dur;
  const pan = prog(f, 40, 110, EASE_IO); // câmera da esquerda para a direita
  const finalZ = prog(f, D - 34, 34, EASE_IO); // o resultado cresce e vai ao centro
  const camX = lerp(160, -170, pan), camS = lerp(1.06, 1, pan);
  const unlock = prog(f, 92, 26, EASE_OUT); // blur 12 → 0
  const shackle = prog(f, 80, 14, EASE_OUT);
  const flow = prog(f, 66, 30, EASE_IO);
  const tIdx = wordAt('unlock', 'índice'), tPts = wordAt('unlock', 'pontos'), tRec = wordAt('unlock', 'recomendações');
  // resultado ao centro no fim: escala e posição de tela
  const rsS = lerp(1, END_K / RSK, finalZ);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: prog(f, 0, 12)}}>
      <NavyStage f={f} glowX={lerp(500, 1400, pan)} glowY={700} />
      <BrandCorner opacity={1 - finalZ} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 55%', transform: `translate(${camX * (1 - finalZ)}px, 0) scale(${camS})`}}>
        <div style={{opacity: 1 - finalZ * 0.9}}>
          <InterfaceWindow x={CO.x} y={CO.y} w={CO.w} h={CO.h} url="sgc · pagamento"><Checkout /></InterfaceWindow>
        </div>
        {/* passagem: fluxo laranja e cadeado que abre (símbolo, não confirmação de pagamento) */}
        <svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0, opacity: 1 - finalZ}}>
          <path d="M 850 600 C 900 600, 940 560, 990 560" pathLength={1} fill="none" stroke={C.orange} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - flow} />
        </svg>
        <div style={{position: 'absolute', left: 892, top: 500, width: 76, height: 76, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: prog(f, 70, 10) * (1 - prog(f, 124, 14)), transform: `scale(${0.7 + 0.3 * prog(f, 70, 14, EASE_OUT)})`, boxShadow: '0 14px 30px rgba(0,0,0,.4)'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.4"><rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0" style={{transformOrigin: '16px 11px', transform: `translateY(${-2.5 * shackle}px) rotate(${-30 * shackle}deg)`}} /><path d="M16 7v4" opacity={1 - shackle} /></svg>
        </div>
        <div style={{position: 'absolute', left: RS.x, top: RS.y, transformOrigin: '0 0', transform: `translate(${lerp(0, END_X - RS.x, finalZ)}px, ${lerp(0, END_Y - RS.y, finalZ)}px) scale(${rsS})`}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1344, height: 742 + 48, transform: `scale(${RSK})`, transformOrigin: '0 0'}}>
            <InterfaceWindow x={0} y={0} w={1344} h={790}>
              <ResultScreen blur={12 * (1 - unlock)} showButton={false} title="Seu diagnóstico" />
              <ScreenHighlight f={f} start={tIdx - 2} out={tPts - 2} x={AREA.index.x} y={AREA.index.y} w={AREA.index.w} h={AREA.index.h} r={20} />
              <ScreenHighlight f={f} start={tPts - 2} out={tRec - 2} x={AREA.points.x} y={AREA.points.y} w={AREA.points.w} h={AREA.points.h} r={20} />
              <ScreenHighlight f={f} start={tRec - 2} out={D - 30} x={AREA.recs.x} y={AREA.recs.y} w={AREA.recs.w} h={AREA.recs.h} r={20} />
            </InterfaceWindow>
          </div>
          <Seal text="Exemplo ilustrativo · índice demonstrativo" style={{left: 0, top: 640, opacity: unlock}} />
        </div>
      </div>
      {/* títulos */}
      <div style={{position: 'absolute', left: 260, top: 92, opacity: 1 - prog(f, 120, 14, EASE_IN)}}>
        <AnimatedHeadline f={f} start={8} text="PAGAMENTO ÚNICO  [R$ 49,90]" size={60} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 92, opacity: prog(f, 128, 14) * (1 - finalZ)}}>
        <AnimatedHeadline f={f} start={tIdx - 4} text="RESULTADO [DESBLOQUEADO]" size={56} align="center" />
      </div>
    </div>
  );
};
