import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {camera} from '../theme/motion';

/**
 * CinematicImage — camada de "fotografia" com câmera virtual (escala + translação).
 * Se `src` existir em public/assets/images, usa a foto real (licenciada). Caso contrário,
 * renderiza a ilustração vetorial temporária (children). Ver ASSETS-PENDENTES.md.
 */
export const CinematicImage: React.FC<{
  src?: string; dur: number; cam?: Parameters<typeof camera>[2]; children?: React.ReactNode; grade?: string;
}> = ({src, dur, cam, children, grade}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: camera(f, dur, cam), transformOrigin: '50% 50%'}}>
        {src ? <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : children}
      </AbsoluteFill>
      {/* correção de cor comum: preto profundo + azul frio nas sombras */}
      <AbsoluteFill style={{background: grade ?? 'linear-gradient(180deg,rgba(6,7,8,.55) 0%,rgba(6,7,8,.05) 35%,rgba(6,7,8,.1) 65%,rgba(6,7,8,.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Granulação cinematográfica muito sutil e determinística. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = f % 12;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id={`grain${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
    </svg>
  );
};

/** Vinheta e luz ambiente comuns. */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.6}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
);
