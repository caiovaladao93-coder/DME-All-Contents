import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {StaggeredWords} from '../components/AnimatedText';
import {SystemCard} from '../components/SystemCard';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/motion';
import {FONT_UI} from '../theme/typography';

const TITLE_TOP = 290;
// Geometria (palco 1080x1920)
const PANEL = {x: 290, y: 760, w: 500, h: 380};
const IA = {x: 90, y: 540, w: 380, h: 170};
const INT = {x: 610, y: 540, w: 380, h: 170};
const CHAIN = [
  {x: 90, label: 'Entrada'},
  {x: 405, label: 'Processamento'},
  {x: 720, label: 'Atualização'},
];
const CHAIN_Y = 1220, CHAIN_W = 240, CHAIN_H = 110;

// Conexões de integração (desenhadas por stroke-dashoffset)
const LINKS = [
  'M280 710 L280 800 L290 800',
  'M800 710 L800 800 L790 800',
  'M470 625 L610 625',
  'M540 1140 L540 1180 L210 1180 L210 1220',
  'M540 1140 L540 1220',
  'M540 1180 L840 1180 L840 1220',
];

const NodeNetwork: React.FC<{f: number}> = ({f}) => {
  const pts: Array<[number, number]> = [[30, 60], [90, 20], [150, 64], [92, 100], [200, 30], [210, 96]];
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [0, 3], [3, 2], [2, 4], [2, 5], [4, 5]];
  return (
    <svg width={240} height={120} viewBox="0 0 240 120">
      {edges.map(([a, b], i) => {
        const on = prog(f, 14 + i * 5, 8);
        return <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={on > 0.5 ? '#6E9BCB' : 'rgba(192,198,204,.3)'} strokeWidth={2} opacity={0.4 + 0.6 * on} />;
      })}
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7 + Math.sin(f * 0.12 + i) * 1.5} fill={i === 2 ? C.accent : '#C0C6CC'} />)}
    </svg>
  );
};

export const Scene05Solutions: React.FC = () => {
  const f = useCurrentFrame();
  // dolly-out: 1,06 → 0,96 ; deslocamento lateral acompanhando o foco
  const s = lerp(1.06, 0.96, prog(f, 0, 300, EASE_IO));
  const camX = f < 90 ? lerp(60, 30, prog(f, 0, 90, EASE_IO)) : f < 180 ? lerp(30, -30, prog(f, 90, 60, EASE_IO)) : lerp(-30, 0, prog(f, 180, 60, EASE_IO));
  const expand = prog(f, 310, 20, EASE_IN); // painel invade a tela → cena 06
  const allLit = prog(f, 272, 20);
  const micro = (ph: number) => `translate(${(Math.sin(f * 0.05 + ph) * 4).toFixed(2)}px, ${(Math.cos(f * 0.045 + ph) * 5).toFixed(2)}px)`;

  // partícula da automação
  const pp = prog(f, 118, 46, EASE_IO);
  const px = lerp(90 + CHAIN_W / 2, 720 + CHAIN_W / 2, pp);
  const check = prog(f, 164, 12);

  // dados trafegando pelas conexões (após desenhadas)
  const flow = (i: number) => ((f * 0.02 + i * 0.27) % 1);

  return (
    <AbsoluteFill style={{background: C.carbon, opacity: prog(f, 0, 14)}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 52%, rgba(38,75,113,.32), rgba(10,11,12,0) 70%)'}} />
      <AbsoluteFill style={{transform: `translateX(${camX.toFixed(2)}px) scale(${(s * lerp(1, 3.2, expand)).toFixed(4)})`, transformOrigin: '540px 950px', opacity: 1 - prog(f, 318, 12)}}>
        {/* painel central */}
        <div style={{position: 'absolute', inset: 0, transform: micro(0)}}>
          <SystemCard x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} title="Operação" rows={4} lit={Math.max(allLit, 0.35 * prog(f, 0, 20))} />
        </div>
        {/* módulo IA */}
        <div style={{position: 'absolute', inset: 0, opacity: prog(f, 6, 16), transform: `${micro(1.3)} translateY(${(1 - prog(f, 6, 16)) * 30}px)`}}>
          <SystemCard x={IA.x} y={IA.y} w={IA.w} h={IA.h} title="IA" lit={Math.max(allLit, f < 90 ? prog(f, 20, 20) : 0.3)}>
            <div style={{marginTop: -8, marginLeft: 50}}><NodeNetwork f={f} /></div>
          </SystemCard>
        </div>
        {/* módulo integração */}
        <div style={{position: 'absolute', inset: 0, opacity: prog(f, 182, 16), transform: `${micro(2.1)} translateY(${(1 - prog(f, 182, 16)) * 30}px)`}}>
          <SystemCard x={INT.x} y={INT.y} w={INT.w} h={INT.h} title="Integração" rows={2} lit={Math.max(allLit, prog(f, 190, 20) * 0.6)} />
        </div>
        {/* cadeia de automação */}
        {CHAIN.map((c, i) => {
          const e = prog(f, 96 + i * 8, 16);
          const reached = (i === 0 && pp > 0) || (i === 1 && pp > 0.5) || (i === 2 && pp >= 0.99);
          return (
            <div key={i} style={{position: 'absolute', left: c.x, top: CHAIN_Y, width: CHAIN_W, height: CHAIN_H, borderRadius: 18, opacity: e,
              transform: `${micro(3 + i)} translateY(${(1 - e) * 30}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'linear-gradient(160deg,#2A2F35,#1A1D21)', border: `1.5px solid ${reached || allLit > 0.5 ? 'rgba(58,110,165,.95)' : 'rgba(192,198,204,.25)'}`,
              boxShadow: '0 20px 40px rgba(0,0,0,.5)', fontFamily: FONT_UI, fontWeight: 700, fontSize: 25, letterSpacing: '.06em', color: '#E6EAEE', textTransform: 'uppercase'}}>
              {c.label}
              {i === 2 ? (
                <svg width={34} height={34} viewBox="0 0 24 24" style={{opacity: check}}>
                  <circle cx={12} cy={12} r={11} fill={C.accent} />
                  <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - check} />
                </svg>
              ) : null}
            </div>
          );
        })}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* setas da cadeia */}
          {[0, 1].map((i) => <line key={i} x1={CHAIN[i].x + CHAIN_W} y1={CHAIN_Y + CHAIN_H / 2} x2={CHAIN[i + 1].x} y2={CHAIN_Y + CHAIN_H / 2}
            stroke="rgba(192,198,204,.5)" strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(f, 108 + i * 6, 12)} />)}
          {f >= 118 && f < 170 ? <circle cx={px} cy={CHAIN_Y + CHAIN_H / 2} r={9} fill="#DCE8F5" /> : null}
          {/* integração */}
          {LINKS.map((d, i) => {
            const p = prog(f, 186 + i * 9, 22, EASE_IO);
            return <path key={i} d={d} fill="none" stroke={C.accent} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={0.95} />;
          })}
          {/* dados trafegando (pontos ao longo das conexões já desenhadas) */}
          {f > 250 ? LINKS.map((d, i) => (
            <path key={'d' + i} d={d} fill="none" stroke="#DCE8F5" strokeWidth={4} strokeLinecap="round" pathLength={1}
              strokeDasharray="0.06 0.94" strokeDashoffset={-flow(i)} opacity={0.8 * prog(f, 250, 12)} />
          )) : null}
        </svg>
      </AbsoluteFill>

      {/* títulos (fora da câmera, sempre legíveis) */}
      <StaggeredWords text="INTELIGÊNCIA|[ARTIFICIAL]" start={8} size={80} exit={82} style={{top: TITLE_TOP}} />
      <StaggeredWords text="AUTOMAÇÃO|[DE PROCESSOS]" start={94} size={80} exit={172} style={{top: TITLE_TOP}} />
      <StaggeredWords text="INTEGRAÇÃO|[DE SISTEMAS]" start={184} size={80} exit={262} style={{top: TITLE_TOP}} />
      <StaggeredWords text="TECNOLOGIA|QUE [CONECTA.]" start={272} size={86} exit={314} style={{top: TITLE_TOP}} />
      <AbsoluteFill style={{background: C.graphite2, opacity: prog(f, 318, 12)}} />
    </AbsoluteFill>
  );
};
