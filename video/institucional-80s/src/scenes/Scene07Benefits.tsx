import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {StaggeredWords} from '../components/AnimatedText';
import {CinematicImage} from '../components/CinematicImage';
import {MonitorCalm} from '../components/Illustrations';
import {LightSweep} from '../components/LightSweep';
import {ASSETS} from '../data/assets';
import {ACCENT_TEXT, C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/motion';
import {TITLE_STYLE} from '../theme/typography';

const FG_CARDS: Array<[number, number, number]> = [[90, 560, 0], [720, 520, 8], [160, 1180, 16], [690, 1230, 24], [420, 1380, 32], [810, 860, 40], [60, 880, 48]];
const VALUES = [
  {w: 'TEMPO.', y: 600, from: [-140, -40], start: 126},
  {w: 'CLAREZA.', y: 760, from: [150, 30], start: 150},
  {w: 'CONTROLE.', y: 920, from: [-90, 70], start: 174},
];

export const Scene07Benefits: React.FC = () => {
  const f = useCurrentFrame();
  const scrim = prog(f, 112, 20) * 0.55;
  const align = prog(f, 210, 24, EASE_IO);
  const out = prog(f, 312, 18);
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      <CinematicImage src={ASSETS.images.s07 ?? undefined} dur={330} cam={{s0: 1.04, s1: 0.98}}><MonitorCalm /></CinematicImage>
      <AbsoluteFill style={{background: `rgba(6,7,8,${(0.2 + scrim).toFixed(3)})`}} />

      {/* cartões desconectados em primeiro plano que somem aos poucos */}
      {(ASSETS.images.s07 ? [] : FG_CARDS).map(([x, y, d], i) => {
        const gone = prog(f, 26 + d, 22, EASE_IN);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 200, height: 110, borderRadius: 14, opacity: (1 - gone) * 0.9 * prog(f, 0, 10),
          filter: `blur(${(gone * 10 + (i % 2) * 2).toFixed(1)}px)`, transform: `scale(${lerp(1, 0.9, gone)})`,
          background: 'linear-gradient(160deg,#2C3137,#1A1D21)', border: '1px solid rgba(192,198,204,.22)', boxShadow: '0 20px 40px rgba(0,0,0,.5)'}} />;
      })}

      {/* "TECNOLOGIA NÃO É MAIS COMPLEXIDADE." — COMPLEXIDADE com baixo contraste e dissolvendo */}
      {f < 124 ? (
        <>
          <StaggeredWords text="TECNOLOGIA|NÃO É MAIS" start={8} size={80} exit={110} style={{top: 640}} />
          <div style={{position: 'absolute', left: 90, width: 900, top: 820, textAlign: 'center', ...TITLE_STYLE, fontSize: 80,
            opacity: prog(f, 26, 16) * 0.42 * (1 - prog(f, 88, 26)), filter: `blur(${(prog(f, 88, 26) * 14).toFixed(1)}px)`,
            letterSpacing: `${lerp(-0.01, 0.12, prog(f, 88, 26)).toFixed(3)}em`}}>COMPLEXIDADE.</div>
        </>
      ) : null}

      {/* TEMPO. CLAREZA. CONTROLE. — cada palavra entra deslocada e assenta */}
      {VALUES.map((v, i) => {
        const e = prog(f, v.start, 20);
        const x = (1 - e) * v.from[0];
        const y = (1 - e) * v.from[1];
        return (
          <div key={v.w} style={{position: 'absolute', left: 90, width: 900, top: v.y, textAlign: 'center', ...TITLE_STYLE, fontSize: 108,
            opacity: e * (1 - out), transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`, filter: e < 0.98 ? `blur(${((1 - e) * 8).toFixed(1)}px)` : undefined,
            ...(i === 0 ? ACCENT_TEXT : {})}}>{v.w}</div>
        );
      })}
      {/* linhas finas que conectam as palavras */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
        {[[718, 762], [878, 922]].map(([a, b], i) => (
          <line key={i} x1={540} y1={a} x2={540} y2={a + (b - a) * prog(f, 214 + i * 8, 14, EASE_IO)} stroke={C.accent} strokeWidth={2} />
        ))}
        {[0, 1, 2].map((i) => <circle key={i} cx={540} cy={[712, 872, 1032][i]} r={5 * align} fill="#DCE8F5" />)}
      </svg>
      <LightSweep y={820} start={248} dur={30} thickness={2} />
    </AbsoluteFill>
  );
};
