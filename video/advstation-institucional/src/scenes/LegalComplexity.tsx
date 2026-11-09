import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline, FeatureLabel} from '../components/Editorial';
import {wordAt} from '../data/narration';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {SANS} from '../theme/typography';

/*
 * CENA 02 — A complexidade operacional, com contexto:
 * três "artefatos" desenhados em código (planilha, mensagens, controles paralelos) surgem na palavra
 * dita; as informações do escritório ficam espalhadas entre eles, com ligações que não se fecham.
 * Nada aqui imita um produto real; são ilustrações genéricas.
 */
const Frame: React.FC<{x: number; y: number; w: number; h: number; tilt: number; e: number; label: string; children: React.ReactNode; float: number}> = ({x, y, w, h, tilt, e, label, children, float}) => (
  <div style={{position: 'absolute', left: x, top: y + (1 - e) * 40 + float, width: w, opacity: e, transform: `perspective(1400px) rotateY(${tilt}deg) rotate(${tilt / 4}deg)`}}>
    <div style={{height: h, borderRadius: 14, overflow: 'hidden', background: '#F7F3EA', boxShadow: '0 30px 70px rgba(0,0,0,.45)'}}>{children}</div>
    <div style={{marginTop: 16, fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: '.24em', color: C.gold}}>{label}</div>
  </div>
);

const Sheet: React.FC = () => (
  <div style={{position: 'absolute', inset: 0}}>
    <div style={{height: 30, background: '#E4DED1'}} />
    {Array.from({length: 9}).map((_, r) => (
      <div key={r} style={{display: 'flex', height: 32, borderBottom: '1px solid #DDD6C7', background: r === 0 ? '#EFEAE0' : undefined}}>
        {Array.from({length: 6}).map((__, c) => (
          <div key={c} style={{flex: c === 0 ? 0.5 : 1, borderRight: '1px solid #DDD6C7', padding: '11px 8px'}}>
            {r > 0 && c > 0 && (r * 7 + c * 3) % 4 !== 0 ? <div style={{height: 8, width: `${40 + ((r * 13 + c * 29) % 50)}%`, borderRadius: 4, background: (r + c) % 7 === 0 ? '#E7C979' : '#C9C2B4'}} /> : null}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Messages: React.FC<{f: number; at: number}> = ({f, at}) => (
  <div style={{position: 'absolute', inset: 0, padding: 18, background: '#F1EEE6'}}>
    {[[0, 70], [1, 55], [0, 82], [1, 40], [0, 60], [1, 74]].map(([side, wd], i) => {
      const e = prog(f, at + 4 + i * 5, 10);
      return <div key={i} style={{display: 'flex', justifyContent: side ? 'flex-end' : 'flex-start', marginTop: i ? 12 : 0, opacity: e}}>
        <div style={{width: `${wd}%`, padding: '12px 14px', borderRadius: side ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: side ? '#DCE6D2' : '#FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,.06)'}}>
          <div style={{height: 7, width: '85%', borderRadius: 4, background: '#B9B3A6'}} />
          <div style={{height: 7, width: '55%', borderRadius: 4, background: '#CFC9BC', marginTop: 7}} />
        </div>
      </div>;
    })}
  </div>
);

const Controls: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: '#EFEAE0', padding: 18}}>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6}}>
      {Array.from({length: 28}).map((_, i) => <div key={i} style={{height: 34, borderRadius: 6, background: [3, 9, 17, 22].includes(i) ? '#E7C979' : '#FBF8F2', border: '1px solid #DDD6C7'}} />)}
    </div>
    {[[-6, 20, 236], [5, 210, 250], [-3, 120, 268]].map(([r, l, t], i) => (
      <div key={i} style={{position: 'absolute', left: l, top: t, width: 150, height: 96, background: '#F6E7B6', transform: `rotate(${r}deg)`, boxShadow: '0 8px 16px rgba(0,0,0,.18)', padding: 12}}>
        <div style={{height: 7, width: '80%', borderRadius: 4, background: '#C4A85C'}} /><div style={{height: 7, width: '60%', borderRadius: 4, background: '#D2BA78', marginTop: 9}} />
      </div>
    ))}
  </div>
);

type Card = {t: string; x: number; y: number; at: number};
const CARDS: Card[] = [
  {t: 'CLIENTES', x: 610, y: 168, at: 0}, {t: 'DOCUMENTOS', x: 1240, y: 640, at: 6}, {t: 'ETAPAS', x: 180, y: 640, at: 12},
  {t: 'PRAZOS', x: 1530, y: 140, at: 18}, {t: 'TAREFAS', x: 820, y: 700, at: 24},
];

export const LegalComplexity: React.FC = () => {
  const f = useCurrentFrame();
  const aSheet = wordAt('complexity', 'planilhas,') - 4;
  const aMsg = wordAt('complexity', 'mensagens') - 4;
  const aCtrl = wordAt('complexity', 'controles') - 4;
  const cardsAt = wordAt('complexity', 'acompanhar') - 6;
  const dark = prog(f, 236, 16);
  const conv = prog(f, 272, 26, EASE_IN);
  const fl = (ph: number) => Math.sin(f / 22 + ph) * 5;
  const scatter = (x: number, y: number): React.CSSProperties => ({
    transform: `translate(${((960 - x) * conv).toFixed(1)}px, ${((470 - y) * conv).toFixed(1)}px) scale(${lerp(1, 0.2, conv)})`, opacity: 1 - prog(f, 284, 14),
  });
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      <div style={{position: 'absolute', inset: 0, ...scatter(380, 360), opacity: (1 - dark * 0.7) * (1 - prog(f, 284, 14))}}>
        <Frame x={150} y={200} w={500} h={330} tilt={8} e={prog(f, aSheet, 18, EASE_OUT)} label="PLANILHAS" float={fl(0)}><Sheet /></Frame>
      </div>
      <div style={{position: 'absolute', inset: 0, ...scatter(920, 420), opacity: (1 - dark * 0.7) * (1 - prog(f, 284, 14))}}>
        <Frame x={720} y={250} w={420} h={380} tilt={-4} e={prog(f, aMsg, 18, EASE_OUT)} label="MENSAGENS" float={fl(1.7)}><Messages f={f} at={aMsg} /></Frame>
      </div>
      <div style={{position: 'absolute', inset: 0, ...scatter(1470, 380), opacity: (1 - dark * 0.7) * (1 - prog(f, 284, 14))}}>
        <Frame x={1220} y={210} w={500} h={360} tilt={-9} e={prog(f, aCtrl, 18, EASE_OUT)} label="CONTROLES PARALELOS" float={fl(3.1)}><Controls /></Frame>
      </div>
      {/* ligações tracejadas que não se completam */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: (1 - dark) * prog(f, cardsAt + 10, 14)}}>
        {[[690, 210, 640, 360], [1240, 660, 1140, 560], [300, 640, 330, 560], [1620, 180, 1560, 280], [900, 720, 900, 650]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={lerp(x1, x2, 0.6)} y2={lerp(y1, y2, 0.6)} stroke="rgba(194,155,60,.7)" strokeWidth={2} strokeDasharray="5 8" />
        ))}
      </svg>
      {CARDS.map((c) => {
        const e = prog(f, cardsAt + c.at, 16, EASE_OUT);
        return <div key={c.t} style={{position: 'absolute', inset: 0, ...scatter(c.x + 100, c.y + 30)}}>
          <FeatureLabel text={c.t} x={c.x} y={c.y + (1 - e) * 20 + fl(c.at)} opacity={e * lerp(1, 0.3, dark)} />
        </div>;
      })}
      <AbsoluteFill style={{background: `rgba(14,27,51,${(dark * 0.55).toFixed(3)})`}} />
      <EditorialHeadline text="Quando tudo fica disperso,|a gestão perde [clareza]." start={242} x={150} y={400} width={1620} size={78} align="center" lineStagger={10} />
    </AbsoluteFill>
  );
};
