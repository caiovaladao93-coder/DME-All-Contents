// Personagens 2D autorais em "recorte de papel" (formas geométricas com borda irregular e sombra deslocada; filtro #papel em Film.tsx).
// Origem nos pés (0,0); altura ≈ 700 px em s = 1. Animação pose a pose a 12 fps (tq).
import React from 'react';
import {C} from './theme/colors';

export type Who = 'voce' | 'mae' | 'cida' | 'leo';
export type Expr = 'neutro' | 'feliz' | 'choque' | 'desconfia' | 'calmo' | 'aflito';
export type Pose = 'parado' | 'correr' | 'dancar' | 'apontar' | 'cafe' | 'sacola' | 'costas' | 'celular' | 'bracos';

const LOOK: Record<Who, {skin: string; top: string; topDeep: string; pants: string; shoe: string}> = {
  voce: {skin: C.skinYou, top: C.yellow, topDeep: C.yellowDeep, pants: C.night3, shoe: C.cream},
  mae: {skin: C.skinMae, top: C.blue, topDeep: C.blueDeep, pants: C.blue, shoe: C.woodDeep},
  cida: {skin: C.skinCida, top: C.lilac, topDeep: '#7D70A8', pants: '#5B5470', shoe: C.ink},
  leo: {skin: C.skinLeo, top: C.cream, topDeep: C.cream3, pants: '#4A6FA5', shoe: C.cream},
};

const Limb: React.FC<{x: number; y: number; len: number; w: number; rot: number; fill: string; end?: React.ReactNode}> = ({x, y, len, w, rot, fill, end}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill={fill} />
    <g transform={`translate(0 ${len})`}>{end}</g>
  </g>
);

const Face: React.FC<{who: Who; expr: Expr; mouthOpen: boolean; blink: boolean; look: number}> = ({who, expr, mouthOpen, blink, look}) => {
  const ex = look * 10, ey = -645;
  const big = expr === 'choque';
  const eye = (x: number) => blink && !big
    ? <rect x={x + ex - 11} y={ey - 2} width={22} height={5} rx={2} fill={C.ink} />
    : big ? <g><circle cx={x + ex} cy={ey} r={17} fill={C.cream} /><circle cx={x + ex} cy={ey} r={8} fill={C.ink} /></g>
      : expr === 'desconfia' ? <rect x={x + ex - 12} y={ey - 4} width={24} height={9} rx={4} fill={C.ink} />
        : <circle cx={x + ex} cy={ey} r={10} fill={C.ink} />;
  const brow = (x: number, s: number) => {
    const r = expr === 'choque' ? -s * 8 : expr === 'desconfia' ? s * 14 : expr === 'aflito' ? -s * 16 : expr === 'calmo' ? 0 : -s * 4;
    const dy = expr === 'choque' ? -16 : 0;
    return <rect x={x + ex - 18} y={ey - 34 + dy} width={36} height={8} rx={4} fill={C.ink} transform={`rotate(${r} ${x + ex} ${ey - 30 + dy})`} />;
  };
  const my = -592;
  let mouth: React.ReactNode;
  if (mouthOpen) mouth = <ellipse cx={ex * .6} cy={my + 4} rx={big ? 16 : 20} ry={big ? 22 : 14} fill={C.ink} />;
  else if (big) mouth = <ellipse cx={ex * .6} cy={my + 6} rx={14} ry={20} fill={C.ink} />;
  else if (expr === 'feliz' || expr === 'calmo') mouth = <path d={`M${ex * .6 - 28} ${my - 4} Q${ex * .6} ${my + 24} ${ex * .6 + 28} ${my - 4}`} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />;
  else if (expr === 'aflito') mouth = <path d={`M${ex * .6 - 24} ${my + 10} Q${ex * .6} ${my - 10} ${ex * .6 + 24} ${my + 10}`} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />;
  else if (expr === 'desconfia') mouth = <rect x={ex * .6 - 6} y={my} width={34} height={8} rx={4} fill={C.ink} transform={`rotate(-8 ${ex * .6} ${my})`} />;
  else mouth = <rect x={ex * .6 - 20} y={my} width={40} height={8} rx={4} fill={C.ink} />;
  return (
    <g>
      {eye(-34)}{eye(34)}{brow(-34, 1)}{brow(34, -1)}{mouth}
      {who === 'mae' && <g fill="none" stroke={C.ink} strokeWidth={6}><circle cx={-34 + ex} cy={ey} r={26} /><circle cx={34 + ex} cy={ey} r={26} /><line x1={-8 + ex} x2={8 + ex} y1={ey} y2={ey} /></g>}
      {(expr === 'choque' || expr === 'aflito') && <path d="M88 -700 q10 22 0 34 q-12 -10 0 -34z" fill="#9FD3F0" />}
    </g>
  );
};

export const Person: React.FC<{who: Who; x: number; y: number; s?: number; t: number; expr?: Expr; talk?: boolean; pose?: Pose; flip?: boolean; look?: number; prop?: React.ReactNode}> =
  ({who, x, y, s = 1, t, expr = 'neutro', talk = false, pose = 'parado', flip = false, look = 0, prop}) => {
    const L = LOOK[who];
    const tq = Math.floor(t * 12) / 12; // pose a pose
    const blink = (Math.floor(tq * 12) % 47) < 2;
    const mouthOpen = talk && Math.floor(tq * 12) % 3 !== 0;
    const ph = tq * 2 * Math.PI * 2.2; // ciclo de corrida
    const bob = pose === 'correr' ? Math.abs(Math.sin(ph)) * -26 : pose === 'dancar' ? Math.abs(Math.sin(tq * Math.PI * 4)) * -22 : Math.sin(tq * 2.4) * 3;
    const tilt = pose === 'correr' ? 10 : pose === 'dancar' ? Math.sin(tq * Math.PI * 2) * 8 : 0;
    // pernas
    const legR = pose === 'correr' ? Math.sin(ph) * 40 : pose === 'dancar' ? Math.sin(tq * Math.PI * 4) * 14 : 0;
    // braços
    let aL = 8, aR = -8;
    if (pose === 'correr') { aL = -Math.sin(ph) * 55; aR = Math.sin(ph) * 55; }
    if (pose === 'dancar') { aL = 150 + Math.sin(tq * Math.PI * 4) * 20; aR = -150 - Math.cos(tq * Math.PI * 4) * 20; }
    if (pose === 'apontar') { aR = -95; }
    if (pose === 'cafe') { aR = 28; }
    if (pose === 'sacola') { aR = -40; }
    if (pose === 'celular') { aL = -150; aR = 150; }
    if (pose === 'bracos') { aL = 160; aR = -160; }
    const hand = <circle cx={0} cy={4} r={26} fill={L.skin} />;
    const back = pose === 'costas';
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#papel)">
        <ellipse cx={0} cy={6} rx={120} ry={18} fill={C.ink} opacity={.25} />
        <g transform={`translate(0 ${bob}) rotate(${tilt} 0 -300)`}>
          {/* pernas */}
          <Limb x={-40} y={-310} len={290} w={70} rot={legR} fill={L.pants} end={<ellipse cx={14} cy={8} rx={52} ry={24} fill={L.shoe} />} />
          <Limb x={40} y={-310} len={290} w={70} rot={-legR} fill={L.pants} end={<ellipse cx={14} cy={8} rx={52} ry={24} fill={L.shoe} />} />
          {who === 'leo' && <g transform={`translate(40 -310) rotate(${-legR})`}><path d="M-22 150 l18 -12 l14 16 l12 -10 l4 22 l-20 6 z" fill={C.cream} /></g>}
          {/* braço de trás */}
          <Limb x={-96} y={-500} len={210} w={52} rot={aL} fill={L.topDeep} end={hand} />
          {/* tronco */}
          <path d="M-110 -520 Q-118 -400 -96 -290 L96 -290 Q118 -400 110 -520 Q0 -556 -110 -520Z" fill={L.top} />
          {who === 'voce' && !back && <g><path d="M-40 -400 h80 v52 h-80z" fill={L.topDeep} /><line x1={-18} x2={-18} y1={-520} y2={-470} stroke={C.cream} strokeWidth={6} /><line x1={18} x2={18} y1={-520} y2={-470} stroke={C.cream} strokeWidth={6} /></g>}
          {who === 'voce' && back && <path d="M-96 -560 Q0 -470 96 -560 L80 -500 Q0 -450 -80 -500Z" fill={L.topDeep} />}
          {who === 'mae' && <g><path d="M-80 -470 h160 v190 h-160z" fill={C.cream} /><rect x={-50} y={-420} width={100} height={40} rx={6} fill={C.cream3} /></g>}
          {who === 'cida' && <g><rect x={30} y={-470} width={70} height={46} rx={6} fill={C.cream} /><rect x={40} y={-458} width={50} height={8} fill={C.ink} /><rect x={40} y={-442} width={34} height={6} fill={C.gray} /><path d="M-60 -540 Q-40 -380 -70 -300" stroke={C.yellow} strokeWidth={14} fill="none" /><path d="M60 -540 Q70 -440 40 -380" stroke={C.yellow} strokeWidth={14} fill="none" /></g>}
          {who === 'leo' && <path d="M-40 -530 Q0 -440 40 -530" stroke={C.yellow} strokeWidth={8} fill="none" />}
          {/* pescoço e cabeça */}
          <rect x={-24} y={-560} width={48} height={50} fill={L.skin} />
          {who === 'cida' && !back && Array.from({length: 11}, (_, i) => <circle key={i} cx={Math.cos(Math.PI + i * Math.PI / 10) * 96} cy={-650 + Math.sin(Math.PI + i * Math.PI / 10) * 92} r={36} fill="#F2F2F2" />)}
          <circle cx={0} cy={-640} r={96} fill={L.skin} />
          {back ? (
            who === 'voce' ? <path d="M-104 -640 Q-110 -760 0 -768 Q110 -760 104 -640 Q100 -560 0 -548 Q-100 -560 -104 -640Z" fill={L.topDeep} /> : <circle cx={0} cy={-650} r={98} fill={C.ink} />
          ) : (
            <g>
              {who === 'voce' && <path d="M-96 -660 Q-100 -748 0 -742 Q96 -746 96 -672 Q60 -706 0 -700 Q-50 -700 -96 -660Z" fill={C.ink} />}
              {who === 'mae' && <g><circle cx={0} cy={-760} r={44} fill="#4A3B33" /><path d="M-98 -630 Q-100 -740 0 -738 Q100 -740 98 -630 Q80 -700 0 -702 Q-80 -700 -98 -630Z" fill="#4A3B33" /></g>}
              {who === 'cida' && <path d="M-92 -680 Q0 -760 92 -680 Q60 -720 0 -722 Q-60 -720 -92 -680Z" fill="#F2F2F2" />}
              {who === 'leo' && <g><path d="M-100 -666 Q-96 -752 0 -752 Q96 -752 100 -666Z" fill={C.tomato} /><rect x={-150} y={-684} width={80} height={22} rx={10} fill={C.tomato} /></g>}
              <Face who={who} expr={expr} mouthOpen={mouthOpen} blink={blink} look={look} />
            </g>
          )}
          {/* braço da frente */}
          <Limb x={96} y={-500} len={210} w={52} rot={aR} fill={L.top} end={<g>{hand}{prop}</g>} />
        </g>
      </g>
    );
  };
