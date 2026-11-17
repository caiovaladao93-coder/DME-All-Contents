// Série "O BILHETE" · Ep. 1 "A calça" (9:16). Personagens 2D autorais em recorte de papel.
// Todos os tempos vêm de src/data/timeline.json (falas reais). História, nomes e valores são fictícios.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {Person} from './Person';
import {C} from './theme/colors';
import {HEAD, MONO, UI, loadFonts} from './theme/typography';

type Word = [string, number, number];
type Cap = {start: number; end: number; words: Word[]; text: string; scene: string; voz: string};
const SC: Record<string, {key: string; fala: string; t0: number; t1: number; v0: number; v1: number}> = Object.fromEntries(TL.scenes.map((s) => [s.key, s]));
const WORDS = TL.words as unknown as Record<string, Word[]>;
const CAPS = TL.captions as unknown as Cap[];

// ── utilitários
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t: number, a: number, d: number) => clamp((t - a) / d);
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (x: number) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const norm = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const W = (k: string, w: string, nth = 0) => { const h = (WORDS[k] || []).filter((x) => norm(x[0]) === norm(w)); return (h[nth] || h[0] || [w, SC[k].v0, SC[k].v0])[1]; };
const WE = (k: string, w: string, nth = 0) => { const h = (WORDS[k] || []).filter((x) => norm(x[0]) === norm(w)); return (h[nth] || h[0] || [w, SC[k].v0, SC[k].v1])[2]; };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
const talking = (k: string, t: number) => (WORDS[k] || []).some((w) => t >= w[1] - .03 && t <= w[2] + .03);

// ── relógio da história (sábado)
const KEYS: Array<[number, number]> = [[SC.corrida.v0, 16 * 60 + 20], [SC.bazar.t0, 17 * 60 + 38], [SC.capacete.t1, 17 * 60 + 52], [SC.festa.t0, 19 * 60 + 40], [SC.caminhao.t0, 19 * 60 + 52]];
const T_COUNT0 = SC.escolha.t0 + .25, T_END = T_COUNT0 + 10;
const storyMin = (t: number) => {
  t = Math.min(t, T_END);
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) { const [a, ma] = KEYS[i], [b, mb] = KEYS[i + 1]; if (t < b) return ma + (mb - ma) * ((t - a) / (b - a)); }
  const [a, ma] = KEYS[KEYS.length - 1]; return ma + (t - a) / 60;
};
const hhmm = (m: number) => `${pad2(m / 60)}:${pad2(m % 60)}`;
const hms = (sec: number) => `${pad2(sec / 3600)}:${pad2((sec % 3600) / 60)}:${pad2(sec % 60)}`;

// ── peças comuns
const Txt: React.FC<{x: number; y: number; s: number; f?: string; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; ls?: number; o?: number; children: React.ReactNode; it?: boolean; rot?: number}> = ({x, y, s, f = UI, w = 700, c = C.ink, a = 'start', ls = 0, o = 1, children, it, rot = 0}) => (
  <text x={x} y={y} fontSize={s} fontFamily={f} fontWeight={w} fill={c} textAnchor={a} letterSpacing={ls} opacity={o} fontStyle={it ? 'italic' : 'normal'} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{children}</text>
);
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => <g filter="url(#papel)">{children}</g>;
const Stamp: React.FC<{x: number; y: number; t: number; at: number; text: string; s?: number; rot?: number; c?: string}> = ({x, y, t, at, text, s = 64, rot = -9, c = C.tomato}) => {
  const k = p(t, at, .16); if (k <= 0) return null;
  const sc = mix(2.1, 1, eo(k)); const wdt = text.length * s * .68 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={clamp(k * 3)}>
      <rect x={-wdt / 2} y={-s * .95} width={wdt} height={s * 1.35} rx={10} fill="none" stroke={c} strokeWidth={7} />
      <Txt x={0} y={s * .1} s={s} f={HEAD} w={800} c={c} a="middle" ls={3}>{text}</Txt>
    </g>
  );
};
const Tag: React.FC<{x: number; y: number; t: number; at: number; text: string; bg?: string; fg?: string; rot?: number}> = ({x, y, t, at, text, bg = C.cream, fg = C.ink, rot = -3}) => {
  const k = back(p(t, at, .3)); if (p(t, at, .3) <= 0) return null; const w = text.length * 21 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      <Paper><rect x={-w / 2} y={-38} width={w} height={64} rx={6} fill={bg} /></Paper>
      <Txt x={0} y={6} s={32} f={MONO} w={800} c={fg} a="middle" ls={1}>{text}</Txt>
    </g>
  );
};
const Ticket: React.FC<{x: number; y: number; s?: number; rot?: number; checks?: number}> = ({x, y, s = 1, rot = 0, checks = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Paper><rect x={-170} y={-90} width={340} height={180} rx={6} fill={C.cream} /></Paper>
    <rect x={-170} y={-90} width={340} height={40} fill={C.green} />
    <Txt x={0} y={-60} s={22} f={MONO} w={800} c={C.cream} a="middle" ls={4}>BILHETE · LOTERIA</Txt>
    {NUMS.map((n, i) => (
      <g key={n} transform={`translate(${-125 + i * 50} 0)`}>
        <Txt x={0} y={10} s={28} f={MONO} w={800} c={C.ink} a="middle">{n}</Txt>
        {i < checks && <circle cx={0} cy={0} r={22} fill="none" stroke={C.green} strokeWidth={5} />}
      </g>
    ))}
    <rect x={-140} y={40} width={280} height={14} fill={C.ink} opacity={.7} />
    {Array.from({length: 18}, (_, i) => <rect key={i} x={-140 + i * 16} y={60} width={i % 3 ? 6 : 10} height={16} fill={C.ink} opacity={.7} />)}
  </g>
);
const NUMS = ['07', '13', '22', '35', '41', '58'];
const Jeans: React.FC<{x: number; y: number; s?: number; rot?: number; rip?: boolean; ticket?: boolean; c?: string}> = ({x, y, s = 1, rot = 0, rip = true, ticket = false, c = C.blue}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Paper>
      <path d="M-110 -200 H110 L120 200 H20 L0 -40 L-20 200 H-120Z" fill={c} />
      <rect x={-110} y={-200} width={220} height={30} fill={C.blueDeep} />
    </Paper>
    <path d="M-100 -150 Q-60 -120 -30 -160" fill="none" stroke={C.blueDeep} strokeWidth={6} />
    <path d="M100 -150 Q60 -120 30 -160" fill="none" stroke={C.blueDeep} strokeWidth={6} />
    {ticket && <g transform="translate(-74 -168) rotate(-12)"><rect x={-24} y={-26} width={48} height={34} fill={C.cream} /><rect x={-24} y={-26} width={48} height={9} fill={C.green} /></g>}
    {rip && <path d="M50 70 l14 -10 l12 12 l14 -8 l2 18 l-18 8 l-14 -6 z" fill={C.cream} />}
  </g>
);
const Bag: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Paper><path d="M-120 -140 H120 L140 140 H-140Z" fill={C.cream2} /></Paper>
    <path d="M-60 -140 Q0 -220 60 -140" fill="none" stroke={C.cream3} strokeWidth={14} />
    <Txt x={0} y={20} s={46} f={HEAD} w={800} c={C.tomato} a="middle" rot={-4}>DOAÇÃO</Txt>
  </g>
);
const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; shake?: number}> = ({x, y, s = 1, rot = 0, children, shake = 0}) => (
  <g transform={`translate(${x + shake * Math.sin(x + shake * 97)} ${y}) rotate(${rot}) scale(${s})`}>
    <Paper><rect x={-190} y={-360} width={380} height={720} rx={50} fill={C.ink} /></Paper>
    <rect x={-170} y={-338} width={340} height={676} rx={36} fill={C.night2} />
    {children}
  </g>
);

// ── fundos
const Kitchen: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill={C.cream2} />
    {Array.from({length: 9}, (_, i) => Array.from({length: 5}, (_, j) => <rect key={`${i}-${j}`} x={60 + i * 110} y={520 + j * 110} width={100} height={100} fill={C.cream} opacity={.55} />))}
    <Paper><rect x={-20} y={1120} width={1120} height={60} fill={C.wood} /><rect x={-20} y={1180} width={1120} height={800} fill={C.woodDeep} /></Paper>
    <Paper><rect x={720} y={500} width={260} height={200} rx={8} fill="#9FC3D8" /></Paper>
    <rect x={844} y={500} width={12} height={200} fill={C.cream} /><rect x={720} y={594} width={260} height={12} fill={C.cream} />
  </g>
);
const Night: React.FC<{c?: string}> = ({c = C.night}) => <rect width={1080} height={1920} fill={c} />;

// ── CENAS ─────────────────────────────────────────────────────────────────────

// 1 · Gancho: TV com o prêmio (legível no quadro 0) → bolas conferem o bilhete → corte para a mãe com a sacola de DOAÇÃO
const Gancho: React.FC<{t: number}> = ({t}) => {
  const tMae = W('gancho', 'e') - .05, kM = p(t, tMae, .12);
  const n0 = SC.gancho.v0 + .25, nd = (W('gancho', 'loteria…') - n0) / 6;
  const shown = clamp(Math.floor((t - n0) / nd) + 1, 0, 6);
  if (t < tMae) return (
    <g>
      <Night />
      <Paper><rect x={60} y={480} width={960} height={600} rx={36} fill={C.ink} /></Paper>
      <rect x={90} y={510} width={900} height={540} rx={20} fill={C.night2} />
      <Txt x={540} y={600} s={34} f={MONO} w={800} c={C.yellow} a="middle" ls={6}>RESULTADO · SORTEIO 2.847</Txt>
      <Txt x={540} y={740} s={118} f={HEAD} w={800} c={C.green} a="middle" ls={-2}>R$ 48 MILHÕES</Txt>
      <Txt x={540} y={800} s={34} f={MONO} w={800} c={C.cream} a="middle" ls={4}>1 GANHADOR</Txt>
      {NUMS.map((n, i) => {
        const k = back(p(t, n0 + i * nd, .22));
        return (
          <g key={n} transform={`translate(${190 + i * 140} ${mix(760, 940, k)})`} opacity={clamp(k * 4)}>
            <circle r={58} fill={C.cream} /><circle r={58} fill="none" stroke={C.green} strokeWidth={8} />
            <Txt x={0} y={16} s={50} f={MONO} w={800} c={C.ink} a="middle">{n}</Txt>
          </g>
        );
      })}
      <rect x={480} y={1080} width={120} height={60} fill={C.ink} />
      <Ticket x={540} y={1260} s={1.25} rot={-4} checks={shown} />
    </g>
  );
  const zoom = eo(p(t, W('gancho', 'doou') - .1, .5));
  return (
    <g transform={`translate(540 900) scale(${mix(1.08, 1, eo(kM)) + zoom * .05}) translate(-540 -900)`}>
      <Kitchen />
      <Person who="mae" x={640} y={1300} s={1.05} t={t} expr="feliz" pose="sacola" prop={<Bag x={20} y={120} s={.6} rot={40} />} />
      <Person who="voce" x={260} y={1340} s={1.0} t={t} expr="choque" look={1} />
    </g>
  );
};

// 2 · Ficha do protagonista
const Ficha: React.FC<{t: number}> = ({t}) => {
  const t0 = SC.ficha.t0, k = back(p(t, t0, .4));
  return (
    <g>
      <Night c={C.night2} />
      <g transform={`translate(540 860) rotate(${mix(-12, -2, eo(p(t, t0, .4)))}) scale(${k})`}>
        <Paper><rect x={-430} y={-380} width={860} height={760} rx={20} fill={C.cream} /></Paper>
        <rect x={-430} y={-380} width={860} height={90} rx={20} fill={C.yellow} />
        <Txt x={-390} y={-320} s={36} f={MONO} w={800} c={C.ink} ls={6}>FICHA · PROTAGONISTA</Txt>
        <rect x={-390} y={-250} width={330} height={420} rx={14} fill={C.night3} />
        <svg x={-390} y={-250} width={330} height={420} viewBox="-165 -810 330 420"><Person who="voce" x={0} y={0} s={1} t={t} expr="aflito" /></svg>
        <Txt x={-20} y={-180} s={84} f={HEAD} w={800} c={C.ink}>VOCÊ</Txt>
        <g opacity={eo(p(t, W('ficha', 'Vinte'), .2))}><Txt x={-20} y={-90} s={40} f={MONO} w={800} c={C.ink}>27 ANOS</Txt></g>
        <g opacity={eo(p(t, W('ficha', 'Saldo'), .2))}>
          <Txt x={-20} y={10} s={30} f={MONO} w={700} c={C.gray}>SALDO NA CONTA</Txt>
          <Txt x={-20} y={84} s={64} f={MONO} w={800} c={C.tomato}>R$ 312,40</Txt>
        </g>
        <Stamp x={0} y={290} t={t} at={WE('ficha', 'reais.') + .1} text="MILIONÁRIO?" s={70} rot={-6} c={C.green} />
      </g>
    </g>
  );
};

// 3 · Flashback em três quadros (ontem)
const Flash: React.FC<{t: number}> = ({t}) => {
  const a = [SC.flash.t0, W('flash', 'bolso'), W('flash', 'Aquela')];
  const panel = (i: number, y: number, children: React.ReactNode) => {
    const k = back(p(t, a[i], .3)); if (p(t, a[i], .3) <= 0) return null;
    return (
      <g transform={`translate(540 ${y}) rotate(${[-2, 1.5, -1][i]}) scale(${k})`}>
        <Paper><rect x={-430} y={-140} width={860} height={280} fill={C.cream} /></Paper>
        <rect x={-414} y={-124} width={828} height={248} fill={C.cream2} />
        <svg x={-414} y={-124} width={828} height={248} viewBox="-414 -124 828 248">{children}</svg>
      </g>
    );
  };
  const zk = eo(p(t, W('flash', 'joelho.') - .2, .4));
  return (
    <g>
      <Night />
      <Txt x={540} y={500} s={34} f={MONO} w={800} c={C.yellow} a="middle" ls={8}>ONTEM</Txt>
      {panel(0, 690, <g><line x1={-414} x2={414} y1={-80} y2={-80} stroke={C.ink} strokeWidth={4} /><Jeans x={-120} y={70} s={.6} /><rect x={-150} y={-90} width={16} height={30} fill={C.wood} /><rect x={-100} y={-90} width={16} height={30} fill={C.wood} /><Txt x={180} y={10} s={36} f={HEAD} w={800} c={C.ink} a="middle">no varal</Txt></g>)}
      {panel(1, 990, <g><Jeans x={-60} y={180} s={1.2} ticket /><Txt x={240} y={10} s={36} f={HEAD} w={800} c={C.ink} a="middle">no bolso</Txt><circle cx={-148} cy={-48} r={64} fill="none" stroke={C.green} strokeWidth={8} /></g>)}
      {panel(2, 1290, <g transform={`scale(${1 + zk * .5}) translate(${-zk * 80} ${-zk * 20})`}><Jeans x={-160} y={60} s={.55} rot={90} /><Bag x={180} y={20} s={.6} /><circle cx={-120} cy={30} r={50} fill="none" stroke={C.tomato} strokeWidth={8} opacity={zk} /></g>)}
    </g>
  );
};

// 4 · A mãe explica, tomando café
const Mae: React.FC<{t: number}> = ({t}) => {
  const steam = Math.floor(t * 12) % 4;
  return (
    <g>
      <Kitchen />
      <Person who="voce" x={300} y={1330} s={.95} t={t} expr="choque" look={1} />
      <Person who="mae" x={720} y={1300} s={1.08} t={t} expr="calmo" talk={talking('mae', t)} pose="cafe" look={-1}
        prop={<g transform="rotate(-28) translate(-30 10)"><Paper><rect x={-36} y={-10} width={72} height={78} rx={8} fill={C.tomato} /></Paper><path d={`M-10 ${-30 - steam * 4} q12 -20 0 -40`} stroke={C.cream} strokeWidth={6} fill="none" opacity={.8} /></g>} />
    </g>
  );
};

// 5 · Corrida pela rua: relógio "bazar fecha às 18h"
const Corrida: React.FC<{t: number}> = ({t}) => {
  const run = t >= W('corrida', 'Você') - .1, sp = (t - SC.corrida.t0) * (run ? 900 : 120);
  return (
    <g>
      <Night c={C.night2} />
      <g transform={`translate(${-(sp * .3) % 400} 0)`}>{Array.from({length: 5}, (_, i) => <Paper key={i}><rect x={i * 400} y={760 - (i % 2) * 120} width={340} height={500 + (i % 2) * 120} fill={i % 2 ? C.night3 : C.blueDeep} /></Paper>)}
        {Array.from({length: 5}, (_, i) => Array.from({length: 3}, (_, j) => <rect key={`${i}${j}`} x={i * 400 + 50 + j * 100} y={820 - (i % 2) * 120} width={60} height={80} fill={(i + j) % 3 ? C.yellow : C.night} opacity={.85} />))}
      </g>
      <g transform={`translate(${-(sp) % 300} 0)`}>{Array.from({length: 6}, (_, i) => <Paper key={i}><rect x={i * 300} y={700} width={22} height={600} fill={C.ink} /><rect x={i * 300 - 40} y={700} width={100} height={18} fill={C.ink} /></Paper>)}</g>
      <rect x={0} y={1280} width={1080} height={700} fill={C.ink} />
      <g transform={`translate(${-(sp) % 160} 0)`}>{Array.from({length: 10}, (_, i) => <rect key={i} x={i * 160} y={1360} width={90} height={14} fill={C.cream} opacity={.5} />)}</g>
      {run && Array.from({length: 6}, (_, i) => <rect key={i} x={120 + rnd(i + Math.floor(t * 12)) * 200} y={760 + i * 90} width={160} height={8} rx={4} fill={C.cream} opacity={.6} />)}
      <Person who="voce" x={run ? 600 : 540} y={1300} s={1.0} t={t} expr={run ? 'aflito' : 'choque'} pose={run ? 'correr' : 'parado'} />
    </g>
  );
};

// 6–8 · Bazar: montanha de roupas, Dona Cida, a busca e o "vendi agorinha"
const Bazar: React.FC<{t: number; close?: boolean}> = ({t, close}) => (
  <g>
    <rect width={1080} height={1920} fill="#D9CDB6" />
    <Paper><rect x={150} y={480} width={780} height={110} rx={8} fill={C.green} /></Paper>
    <Txt x={540} y={556} s={52} f={HEAD} w={800} c={C.cream} a="middle">BAZAR DA IGREJA</Txt>
    <Paper><rect x={720} y={620} width={220} height={120} fill={C.cream} /></Paper>
    <Txt x={830} y={672} s={28} f={MONO} w={800} c={C.ink} a="middle">TUDO</Txt>
    <Txt x={830} y={720} s={44} f={MONO} w={800} c={C.tomato} a="middle">R$ 5</Txt>
    <rect x={0} y={1240} width={1080} height={700} fill={C.wood} />
    {!close && <g>{Array.from({length: 26}, (_, i) => {
      const cx = 300 + (rnd(i) - .5) * 380, cy = 1240 - Math.pow(rnd(i * 2.3), .6) * 380 * (1 - Math.abs(cx - 300) / 280);
      return <Paper key={i}><rect x={cx - 70} y={cy - 40} width={140} height={80} rx={20} fill={[C.blue, C.tomato, C.yellow, C.lilac, C.green, C.cream3, C.blueDeep][i % 7]} transform={`rotate(${(rnd(i * 5) - .5) * 60} ${cx} ${cy})`} /></Paper>;
    })}</g>}
  </g>
);
const BazarCena: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bazar t={t} />
    <Person who="cida" x={760} y={1320} s={1.0} t={t} expr="feliz" talk={talking('bazar', t)} pose={t > W('bazar', 'Chegou') ? 'apontar' : 'parado'} flip look={1} />
  </g>
);
const Busca: React.FC<{t: number}> = ({t}) => {
  const a = SC.busca.t0, b = SC.busca.t1 - .2, n = Math.round(clamp((t - a) / (b - a)) * 30);
  return (
    <g>
      <Bazar t={t} />
      <Person who="voce" x={330} y={1320} s={1.0} t={t} expr="aflito" pose="bracos" />
      {Array.from({length: 30}, (_, i) => {
        const t0 = a + (i / 30) * (b - a), k = p(t, t0, .55); if (k <= 0 || k >= 1) return null;
        const x = mix(330, 330 + 180 + rnd(i) * 520, k), y = 900 - Math.sin(k * Math.PI) * 420 + k * 300;
        return <g key={i} opacity={1 - k * .3}><Jeans x={x} y={y} s={.32} rot={k * 540 * (rnd(i * 3) > .5 ? 1 : -1)} rip={false} c={[C.blue, C.blueDeep, '#5A7BB0'][i % 3]} /></g>;
      })}
      <g transform="translate(790 960) rotate(4)">
        <Paper><rect x={-150} y={-70} width={300} height={130} rx={10} fill={C.cream} /></Paper>
        <Txt x={0} y={30} s={74} f={MONO} w={800} c={C.ink} a="middle">{`${n}/30`}</Txt>
        <Txt x={0} y={-30} s={22} f={MONO} w={800} c={C.gray} a="middle" ls={3}>CALÇAS CONFERIDAS</Txt>
      </g>
      <Stamp x={790} y={1150} t={t} at={W('busca', 'Nenhuma')} text="NENHUMA" s={56} rot={-8} />
    </g>
  );
};
const Vendi: React.FC<{t: number}> = ({t}) => {
  const kz = eo(p(t, SC.vendi.t0, .4));
  return (
    <g>
      <Bazar t={t} close />
      <g transform={`translate(540 1300) scale(${mix(1, 1.15, kz)}) translate(-540 -1300)`}>
        <Person who="cida" x={540} y={1650} s={1.1} t={t} expr={t < W('vendi', 'Vendi') ? 'neutro' : 'feliz'} talk={talking('vendi', t)} look={-.5} />
      </g>
      <Tag x={820} y={760} t={t} at={W('vendi', 'Cinco')} text="VENDIDA · R$ 5" bg={C.tomato} fg={C.cream} rot={6} />
    </g>
  );
};

// 9 · R$ 5 × R$ 48 milhões: a balança fica nivelada (a calça "vale" o prêmio)
const Cinco: React.FC<{t: number}> = ({t}) => {
  const k = eo(p(t, SC.cinco.t0, .4)), tilt = Math.sin(Math.max(0, t - SC.cinco.t0) * 5) * 12 * Math.exp(-Math.max(0, t - SC.cinco.t0) * .9);
  const kM = eo(p(t, W('cinco', 'Pela'), .3));
  return (
    <g>
      <Night />
      <g transform={`translate(540 ${mix(1500, 1000, k)})`}>
        <Paper><rect x={-16} y={-300} width={32} height={520} fill={C.cream3} /><path d="M-160 220 H160 L120 260 H-120Z" fill={C.cream3} /></Paper>
        <g transform={`translate(0 -300) rotate(${tilt})`}>
          <Paper><rect x={-380} y={-14} width={760} height={28} rx={14} fill={C.cream} /></Paper>
          {[-1, 1].map((sgn) => (
            <g key={sgn} transform={`translate(${sgn * 340} 0) rotate(${-tilt})`}>
              <line x1={-90} x2={0} y1={180} y2={0} stroke={C.cream3} strokeWidth={5} /><line x1={90} x2={0} y1={180} y2={0} stroke={C.cream3} strokeWidth={5} />
              <Paper><path d="M-130 180 H130 Q110 230 0 236 Q-110 230 -130 180Z" fill={C.cream} /></Paper>
              {sgn < 0 ? <g><Jeans x={0} y={100} s={.38} /><Txt x={0} y={320} s={64} f={MONO} w={800} c={C.tomato} a="middle">R$ 5</Txt></g>
                : <g opacity={kM}><Paper><circle cx={0} cy={110} r={80} fill={C.green} /></Paper><Txt x={0} y={136} s={74} f={HEAD} w={800} c={C.cream} a="middle">$</Txt><Txt x={0} y={320} s={52} f={MONO} w={800} c={C.green} a="middle">R$ 48 MI</Txt></g>}
            </g>
          ))}
        </g>
      </g>
    </g>
  );
};

// 10 · O capacete esquecido com o adesivo da festa
const Capacete: React.FC<{t: number}> = ({t}) => {
  const z = eio(p(t, W('capacete', 'capacete.') - .3, .7));
  return (
    <g transform={`translate(560 880) scale(${1 + z * .7}) translate(-560 -880)`}>
      <rect width={1080} height={1920} fill="#D9CDB6" />
      <Paper><rect x={0} y={1080} width={1080} height={900} fill={C.wood} /></Paper>
      <Paper><path d="M260 1080 Q250 700 540 680 Q830 700 820 1080Z" fill={C.ink} /></Paper>
      <path d="M330 900 Q540 780 760 900 L760 990 Q540 930 330 990Z" fill={C.night3} />
      <g transform="translate(560 880) rotate(-6)">
        <Paper><rect x={-170} y={-60} width={340} height={130} rx={12} fill={C.yellow} /></Paper>
        <Txt x={0} y={-8} s={34} f={HEAD} w={800} c={C.ink} a="middle">LAJE DO TUTA</Txt>
        <Txt x={0} y={40} s={28} f={MONO} w={800} c={C.tomato} a="middle">HOJE · 19H</Txt>
      </g>
    </g>
  );
};

// 11–12 · A festa na laje e o Léo
const Laje: React.FC<{t: number; dim?: number}> = ({t, dim = 0}) => (
  <g>
    <Night c={C.ink} />
    {Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={300 + rnd(i * 4) * 400} r={2 + rnd(i * 7) * 2} fill={C.cream} opacity={.5} />)}
    <path d="M-20 560 Q270 660 540 590 T1100 600" fill="none" stroke={C.cream3} strokeWidth={3} />
    {Array.from({length: 11}, (_, i) => { const x = i * 105, y = 560 + Math.sin(i * .9) * 40 + 30; return <circle key={i} cx={x} cy={y} r={14} fill={[C.yellow, C.tomato, C.green, C.cream][i % 4]} opacity={Math.floor(t * 4 + i) % 3 ? 1 : .55} />; })}
    <Paper><rect x={0} y={1250} width={1080} height={700} fill={C.night3} /></Paper>
    {Array.from({length: 9}, (_, i) => {
      const x = 60 + i * 120, b = Math.abs(Math.sin(Math.floor(t * 12) / 12 * Math.PI * 4 + i)) * 24, h = 380 + rnd(i) * 140;
      return <g key={i} opacity={1 - dim}><Paper><rect x={x - 45} y={1260 - h - b} width={90} height={h} rx={45} fill={C.night2} /><circle cx={x} cy={1260 - h - b - 40} r={52} fill={C.night2} /></Paper></g>;
    })}
  </g>
);
const Festa: React.FC<{t: number}> = ({t}) => {
  const tE = W('festa', 'E') - .1, kS = eo(p(t, tE, .3)), z = eio(p(t, W('festa', 'calça.') - .2, .7));
  return (<g><g transform={`translate(540 1080) scale(${1 + z * .35}) translate(-540 -1080)`}>
      <Laje t={t} dim={kS * .6} />
      {kS > 0 && <polygon points="470,300 610,300 820,1320 260,1320" fill={C.cream} opacity={.14 * kS} />}
      <g opacity={mix(.25, 1, kS)}><Person who="leo" x={540} y={1300} s={1.0} t={t} expr="feliz" pose="dancar" /></g>
      {z > .2 && <circle cx={580} cy={1150} r={70} fill="none" stroke={C.green} strokeWidth={8} opacity={z} />}
    </g>
    <Tag x={540} y={490} t={t} at={W('festa', 'Dançando.')} text="LÉO · 24 · DANÇA MAL" bg={C.yellow} />
  </g>);
};
const Leo: React.FC<{t: number}> = ({t}) => (
  <g>
    <Laje t={t} dim={.7} />
    <Person who="leo" x={600} y={1330} s={1.15} t={t} expr="desconfia" talk={talking('leo', t)} look={-1} />
    <Person who="voce" x={200} y={1700} s={1.2} t={t} pose="costas" />
  </g>
);

// 13 · Mensagem de voz da mãe no celular
const Audio_: React.FC<{t: number}> = ({t}) => {
  const ring = t < SC.audio.v0 && Math.floor(t * 10) % 2 === 0, prog = clamp((t - SC.audio.v0) / (SC.audio.v1 - SC.audio.v0));
  const speak = talking('audio', t);
  return (
    <g>
      <Laje t={t} dim={.85} />
      <rect width={1080} height={1920} fill={C.ink} opacity={.5} />
      <Phone x={540} y={900} s={1.05} rot={-3} shake={ring ? 6 : 0}>
        <Txt x={0} y={-250} s={26} f={MONO} w={800} c={C.gray} a="middle" ls={3}>MENSAGEM DE VOZ</Txt>
        <circle cx={0} cy={-130} r={74} fill={C.skinMae} /><circle cx={0} cy={-190} r={30} fill="#4A3B33" />
        <g fill="none" stroke={C.ink} strokeWidth={5}><circle cx={-24} cy={-136} r={18} /><circle cx={24} cy={-136} r={18} /></g>
        <Txt x={0} y={0} s={56} f={HEAD} w={800} c={C.cream} a="middle">MÃE</Txt>
        {Array.from({length: 22}, (_, i) => {
          const h = speak ? 14 + Math.abs(Math.sin(t * 11 + i * 1.3) * Math.sin(t * 4.1 + i * .5)) * 110 : 10 + rnd(i) * 30;
          return <rect key={i} x={-150 + i * 14} y={120 - h / 2} width={8} height={h} rx={4} fill={i / 22 < prog ? C.green : C.gray} />;
        })}
        <Txt x={0} y={240} s={28} f={MONO} w={800} c={C.cream} a="middle">{`0:${pad2(prog * 7)} / 0:07`}</Txt>
      </Phone>
    </g>
  );
};

// 14 · Dois lugares, um bilhete: lixo de casa × calça do Léo; caminhão chega às 20h
const Caminhao: React.FC<{t: number}> = ({t}) => {
  const tD = W('caminhao', 'Dois') - .1, kD = eo(p(t, tD, .4)), tU = W('caminhao', 'Um') - .1, kU = back(p(t, tU, .35));
  const truck = clamp((storyMin(t) - (19 * 60 + 52)) / 8);
  return (
    <g>
      <Night />
      <g transform="translate(0 0)">
        <Paper><rect x={90} y={500} width={900} height={110} rx={14} fill={C.night2} /></Paper>
        <line x1={140} x2={940} y1={575} y2={575} stroke={C.cream3} strokeWidth={4} strokeDasharray="18 14" />
        <g transform={`translate(${mix(170, 860, eo(p(t, SC.caminhao.t0, 1.4)) * .25 + truck * .75)} 560)`}>
          <Paper><rect x={-60} y={-40} width={80} height={46} fill={C.green} /><rect x={20} y={-28} width={40} height={34} fill={C.cream} /></Paper>
          <circle cx={-40} cy={10} r={11} fill={C.ink} /><circle cx={40} cy={10} r={11} fill={C.ink} />
        </g>
        <g transform="translate(920 530)"><Paper><path d="M-30 50 V0 L0 -24 L30 0 V50Z" fill={C.yellow} /></Paper></g>
      </g>
      <g opacity={mix(.3, 1, kD)}>
        <g transform={`translate(${mix(0, 0, kD)} 0)`}>
          <Paper><rect x={70} y={680} width={450} height={600} rx={18} fill={C.cream2} /></Paper>
          <Paper><path d="M180 860 H410 L390 1180 H200Z" fill={C.gray} /></Paper><rect x={170} y={840} width={250} height={30} rx={8} fill={C.ink} />
          <rect x={250} y={800} width={60} height={50} fill={C.cream} transform="rotate(-14 280 825)" />
          <Txt x={295} y={1250} s={30} f={MONO} w={800} c={C.ink} a="middle">LIXO DE CASA</Txt>
        </g>
        <g>
          <Paper><rect x={560} y={680} width={450} height={600} rx={18} fill={C.night3} /></Paper>
          <Jeans x={785} y={950} s={.85} />
          <Txt x={785} y={1250} s={30} f={MONO} w={800} c={C.cream} a="middle">CALÇA DO LÉO</Txt>
        </g>
      </g>
      {kU > 0 && <g transform={`translate(540 980) scale(${kU})`}><Ticket x={0} y={0} s={.7} rot={-6} /><Paper><circle cx={150} cy={-90} r={46} fill={C.tomato} /></Paper><Txt x={150} y={-70} s={60} f={HEAD} w={800} c={C.cream} a="middle">?</Txt></g>}
    </g>
  );
};

// 15–16 · Cartão de decisão com contagem de 10 s; voto; cartão final
const Decisao: React.FC<{t: number}> = ({t}) => {
  const tE = SC.escolha.t0, kCard = eo(p(t, tE, .35)), cnt = clamp(1 - (t - T_COUNT0) / 10), sec = Math.ceil(cnt * 10 - 1e-6);
  const over = t >= T_END, kOver = eo(p(t, T_END + .2, .5));
  const hiA = t >= W('escolha', 'mãe…') - .3 && t < W('escolha', 'ou'), hiB = t >= W('escolha', 'calça?') - .1 && t < WE('escolha', 'calça?') + .5;
  const kVote = eo(p(t, W('contagem', 'Comenta') - .1, .35));
  const R0 = 88, L = 2 * Math.PI * R0;
  const opt = (y: number, letter: string, l1: string, l2: string, hi: boolean, d: number, col: string) => {
    const k = back(p(t, tE + .1 + d, .35));
    return (
      <g transform={`translate(540 ${y}) scale(${k}) rotate(${hi ? -1.5 : 0})`}>
        <Paper><rect x={-450} y={-95} width={900} height={190} rx={18} fill={hi ? col : C.cream} /></Paper>
        <rect x={-424} y={-70} width={140} height={140} rx={14} fill={hi ? C.cream : col} />
        <Txt x={-354} y={30} s={96} f={HEAD} w={800} c={hi ? col : C.cream} a="middle">{letter}</Txt>
        <Txt x={-250} y={-10} s={44} f={HEAD} w={800} c={C.ink}>{l1}</Txt>
        <Txt x={-250} y={46} s={44} f={HEAD} w={800} c={C.ink}>{l2}</Txt>
      </g>
    );
  };
  return (
    <g>
      <Night />
      {!over || kOver < 1 ? (
        <g opacity={1 - kOver}>
          <g opacity={kCard}>
            <circle cx={540} cy={620} r={R0} fill="none" stroke={C.night3} strokeWidth={16} />
            <circle cx={540} cy={620} r={R0} fill="none" stroke={sec <= 3 ? C.tomato : C.green} strokeWidth={16} strokeDasharray={L} strokeDashoffset={L * (1 - cnt)} transform="rotate(-90 540 620)" strokeLinecap="round" />
            <Txt x={540} y={652} s={92} f={MONO} w={800} c={sec <= 3 ? C.tomato : C.cream} a="middle">{t < T_COUNT0 ? 10 : sec}</Txt>
          </g>
          {opt(850, 'A', 'CORRER PRO', 'LIXO DE CASA', hiA, 0, C.green)}
          {opt(1070, 'B', 'CONVENCER O LÉO', 'A TIRAR A CALÇA', hiB, .12, C.tomato)}
          <g opacity={kVote} transform={`translate(0 ${(1 - kVote) * 20})`}>
            <Paper><rect x={180} y={1210} width={720} height={80} rx={40} fill={C.yellow} /></Paper>
            <Txt x={540} y={1262} s={32} f={MONO} w={800} c={C.ink} a="middle" ls={2}>VOTE NOS COMENTÁRIOS: A OU B</Txt>
          </g>
        </g>
      ) : null}
      {over && (
        <g opacity={kOver}>
          <Txt x={540} y={600} s={34} f={MONO} w={800} c={C.tomato} a="middle" ls={8}>TEMPO ESGOTADO</Txt>
          <Ticket x={540} y={780} s={1.1} rot={-5} />
          <Txt x={540} y={1010} s={130} f={HEAD} w={800} c={C.cream} a="middle" ls={-2}>O BILHETE</Txt>
          <Txt x={540} y={1100} s={40} f={MONO} w={800} c={C.yellow} a="middle" ls={4}>EP. 2 · EM BREVE</Txt>
          <Txt x={540} y={1170} s={34} f={UI} w={700} c={C.cream3} a="middle">Comente A ou B. Você decide.</Txt>
        </g>
      )}
    </g>
  );
};

// ── HUD: episódio, prêmio (fixo), dia · hora e prazo
const Hud: React.FC<{t: number}> = ({t}) => {
  const endCard = t >= T_END + .2;
  const showTime = t >= W('corrida', 'seis.') - .2 && t < SC.escolha.t0;
  const prazo = t >= SC.caminhao.t0 ? 20 * 60 : t < SC.cinco.t0 ? 18 * 60 : 0;
  const label = t >= SC.caminhao.t0 ? 'CAMINHÃO EM' : 'BAZAR FECHA EM';
  const restS = Math.max(0, (prazo - storyMin(t)) * 60);
  const lightBg = ['mae', 'bazar', 'busca', 'vendi', 'capacete'].some((k) => t >= SC[k].t0 && t < SC[k].t1) || (t >= W('gancho', 'e') - .05 && t < SC.gancho.t1);
  const fg = lightBg ? C.ink : C.cream, chip = lightBg ? C.cream : C.night2;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g filter="url(#papel)">
        <rect x={84} y={262} width={190} height={58} rx={8} fill={C.tomato} />
        {!endCard && <rect x={664} y={256} width={332} height={70} rx={8} fill={chip} />}
      </g>
      <Txt x={179} y={302} s={30} f={MONO} w={800} c={C.cream} a="middle" ls={2}>● EP. 1</Txt>
      <Txt x={90} y={360} s={24} f={MONO} w={800} c={fg} ls={4} o={.8}>A CALÇA</Txt>
      {!endCard && <g>
        <Txt x={980} y={304} s={38} f={MONO} w={800} c={C.green} a="end">R$ 48.000.000</Txt>
        <Txt x={990} y={360} s={22} f={MONO} w={800} c={C.tomato} a="end" ls={3}>NÃO RESGATADO</Txt>
      </g>}
      {showTime && (
        <g opacity={eo(p(t, W('corrida', 'seis.') - .2, .3))}>
          <Txt x={90} y={420} s={28} f={MONO} w={800} c={fg} ls={2}>{`SÁBADO · ${hhmm(storyMin(t))}`}</Txt>
          {prazo > 0 && <g><rect x={560} y={388} width={430} height={46} rx={6} fill={C.tomato} /><Txt x={775} y={421} s={26} f={MONO} w={800} c={C.cream} a="middle">{`${label} ${hms(restS)}`}</Txt></g>}
        </g>
      )}
    </svg>
  );
};

// ── Legendas palavra a palavra (Sora 800; palavra falada em verde; nome do personagem acima das falas dele)
const WHO: Record<string, [string, string]> = {mae: ['MÃE', C.blue], cida: ['DONA CIDA', C.lilac], leo: ['LÉO', C.tomato]};
const Captions: React.FC<{t: number}> = ({t}) => {
  const cap = CAPS.find((c) => t >= c.start - .02 && t < c.end);
  if (!cap) return null;
  const who = WHO[cap.voz];
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1400, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {who && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: C.cream, background: who[1], padding: '4px 14px', borderRadius: 6, marginBottom: 8, transform: 'rotate(-2deg)'}}>{who[0]}</div>}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, fontFamily: HEAD, fontWeight: 800, fontSize: 72, lineHeight: 1.08, textTransform: 'uppercase'}}>
        {cap.words.map(([w, s, e], i) => {
          const k = eo(p(t, s - .04, .1)); const cur = t >= s - .04 && (t < e + .08 || i === cap.words.length - 1);
          return (
            <span key={i} style={{opacity: k, transform: `translateY(${(1 - k) * 16}px) scale(${mix(1.15, 1, k)}) rotate(${cur ? -2 : 0}deg)`, display: 'inline-block',
              color: cur ? C.green : C.cream, WebkitTextStroke: `10px ${C.ink}`, paintOrder: 'stroke fill'}}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};

const SCENES: Array<[string, React.FC<{t: number}>]> = [
  ['gancho', Gancho], ['ficha', Ficha], ['flash', Flash], ['mae', Mae], ['corrida', Corrida], ['bazar', BazarCena], ['busca', Busca], ['vendi', Vendi],
  ['cinco', Cinco], ['capacete', Capacete], ['festa', Festa], ['leo', Leo], ['audio', Audio_], ['caminhao', Caminhao],
];

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  loadFonts();
  const frame = useCurrentFrame(); const t = still ?? frame / TL.fps;
  const cur = SCENES.find(([k]) => t >= SC[k].t0 && t < SC[k].t1);
  const isDec = t >= SC.escolha.t0;
  const sc = cur ? SC[cur[0]] : SC.escolha; const kIn = p(t, sc.t0, .14); const punch = mix(1.04, 1, eo(kIn));
  return (
    <AbsoluteFill style={{backgroundColor: C.night}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="papel" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feDropShadow in="d" dx={7} dy={9} stdDeviation={0} floodColor={C.ink} floodOpacity={.35} />
          </filter>
        </defs>
        <g transform={`translate(540 960) scale(${punch}) translate(-540 -960)`}>
          {cur && !isDec && React.createElement(cur[1], {t})}
          {isDec && <Decisao t={t} />}
        </g>
      </svg>
      <Hud t={t} />
      <Captions t={t} />
      {audio && !still && (
        <>
          <Audio src={staticFile('assets/audio/trilha.wav')} />
          {TL.scenes.map((s) => (
            <Sequence key={s.key} from={Math.round(s.v0 * TL.fps)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
