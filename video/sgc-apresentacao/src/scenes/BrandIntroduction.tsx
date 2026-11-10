import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {BrandSignature} from '../components/BrandSignature';
import {OrangeAccentLine} from '../components/OrangeAccentLine';
import {SCENES} from '../data/storyboard';

/** Posição final do logo no canto superior esquerdo (as cenas de produto mantêm o logo ali). */
export const CORNER = {x: 72, y: 44, h: 112};
const CENTER = {h: 500, y: 150};

/** Fundo marinho das cenas de produto, com profundidade e luz laranja pontual. */
export const NavyStage: React.FC<{f: number; glowX?: number; glowY?: number}> = ({f, glowX = 1500, glowY = 820}) => (
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 80% at 50% 40%, #0F2A5E 0%, #0A2048 40%, #06142F 75%, #030A1A 100%)'}}>
    <div style={{position: 'absolute', left: glowX - 450 + Math.sin(f / 50) * 30, top: glowY - 450, width: 900, height: 900, borderRadius: '50%',
      background: 'radial-gradient(closest-side, rgba(248,106,20,.16), rgba(248,106,20,0))'}} />
    <div style={{position: 'absolute', inset: 0, opacity: .5, backgroundImage: 'linear-gradient(rgba(150,180,235,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(150,180,235,.05) 1px, transparent 1px)',
      backgroundSize: '80px 80px', WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000 20%, transparent 75%)'}} />
  </div>
);

export const BrandCorner: React.FC<{opacity?: number}> = ({opacity = 1}) =>
  <div style={{position: 'absolute', left: CORNER.x, top: CORNER.y, opacity}}><BrandSignature height={CORNER.h} part="mark" /></div>;

const PATHS = [
  'M -50 140 C 420 160, 700 420, 960 430', 'M -50 940 C 380 900, 720 520, 960 450', 'M 1970 120 C 1500 180, 1200 420, 960 430',
  'M 1970 980 C 1550 900, 1220 560, 960 450', 'M 700 -40 C 760 200, 880 360, 960 430', 'M 1240 1120 C 1180 860, 1040 560, 960 450',
];

export const BrandIntroduction: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.brand.dur;
  const fadeIn = prog(f, 0, 12);
  const lines = prog(f, 0, 45, EASE_IO);
  const reveal = prog(f, 40, 30, EASE_OUT); // máscara horizontal do centro para fora
  const toCorner = prog(f, D - 24, 24, EASE_IO); // vai para o canto (transição para a janela do produto)
  const cam = lerp(1.04, 1, prog(f, 0, D - 24, EASE_IO));
  const h = lerp(CENTER.h, CORNER.h * 700 / 700, toCorner);
  const w = h * 532 / 700;
  const x = lerp(960 - CENTER.h * 532 / 700 / 2, CORNER.x, toCorner);
  const y = lerp(CENTER.y, CORNER.y, toCorner);
  const tail = 1 - prog(f, D - 24, 12, EASE_IN);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
      <NavyStage f={f} glowX={960} glowY={450} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`}}>
        <svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0, opacity: tail * (1 - 0.6 * reveal)}}>
          {PATHS.map((d, i) => <path key={i} d={d} pathLength={1} fill="none" stroke={C.orange} strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray="1 1" strokeDashoffset={1 - prog(f, i * 3, 40, EASE_IO)} opacity={0.5 + 0.5 * (i % 2)} />)}
          <circle cx={960} cy={440} r={6 + 30 * lines} fill="none" stroke={C.orange} strokeWidth={2} opacity={lines * (1 - reveal)} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: tail}}>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 46, letterSpacing: '.22em', color: '#fff', paddingLeft: '.22em',
            opacity: prog(f, 76, 16), transform: `translateY(${(1 - prog(f, 76, 16)) * 18}px)`}}>DIAGNÓSTICO EMPRESARIAL</div>
          <OrangeAccentLine f={f} start={84} dur={20} width={520} x={960} y={78} align="center" />
        </div>
      </div>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, clipPath: `inset(0 ${(50 - 50 * reveal).toFixed(2)}% 0 ${(50 - 50 * reveal).toFixed(2)}%)`}}>
        <BrandSignature height={h} part={toCorner > 0.5 ? 'mark' : 'full'} />
      </div>
    </div>
  );
};
