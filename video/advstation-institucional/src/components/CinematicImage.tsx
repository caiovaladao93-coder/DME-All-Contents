import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {camera} from '../theme/animation';
import {PendingTag} from './Atmosphere';

/**
 * CinematicImage — fotografia/vídeo com câmera virtual. Sem arquivo: marcador de revisão
 * (atmosfera marinho/âmbar + etiqueta "FOTOGRAFIA PENDENTE" com a direção do storyboard).
 */
export const CinematicImage: React.FC<{
  src: string | null; desc: string; dur: number; cam?: Parameters<typeof camera>[2];
  box?: {x: number; y: number; w: number; h: number; r?: number}; tagPos?: React.CSSProperties; startFrom?: number;
}> = ({src, desc, dur, cam, box, tagPos, startFrom = 0}) => {
  const f = useCurrentFrame();
  const inner = (
    <AbsoluteFill style={{transform: camera(f, dur, cam), transformOrigin: '50% 50%'}}>
      {src ? (/\.(mp4|mov|webm)$/i.test(src)
        ? <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />)
        : (
          <AbsoluteFill style={{background: 'linear-gradient(120deg,#1B2B47 0%,#14203A 45%,#241F1A 100%)'}}>
            <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 60% at 22% 40%, rgba(90,130,190,.28), rgba(0,0,0,0) 70%)'}} />
            <AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 50% at 78% 65%, rgba(194,155,60,.22), rgba(0,0,0,0) 70%)'}} />
            {/* linhas de perspectiva de mesa — apenas referência de composição */}
            <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, opacity: 0.25}}>
              <path d="M0 760 L1920 700 M0 1080 L700 760 M1920 1080 L1300 730" stroke="#8FA4C4" strokeWidth={2} fill="none" />
            </svg>
          </AbsoluteFill>
        )}
    </AbsoluteFill>
  );
  const content = (
    <>
      {inner}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,27,51,.35) 0%, rgba(14,27,51,0) 30%, rgba(14,27,51,0) 65%, rgba(14,27,51,.55) 100%)'}} />
      {!src ? <PendingTag kind="FOTOGRAFIA" desc={desc} style={{right: 24, top: 24, ...tagPos}} /> : null}
    </>
  );
  if (!box) return <AbsoluteFill style={{overflow: 'hidden'}}>{content}</AbsoluteFill>;
  return (
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r ?? 0, overflow: 'hidden',
      boxShadow: '0 30px 70px rgba(0,0,0,.45)'}}>{content}</div>
  );
};
