import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CinematicImage} from '../components/CinematicImage';
import {AttendanceDesk, CommercialLaptop, ManagementScreen} from '../components/Illustrations';
import {SystemCard} from '../components/SystemCard';
import {ASSETS} from '../data/assets';
import {APP_BLOCKS} from '../data/scenes';
import {C} from '../theme/colors';
import {prog} from '../theme/motion';
import {FONT_UI, TITLE_STYLE} from '../theme/typography';

const Heading: React.FC<{f: number; title: string; sub: string; start: number}> = ({f, title, sub, start}) => {
  const e = prog(f, start, 16);
  const e2 = prog(f, start + 8, 16);
  return (
    <>
      <div style={{position: 'absolute', left: 90, width: 900, top: 300, textAlign: 'center', ...TITLE_STYLE, fontSize: 90, opacity: e,
        transform: `translateY(${((1 - e) * 26).toFixed(1)}px)`}}>{title}</div>
      <div style={{position: 'absolute', left: 90, width: 900, top: 412, textAlign: 'center', fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: '#C0C6CC',
        opacity: e2, transform: `translateY(${((1 - e2) * 18).toFixed(1)}px)`}}>{sub}</div>
      <div style={{position: 'absolute', left: 540 - 60 * e, top: 480, width: 120 * e, height: 3, background: C.accent}} />
    </>
  );
};

const Chip: React.FC<{label: string; on?: boolean}> = ({label, on}) => (
  <span style={{fontFamily: FONT_UI, fontWeight: 700, fontSize: 22, letterSpacing: '.08em', textTransform: 'uppercase', padding: '8px 14px', borderRadius: 20,
    color: on ? '#F4F6F8' : '#C0C6CC', background: on ? 'rgba(58,110,165,.55)' : 'rgba(192,198,204,.1)', border: '1px solid rgba(192,198,204,.25)'}}>{label}</span>
);

/* A — Atendimento: cartões de solicitações em cascata */
const BlockAtendimento: React.FC<{f: number; dur: number}> = ({f, dur}) => (
  <AbsoluteFill>
    <CinematicImage src={ASSETS.images.s06a ?? undefined} dur={dur} cam={{s0: 1.05, s1: 1.05, x0: 30, x1: -30}}><AttendanceDesk /></CinematicImage>
    <Heading f={f} title="ATENDIMENTO" sub="Informações mais organizadas." start={4} />
    {['Nova solicitação', 'Em andamento', 'Concluída'].map((s, i) => {
      const e = prog(f, 18 + i * 7, 16);
      return (
        <div key={i} style={{position: 'absolute', left: 140 + i * 18, top: 1130 + i * 92, width: 800 - i * 36, height: 80, borderRadius: 18, opacity: e,
          transform: `translateY(${((1 - e) * 40).toFixed(1)}px)`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px',
          background: 'linear-gradient(160deg,rgba(42,47,53,.97),rgba(26,29,33,.97))', border: '1px solid rgba(192,198,204,.2)', boxShadow: '0 20px 40px rgba(0,0,0,.5)'}}>
          <span style={{width: 40, height: 40, borderRadius: 10, background: i === 0 ? 'rgba(58,110,165,.6)' : 'rgba(192,198,204,.14)'}} />
          <span style={{flex: 1}}><span style={{display: 'block', height: 12, width: '64%', borderRadius: 6, background: 'rgba(192,198,204,.3)'}} />
            <span style={{display: 'block', height: 10, width: '40%', borderRadius: 5, marginTop: 8, background: 'rgba(192,198,204,.15)'}} /></span>
          <Chip label={s} on={i === 0} />
        </div>
      );
    })}
  </AbsoluteFill>
);

/* B — Comercial: três colunas de acompanhamento (sem números) */
const BlockComercial: React.FC<{f: number; dur: number}> = ({f, dur}) => (
  <AbsoluteFill>
    <CinematicImage src={ASSETS.images.s06b ?? undefined} dur={dur} cam={{s0: 1.0, s1: 1.06}}><CommercialLaptop /></CinematicImage>
    <Heading f={f} title="COMERCIAL" sub="Fluxos mais conectados." start={4} />
    {['Contato', 'Proposta', 'Negociação'].map((col, i) => {
      const e = prog(f, 14 + i * 9, 16);
      return (
        <div key={i} style={{position: 'absolute', left: 100 + i * 296, top: 1040, width: 280, height: 360, borderRadius: 18, opacity: e,
          transform: `translateY(${((1 - e) * 36).toFixed(1)}px)`, background: 'rgba(22,25,28,.9)', border: '1px solid rgba(192,198,204,.2)', padding: 16,
          boxShadow: '0 24px 50px rgba(0,0,0,.5)'}}>
          <div style={{fontFamily: FONT_UI, fontWeight: 700, fontSize: 24, letterSpacing: '.12em', textTransform: 'uppercase', color: '#E6EAEE'}}>{col}</div>
          <div style={{height: 3, width: 60, background: i === 1 ? C.accent : 'rgba(192,198,204,.35)', marginTop: 10, borderRadius: 2}} />
          {Array.from({length: 2}).map((_, k) => {
            const ek = prog(f, 26 + i * 9 + k * 5, 14);
            return <div key={k} style={{marginTop: 18, height: 110, borderRadius: 14, opacity: ek, background: 'linear-gradient(160deg,#2A2F35,#1E2226)',
              border: `1px solid ${i === 1 && k === 0 ? 'rgba(58,110,165,.9)' : 'rgba(192,198,204,.16)'}`, padding: 14}}>
              <div style={{height: 12, width: '70%', borderRadius: 6, background: 'rgba(192,198,204,.3)'}} />
              <div style={{height: 10, width: '46%', borderRadius: 5, marginTop: 10, background: 'rgba(192,198,204,.15)'}} />
            </div>;
          })}
        </div>
      );
    })}
  </AbsoluteFill>
);

/* C — Gestão: indicadores gráficos abstratos (sem percentuais) */
const BlockGestao: React.FC<{f: number; dur: number}> = ({f, dur}) => (
  <AbsoluteFill>
    <CinematicImage src={ASSETS.images.s06c ?? undefined} dur={dur} cam={{s0: 1.1, s1: 1.0}}><ManagementScreen /></CinematicImage>
    <Heading f={f} title="GESTÃO" sub="Mais clareza na operação." start={4} />
    {[
      {x: 100, y: 1090, w: 430, h: 300, v: 'chart'},
      {x: 550, y: 1090, w: 400, h: 300, v: 'line'},
    ].map((c, i) => {
      const e = prog(f, 16 + i * 7, 16);
      return (
        <div key={i} style={{position: 'absolute', inset: 0, opacity: e, transform: `translateY(${((1 - e) * 30).toFixed(1)}px)`}}>
          {c.v === 'chart' ? <SystemCard x={c.x} y={c.y} w={c.w} h={c.h} variant="chart" /> : null}
          {c.v === 'list' ? <SystemCard x={c.x} y={c.y} w={c.w} h={c.h} rows={3} /> : null}
          {c.v === 'line' ? (
            <SystemCard x={c.x} y={c.y} w={c.w} h={c.h} variant="blank">
              <svg width={380} height={200}><path d="M0 170 C60 150 90 160 130 120 S210 90 250 100 S330 40 380 30" fill="none" stroke={C.accent} strokeWidth={4}
                pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(f, 26 + i * 7, 30)} />
                <path d="M0 190 C80 180 160 175 240 160 S340 140 380 130" fill="none" stroke="rgba(192,198,204,.35)" strokeWidth={3} /></svg>
            </SystemCard>
          ) : null}
          {c.v === 'donut' ? (
            <SystemCard x={c.x} y={c.y} w={c.w} h={c.h} variant="blank">
              <svg width={380} height={190}><circle cx={110} cy={95} r={70} fill="none" stroke="rgba(192,198,204,.18)" strokeWidth={22} />
                <circle cx={110} cy={95} r={70} fill="none" stroke={C.accent} strokeWidth={22} pathLength={1} strokeDasharray={`${0.62 * prog(f, 30, 30)} 1`} transform="rotate(-90 110 95)" />
                {[0, 1, 2].map((k) => <rect key={k} x={220} y={50 + k * 36} width={[120, 90, 104][k]} height={14} rx={7} fill="rgba(192,198,204,.25)" />)}</svg>
            </SystemCard>
          ) : null}
        </div>
      );
    })}
  </AbsoluteFill>
);

export const Scene06Applications: React.FC = () => {
  const f = useCurrentFrame();
  const [A, B, Cc] = APP_BLOCKS;
  return (
    <AbsoluteFill style={{background: C.graphite2}}>
      <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
        {f < B.from ? <BlockAtendimento f={f - A.from} dur={A.dur + 10} /> : null}
        {f >= B.from && f < Cc.from ? <BlockComercial f={f - B.from} dur={B.dur + 10} /> : null}
        {f >= Cc.from ? <BlockGestao f={f - Cc.from} dur={Cc.dur} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
