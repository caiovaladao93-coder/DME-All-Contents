import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {RevealText, StaggeredWords} from '../components/AnimatedText';
import {CinematicImage} from '../components/CinematicImage';
import {DeskTop} from '../components/Illustrations';
import {lineReveal} from '../components/SceneTransition';
import {SystemCard} from '../components/SystemCard';
import {ASSETS} from '../data/assets';
import {ACCENT_TEXT, C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/motion';
import {TITLE_STYLE} from '../theme/typography';
import {HOOK_LINE_Y} from './Scene01Hook';

const TITLE_TOP = 300;

// Momento C: cartões pequenos (alguns duplicados = retrabalho)
const SMALL = [
  [110, 640, 0], [400, 600, 1], [690, 660, 0], [170, 900, 1], [560, 880, 0], [760, 960, 1], [120, 1160, 0], [430, 1130, 1], [700, 1210, 0],
] as const;
// Linha que tenta percorrer os cartões e encontra interrupções (trechos nulos = interrupção)
const TRACE: Array<[number, number]> = [[200, 700], [490, 660], [780, 720], [650, 940], [260, 960], [520, 1190], [790, 1270]];
const GAPS = new Set([2, 4]); // segmentos interrompidos

export const Scene02Problems: React.FC = () => {
  const f = useCurrentFrame();
  const conv = prog(f, 262, 34, EASE_IN); // convergência para o ponto central
  const convStyle = (x: number, y: number): React.CSSProperties => ({
    transform: `translate(${((540 - x) * conv).toFixed(1)}px, ${((960 - y) * conv).toFixed(1)}px) scale(${(1 - conv * 0.92).toFixed(3)})`,
    opacity: 1 - prog(f, 280, 16),
  });

  // A → B
  const aOut = prog(f, 84, 16, EASE_IO);
  // B → C (cartões grandes recuam e diminuem um pouco)
  const bShrink = prog(f, 178, 20, EASE_IO);

  // ponto que percorre a linha (pausa nas interrupções)
  const tp = prog(f, 196, 60, EASE_IO) * (TRACE.length - 1);
  const si = Math.min(TRACE.length - 2, Math.floor(tp));
  const sf = tp - si;
  const dot = [lerp(TRACE[si][0], TRACE[si + 1][0], GAPS.has(si) ? Math.min(sf, 0.45) : sf), lerp(TRACE[si][1], TRACE[si + 1][1], GAPS.has(si) ? Math.min(sf, 0.45) : sf)];

  return (
    <AbsoluteFill style={{clipPath: lineReveal(f, 0, 16, HOOK_LINE_Y), background: C.carbon}}>
      {/* ===== Momento A — processos manuais ===== */}
      {f < 104 ? (
        <AbsoluteFill style={{opacity: 1 - aOut, transform: `scale(${lerp(1, 1.06, aOut)})`}}>
          <CinematicImage src={ASSETS.images.s02a ?? undefined} dur={100} cam={{s0: 1.01, s1: 1.08, x0: 0, x1: -24, y0: 0, y1: -30}}>
            <DeskTop />
          </CinematicImage>
          {[[120, 760, 260, 150, 10], [680, 620, 280, 170, 18], [620, 1180, 300, 160, 26], [150, 1240, 240, 140, 34]].map(([x, y, w, h, s], i) => {
            const e = prog(f, s, 14);
            return <div key={i} style={{position: 'absolute', left: x, top: y + (1 - e) * 20, width: w, height: h, borderRadius: 16, opacity: e * 0.9,
              background: 'rgba(160,190,225,.08)', border: '1.5px solid rgba(200,220,240,.35)', boxShadow: '0 20px 40px rgba(0,0,0,.35)'}}>
              <div style={{height: 26, borderBottom: '1px solid rgba(200,220,240,.25)'}} />
            </div>;
          })}
          <RevealText start={10} dur={18} dx={-70} dy={0} blur={8} exit={80} style={{left: 90, width: 900, top: TITLE_TOP, textAlign: 'center', ...TITLE_STYLE, fontSize: 84}}>
            PROCESSOS MANUAIS
          </RevealText>
        </AbsoluteFill>
      ) : null}

      {/* ===== Momento B — sistemas desconectados ===== */}
      {f >= 86 ? (
        <AbsoluteFill style={{opacity: prog(f, 86, 14)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(38,75,113,.28), rgba(10,11,12,0) 70%)'}} />
          {[
            {x: 90, y: 620, w: 420, h: 280, t: 'Atendimento', d: 0, ph: 0},
            {x: 540, y: 760, w: 410, h: 280, t: 'Comercial', d: 6, ph: 1.7},
            {x: 210, y: 1040, w: 440, h: 280, t: 'Gestão', d: 12, ph: 3.1},
          ].map((c, i) => {
            const e = prog(f, 92 + c.d, 18);
            const fy = Math.sin(f * 0.05 + c.ph) * 6;
            const fx = Math.cos(f * 0.04 + c.ph) * 4;
            const sc = lerp(1, 0.82, bShrink);
            const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
            return (
              <div key={i} style={{position: 'absolute', inset: 0, ...convStyle(cx, cy)}}>
                <SystemCard x={c.x} y={c.y} w={c.w} h={c.h} title={c.t} rows={3}
                  style={{opacity: e * lerp(1, 0.55, bShrink), transform: `translate(${fx}px, ${(1 - e) * 40 + fy}px) scale(${sc})`, transformOrigin: 'center'}} />
              </div>
            );
          })}
          {/* linhas pontilhadas que não chegam a se conectar */}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, ...convStyle(540, 900)}}>
            {[[[510, 760], [545, 830], [560, 860], [600, 900]], [[430, 1040], [480, 990], [520, 960], [600, 1040]], [[300, 900], [320, 960], [330, 990], [340, 1040]]].map((seg, i) => {
              const p = prog(f, 112 + i * 6, 20, EASE_IO) * (1 - bShrink * 0.6);
              const [a, b, c2, d] = seg;
              return (
                <g key={i} stroke="rgba(192,198,204,.55)" strokeWidth={3} strokeDasharray="4 10" strokeLinecap="round" fill="none">
                  <line x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], p)} y2={lerp(a[1], b[1], p)} />
                  <line x1={d[0]} y1={d[1]} x2={lerp(d[0], c2[0], p)} y2={lerp(d[1], c2[1], p)} />
                </g>
              );
            })}
          </svg>
          {f < 186 ? (
            <div style={{position: 'absolute', left: 90, width: 900, top: TITLE_TOP, textAlign: 'center', ...TITLE_STYLE, fontSize: 80,
              opacity: prog(f, 96, 14) * (1 - prog(f, 172, 10, EASE_IN))}}>
              <div>SISTEMAS</div>
              <div style={{letterSpacing: `${lerp(0.22, -0.01, prog(f, 98, 34, EASE_IO)).toFixed(3)}em`, ...ACCENT_TEXT}}>DESCONECTADOS</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ===== Momento C — tempo perdido ===== */}
      {f >= 176 ? (
        <AbsoluteFill>
          {SMALL.map(([x, y, dup], i) => {
            const e = prog(f, 180 + i * 3, 14);
            const card = (dx: number, dy: number, op: number) => (
              <div style={{position: 'absolute', left: x + dx, top: y + dy, width: 220, height: 120, borderRadius: 14, opacity: op,
                background: 'linear-gradient(160deg,#2A2F35,#1A1D21)', border: '1px solid rgba(192,198,204,.22)', boxShadow: '0 16px 30px rgba(0,0,0,.45)', padding: 16}}>
                <div style={{height: 12, width: '70%', borderRadius: 6, background: 'rgba(192,198,204,.3)'}} />
                <div style={{height: 10, width: '50%', borderRadius: 5, marginTop: 10, background: 'rgba(192,198,204,.16)'}} />
                <div style={{height: 10, width: '62%', borderRadius: 5, marginTop: 10, background: 'rgba(192,198,204,.16)'}} />
              </div>
            );
            return (
              <div key={i} style={{position: 'absolute', inset: 0, ...convStyle(x + 110, y + 60), transform: `${convStyle(x + 110, y + 60).transform} translateY(${(1 - e) * 24}px)`}}>
                <div style={{opacity: e}}>
                  {dup ? card(16, 14, 0.55) : null}
                  {card(0, 0, 1)}
                </div>
              </div>
            );
          })}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, ...convStyle(540, 960)}}>
            {TRACE.slice(0, -1).map((a, i) => {
              const b = TRACE[i + 1];
              const p = prog(f, 196 + i * 8.5, 10, EASE_IO);
              const end = GAPS.has(i) ? 0.45 : 1;
              return <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], p * end)} y2={lerp(a[1], b[1], p * end)} stroke={C.accent} strokeWidth={4} strokeLinecap="round" opacity={0.9} />;
            })}
            {f >= 196 ? <circle cx={dot[0]} cy={dot[1]} r={10} fill="#DCE8F5" /> : null}
          </svg>
          <StaggeredWords text="[TEMPO] PERDIDO." start={192} stagger={5} size={88} exit={258} style={{top: TITLE_TOP}} />
        </AbsoluteFill>
      ) : null}

      {/* ponto de convergência que dá origem à cena 03 */}
      {f >= 270 ? <div style={{position: 'absolute', left: 540 - 8, top: 960 - 8, width: 16, height: 16, borderRadius: 8, background: '#F4F6F8',
        boxShadow: '0 0 30px 8px rgba(120,160,210,.35)', opacity: prog(f, 270, 14)}} /> : null}
    </AbsoluteFill>
  );
};
