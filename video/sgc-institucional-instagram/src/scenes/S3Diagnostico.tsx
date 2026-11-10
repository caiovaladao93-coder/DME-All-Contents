import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {Plate} from '../components/Plates';
import {Scrim} from '../components/NavyStage';
import {Connector, PillarCard} from '../components/Cards';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

/** Centro do diagnóstico e posição do 1º cartão do plano (cena 04): a transição liga os dois. */
export const NODE = {cx: 540, cy: 900};
export const PLAN1 = {cx: 540, cy: 760, w: 620, h: 130};
const R = 330;
const PILLARS = ['FATURAMENTO', 'IMPOSTOS', 'LOGÍSTICA', 'MARGEM', 'CUSTOS'];
const POS = PILLARS.map((_, i) => { const a = (-90 + i * 72) * Math.PI / 180; return [NODE.cx + R * Math.cos(a), NODE.cy + R * Math.sin(a)]; });

/** CENA 03 · O diagnóstico. Os cinco pilares do FILMC 360° (Faturamento, Impostos, Logística, Margem, Custos), sem valores. */
export const S3Diagnostico: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.s3.dur;
  const words = ['faturamento,', 'impostos,', 'logística,', 'margem', 'custos.'];
  const tIn = words.map((w, i) => Math.min(wordAt('s3', w) - 4, 80 + i * 8 + 200));
  const tNode = wordAt('s3', 'diagnóstico:') - 2;
  const morph = prog(f, D - 20, 20, EASE_IO); // o centro vira o 1º elemento do plano
  const fadeAll = prog(f, D - 22, 14, EASE_IN);
  const nodeW = lerp(300, PLAN1.w, morph), nodeH = lerp(92, PLAN1.h, morph), nodeY = lerp(NODE.cy, PLAN1.cy, morph);
  const pn = prog(f, tNode, 16, EASE_OUT);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: prog(f, 0, 16)}}>
      <CinematicImage f={f} dur={D + 16} s0={1} s1={1.08} x0={0} x1={-20} origin="45% 45%"><Plate k="analysis" /></CinematicImage>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(3,10,26,.55)'}} />
      <Scrim top={0.6} bottom={0.8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: UI, fontWeight: 700, fontSize: 26, letterSpacing: '.26em', paddingLeft: '.26em',
        color: 'rgba(255,255,255,.75)', opacity: prog(f, 10, 16) * (1 - fadeAll)}}>DIAGNÓSTICO · FILMC 360°</div>
      <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: 1 - fadeAll}}>
        {/* anel do método (ilustrativo) */}
        <circle cx={NODE.cx} cy={NODE.cy} r={R} fill="none" stroke="rgba(190,205,235,.16)" strokeWidth={1.5} strokeDasharray="4 10" opacity={pn} />
        {POS.map(([x, y], i) => <Connector key={i} d={`M ${NODE.cx} ${NODE.cy} L ${x} ${y}`} v={prog(f, tIn[i] + 4, 12, EASE_OUT)} width={2} opacity={.85} />)}
      </svg>
      {PILLARS.map((p, i) => <PillarCard key={p} f={f} start={tIn[i]} out={D - 22} cx={POS[i][0]} cy={POS[i][1]} w={300} h={104} label={p} size={30} />)}
      {/* ponto central DIAGNÓSTICO */}
      <div style={{position: 'absolute', left: NODE.cx - nodeW / 2, top: nodeY - nodeH / 2 + (1 - pn) * 20, width: nodeW, height: nodeH, borderRadius: lerp(46, 18, morph), opacity: pn,
        background: lerp(1, 0, morph) > .5 ? C.orange : 'linear-gradient(160deg, rgba(28,40,66,.92), rgba(14,24,44,.92))', border: `2px solid ${C.orange}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: lerp(30, 38, morph), letterSpacing: '.08em',
        color: morph > .5 ? '#fff' : C.navy, boxShadow: '0 20px 50px rgba(0,0,0,.45)'}}>DIAGNÓSTICO</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, opacity: 1 - fadeAll}}>
        <AnimatedHeadline f={f} start={wordAt('s3', 'margem') - 6} text="ENTENDER ANTES|DE [AGIR.]" size={84} align="center" />
      </div>
    </div>
  );
};
