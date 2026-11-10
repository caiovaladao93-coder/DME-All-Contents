import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {Plate} from '../components/Plates';
import {Scrim} from '../components/NavyStage';
import {Connector, PillarCard, Spark} from '../components/Cards';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {PLAN1} from './S3Diagnostico';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

const Y = [PLAN1.cy, PLAN1.cy + 250, PLAN1.cy + 500]; // 760 · 1010 · 1260

/** CENA 04 · Do diagnóstico ao plano: três blocos empilhados, linha e ponto luminoso; câmera separada do fluxo. */
export const S4Plano: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.s4.dur;
  const t2 = wordAt('s4', 'prioridades') - 6, t3 = wordAt('s4', 'plano') - 8;
  const sparkP = prog(f, t3 + 12, 26, EASE_IO);
  const sy = lerp(Y[0] + PLAN1.h / 2, Y[2] - PLAN1.h / 2, sparkP);
  const outline = prog(f, t3 + 36, 12, EASE_OUT);
  const ext = prog(f, D - 18, 18, EASE_IO); // a linha do último cartão desce e revela a próxima cena
  const half = PLAN1.h / 2;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <CinematicImage f={f} dur={D + 16} s0={1.04} s1={1.1} x0={30} x1={-30} y0={20} y1={-30}><Plate k="table" /></CinematicImage>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(3,10,26,.5)'}} />
      <Scrim top={0.7} bottom={0.6} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330}}>
        <AnimatedHeadline f={f} start={6} text="DIAGNÓSTICO QUE|[ORIENTA AÇÃO.]" size={76} align="center" />
      </div>
      <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
        <Connector d={`M 540 ${Y[0] + half} L 540 ${Y[1] - half}`} v={prog(f, t2 - 8, 12, EASE_OUT)} />
        <Connector d={`M 540 ${Y[1] + half} L 540 ${Y[2] - half}`} v={prog(f, t3 - 8, 12, EASE_OUT)} />
        <Connector d={`M 540 ${Y[2] + half} L 540 1920`} v={ext} width={3} />
      </svg>
      <PillarCard f={f} start={-20} cx={540} cy={Y[0]} w={PLAN1.w} h={PLAN1.h} label="DIAGNÓSTICO" size={38} />
      <PillarCard f={f} start={t2} cx={540} cy={Y[1]} w={PLAN1.w} h={PLAN1.h} label="PRIORIDADES" size={38} mask="down" />
      <PillarCard f={f} start={t3} cx={540} cy={Y[2]} w={PLAN1.w} h={PLAN1.h} label="PLANO DE AÇÃO" size={38} mask="down" outline={outline} />
      <Spark x={540} y={sy} o={sparkP > 0 && sparkP < 1 ? 1 : 0} />
    </div>
  );
};
