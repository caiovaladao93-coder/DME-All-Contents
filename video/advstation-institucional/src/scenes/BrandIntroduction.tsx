import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {BrandMark} from '../components/Brand';
import {EditorialHeadline} from '../components/Editorial';
import {AnimatedStationLine, CENTER, linePoint, LOWER, Station, UPPER} from '../components/StationMap';
import {C} from '../theme/colors';
import {EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';

// Linhas dispersas (posição inicial) que se organizam em arcos ao redor do centro.
const N = 12;
const DISP = Array.from({length: N}, (_, i) => {
  const a0 = (i / N) * Math.PI * 2;
  return {sx: 200 + ((i * 397) % 1500), sy: 120 + ((i * 263) % 820), rot: (i * 47) % 180, a0};
});

/** CENA 03 — Conheça a ADV Station. */
export const BrandIntroduction: React.FC = () => {
  const f = useCurrentFrame();
  const gather = prog(f, 0, 50, EASE_IO);
  const logo = prog(f, 50, 40, EASE_OUT);
  const shrink = prog(f, 196, 28, EASE_IO);
  const lines = prog(f, 200, 50, EASE_IO);
  const camS = lerp(1.06, 1, prog(f, 200, 60, EASE_IO));
  const pan = prog(f, 252, 30, EASE_IO);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      <AbsoluteFill style={{transform: `translate(${-420 * pan}px, ${120 * pan}px) scale(${camS * lerp(1, 1.12, pan)})`, transformOrigin: '50% 45%'}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {DISP.map((d, i) => {
            const r = 250;
            const a = d.a0 + gather * 0.3;
            const ex = CENTER[0] + Math.cos(a) * r, ey = CENTER[1] + Math.sin(a) * r;
            const x = lerp(d.sx, ex, gather), y = lerp(d.sy, ey, gather);
            const ang = lerp(d.rot, (a * 180) / Math.PI + 90, gather);
            return <line key={i} x1={x - 34} y1={y} x2={x + 34} y2={y} stroke={C.gold} strokeWidth={2} strokeLinecap="round"
              transform={`rotate(${ang} ${x} ${y})`} opacity={lerp(0.6, 0.35, gather) * (1 - shrink * 0.7)} />;
          })}
          <circle cx={CENTER[0]} cy={CENTER[1]} r={250} fill="none" stroke="rgba(194,155,60,.18)" strokeWidth={1.5} opacity={gather * (1 - shrink)} />
          <AnimatedStationLine segs={UPPER} draw={lines * 0.6} dotT={f > 236 ? lines * 0.58 : null} />
          <AnimatedStationLine segs={LOWER} draw={lines * 0.6} dotT={f > 240 ? lines * 0.56 : null} />
          {lines > 0.92 ? <Station p={linePoint(UPPER, 0.5)} label="MATERNIDADE LEGAL" labelSide="top" opacity={prog(f, 244, 10)} /> : null}
          {lines > 0.92 ? <Station p={linePoint(LOWER, 0.5)} label="PREVIDENCIÁRIO GERAL" labelSide="bottom" opacity={prog(f, 248, 10)} /> : null}
        </svg>
        {/* logo oficial (versão para fundo escuro): revelação por máscara de opacidade, sem animar partes internas */}
        <div style={{position: 'absolute', left: 0, right: 0, top: CENTER[1] - 175, display: 'flex', justifyContent: 'center',
          opacity: logo * (1 - shrink * 0.85), transform: `scale(${lerp(1, 0.55, shrink)})`, transformOrigin: '50% 175px',
          WebkitMaskImage: `radial-gradient(circle at 50% 45%, #000 ${(logo * 70).toFixed(1)}%, transparent ${(logo * 100).toFixed(1)}%)`,
          maskImage: `radial-gradient(circle at 50% 45%, #000 ${(logo * 70).toFixed(1)}%, transparent ${(logo * 100).toFixed(1)}%)`}}>
          <BrandMark size={230} variant="dark" nameSize={50} />
        </div>
      </AbsoluteFill>
      <EditorialHeadline text="Uma família de soluções|para a advocacia previdenciária." start={126} x={150} y={760} width={1620} size={56} align="center" lineStagger={10} exit={196} />
    </AbsoluteFill>
  );
};
