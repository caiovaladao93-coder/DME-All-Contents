import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE_IN, EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {Plate} from '../components/Plates';
import {Scrim} from '../components/NavyStage';
import {Connector, PillarCard} from '../components/Cards';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {SCENES} from '../data/storyboard';

const E = {cx: 540, cy: 760}, I = {cx: 780, cy: 1020}, A = {cx: 300, cy: 1020};

/** CENA 05 · Acompanhamento: ciclo Execução → Indicadores → Ajustes (ilustrativo, sem dados). */
export const S5Acompanhamento: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.s5.dur;
  const reveal = prog(f, 0, 18, EASE_IO); // revelação vinda da linha vertical da cena anterior
  const cardsOut = D - 22;
  const fo = 1 - prog(f, cardsOut, 14, EASE_IN);
  return (
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${((1 - reveal) * 50).toFixed(2)}% 0 ${((1 - reveal) * 50).toFixed(2)}%)`}}>
      <CinematicImage f={f} dur={D + 16} s0={1.1} s1={1.0} x0={-20} x1={0}><Plate k="workstation" /></CinematicImage>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(3,10,26,.5)'}} />
      <Scrim top={0.6} bottom={0.8} />
      <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: fo}}>
        <Connector d={`M ${E.cx + 120} ${E.cy + 50} Q ${I.cx + 40} ${E.cy + 40} ${I.cx} ${I.cy - 50}`} v={prog(f, 30, 16, EASE_OUT)} />
        <Connector d={`M ${I.cx - 170} ${I.cy + 20} L ${A.cx + 170} ${A.cy + 20}`} v={prog(f, 62, 16, EASE_OUT)} />
        <Connector d={`M ${A.cx} ${A.cy - 50} Q ${A.cx - 40} ${E.cy + 40} ${E.cx - 120} ${E.cy + 50}`} v={prog(f, 90, 16, EASE_OUT)} />
      </svg>
      <div style={{opacity: fo}}>
        <PillarCard f={f} start={14} cx={E.cx} cy={E.cy} w={330} h={100} label="EXECUÇÃO" size={30} />
        <PillarCard f={f} start={44} cx={I.cx} cy={I.cy} w={340} h={100} label="INDICADORES" size={30} />
        <PillarCard f={f} start={76} cx={A.cx} cy={A.cy} w={330} h={100} label="AJUSTES" size={30} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1210}}>
        <AnimatedHeadline f={f} start={104} text="ACOMPANHAR." size={84} align="center" />
        <AnimatedHeadline f={f} start={118} text="AJUSTAR." size={84} align="center" />
        <AnimatedHeadline f={f} start={132} text="[EVOLUIR.]" size={84} align="center" />
      </div>
    </div>
  );
};
