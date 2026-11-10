import React from 'react';
import {C} from '../theme/colors';
import {EASE_OUT, prog} from '../theme/animation';

/** Linha laranja de 3 px que cresce na horizontal. */
export const OrangeAccentLine: React.FC<{f: number; start: number; dur?: number; width: number; x: number; y: number; align?: 'left' | 'center'; h?: number}> =
  ({f, start, dur = 18, width, x, y, align = 'left', h = 3}) => {
    const p = prog(f, start, dur, EASE_OUT);
    const w = width * p;
    return <div style={{position: 'absolute', left: align === 'center' ? x - w / 2 : x, top: y, width: w, height: h, borderRadius: h, background: C.orange}} />;
  };
