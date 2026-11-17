// Série "10 SEGUNDOS" · temporada "O prédio" · Ep. 1 v2 "A foto das 3h10" (9:16). Suspense em PRIMEIRA PESSOA, sem sangue.
// Câmera = os meus olhos: mãos, celular e o olho mágico (lente olho de peixe por feDisplacementMap).
// Tempos de src/data/timeline.json (falas reais). Personagens, endereços e dados são fictícios.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {OLHO_MAPA} from './data/olhoMapa';
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
const back = (x: number) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const norm = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const W = (k: string, w: string, nth = 0) => { const h = (WORDS[k] || []).filter((x) => norm(x[0]) === norm(w)); return (h[nth] || h[0] || [w, SC[k].v0, SC[k].v0])[1]; };
const WE = (k: string, w: string, nth = 0) => { const h = (WORDS[k] || []).filter((x) => norm(x[0]) === norm(w)); return (h[nth] || h[0] || [w, SC[k].v0, SC[k].v1])[2]; };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
const inS = (t: number, ...ks: string[]) => ks.some((k) => t >= SC[k].t0 && t < SC[k].t1);
import CNT from './data/contagem.json';
const T_COUNT0 = CNT.um, T_END = T_COUNT0 + 9.6; // a delegada conta 1..10, um por segundo
// batidas na porta (usadas na imagem e na trilha): 3 no início de "batida", 2 no início de "entao"
export const KNOCKS = [SC.policia.t0 + .15, SC.policia.t0 + .45, SC.policia.t0 + .75];
const knockShake = (t: number) => KNOCKS.reduce((a, k) => a + (t >= k && t < k + .2 ? Math.sin((t - k) * 90) * 14 * (1 - (t - k) / .2) : 0), 0);

const Txt: React.FC<{x: number; y: number; s: number; f?: string; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; ls?: number; o?: number; children: React.ReactNode; rot?: number}> = ({x, y, s, f = UI, w = 700, c = C.white, a = 'start', ls = 0, o = 1, children, rot = 0}) => (
  <text x={x} y={y} fontSize={s} fontFamily={f} fontWeight={w} fill={c} textAnchor={a} letterSpacing={ls} opacity={o} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{children}</text>
);
const Stamp: React.FC<{x: number; y: number; t: number; at: number; text: string; s?: number; rot?: number}> = ({x, y, t, at, text, s = 56, rot = -8}) => {
  const k = p(t, at, .16); if (k <= 0) return null; const wdt = text.length * s * .64 + 50;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${mix(2, 1, eo(k))})`} opacity={clamp(k * 3)}>
      <rect x={-wdt / 2} y={-s * .95} width={wdt} height={s * 1.35} rx={8} fill="none" stroke={C.red} strokeWidth={6} />
      <Txt x={0} y={s * .1} s={s} f={HEAD} w={800} c={C.red} a="middle" ls={2}>{text}</Txt>
    </g>
  );
};
const Tag: React.FC<{x: number; y: number; t: number; at: number; text: string; danger?: boolean}> = ({x, y, t, at, text, danger}) => {
  const k = eo(p(t, at, .25)); if (k <= 0) return null; const w = text.length * 19.5 + 50;
  return (
    <g opacity={k} transform={`translate(${x} ${y + (1 - k) * 14})`}>
      <rect x={-w / 2} y={-36} width={w} height={56} rx={4} fill={danger ? C.red : C.white} />
      <Txt x={0} y={4} s={28} f={MONO} w={800} c={danger ? C.white : C.bg} a="middle" ls={1}>{text}</Txt>
    </g>
  );
};

// ── celular nas MINHAS mãos (POV). Balanço de câmera na mão.
const Hands: React.FC<{t: number; children: React.ReactNode; lift?: number; thumb?: [number, number] | null; tap?: number}> = ({t, children, lift = 0, thumb = null, tap = 0}) => {
  const sx = Math.sin(t * 1.3) * 6 + Math.sin(t * 2.9) * 3, sy = Math.cos(t * 1.1) * 5;
  return (
    <g transform={`translate(${sx} ${sy + lift})`}>
      <g transform="translate(540 1000) rotate(-3)">
        {/* mangas do moletom e mãos, vindas de baixo */}
        <path d="M-520 1000 L-330 360 Q-300 300 -240 330 L-120 640 L-260 1000Z" fill={C.sleeve} />
        <path d="M520 1000 L330 380 Q300 310 240 340 L120 640 L260 1000Z" fill={C.sleeveDeep} />
        <path d="M-300 380 Q-330 200 -250 160 L-220 300 Q-200 420 -150 470 L-250 520Z" fill={C.skinDeep} />
        {/* celular */}
        <rect x={-270} y={-560} width={540} height={1080} rx={64} fill="#05070A" />
        <rect x={-252} y={-542} width={504} height={1044} rx={50} fill={C.screen} />
        <svg x={-252} y={-542} width={504} height={1044} viewBox="0 0 504 1044">{children}</svg>
        <rect x={-60} y={-530} width={120} height={26} rx={13} fill="#05070A" />
        {/* dedos da mão esquerda e direita segurando as bordas */}
        {[0, 1, 2].map((i) => <rect key={i} x={-300} y={-60 + i * 110} width={70} height={90} rx={34} fill={C.skin} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={234} y={-20 + i * 110} width={70} height={90} rx={34} fill={C.skinDeep} />)}
        <path d="M300 420 Q330 260 250 220 L210 330 Q190 430 150 470 L250 520Z" fill={C.skin} />
        {/* polegar direito (toca a tela) */}
        {thumb && <g transform={`translate(${thumb[0]} ${thumb[1] + tap * 18})`}><path d="M60 300 Q40 120 -6 30 Q-30 -10 -60 10 Q-80 40 -50 140 Q-20 260 0 330Z" fill={C.skin} /><ellipse cx={-36} cy={22} rx={22} ry={16} fill="#D9A585" /></g>}
      </g>
    </g>
  );
};
const Avatar: React.FC<{x: number; y: number; r: number; who: 'elias' | 'desconhecido'}> = ({x, y, r, who}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={who === 'elias' ? '#56657E' : C.redDeep} />
    {who === 'elias' ? <Txt x={x} y={y + r * .36} s={r} f={HEAD} w={800} c={C.light} a="middle">E</Txt> : <Txt x={x} y={y + r * .36} s={r} f={HEAD} w={800} c={C.white} a="middle">?</Txt>}
  </g>
);
const Wave: React.FC<{x: number; y: number; w: number; h: number; prog: number; active: boolean; t: number; n?: number; hi?: [number, number]}> = ({x, y, w, h, prog, active, t, n = 34, hi}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const fr = i / n; const base = .25 + rnd(i * 3.3) * .55 + (fr > .82 ? .35 : 0);
      const live = active && Math.abs(fr - prog) < .06 ? 1 + Math.abs(Math.sin(t * 20 + i)) * .5 : 1;
      const hh = Math.min(h, h * base * live); const inHi = hi && fr >= hi[0] && fr <= hi[1];
      return <rect key={i} x={x + fr * w} y={y - hh / 2} width={w / n * .55} height={hh} rx={3} fill={inHi ? C.red : fr <= prog ? C.light : C.grayDim} />;
    })}
  </g>
);

// ── olho mágico: porta por dentro, anel escuro e cena distorcida
const OC = [540, 880], OR = 400;
const Olho: React.FC<{t: number; children: React.ReactNode; zoom?: number}> = ({children, zoom = 1}) => (
  <g>
    <rect width={1080} height={1920} fill="#020304" />
    <g transform={`translate(${OC[0]} ${OC[1]}) scale(${zoom}) translate(${-OC[0]} ${-OC[1]})`}>
      <g clipPath="url(#olhoClip)"><g filter="url(#olho)">{children}</g></g>
      <circle cx={OC[0]} cy={OC[1]} r={OR} fill="url(#olhoVinheta)" />
      <circle cx={OC[0]} cy={OC[1]} r={OR + 6} fill="none" stroke="#000" strokeWidth={24} />
    </g>
  </g>
);
// corredor visto da minha porta (coordenadas da caixa 110–970 × 450–1310)
const Corredor: React.FC<{t: number; police?: boolean; dark?: number}> = ({t, police, dark = 0}) => {
  const ph = Math.floor(t * 3) % 2; const pol = police ? .22 : 0;
  return (
    <g>
      <rect x={-300} y={100} width={1680} height={1600} fill={C.wallDeep} />
      <polygon points="-300,100 110,450 110,1310 -300,1700" fill={C.wall} /><polygon points="1380,100 970,450 970,1310 1380,1700" fill={C.wall} />
      <polygon points="-300,1700 110,1310 970,1310 1380,1700" fill="#2B2F36" /><polygon points="-300,100 110,450 970,450 1380,100" fill="#3A404A" />
      <polygon points="110,450 330,640 330,1120 110,1310" fill={C.wall} /><polygon points="970,450 750,640 750,1120 970,1310" fill={C.wall} />
      <polygon points="110,1310 330,1120 750,1120 970,1310" fill="#2B2F36" /><polygon points="110,450 330,640 750,640 970,450" fill="#3A404A" />
      <rect x={330} y={640} width={420} height={480} fill={C.wallDeep} />
      {/* porta do 302 em frente */}
      <rect x={430} y={720} width={220} height={400} fill={C.wood} /><rect x={430} y={720} width={220} height={400} fill="none" stroke={C.woodDeep} strokeWidth={8} />
      <circle cx={620} cy={930} r={10} fill={C.tape} /><rect x={510} y={760} width={60} height={30} fill={C.light} /><Txt x={540} y={784} s={24} f={MONO} w={800} c={C.bg} a="middle">302</Txt>
      <rect x={344} y={660} width={60} height={14} rx={7} fill={C.light} opacity={.8} />
      {police && <g>
        <g transform="rotate(14 540 900)"><rect x={360} y={880} width={360} height={34} fill={C.tape} /><Txt x={540} y={905} s={20} f={MONO} w={800} c={C.bg} a="middle" ls={2}>POLÍCIA · NÃO ULTRAPASSE</Txt></g>
        <g transform="rotate(-12 540 980)"><rect x={360} y={960} width={360} height={34} fill={C.tape} /><Txt x={540} y={985} s={20} f={MONO} w={800} c={C.bg} a="middle" ls={2}>POLÍCIA · NÃO ULTRAPASSE</Txt></g>
        <rect x={-300} y={100} width={1680} height={1600} fill={ph ? C.blue : C.red} opacity={pol} />
      </g>}
      {dark > 0 && <rect x={-300} y={100} width={1680} height={1600} fill="#000" opacity={dark} />}
    </g>
  );
};
// personagens vistos pelo olho mágico (2D, sem sangue; formas simples com sombra dura)
const Delegada: React.FC<{x: number; y: number; s?: number; talk?: boolean; t: number; look?: number}> = ({x, y, s = 1, talk, t, look = 0}) => {
  const mo = talk && Math.floor(t * 12) % 3 !== 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-260 420 Q-250 170 -120 130 L120 130 Q250 170 260 420Z" fill="#232B38" />
      <path d="M-60 130 L0 260 L60 130Z" fill={C.light} />
      <rect x={-40} y={150} width={14} height={180} fill={C.red} transform="rotate(-18 -33 150)" /><rect x={-90} y={300} width={70} height={90} rx={6} fill={C.tape} />
      <rect x={-34} y={60} width={68} height={90} fill="#B98263" />
      <ellipse cx={0} cy={-20} rx={120} ry={140} fill="#C9906F" />
      <path d="M-128 -20 Q-140 -170 0 -170 Q140 -170 128 -20 Q110 -110 0 -116 Q-110 -110 -128 -20Z" fill="#1A1410" />
      <circle cx={0} cy={-170} r={42} fill="#1A1410" />
      <g transform={`translate(${look * 14} 0)`}>
        <ellipse cx={-44} cy={-20} rx={14} ry={10} fill="#141414" /><ellipse cx={44} cy={-20} rx={14} ry={10} fill="#141414" />
        <rect x={-68} y={-56} width={48} height={9} rx={4} fill="#1A1410" transform="rotate(8 -44 -52)" /><rect x={20} y={-56} width={48} height={9} rx={4} fill="#1A1410" transform="rotate(-8 44 -52)" />
      </g>
      <path d="M-6 0 Q0 30 10 34" fill="none" stroke="#9E6A4F" strokeWidth={6} />
      {mo ? <ellipse cx={0} cy={66} rx={22} ry={12} fill="#3A1C1C" /> : <rect x={-26} y={62} width={52} height={7} rx={3} fill="#7A3E3A" />}
    </g>
  );
};
const Valdir: React.FC<{x: number; y: number; s?: number; t: number; whistle?: boolean}> = ({x, y, s = 1, t, whistle}) => {
  const sw = Math.sin(t * 6) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-200 360 Q-190 150 -100 120 L100 120 Q190 150 200 360Z" fill="#7F93AE" />
      <rect x={60} y={170} width={90} height={40} rx={4} fill={C.light} /><Txt x={105} y={198} s={18} f={MONO} w={800} c={C.bg} a="middle">PORTARIA</Txt>
      <rect x={-30} y={60} width={60} height={70} fill="#A97A5E" />
      <ellipse cx={0} cy={-10} rx={104} ry={120} fill="#B98466" />
      <path d="M-110 -30 Q-110 -140 0 -140 Q110 -140 110 -30 Q90 -100 0 -104 Q-90 -100 -110 -30Z" fill="#B9BEC6" />
      <ellipse cx={-38} cy={-14} rx={11} ry={8} fill="#141414" /><ellipse cx={38} cy={-14} rx={11} ry={8} fill="#141414" />
      <path d="M-50 40 Q0 20 50 40 Q30 56 0 50 Q-30 56 -50 40Z" fill="#9AA0A8" />
      {whistle ? <circle cx={0} cy={66} r={9} fill="#3A1C1C" /> : <rect x={-20} y={62} width={40} height={6} rx={3} fill="#7A3E3A" />}
      {/* molho de chaves na mão */}
      <g transform={`translate(-170 300) rotate(${sw})`}>
        <circle cx={0} cy={0} r={30} fill="none" stroke={C.light} strokeWidth={7} />
        {[-30, 0, 30].map((a, i) => <g key={i} transform={`rotate(${a}) translate(0 30)`}><rect x={-6} y={0} width={12} height={60} fill={C.gray} /><rect x={-6} y={44} width={22} height={8} fill={C.gray} /></g>)}
      </g>
    </g>
  );
};
const Notas: React.FC<{x: number; y: number; t: number; at: number; c?: string}> = ({x, y, t, at, c = C.light}) => (
  <g>{[0, 1, 2, 3].map((i) => { const k = p(t, at + i * .28, .9); if (k <= 0 || k >= 1) return null; return <Txt key={i} x={x + i * 40 + Math.sin(k * 6) * 10} y={y - k * 120} s={54} f={UI} w={700} c={c} o={1 - k}>♪</Txt>; })}</g>
);

// ── CENAS (v2) ────────────────────────────────────────────────────────────────
// foto escura do quarto, tirada do pé da cama: eu dormindo sob o cobertor (sem rosto à mostra)
const FotoQuarto: React.FC<{w: number; h: number; t: number; live?: number; red?: number}> = ({w, h, t, live = 0, red = 0}) => {
  const br = live > 0 ? Math.sin(t * 5.2) * 6 : Math.sin(t * 1.4) * 2, sh = live > 0 ? Math.sin(t * 37) * 4 * live : 0;
  return (
    <g transform={`translate(${sh} ${sh * .6})`}>
      <rect width={w} height={h} fill="#0A0E16" />
      <polygon points={`${w * .62},0 ${w * .92},0 ${w},${h * .55} ${w * .5},${h * .45}`} fill="#1C2740" opacity={.7} />
      <rect x={w * .66} y={h * .05} width={w * .22} height={h * .26} fill="#1B2742" /><line x1={w * .77} x2={w * .77} y1={h * .05} y2={h * .31} stroke="#0A0E16" strokeWidth={6} />
      <rect x={-20} y={h * .62} width={w + 40} height={h * .5} fill="#0D121C" />
      {/* cama vista do pé: travesseiro, cabeça (cabelo), cobertor */}
      <path d={`M${w * .1} ${h * .52} L${w * .9} ${h * .52} L${w * 1.02} ${h * .98} L${w * -.02} ${h * .98}Z`} fill="#1A2233" />
      <ellipse cx={w * .5} cy={h * .4} rx={w * .34} ry={h * .085} fill="#3A4560" />
      {/* eu, dormindo: rosto de lado no travesseiro, olhos fechados */}
      <g transform={`translate(${w * .5} ${h * .41 - br * .3}) rotate(-12)`}>
        <ellipse cx={0} cy={0} rx={w * .13} ry={w * .15} fill="#8A6450" />
        <path d={`M${-w * .14} ${-w * .02} Q${-w * .12} ${-w * .18} 0 ${-w * .17} Q${w * .13} ${-w * .17} ${w * .14} ${-w * .03} Q${w * .08} ${-w * .1} 0 ${-w * .1} Q${-w * .09} ${-w * .1} ${-w * .14} ${-w * .02}Z`} fill="#0B0D12" />
        <path d={`M${-w * .07} ${w * .015} q${w * .025} ${w * .02} ${w * .05} 0`} fill="none" stroke="#2A1C16" strokeWidth={5} strokeLinecap="round" />
        <path d={`M${w * .02} ${w * .015} q${w * .025} ${w * .02} ${w * .05} 0`} fill="none" stroke="#2A1C16" strokeWidth={5} strokeLinecap="round" />
        <path d={`M${-w * .02} ${w * .085} q${w * .02} ${w * .01} ${w * .04} 0`} fill="none" stroke="#5A3A2C" strokeWidth={4} strokeLinecap="round" />
      </g>
      <path d={`M${w * .06} ${h * .53 - br} Q${w * .5} ${h * .47 - br * 1.6} ${w * .94} ${h * .53 - br} L${w * 1.02} ${h * .99} L${w * -.02} ${h * .99}Z`} fill="#46537A" />
      <path d={`M${w * .2} ${h * .62 - br} Q${w * .5} ${h * .56 - br} ${w * .8} ${h * .64 - br}`} fill="none" stroke="#2A3346" strokeWidth={8} />
      <path d={`M${w * .16} ${h * .78} Q${w * .5} ${h * .72 - br * .5} ${w * .86} ${h * .8}`} fill="none" stroke="#2A3346" strokeWidth={8} />
      <rect width={w} height={h} fill="#000" opacity={.12} />
      <rect x={w - 150} y={20} width={130} height={40} rx={20} fill="#0009" /><circle cx={w - 126} cy={40} r={7} fill={live > 0 ? C.red : C.light} />
      <Txt x={w - 110} y={49} s={22} f={MONO} w={800} c={C.light}>AO VIVO</Txt>
      {red > 0 && <rect x={0} y={0} width={w} height={h} fill="none" stroke={C.red} strokeWidth={8} opacity={red} />}
    </g>
  );
};
const Galeria: React.FC<{t: number; live?: number; red?: number; prog?: number}> = ({t, live = 0, red = 0, prog}) => (
  <g>
    <rect width={504} height={1044} fill="#05070A" />
    <Txt x={252} y={86} s={26} f={UI} w={800} c={C.white} a="middle">Hoje</Txt>
    <Txt x={252} y={118} s={22} f={MONO} w={800} c={red > 0 ? C.red : C.gray} a="middle">03:10</Txt>
    <svg x={0} y={170} width={504} height={680} viewBox="0 0 504 680"><FotoQuarto w={504} h={680} t={t} live={live} red={red} /></svg>
    {prog !== undefined && <g><rect x={40} y={890} width={424} height={8} rx={4} fill={C.grayDim} /><rect x={40} y={890} width={424 * prog} height={8} rx={4} fill={C.red} /><Txt x={252} y={940} s={22} f={MONO} w={800} c={C.light} a="middle">{`0:0${Math.min(3, Math.floor(prog * 3))} / 0:03`}</Txt></g>}
    {prog === undefined && <g>{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={40 + i * 88} y={890} width={78} height={78} rx={6} fill={i === 4 ? '#3A4560' : '#1A2233'} stroke={i === 4 ? C.light : 'none'} strokeWidth={3} />)}</g>}
  </g>
);
const Foto: React.FC<{t: number}> = ({t}) => {
  const z = eo(p(t, 0, SC.foto.t1)) * .08, kRed = eo(p(t, W('foto', 'celular.') - .1, .3));
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <g transform={`translate(540 760) scale(${1.3 + z}) translate(-540 -760)`}><Hands t={t}><Galeria t={t} red={kRed} /></Hands></g>
    </g>
  );
};
const ChatEu: React.FC<{t: number; kMsg: number; mark?: number}> = ({t, kMsg, mark = 0}) => (
  <g>
    <rect width={504} height={1044} fill="#0B1220" />
    <rect width={504} height={130} fill={C.bubble} />
    <Txt x={60} y={92} s={34} f={UI} w={600} c={C.light}>‹</Txt><Avatar x={124} y={80} r={30} who="elias" />
    <Txt x={170} y={74} s={28} f={UI} w={800} c={C.white}>Seu Elias (302)</Txt><Txt x={170} y={106} s={20} f={UI} w={600} c={C.gray}>visto por último hoje às 03:13</Txt>
    <rect x={24} y={220} width={300} height={70} rx={20} fill={C.bubble} /><Txt x={44} y={264} s={24} f={UI} w={600} c={C.light}>boa noite, menino</Txt>
    <Txt x={252} y={380} s={20} f={MONO} w={700} c={C.gray} a="middle">HOJE</Txt>
    {kMsg > 0 && <g transform={`translate(${(1 - kMsg) * 60} 0)`} opacity={kMsg}>
      <rect x={80} y={420} width={400} height={170} rx={24} fill={C.bubbleMe} stroke={mark > 0 ? C.red : 'none'} strokeWidth={6} />
      <Txt x={104} y={474} s={30} f={UI} w={700} c={C.white}>Seu Elias, abre a porta.</Txt>
      <Txt x={104} y={516} s={30} f={UI} w={700} c={C.white}>Sou eu.</Txt>
      <Txt x={456} y={570} s={22} f={MONO} w={700} c={C.light} a="end">03:12 ✓✓</Txt>
      <Txt x={460} y={630} s={22} f={MONO} w={800} c={mark > 0 ? C.red : C.gray} a="end">LIDA ÀS 03:12</Txt>
    </g>}
  </g>
);
const Mensagem: React.FC<{t: number}> = ({t}) => {
  const kM = back(p(t, W('mensagem', 'mandou') - .2, .35)), mark = eo(p(t, W('mensagem', 'vizinho.') - .2, .3));
  return <g><rect width={1080} height={1920} fill={C.bg} /><g transform="translate(540 760) scale(1.18) translate(-540 -760)"><Hands t={t}><ChatEu t={t} kMsg={kM} mark={mark} /></Hands></g></g>;
};
const Morto: React.FC<{t: number}> = ({t}) => <Olho t={t}><Corredor t={t} police /></Olho>;
const Suspeito: React.FC<{t: number}> = ({t}) => {
  const k = back(p(t, SC.suspeito.t0 + .1, .35));
  return (
    <g>
      <Olho t={t}><Corredor t={t} police dark={.6} /></Olho>
      {k > 0 && <g transform={`translate(540 860) rotate(-2) scale(${k})`}>
        <rect x={-380} y={-150} width={760} height={300} rx={10} fill={C.light} /><rect x={-380} y={-150} width={22} height={300} fill={C.red} />
        <Txt x={-330} y={-60} s={64} f={HEAD} w={800} c={C.bg}>EU</Txt>
        <Txt x={-330} y={0} s={30} f={MONO} w={800} c="#3A4252">APTO 301 · MORO SOZINHO</Txt>
        <Txt x={-330} y={50} s={30} f={MONO} w={800} c="#3A4252">ÚLTIMA MENSAGEM: 03:12</Txt>
      </g>}
      <Stamp x={600} y={1010} t={t} at={W('suspeito', 'eu.') - .05} text="SUSPEITO" s={78} rot={-8} />
    </g>
  );
};
// batidas fortes; delegada pelo olho mágico
const Policia: React.FC<{t: number}> = ({t}) => {
  const kO = p(t, KNOCKS[2] + .25, .3);
  return (
    <g transform={`translate(${knockShake(t)} 0)`}>
      <rect width={1080} height={1920} fill={C.woodDeep} />
      <rect x={160} y={250} width={760} height={1700} fill={C.wood} />
      {[0, 1].map((i) => <rect key={i} x={240} y={380 + i * 760} width={600} height={620} fill="none" stroke={C.woodDeep} strokeWidth={14} />)}
      <circle cx={540} cy={880} r={34} fill="#9AA0A8" /><circle cx={540} cy={880} r={18} fill="#05070A" />
      <rect width={1080} height={1920} fill="#000" opacity={.35} />
      {kO > 0 && <g opacity={kO}><Olho t={t}><Corredor t={t} police /><Delegada x={540} y={980} s={1.25} t={t} talk={t >= SC.policia.v0 && t <= SC.policia.v1} /></Olho></g>}
    </g>
  );
};
// a correntinha da porta, solta e balançando
const Corrente: React.FC<{t: number}> = ({t}) => {
  const sw = Math.sin((t - SC.corrente.t0) * 3.2) * 22 * Math.exp(-(t - SC.corrente.t0) * .25) + 4;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.woodDeep} />
      <rect x={90} y={300} width={900} height={1300} fill={C.wood} />
      <rect x={180} y={300} width={16} height={1300} fill={C.woodDeep} />
      {/* fechadura trancada */}
      <rect x={640} y={940} width={150} height={220} rx={16} fill="#8D939B" /><circle cx={715} cy={1010} r={36} fill="#6E747C" /><rect x={705} y={980} width={20} height={60} rx={6} fill="#3A3F46" transform="rotate(90 715 1010)" />
      <Txt x={715} y={1120} s={22} f={MONO} w={800} c="#2A2F36" a="middle">TRANCADA</Txt>
      {/* trilho da corrente na porta e a corrente pendurada */}
      <rect x={560} y={560} width={260} height={46} rx={10} fill="#8D939B" /><rect x={580} y={576} width={200} height={14} rx={7} fill="#3A3F46" />
      <g transform={`translate(400 590) rotate(${sw})`}>
        <rect x={-30} y={-30} width={60} height={60} rx={10} fill="#8D939B" />
        {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={0} cy={50 + i * 40} rx={i % 2 ? 9 : 16} ry={24} fill="none" stroke="#B9BEC6" strokeWidth={8} />)}
        <circle cx={0} cy={440} r={22} fill="#B9BEC6" />
      </g>
      <Tag x={540} y={1300} t={t} at={W('corrente', 'Então')} text="A CORRENTE TAVA SOLTA" danger />
      <rect width={1080} height={1920} fill="#000" opacity={.15} />
    </g>
  );
};
// a "foto ao vivo": 3 s com o cobertor respirando e o assobio
const Som: React.FC<{t: number}> = ({t}) => {
  const tL = SC.som.v1 + .15, live = t >= tL && t < tL + 3 ? 1 : 0, prog = clamp((t - tL) / 3);
  const z = eo(p(t, SC.som.t0, .6));
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <g transform={`translate(540 900) scale(${1 + z * .12}) translate(-540 -900)`}>
        <Hands t={t} thumb={[150, 330]} tap={t >= tL - .2 ? 1 : 0}><Galeria t={t} live={live} prog={t >= tL ? prog : undefined} /></Hands>
      </g>
      {live > 0 && <Notas x={760} y={560} t={t} at={tL + .2} c={C.red} />}
    </g>
  );
};
const Cama: React.FC<{t: number}> = ({t}) => {
  const pulse = (Math.sin(t * 6) + 1) / 2;
  return <g><rect width={1080} height={1920} fill={C.bg} /><g transform="translate(540 900) scale(1.12) translate(-540 -900)"><Hands t={t}><Galeria t={t} red={.4 + pulse * .6} /></Hands></g></g>;
};
// delegada: "vou contar até dez" (mão aberta)
const Contar: React.FC<{t: number}> = ({t}) => {
  const kH = eo(p(t, W('contar', 'contar') - .1, .3));
  return (
    <Olho t={t}>
      <Corredor t={t} police />
      <Delegada x={500} y={980} s={1.2} t={t} talk={t >= SC.contar.v0 && t <= SC.contar.v1} />
      {kH > 0 && <g transform={`translate(760 ${mix(1250, 860, kH)})`}>
        <rect x={-70} y={0} width={140} height={160} rx={30} fill="#C9906F" />
        {[-52, -18, 18, 52].map((x, i) => <rect key={i} x={x - 15} y={-110 + (i === 0 || i === 3 ? 20 : 0)} width={30} height={130} rx={15} fill="#C9906F" />)}
        <rect x={-110} y={30} width={60} height={30} rx={15} fill="#C9906F" transform="rotate(-30 -80 45)" />
      </g>}
    </Olho>
  );
};
const Porta: React.FC<{t: number; focus: number; valdir: number; whistle?: boolean; talk?: boolean; zoom?: number}> = ({t, focus, valdir, whistle, talk, zoom = 1}) => (
  <Olho t={t} zoom={zoom}>
    <Corredor t={t} police />
    {valdir > 0 && <g opacity={valdir} filter={focus < .5 ? 'url(#desfoque)' : undefined}><Valdir x={780} y={900} s={.75} t={t} whistle={whistle} /></g>}
    <g filter={focus >= .5 ? 'url(#desfoque)' : undefined}><Delegada x={470} y={950} s={1.15} t={t} talk={talk} /></g>
  </Olho>
);
const Assobio: React.FC<{t: number}> = ({t}) => {
  const kV = eo(p(t, W('assobio', 'atrás') - .1, .8)), wh = t >= W('assobio', 'alguém');
  return <g><Porta t={t} focus={0} valdir={kV} whistle={wh} /><Notas x={800} y={760} t={t} at={W('assobio', 'alguém')} c={C.red} /></g>;
};
const ValdirCena: React.FC<{t: number}> = ({t}) => (
  <g><Porta t={t} focus={1} valdir={1} whistle={Math.floor(t * 2) % 2 === 0} /><Tag x={540} y={1240} t={t} at={W('valdir', 'porteiro.')} text="SEU VALDIR · PORTEIRO · 22 ANOS" /></g>
);
const Chave: React.FC<{t: number}> = ({t}) => {
  const k = eio(p(t, SC.chave.t0, .5)), kT = eo(p(t, W('chave', 'meu.') - .1, .3)), sw = Math.sin(t * 5) * 8;
  return (
    <Olho t={t}><Corredor t={t} police dark={.4} />
      <g transform={`translate(540 880) scale(${mix(.6, 1.6, k)}) rotate(${sw})`}>
        <circle cx={0} cy={-200} r={70} fill="none" stroke={C.light} strokeWidth={14} />
        {[-40, -12, 16, 44].map((a, i) => <g key={i} transform={`rotate(${a} 0 -200) translate(0 -130)`}><rect x={-14} y={0} width={28} height={190} rx={6} fill={i === 2 ? C.light : C.gray} /><rect x={-14} y={140} width={50} height={18} fill={i === 2 ? C.light : C.gray} /><rect x={-14} y={168} width={36} height={14} fill={i === 2 ? C.light : C.gray} /></g>)}
        <g transform="rotate(16 0 -200) translate(0 90)" opacity={mix(.6, 1, kT)}><rect x={-60} y={0} width={120} height={70} rx={8} fill={kT > .5 ? C.red : C.light} /><Txt x={0} y={50} s={46} f={MONO} w={800} c={kT > .5 ? C.white : C.bg} a="middle">301</Txt></g>
      </g>
    </Olho>
  );
};
// "Aí chegou isso": ameaça + foto da minha porta, tirada agora do corredor
const Chegou: React.FC<{t: number}> = ({t}) => {
  const t0 = SC.chegou.t0, kUp = eo(p(t, t0, .35)), tM = SC.chegou.v1 - .1, kM = back(p(t, tM, .3)), kP = back(p(t, tM + 1.1, .35));
  const vib = (t > tM && t < tM + .4) || (t > tM + 1.1 && t < tM + 1.5) ? Math.sin(t * 120) * 8 : 0;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <g transform={`translate(${vib} ${(1 - kUp) * 1200})`}>
        <Hands t={t}>
          <rect width={504} height={1044} fill="#0B1220" />
          <rect width={504} height={130} fill={C.bubble} />
          <Avatar x={84} y={80} r={30} who="desconhecido" />
          <Txt x={130} y={74} s={26} f={UI} w={800} c={C.white}>+55 (00) 9 ••••-••••</Txt><Txt x={130} y={106} s={20} f={UI} w={600} c={C.gray}>número desconhecido</Txt>
          {kM > 0 && <g transform={`translate(30 190) scale(${kM})`}>
            <rect x={0} y={0} width={440} height={170} rx={26} fill={C.redDeep} />
            <Txt x={26} y={70} s={38} f={HEAD} w={800} c={C.white}>Mostra a foto e você</Txt>
            <Txt x={26} y={122} s={38} f={HEAD} w={800} c={C.white}>é o próximo.</Txt>
          </g>}
          {kP > 0 && <g transform={`translate(30 400) scale(${kP})`}>
            <rect x={0} y={0} width={360} height={470} rx={22} fill={C.bubble} />
            <svg x={14} y={14} width={332} height={400} viewBox="0 0 332 400">
              <rect width={332} height={400} fill={C.wallDeep} /><rect x={90} y={60} width={160} height={300} fill={C.wood} /><rect x={140} y={90} width={60} height={28} fill={C.light} />
              <Txt x={170} y={112} s={22} f={MONO} w={800} c={C.bg} a="middle">301</Txt><circle cx={170} cy={170} r={8} fill="#05070A" /><circle cx={225} cy={230} r={9} fill={C.tape} />
              <rect y={360} width={332} height={40} fill="#2B2F36" /><rect width={332} height={400} fill="#000" opacity={.2} />
            </svg>
            <Txt x={340} y={452} s={20} f={MONO} w={800} c={C.red} a="end">AGORA</Txt>
          </g>}
        </Hands>
      </g>
    </g>
  );
};

// 16–17 · Cartão de decisão com 10 s; voto; cartão final
const Decisao: React.FC<{t: number}> = ({t}) => {
  const tE = SC.um.t0, kCard = eo(p(t, tE, .35)), cnt = clamp((t - T_COUNT0) / 9), sec = t < T_COUNT0 ? 0 : Math.min(10, Math.floor(t - T_COUNT0 + 1e-3) + 1);
  const over = t >= T_END, kOver = eo(p(t, T_END + .2, .5));
  const hiA = t >= W('escolha', 'abro') && t < W('escolha', 'ou'), hiB = t >= W('escolha', 'apago') && t < WE('escolha', 'janela?') + .4;
  const kVote = eo(p(t, W('contagem', 'Comenta') - .1, .35));
  const R0 = 92, L = 2 * Math.PI * R0;
  const opt = (y: number, letter: string, l1: string, l2: string, hi: boolean, d: number) => {
    const k = eo(p(t, tE + .1 + d, .35));
    return (
      <g opacity={k} transform={`translate(${(1 - k) * 60} 0)`}>
        <rect x={90} y={y} width={900} height={170} rx={10} fill={hi ? C.red : C.night2} stroke={hi ? C.red : C.night3} strokeWidth={4} />
        <rect x={112} y={y + 22} width={126} height={126} rx={8} fill={hi ? C.white : C.night3} />
        <Txt x={175} y={y + 112} s={84} f={HEAD} w={800} c={hi ? C.red : C.light} a="middle">{letter}</Txt>
        <Txt x={270} y={y + 76} s={46} f={HEAD} w={800} c={C.white}>{l1}</Txt>
        <Txt x={270} y={y + 130} s={46} f={HEAD} w={800} c={C.white}>{l2}</Txt>
      </g>
    );
  };
  return (
    <g>
      <g opacity={.3}><Olho t={t}><Corredor t={t} police dark={.3} /><Delegada x={470} y={950} s={1.15} t={t} talk={sec > 0 && t - T_COUNT0 - (sec - 1) < .4} /></Olho></g>
      <rect width={1080} height={1920} fill={C.bg} opacity={.6} />
      {!over || kOver < 1 ? (
        <g opacity={1 - kOver}>
          <g opacity={kCard}>
            <circle cx={540} cy={610} r={R0} fill="none" stroke={C.night3} strokeWidth={14} />
            <circle cx={540} cy={610} r={R0} fill="none" stroke={C.red} strokeWidth={14} strokeDasharray={L} strokeDashoffset={L * (1 - cnt)} transform="rotate(-90 540 610)" strokeLinecap="round" />
            <Txt x={540} y={642} s={92} f={MONO} w={800} c={sec >= 8 ? C.red : C.white} a="middle">{sec}</Txt>
            <Txt x={540} y={480} s={24} f={MONO} w={800} c={C.gray} a="middle" ls={4}>A DELEGADA ESTÁ CONTANDO</Txt>
          </g>
          {opt(800, 'A', 'ABRIR E MOSTRAR', 'A FOTO', hiA, 0)}
          {opt(1000, 'B', 'APAGAR TUDO E', 'FUGIR PELA JANELA', hiB, .12)}
          <g opacity={kVote}><rect x={190} y={1205} width={700} height={74} rx={37} fill="none" stroke={C.light} strokeWidth={3} /><Txt x={540} y={1254} s={30} f={MONO} w={800} c={C.light} a="middle" ls={2}>VOTE NOS COMENTÁRIOS: A OU B</Txt></g>
        </g>
      ) : null}
      {over && (
        <g opacity={kOver}>
          <Txt x={540} y={760} s={150} f={HEAD} w={800} c={C.white} a="middle" ls={-4}>10</Txt>
          <Txt x={540} y={850} s={64} f={HEAD} w={800} c={C.red} a="middle" ls={10}>SEGUNDOS</Txt>
          <line x1={340} x2={740} y1={910} y2={910} stroke={C.night3} strokeWidth={3} />
          <Txt x={540} y={980} s={34} f={MONO} w={800} c={C.light} a="middle" ls={4}>O PRÉDIO · EP. 2 EM BREVE</Txt>
          <Txt x={540} y={560} s={30} f={MONO} w={800} c={C.red} a="middle" ls={6}>A MAÇANETA GIROU.</Txt>
          <Txt x={540} y={1050} s={32} f={UI} w={700} c={C.gray} a="middle">Comenta A ou B. Eu faço o que vocês mandarem.</Txt>
        </g>
      )}
    </g>
  );
};

// ── HUD (barra de status): selo do episódio e hora real
const clockOf = (t: number) => {
  if (t < SC.mensagem.t0) return '03:10';
  if (t < SC.morto.t0) return '03:12';
  if (t < SC.policia.t0) return '07:04';
  return `07:${pad2(31 + Math.min(9, (t - SC.policia.t0) / 6.5))}`;
};
const Hud: React.FC<{t: number}> = ({t}) => {
  const end = t >= T_END + .2;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect x={90} y={262} width={164} height={52} rx={4} fill={C.red} />
      <Txt x={172} y={298} s={28} f={MONO} w={800} c={C.white} a="middle" ls={2}>● EP. 1</Txt>
      <Txt x={90} y={352} s={22} f={MONO} w={800} c={C.gray} ls={4}>10 SEGUNDOS · O PRÉDIO</Txt>
      {!end && <g><Txt x={990} y={300} s={44} f={MONO} w={800} c={C.light} a="end">{clockOf(t)}</Txt><Txt x={990} y={352} s={22} f={MONO} w={800} c={C.gray} a="end" ls={3}>SÁBADO</Txt></g>}
    </svg>
  );
};

// ── Legendas palavra a palavra (Sora 800; palavra falada em vermelho nos momentos de perigo)
const DANGER = new Set(['foto', 'morto', 'suspeito', 'cama', 'assobio', 'chave', 'chegou', 'escolha']);
const WHO: Record<string, string> = {elias: 'SEU ELIAS · ÁUDIO', delegada: 'DELEGADA ROCHA'};
const Captions: React.FC<{t: number}> = ({t}) => {
  const cap = CAPS.find((c) => t >= c.start - .02 && t < c.end);
  if (!cap) return null;
  const who = WHO[cap.voz]; const danger = DANGER.has(cap.scene);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1400, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {who && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: C.bg, background: C.light, padding: '4px 12px', marginBottom: 8}}>{who}</div>}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, fontFamily: HEAD, fontWeight: 800, fontSize: 70, lineHeight: 1.1, textTransform: 'uppercase', fontStyle: who ? 'italic' : 'normal'}}>
        {cap.words.map(([w, s, e], i) => {
          if (t < s - .04) return null;
          const k = eo(p(t, s - .04, .1)); const cur = t >= s - .04 && (t < e + .08 || i === cap.words.length - 1);
          return <span key={i} style={{opacity: k, transform: `translateY(${(1 - k) * 12}px)`, display: 'inline-block', color: cur ? (danger ? C.red : C.white) : '#9AA3B2', WebkitTextStroke: `9px ${C.bg}`, paintOrder: 'stroke fill'}}>{w}</span>;
        })}
      </div>
    </div>
  );
};

const SCENES: Array<[string, React.FC<{t: number}>]> = [
  ['foto', Foto], ['mensagem', Mensagem], ['morto', Morto], ['suspeito', Suspeito], ['policia', Policia], ['corrente', Corrente], ['som', Som], ['cama', Cama],
  ['contar', Contar], ['assobio', Assobio], ['valdir', ValdirCena], ['chave', Chave], ['chegou', Chegou],
];

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  loadFonts();
  const frame = useCurrentFrame(); const t = still ?? frame / TL.fps;
  const cur = SCENES.find(([k]) => inS(t, k));
  const isDec = t >= SC.um.t0;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="olhoClip"><circle cx={OC[0]} cy={OC[1]} r={OR} /></clipPath>
          <radialGradient id="olhoVinheta" cx=".5" cy=".5" r=".5"><stop offset=".62" stopColor="#000" stopOpacity={0} /><stop offset=".9" stopColor="#000" stopOpacity={.55} /><stop offset="1" stopColor="#000" stopOpacity={.95} /></radialGradient>
          <filter id="olho" filterUnits="userSpaceOnUse" x={-200} y={140} width={1480} height={1480} colorInterpolationFilters="sRGB">
            <feImage href={OLHO_MAPA} x={110} y={450} width={860} height={860} preserveAspectRatio="none" result="mapa" />
            <feDisplacementMap in="SourceGraphic" in2="mapa" scale={420} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="desfoque"><feGaussianBlur stdDeviation={7} /></filter>
        </defs>
        {cur && !isDec && React.createElement(cur[1], {t})}
        {isDec && <Decisao t={t} />}
      </svg>
      <Hud t={t} />
      <Captions t={t} />
      {audio && !still && (
        <>
          <Audio src={staticFile('assets/audio/trilha.wav')} />
          <Audio src={staticFile('assets/audio/contagem.wav')} volume={.8} />
          {TL.scenes.map((s) => (
            <Sequence key={s.key} from={Math.round(s.v0 * TL.fps)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
