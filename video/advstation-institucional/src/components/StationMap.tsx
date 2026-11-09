import React from 'react';
import {C} from '../theme/colors';
import {SANS} from '../theme/typography';

/*
 * StationMap — o elemento-assinatura do filme: duas linhas douradas finas, cada uma com sua estação.
 * Linha superior = Maternidade Legal; inferior = Previdenciário Geral.
 * Metáfora visual de dois caminhos da mesma marca — NÃO representa integração técnica.
 * Curvas cúbicas calculadas em JS (posição de pontos determinística, sem medir DOM).
 */
export type Pt = [number, number];
export type Seg = [Pt, Pt, Pt, Pt]; // cúbica

export const segPoint = ([a, b, c, d]: Seg, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};
export const pathD = (segs: Seg[]) => segs.map((s, i) => `${i === 0 ? `M${s[0][0]} ${s[0][1]} ` : ''}C${s[1][0]} ${s[1][1]} ${s[2][0]} ${s[2][1]} ${s[3][0]} ${s[3][1]}`).join(' ');
/** ponto ao longo de uma linha com vários segmentos (t 0..1 uniforme por segmento) */
export const linePoint = (segs: Seg[], t: number): Pt => {
  const x = Math.min(0.9999, Math.max(0, t)) * segs.length;
  const i = Math.floor(x);
  return segPoint(segs[i], x - i);
};

export const Station: React.FC<{p: Pt; scale?: number; label?: string; labelSide?: 'right' | 'left' | 'top' | 'bottom'; opacity?: number; labelOpacity?: number}> =
  ({p, scale = 1, label, labelSide = 'right', opacity = 1, labelOpacity = 1}) => (
    <g opacity={opacity} transform={`translate(${p[0]} ${p[1]}) scale(${scale})`}>
      <circle r={22} fill="rgba(194,155,60,.14)" />
      <circle r={13} fill={C.navy} stroke={C.gold} strokeWidth={3} />
      <circle r={4.5} fill={C.gold} />
      {label ? (
        <text x={labelSide === 'right' ? 34 : labelSide === 'left' ? -34 : 0} y={labelSide === 'top' ? -36 : labelSide === 'bottom' ? 46 : 8}
          textAnchor={labelSide === 'right' ? 'start' : labelSide === 'left' ? 'end' : 'middle'} fontFamily={SANS} fontWeight={800} fontSize={22} letterSpacing="4.5"
          fill={C.white} opacity={labelOpacity}>{label}</text>
      ) : null}
    </g>
  );

/** AnimatedStationLine — desenho por stroke-dashoffset + ponto lento opcional. */
export const AnimatedStationLine: React.FC<{segs: Seg[]; draw: number; width?: number; dotT?: number | null; opacity?: number; from?: number}> =
  ({segs, draw, width = 3, dotT = null, opacity = 1, from = 0}) => {
    const dp = dotT != null ? linePoint(segs, dotT) : null;
    return (
      <g opacity={opacity}>
        <path d={pathD(segs)} fill="none" stroke="rgba(194,155,60,.18)" strokeWidth={width + 6} strokeLinecap="round" pathLength={1}
          strokeDasharray={`${Math.max(0, draw - from)} 2`} strokeDashoffset={-from} />
        <path d={pathD(segs)} fill="none" stroke={C.gold} strokeWidth={width} strokeLinecap="round" pathLength={1}
          strokeDasharray={`${Math.max(0, draw - from)} 2`} strokeDashoffset={-from} />
        {dp ? <circle cx={dp[0]} cy={dp[1]} r={6} fill="#F1DCA6" /> : null}
      </g>
    );
  };

// Geometria padrão do mapa central (cena 03 e reaproveitada nas transições).
export const CENTER: Pt = [960, 470];
export const UPPER: Seg[] = [[CENTER, [1100, 470], [1180, 300], [1420, 300]], [[1420, 300], [1600, 300], [1760, 300], [2060, 300]]];
export const LOWER: Seg[] = [[CENTER, [1100, 470], [1180, 640], [1420, 640]], [[1420, 640], [1600, 640], [1760, 640], [2060, 640]]];
