import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE_IO, prog} from '../theme/motion';

/** Passagem de luz horizontal: segmento brilhante atravessa uma linha fina. Linguagem de transição comum ao filme. */
export const LightSweep: React.FC<{y: number; start: number; dur?: number; persist?: boolean; persistOpacity?: number; fadeOut?: {start: number; dur: number}; thickness?: number}> =
  ({y, start, dur = 22, persist = false, persistOpacity = 0.35, fadeOut, thickness = 2}) => {
    const f = useCurrentFrame();
    const p = prog(f, start, dur, EASE_IO);
    if (f < start) return null;
    const fo = fadeOut ? 1 - prog(f, fadeOut.start, fadeOut.dur) : 1;
    const head = -400 + p * 1880;
    return (
      <div style={{position: 'absolute', left: 0, top: y, width: 1080, height: thickness, opacity: fo}}>
        {persist ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: Math.max(0, Math.min(1080, head + 200)), height: thickness,
            background: `linear-gradient(90deg, rgba(58,110,165,0), rgba(160,190,225,${persistOpacity}) 20%, rgba(160,190,225,${persistOpacity}))`}} />
        ) : null}
        <div style={{position: 'absolute', left: head, top: -1, width: 400, height: thickness + 2,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(214,228,242,.95) 70%, #FFFFFF 92%, rgba(255,255,255,0))',
          boxShadow: '0 0 24px 6px rgba(90,140,200,.25)', opacity: p < 1 ? 1 : 0}} />
      </div>
    );
  };
