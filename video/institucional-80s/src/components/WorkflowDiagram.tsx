import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IO, prog} from '../theme/motion';
import {FONT_UI} from '../theme/typography';

/** WorkflowDiagram — fluxograma vetorial desenhado por stroke-dashoffset. Nós sem dados. */
export const WorkflowDiagram: React.FC<{start: number; x: number; y: number; scale?: number; labels?: string[]; opacity?: number}> =
  ({start, x, y, scale = 1, labels, opacity = 1}) => {
    const f = useCurrentFrame();
    const d = (i: number, dur = 14) => prog(f, start + i * 8, dur, EASE_IO);
    const node = (i: number, nx: number, ny: number, w = 200, label?: string) => {
      const p = d(i);
      return (
        <g key={i} opacity={p}>
          <rect x={nx} y={ny} width={w} height={84} rx={18} fill="rgba(28,31,34,.85)" stroke={i === 2 ? C.accent : 'rgba(192,198,204,.6)'} strokeWidth={2.5}
            pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          {label ? <text x={nx + w / 2} y={ny + 52} textAnchor="middle" fontFamily={FONT_UI} fontWeight={700} fontSize={24} letterSpacing="2" fill="#E6EAEE">{label}</text> : null}
        </g>
      );
    };
    const edge = (i: number, path: string) => (
      <path key={'e' + i} d={path} fill="none" stroke={C.accent} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d(i, 12)} />
    );
    return (
      <svg width={900} height={260} viewBox="0 0 900 260" style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: '0 0', opacity, overflow: 'visible'}}>
        {node(0, 0, 88, 200, labels?.[0])}
        {edge(1, 'M200 130 L330 130')}
        {node(2, 330, 88, 240, labels?.[1])}
        {edge(3, 'M570 130 L620 130 L620 42 L700 42')}
        {edge(4, 'M570 130 L620 130 L620 218 L700 218')}
        {node(5, 700, 0, 200, labels?.[2])}
        {node(6, 700, 176, 200, labels?.[3])}
      </svg>
    );
  };
