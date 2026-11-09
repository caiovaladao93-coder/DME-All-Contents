import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';

/** Fundo marinho institucional com luz âmbar discreta e textura mínima. */
export const NavyBackground: React.FC<{glow?: number}> = ({glow = 1}) => {
  const f = useCurrentFrame();
  const gx = 30 + Math.sin(f / 90) * 4;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 80% at ${gx}% 30%, rgba(40,66,112,${0.85 * glow}), rgba(22,40,74,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 50% at 82% 78%, rgba(194,155,60,${0.1 * glow}), rgba(194,155,60,0) 70%)`}} />
    </AbsoluteFill>
  );
};

/** Grão sutil (manual: opacidade 0,05) e vinheta radial escura. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = f % 12;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#g${seed})`} />
    </svg>
  );
};

export const DarkVignette: React.FC<{strength?: number}> = ({strength = 0.5}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(5,10,20,${strength}) 100%)`}} />
);

/** Etiqueta de pendência — visível de propósito na versão de revisão. */
export const PendingTag: React.FC<{kind: string; desc: string; style?: React.CSSProperties; light?: boolean}> = ({kind, desc, style, light}) => (
  <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 18px', borderRadius: 10, maxWidth: 560,
    background: light ? 'rgba(22,40,74,.88)' : 'rgba(10,18,34,.78)', border: '1.5px dashed rgba(194,155,60,.85)', ...style}}>
    <span style={{fontFamily: "'Nunito Sans', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '.22em', color: '#C29B3C'}}>{kind} PENDENTE</span>
    <span style={{fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 18, lineHeight: 1.3, color: '#E6EAF0'}}>{desc}</span>
  </div>
);
