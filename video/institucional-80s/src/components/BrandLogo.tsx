import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE_IO, prog} from '../theme/motion';

// Geometria do arquivo oficial redesenhado em vetor (public/assets/brand/dme-logo.svg).
export const LOGO_PATHS = [
  'M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z',
  'M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z',
  'M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z',
  'M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z',
];

/** BrandLogoReveal — máscara horizontal + reflexo metálico. Sem rotação, sem partículas, sem deformação. */
export const BrandLogo: React.FC<{width: number; revealStart: number; revealDur?: number; sheenStart?: number; sheenDur?: number;
  techStart?: number; id: string; style?: React.CSSProperties}> = ({width, revealStart, revealDur = 30, sheenStart, sheenDur = 26, techStart, id, style}) => {
  const f = useCurrentFrame();
  const r = prog(f, revealStart, revealDur, EASE_IO);
  const s = sheenStart == null ? 0 : prog(f, sheenStart, sheenDur, EASE_IO);
  const te = techStart == null ? 1 : prog(f, techStart, 14);
  const h = (width * 610) / 750;
  return (
    <svg width={width} height={h} viewBox="0 0 750 610" style={{position: 'absolute', overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`steel-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" />
        </linearGradient>
        <linearGradient id={`sheen-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".6" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`reveal-${id}`}><rect x={-10} y={-10} width={(770 * r).toFixed(2)} height={640} /></clipPath>
        <clipPath id={`shape-${id}`}>{LOGO_PATHS.map((d, i) => <path key={i} d={d} />)}</clipPath>
      </defs>
      <g clipPath={`url(#reveal-${id})`}>
        {LOGO_PATHS.map((d, i) => <path key={'s' + i} d={d} fill="#2B3036" transform="translate(4,6)" />)}
        {LOGO_PATHS.map((d, i) => <path key={i} d={d} fill={`url(#steel-${id})`} stroke="#F2F4F6" strokeOpacity={0.35} strokeWidth={1.5} />)}
        {s > 0 && s < 1 ? (
          <rect x={-200 + s * 1100} y={0} width={160} height={500} fill={`url(#sheen-${id})`} clipPath={`url(#shape-${id})`} transform="skewX(-18)" />
        ) : null}
        <text x={14} y={592 + (1 - te) * 14} fontFamily="Manrope" fontWeight={600} fontSize={64} textLength={722} lengthAdjust="spacing" fill="#C0C6CC" opacity={te}>TECHNOLOGY</text>
      </g>
      {r > 0.02 && r < 0.98 ? <rect x={770 * r - 2} y={-20} width={3} height={650} fill="#EAF2FA" opacity={Math.sin(r * Math.PI)} /> : null}
    </svg>
  );
};
