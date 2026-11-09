import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CinematicImage} from '../components/CinematicImage';
import {EditorialHeadline} from '../components/Editorial';
import {AnimatedStationLine, Seg} from '../components/StationMap';
import {PHOTOS} from '../data/assets';
import {SCENES} from '../data/storyboard';
import {C} from '../theme/colors';
import {EASE_IO, lerp, prog} from '../theme/animation';

// Linha dourada: tronco no terço inferior esquerdo que se divide em dois caminhos.
const TRUNK: Seg[] = [[[-30, 790], [200, 790], [480, 790], [700, 790]]];
const UP: Seg[] = [[[700, 790], [860, 790], [900, 600], [1080, 600]], [[1080, 600], [1400, 600], [1700, 600], [1990, 600]]];
const DOWN: Seg[] = [[[700, 790], [860, 790], [900, 930], [1080, 930]], [[1080, 930], [1400, 930], [1700, 930], [1990, 930]]];

/** CENA 01 — Cada benefício, um caminho. */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const trunk = prog(f, 0, 50, EASE_IO);
  const branch = lerp(0, 0.5, prog(f, 50, 65, EASE_IO)) + lerp(0, 0.5, prog(f, 190, 49, EASE_IO));
  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      <AbsoluteFill style={{opacity: prog(f, 0, 30)}}>
        <CinematicImage src={PHOTOS.s01.src} desc={PHOTOS.s01.desc} dur={SCENES.opening.dur + 18} cam={{s0: 1, s1: 1.06, x0: 35, x1: -35}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(14,27,51,.78) 0%, rgba(14,27,51,.35) 55%, rgba(14,27,51,.1) 100%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <AnimatedStationLine segs={TRUNK} draw={trunk} />
        {f >= 50 ? <AnimatedStationLine segs={UP} draw={branch} dotT={f > 120 ? Math.min(0.98, branch * 0.95) : null} /> : null}
        {f >= 50 ? <AnimatedStationLine segs={DOWN} draw={branch} dotT={f > 140 ? Math.min(0.98, branch * 0.9) : null} /> : null}
      </svg>
      <EditorialHeadline text="Cada benefício|tem seu [caminho]." start={115} x={150} y={230} width={1300} size={96} modes={['fade', 'mask']} lineStagger={14} exit={226} />
    </AbsoluteFill>
  );
};
