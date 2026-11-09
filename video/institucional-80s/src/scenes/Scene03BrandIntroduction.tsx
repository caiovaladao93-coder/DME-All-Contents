import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {UnderlineReveal} from '../components/AnimatedText';
import {BrandLogo} from '../components/BrandLogo';
import {C} from '../theme/colors';
import {EASE_IO, lerp, prog} from '../theme/motion';
import {FONT_TITLE, FONT_UI} from '../theme/typography';

export const BRAND_LINE_Y = 1086; // linha que se estende e revela a cena 04

// Arquitetura de linhas: simétrica, ortogonal + 45°, saindo do ponto central.
const PATHS: Array<{d: string; layer: 0 | 1; delay: number}> = [];
const NODES: Array<[number, number, number]> = [];
[-3, -2, -1, 0, 1, 2, 3].forEach((k) => {
  [-1, 1].forEach((s) => {
    const y = 960 + k * 64;
    const bend = 300 + Math.abs(k) * 46;
    const d = k === 0
      ? `M540 960 L${540 + s * 600} 960`
      : `M540 960 L${540 + s * 90} ${y} L${540 + s * bend} ${y} L${540 + s * (bend + 70)} ${y + Math.sign(k) * 70} L${540 + s * (bend + 70)} ${k < 0 ? -40 : 1960}`;
    PATHS.push({d, layer: Math.abs(k) % 2 === 0 ? 1 : 0, delay: Math.abs(k) * 4 + (s > 0 ? 2 : 0)});
    if (k !== 0 && Math.abs(k) % 2 === 0) NODES.push([540 + s * bend, y, Math.abs(k) * 4 + 8]);
  });
});

export const Scene03BrandIntroduction: React.FC = () => {
  const f = useCurrentFrame();
  const camS = lerp(1, 1.04, prog(f, 0, 240, EASE_IO));
  const dim = lerp(1, 0.35, prog(f, 60, 30));
  const move = prog(f, 150, 26, EASE_IO);
  const logoW = 560;
  const logoTop = 960 - (logoW * 610) / 750 / 2;
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(32,37,43,.9), rgba(10,11,12,0) 75%)'}} />
      {/* camadas de linhas com velocidades diferentes (profundidade) */}
      {[0, 1].map((layer) => (
        <svg key={layer} width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: dim * (layer ? 0.9 : 0.4),
          transform: `scale(${layer ? camS * 1.0 : 1 + (camS - 1) * 0.4})`, transformOrigin: '540px 960px'}}>
          {PATHS.filter((p) => p.layer === layer).map((p, i) => {
            const pr = prog(f, 2 + p.delay * (layer ? 1 : 1.4), layer ? 40 : 56, EASE_IO);
            return <path key={i} d={p.d} fill="none" stroke={layer ? 'rgba(160,190,225,.85)' : 'rgba(120,150,190,.6)'} strokeWidth={layer ? 2 : 1}
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pr} />;
          })}
          {layer ? NODES.map(([x, y, d], i) => (
            // nós que acendem nas dobras das linhas, em sequência
            <rect key={'n' + i} x={x - 5} y={y - 5} width={10} height={10} fill="#DCE8F5"
              opacity={prog(f, 24 + d * 1.6, 10) * (0.45 + 0.35 * Math.sin(f * 0.08 + i))} />
          )) : null}
        </svg>
      ))}
      {/* ponto central expandindo */}
      <div style={{position: 'absolute', left: 540 - 8, top: 952, width: 16, height: 16, borderRadius: 8, background: '#F4F6F8',
        transform: `scale(${lerp(1, 0, prog(f, 10, 20))})`, boxShadow: '0 0 30px 8px rgba(120,160,210,.35)'}} />

      {/* logo oficial: máscara horizontal + reflexo; depois sobe e reduz */}
      <AbsoluteFill style={{transform: `translateY(${lerp(0, -470, move).toFixed(1)}px) scale(${lerp(1, 0.62, move).toFixed(4)})`, transformOrigin: '540px 960px'}}>
        <div style={{position: 'absolute', left: 540 - 420, top: 960 - 300, width: 840, height: 600, background: 'radial-gradient(ellipse at center, rgba(10,11,12,.85), rgba(10,11,12,0) 70%)', opacity: prog(f, 56, 20)}} />
        <BrandLogo id="s03" width={logoW} revealStart={62} revealDur={30} sheenStart={96} sheenDur={28} style={{left: 540 - logoW / 2, top: logoTop}} />
      </AbsoluteFill>

      {/* frase */}
      <div style={{position: 'absolute', left: 90, width: 900, top: 880, textAlign: 'center', fontFamily: FONT_UI, fontWeight: 500, fontSize: 50, letterSpacing: '.06em',
        color: '#C0C6CC', opacity: prog(f, 172, 16), transform: `translateY(${(1 - prog(f, 172, 16)) * 20}px)`}}>OPERAÇÕES COMPLEXAS.</div>
      <div style={{position: 'absolute', left: 90, width: 900, top: 960, textAlign: 'center', fontFamily: FONT_UI, fontWeight: 700, fontSize: 64, letterSpacing: '.02em',
        color: '#F4F6F8', opacity: prog(f, 186, 16), transform: `translateY(${(1 - prog(f, 186, 16)) * 20}px)`}}>SISTEMAS INTELIGENTES.</div>
      <UnderlineReveal start={200} dur={18} x={150} y={BRAND_LINE_Y} width={780} thickness={3} extendTo={{start: 222, dur: 16}} />
      <span style={{fontFamily: FONT_TITLE, display: 'none'}} />
    </AbsoluteFill>
  );
};
