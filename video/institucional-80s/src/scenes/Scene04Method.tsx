import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {MeetingBack, MeetingFront} from '../components/Illustrations';
import {lineReveal} from '../components/SceneTransition';
import {WorkflowDiagram} from '../components/WorkflowDiagram';
import {ASSETS} from '../data/assets';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/motion';
import {FONT_UI, TITLE_STYLE} from '../theme/typography';
import {BRAND_LINE_Y} from './Scene03BrandIntroduction';

const WORD_TOP = 330;

/** Palavra de etapa: entra subindo; sai por máscara vertical. */
const StepWord: React.FC<{word: string; start: number; exit?: number; icon?: React.ReactNode; rise?: number}> = ({word, start, exit, icon, rise = 40}) => {
  const f = useCurrentFrame();
  const e = prog(f, start, 18);
  const q = exit == null ? 0 : prog(f, exit, 12, EASE_IN);
  const ul = prog(f, start + 10, 18);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: WORD_TOP, textAlign: 'center',
      clipPath: `inset(0 0 ${(q * 100).toFixed(2)}% 0)`}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 26, opacity: e, transform: `translateY(${((1 - e) * rise).toFixed(2)}px)`,
        filter: e < 0.98 ? `blur(${((1 - e) * 6).toFixed(2)}px)` : undefined, ...TITLE_STYLE, fontSize: 92}}>
        {word}{icon}
      </div>
      <div style={{margin: '18px auto 0', height: 3, width: 420 * ul, background: C.accent, borderRadius: 2}} />
    </div>
  );
};

const AnalysisIcon: React.FC<{p: number}> = ({p}) => (
  <svg width={70} height={70} viewBox="0 0 24 24" style={{opacity: p}}>
    <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="#C0C6CC" strokeWidth={1.6} />
    <path d="M15 15l5 5" stroke="#C0C6CC" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M7.5 12.5 L9.5 10 L11.2 11.5 L13.5 8.5" fill="none" stroke="#3A6EA5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Scene04Method: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, 0, 300, EASE_IO);
  const out = prog(f, 286, 14, EASE_IN);
  const steps = ['ENTENDER', 'PLANEJAR', 'DESENVOLVER'];
  const active = f < 90 ? 0 : f < 180 ? 1 : 2;
  const reorg = prog(f, 184, 26, EASE_IO);
  return (
    <AbsoluteFill style={{clipPath: lineReveal(f, 0, 18, BRAND_LINE_Y), background: C.carbon, opacity: 1 - out}}>
      {/* travelling lateral ~60 px com duas camadas (parallax) */}
      {ASSETS.images.s04 ? (
        <AbsoluteFill style={{transform: `translateX(${lerp(20, -40, t)}px) scale(1.06)`}}><Img src={staticFile(ASSETS.images.s04)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
      ) : (
        <>
          <AbsoluteFill style={{transform: `translateX(${lerp(10, -15, t)}px) scale(1.04)`}}><MeetingBack /></AbsoluteFill>
          <AbsoluteFill style={{transform: `translateX(${lerp(30, -30, t)}px) scale(1.04)`}}><MeetingFront /></AbsoluteFill>
        </>
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,7,8,.82) 0%, rgba(6,7,8,.35) 34%, rgba(6,7,8,.25) 55%, rgba(6,7,8,.75) 100%)'}} />

      <StepWord word="ENTENDER" start={8} exit={84} icon={<AnalysisIcon p={prog(f, 22, 14)} />} />
      <StepWord word="PLANEJAR" start={96} exit={176} />
      <StepWord word="DESENVOLVER" start={186} rise={46} />

      {/* fluxograma (SVG stroke) — aparece em PLANEJAR e se organiza em DESENVOLVER */}
      {f >= 100 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${lerp(0, 40, reorg)}px)`, opacity: lerp(1, 0.75, reorg)}}>
          <div style={{position: 'absolute', left: 70, top: 760, width: 940, height: 300, borderRadius: 28, background: 'rgba(10,11,12,.72)',
            border: '1px solid rgba(192,198,204,.12)', opacity: prog(f, 100, 14)}} />
          <WorkflowDiagram start={104} x={90} y={780} scale={1} />
        </div>
      ) : null}

      {/* etapas numeradas, discretas */}
      <div style={{position: 'absolute', left: 90, top: 560, width: 900}}>
        {steps.map((s, i) => {
          const e = prog(f, 196 + i * 6, 14);
          const on = i === active;
          return (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 20, height: 62, opacity: e * (on ? 1 : 0.55),
              transform: `translateX(${((1 - e) * -30).toFixed(1)}px)`, fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, letterSpacing: '.16em', color: on ? '#F4F6F8' : '#C0C6CC'}}>
              <span style={{color: C.accent, width: 50}}>0{i + 1}</span>{s}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
