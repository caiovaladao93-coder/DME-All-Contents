// Série "10 SEGUNDOS" · temporada "O prédio" · Ep. 2 "O saco de evidência" (9:16). Suspense em PRIMEIRA PESSOA, sem sangue.
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
const T_COUNT0 = SC.escolha.t0 + .3, T_END = T_COUNT0 + 10; // 10 degraus, um por segundo
// batidas na porta (usadas na imagem e na trilha): 3 no início de "batida", 2 no início de "entao"
export const KNOCKS = [T_END + .2, T_END + .5, T_END + .8];
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
const Valdir: React.FC<{x: number; y: number; s?: number; t: number; whistle?: boolean; talk?: boolean}> = ({x, y, s = 1, t, whistle, talk}) => {
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
      {whistle ? <circle cx={0} cy={66} r={9} fill="#3A1C1C" /> : talk && Math.floor(t * 12) % 3 !== 0 ? <ellipse cx={0} cy={66} rx={20} ry={11} fill="#3A1C1C" /> : <path d="M-22 60 Q0 74 22 60" fill="none" stroke="#7A3E3A" strokeWidth={6} strokeLinecap="round" />}
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

// ── CENAS (ep. 2) ─────────────────────────────────────────────────────────────
// foto escura do quarto (eu dormindo); com `saco`, aparece o saco de evidência no chão, ao lado da cama
const SacoEvid: React.FC<{x: number; y: number; s?: number; rot?: number; mark?: number}> = ({x, y, s = 1, rot = 0, mark = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-120} y={-160} width={240} height={320} rx={10} fill="#C9D3DE" opacity={.55} />
    <rect x={-120} y={-160} width={240} height={46} fill={C.red} opacity={.9} />
    <Txt x={0} y={-128} s={22} f={MONO} w={800} c={C.white} a="middle" ls={3}>EVIDÊNCIA</Txt>
    <rect x={-56} y={-90} width={112} height={200} rx={16} fill="#05070A" /><rect x={-48} y={-80} width={96} height={180} rx={10} fill={C.screen} />
    <rect x={-104} y={116} width={208} height={34} fill={C.white} opacity={.9} />
    <Txt x={0} y={142} s={26} f={HEAD} w={800} c={C.bg} a="middle">Nº 0412</Txt>
    {mark > 0 && <ellipse cx={0} cy={133} rx={130 * mark} ry={34 * mark} fill="none" stroke={C.red} strokeWidth={6} />}
  </g>
);
const FotoQuarto: React.FC<{w: number; h: number; t: number; saco?: number}> = ({w, h, t, saco = 0}) => {
  const br = Math.sin(t * 1.4) * 2;
  return (
    <g>
      <rect width={w} height={h} fill="#0A0E16" />
      <polygon points={`${w * .62},0 ${w * .92},0 ${w},${h * .55} ${w * .5},${h * .45}`} fill="#1C2740" opacity={.7} />
      <rect x={w * .66} y={h * .05} width={w * .22} height={h * .26} fill="#1B2742" /><line x1={w * .77} x2={w * .77} y1={h * .05} y2={h * .31} stroke="#0A0E16" strokeWidth={6} />
      <rect x={-20} y={h * .62} width={w + 40} height={h * .5} fill="#0D121C" />
      <path d={`M${w * .1} ${h * .52} L${w * .9} ${h * .52} L${w * 1.02} ${h * .98} L${w * -.02} ${h * .98}Z`} fill="#1A2233" />
      <ellipse cx={w * .5} cy={h * .4} rx={w * .34} ry={h * .085} fill="#3A4560" />
      <g transform={`translate(${w * .5} ${h * .41 - br * .3}) rotate(-12)`}>
        <ellipse cx={0} cy={0} rx={w * .13} ry={w * .15} fill="#8A6450" />
        <path d={`M${-w * .14} ${-w * .02} Q${-w * .12} ${-w * .18} 0 ${-w * .17} Q${w * .13} ${-w * .17} ${w * .14} ${-w * .03} Q${w * .08} ${-w * .1} 0 ${-w * .1} Q${-w * .09} ${-w * .1} ${-w * .14} ${-w * .02}Z`} fill="#0B0D12" />
        <path d={`M${-w * .07} ${w * .015} q${w * .025} ${w * .02} ${w * .05} 0`} fill="none" stroke="#2A1C16" strokeWidth={5} strokeLinecap="round" />
        <path d={`M${w * .02} ${w * .015} q${w * .025} ${w * .02} ${w * .05} 0`} fill="none" stroke="#2A1C16" strokeWidth={5} strokeLinecap="round" />
      </g>
      <path d={`M${w * .06} ${h * .53 - br} Q${w * .5} ${h * .47 - br * 1.6} ${w * .94} ${h * .53 - br} L${w * 1.02} ${h * .99} L${w * -.02} ${h * .99}Z`} fill="#46537A" />
      <path d={`M${w * .2} ${h * .62 - br} Q${w * .5} ${h * .56 - br} ${w * .8} ${h * .64 - br}`} fill="none" stroke="#2A3346" strokeWidth={8} />
      {saco > 0 && <SacoEvid x={w * .1} y={h * .86} s={w / 1400} rot={-18} mark={saco > 1 ? saco - 1 : 0} />}
      <rect width={w} height={h} fill="#000" opacity={.12} />
    </g>
  );
};
// notebook na mesa, no escuro
const Notebook: React.FC<{t: number; children: React.ReactNode; zoom?: number; cx?: number; cy?: number}> = ({t, children, zoom = 1, cx = 540, cy = 860}) => (
  <g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(-540 -860)`}>
    <rect width={1080} height={1920} fill="#05070A" />
    <polygon points="70,1240 1010,1240 1080,1420 0,1420" fill="#121820" />
    <rect x={100} y={480} width={880} height={600} rx={22} fill="#0B0E13" stroke="#1C222B" strokeWidth={6} />
    <svg x={124} y={504} width={832} height={552} viewBox="0 0 832 552">{children}</svg>
    <circle cx={540} cy={492} r={5} fill={Math.floor(t * 2) % 2 ? C.grayDim : '#2B323C'} />
    <polygon points="60,1080 1020,1080 1080,1150 0,1150" fill="#1C222B" />
    <rect x={460} y={1092} width={160} height={14} rx={7} fill="#0B0E13" />
    <polygon points="0,1150 1080,1150 1080,1920 0,1920" fill="#000" opacity={.4} />
  </g>
);
const Foto: React.FC<{t: number}> = ({t}) => {
  const z = eo(p(t, 0, SC.foto.t1)) * .1;
  return (
    <Notebook t={t} zoom={1.55 + z} cy={985}>
      <rect width={832} height={552} fill="#0B1220" />
      <rect width={832} height={44} fill={C.bubble} /><Txt x={150} y={30} s={18} f={UI} w={800} c={C.light}>Fotos · do celular</Txt>
      <Txt x={682} y={30} s={18} f={MONO} w={800} c={C.red} a="end">HOJE · 02:47</Txt>
      <svg x={136} y={58} width={560} height={480} viewBox="0 0 560 480"><FotoQuarto w={560} h={480} t={t} /></svg>
    </Notebook>
  );
};
// porta aberta (sem lente): corredor, delegada na frente, porteiro atrás
const CorredorAberto: React.FC<{t: number; children?: React.ReactNode; dark?: number}> = ({t, children, dark = 0}) => (
  <g>
    <g transform="translate(540 900) scale(1.32) translate(-540 -880)"><Corredor t={t} police />{children}{dark > 0 && <rect x={-300} y={100} width={1680} height={1600} fill="#000" opacity={dark} />}</g>
    <rect x={0} y={0} width={70} height={1920} fill={C.woodDeep} /><rect x={1010} y={0} width={70} height={1920} fill={C.woodDeep} />
  </g>
);
const Recap: React.FC<{t: number}> = ({t}) => {
  const tA = W('recap', 'abri.') - .2, kO = eio(p(t, tA, .8)), kC = eo(p(t, SC.recap.t0 + .1, .35));
  return (
    <g>
      <CorredorAberto t={t} dark={.3}><Delegada x={430} y={1010} s={1.0} t={t} /><Valdir x={760} y={930} s={.7} t={t} whistle /></CorredorAberto>
      {/* a minha porta abrindo (folha vista por dentro) */}
      <g transform={`translate(${mix(70, -900, kO)} 0)`}><rect x={0} y={0} width={1010} height={1920} fill={C.wood} /><rect x={80} y={300} width={850} height={620} fill="none" stroke={C.woodDeep} strokeWidth={14} /><rect x={80} y={1060} width={850} height={620} fill="none" stroke={C.woodDeep} strokeWidth={14} /><circle cx={505} cy={880} r={30} fill="#9AA0A8" /><rect x={880} y={1220} width={90} height={30} rx={14} fill="#9AA0A8" /></g>
      {kC > 0 && <g transform={`translate(540 720) rotate(-3) scale(${mix(1.4, 1, kC)})`} opacity={kC * (1 - p(t, SC.recap.t1 - .4, .4))}>
        <rect x={-400} y={-120} width={800} height={240} rx={12} fill={C.bg} stroke={C.red} strokeWidth={5} />
        <Txt x={0} y={-50} s={30} f={MONO} w={800} c={C.gray} a="middle" ls={6}>VOCÊS ESCOLHERAM</Txt>
        <Txt x={0} y={40} s={64} f={HEAD} w={800} c={C.white} a="middle">A · ABRIR E</Txt>
        <Txt x={0} y={100} s={44} f={HEAD} w={800} c={C.red} a="middle">MOSTRAR A FOTO</Txt>
      </g>}
    </g>
  );
};
// play na foto, no corredor: o assobio toca; o porteiro para de assobiar
const Galeria: React.FC<{t: number; live?: number; prog?: number}> = ({t, live = 0, prog}) => (
  <g>
    <rect width={504} height={1044} fill="#05070A" />
    <Txt x={252} y={86} s={26} f={UI} w={800} c={C.white} a="middle">Ontem</Txt>
    <Txt x={252} y={118} s={22} f={MONO} w={800} c={C.red} a="middle">03:10</Txt>
    <svg x={0} y={170} width={504} height={680} viewBox="0 0 504 680"><g transform={`translate(${live ? Math.sin(t * 37) * 4 : 0} 0)`}><FotoQuarto w={504} h={680} t={live ? t * 3.7 : t} /></g></svg>
    {prog !== undefined && <g><rect x={40} y={890} width={424} height={8} rx={4} fill={C.grayDim} /><rect x={40} y={890} width={424 * prog} height={8} rx={4} fill={C.red} /></g>}
  </g>
);
const Play: React.FC<{t: number}> = ({t}) => {
  const tL = SC.play.v1 + .1, prog = clamp((t - tL) / 3), live = t >= tL && t < tL + 3;
  return (
    <g>
      <CorredorAberto t={t} dark={.25}><Delegada x={430} y={1010} s={1.0} t={t} look={1} /><Valdir x={760} y={930} s={.7} t={t} whistle={t < tL + 1.2} /></CorredorAberto>
      <g transform="translate(0 520)"><Hands t={t}><Galeria t={t} live={live ? 1 : 0} prog={t >= tL ? prog : undefined} /></Hands></g>
      {live && <Notas x={640} y={1150} t={t} at={tL + .1} c={C.red} />}
    </g>
  );
};
const Parou: React.FC<{t: number}> = ({t}) => {
  const z = eio(p(t, SC.parou.t0, 1.2));
  return (
    <g transform={`translate(760 880) scale(${1 + z * .55}) translate(-760 -880)`}>
      <CorredorAberto t={t} dark={.2}><g filter="url(#desfoque)"><Delegada x={430} y={1010} s={1.0} t={t} look={1} /></g><Valdir x={760} y={930} s={.7} t={t} /></CorredorAberto>
    </g>
  );
};
const ValdirFala: React.FC<{t: number}> = ({t}) => (
  <g transform="translate(760 880) scale(1.55) translate(-760 -880)">
    <CorredorAberto t={t} dark={.2}><g filter="url(#desfoque)"><Delegada x={430} y={1010} s={1.0} t={t} /></g><Valdir x={760} y={930} s={.7} t={t} talk={t >= SC.valdir.v0 && t <= SC.valdir.v1} /></CorredorAberto>
  </g>
);
const DelegadaFala: React.FC<{t: number}> = ({t}) => {
  const kB = eo(p(t, W('delegada', 'prova.') - .3, .4));
  return (
    <g>
      <g transform="translate(430 900) scale(1.4) translate(-430 -900)"><CorredorAberto t={t} dark={.2}><Delegada x={430} y={1010} s={1.0} t={t} talk={t >= SC.delegada.v0 && t <= SC.delegada.v1} /><g filter="url(#desfoque)"><Valdir x={760} y={930} s={.7} t={t} /></g></CorredorAberto></g>
      {kB > 0 && <g transform={`translate(${mix(700, 640, kB)} ${mix(1500, 1130, kB)}) rotate(-8)`} opacity={kB}><SacoEvid x={0} y={0} s={1.1} /></g>}
    </g>
  );
};
const Levou: React.FC<{t: number}> = ({t}) => {
  const kF = eio(p(t, W('levou', 'única') - .3, .9));
  return (
    <g>
      <CorredorAberto t={t} dark={.35}><g transform={`translate(${-kF * 200} 0)`}><Delegada x={430} y={1010} s={1.0} t={t} /></g></CorredorAberto>
      <g transform={`translate(${mix(560, 260, kF)} ${mix(1130, 1060, kF)}) rotate(-8)`}><SacoEvid x={0} y={0} s={1.0} /></g>
      <g transform={`translate(${mix(-1010, 70, kF)} 0)`}><rect x={0} y={0} width={1010} height={1920} fill={C.wood} /><rect x={80} y={300} width={850} height={620} fill="none" stroke={C.woodDeep} strokeWidth={14} /><circle cx={505} cy={880} r={30} fill="#9AA0A8" /></g>
    </g>
  );
};
// o dia trancando a casa (montagem)
const Dia: React.FC<{t: number}> = ({t}) => {
  const a = [W('dia', 'Passei'), W('dia', 'Troquei'), W('dia', 'Passei', 1), W('dia', 'Dormi')];
  const k = a.map((x) => back(p(t, x - .1, .35)));
  const hora = ['09:12', '13:40', '19:05', '02:00'];
  const painel = (i: number, x: number, y: number, inner: React.ReactNode) => k[i] > 0 && (
    <g transform={`translate(${x} ${y}) rotate(${[-2, 1.5, -1, 2][i]}) scale(${k[i]})`}>
      <rect x={-210} y={-230} width={420} height={460} rx={8} fill={C.night2} stroke={C.night3} strokeWidth={4} />
      <svg x={-200} y={-220} width={400} height={380} viewBox="0 0 400 380">{inner}</svg>
      <Txt x={0} y={204} s={34} f={MONO} w={800} c={i === 3 ? C.red : C.light} a="middle">{hora[i]}</Txt>
    </g>
  );
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      {painel(0, 300, 690, <g><rect width={400} height={380} fill="#0B1220" /><circle cx={200} cy={170} r={110} fill="none" stroke={C.light} strokeWidth={10} /><circle cx={200} cy={170} r={8} fill={C.light} /><line x1={200} y1={170} x2={200} y2={95} stroke={C.light} strokeWidth={8} /><line x1={200} y1={170} x2={250} y2={190} stroke={C.light} strokeWidth={6} /><Txt x={200} y={350} s={26} f={MONO} w={800} c={C.gray} a="middle">ACORDADO</Txt></g>)}
      {painel(1, 780, 690, <g><rect width={400} height={380} fill={C.wood} /><rect x={130} y={90} width={140} height={200} rx={16} fill="#B9BEC6" /><circle cx={200} cy={160} r={34} fill="#6E747C" /><rect x={188} y={120} width={24} height={80} rx={6} fill="#3A3F46" /><Txt x={200} y={350} s={26} f={MONO} w={800} c={C.bg} a="middle">FECHADURA NOVA</Txt></g>)}
      {painel(2, 300, 1180, <g><rect width={400} height={380} fill={C.wood} /><rect x={60} y={120} width={280} height={36} rx={10} fill="#8D939B" />{Array.from({length: 6}, (_, i) => <ellipse key={i} cx={90 + i * 44} cy={138} rx={22} ry={11} fill="none" stroke="#D8DEE8" strokeWidth={7} />)}<Txt x={200} y={350} s={26} f={MONO} w={800} c={C.bg} a="middle">CORRENTE</Txt></g>)}
      {painel(3, 780, 1180, <g><rect width={400} height={380} fill="#0A0E16" /><Txt x={200} y={200} s={110} f={MONO} w={800} c={C.red} a="middle">02:00</Txt><Txt x={200} y={350} s={26} f={MONO} w={800} c={C.gray} a="middle">DORMI</Txt></g>)}
    </g>
  );
};
// 02:47: a foto chega no notebook; zoom no saco de evidência
const NotebookCena: React.FC<{t: number}> = ({t}) => {
  const kN = back(p(t, SC.notebook.t0 + .3, .35)), kF = eo(p(t, W('notebook', 'essa') - .1, .4));
  return (
    <Notebook t={t} zoom={1.1}>
      <rect width={832} height={552} fill="#0B1220" />
      {kF > 0 && <g opacity={kF}><rect width={832} height={44} fill={C.bubble} /><Txt x={20} y={30} s={20} f={UI} w={800} c={C.light}>Fotos · sincronizadas do celular</Txt><Txt x={812} y={30} s={20} f={MONO} w={800} c={C.red} a="end">HOJE · 02:47</Txt>
        <svg x={136} y={58} width={560} height={480} viewBox="0 0 560 480"><FotoQuarto w={560} h={480} t={t} saco={1} /></svg></g>}
      {kN > 0 && <g transform={`translate(${mix(832, 492, kN)} 70)`}><rect width={320} height={110} rx={14} fill={C.bubble} stroke={C.night3} strokeWidth={2} /><Txt x={20} y={40} s={20} f={UI} w={800} c={C.white}>1 foto nova</Txt><Txt x={20} y={72} s={18} f={UI} w={600} c={C.light}>enviada de: Meu celular</Txt><Txt x={300} y={40} s={18} f={MONO} w={800} c={C.red} a="end">02:47</Txt></g>}
    </Notebook>
  );
};
const Saco: React.FC<{t: number}> = ({t}) => {
  const z = eio(p(t, W('saco', 'chão') - .2, 1.4)), mk = eo(p(t, W('saco', 'número') - .1, .4));
  return (
    <Notebook t={t} zoom={mix(1.1, 3.6, z)} cx={mix(540, 540 + (540 - 316) * 3.6, z)} cy={mix(860, 860 - (975 - 860) * 3.6 - 80, z)}>
      <rect width={832} height={552} fill="#0B1220" />
      <svg x={136} y={58} width={560} height={480} viewBox="0 0 560 480"><FotoQuarto w={560} h={480} t={t} saco={1 + mk} /></svg>
    </Notebook>
  );
};
// a corrente balança no escuro; passos na escada (olho mágico escuro)
const Corrente: React.FC<{t: number}> = ({t}) => {
  const t0 = SC.corrente.t0 + .2, sw = t > t0 ? Math.sin((t - t0) * 3.2) * 22 * Math.exp(-(t - t0) * .3) : 0;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.woodDeep} />
      <rect x={90} y={300} width={900} height={1300} fill={C.wood} />
      <rect x={640} y={940} width={150} height={220} rx={16} fill="#8D939B" /><circle cx={715} cy={1010} r={36} fill="#6E747C" />
      <rect x={560} y={560} width={260} height={46} rx={10} fill="#8D939B" /><rect x={580} y={576} width={200} height={14} rx={7} fill="#3A3F46" />
      <g transform={`translate(780 583) rotate(${sw - 90})`}>{Array.from({length: 5}, (_, i) => <ellipse key={i} cx={0} cy={30 + i * 40} rx={i % 2 ? 9 : 16} ry={24} fill="none" stroke="#B9BEC6" strokeWidth={8} />)}</g>
      <rect width={1080} height={1920} fill="#000" opacity={.62} />
      <Tag x={540} y={1300} t={t} at={W('corrente', 'Balançando.')} text="A CORRENTE ESTAVA PASSADA" danger />
    </g>
  );
};
const Passos: React.FC<{t: number}> = ({t}) => {
  const fl = Math.floor(t * 7) % 5 === 0 ? .55 : .25;
  return (
    <g>
      <Olho t={t}><Corredor t={t} dark={.7} /><rect x={110} y={450} width={220} height={860} fill={C.tape} opacity={fl * .25} /></Olho>
      <Tag x={540} y={1240} t={t} at={W('passos', 'Subindo.')} text="PASSOS NA ESCADA" danger />
    </g>
  );
};

// 16–17 · Cartão de decisão com 10 s; voto; cartão final
const Decisao: React.FC<{t: number}> = ({t}) => {
  const tE = SC.escolha.t0, kCard = eo(p(t, tE, .35)), cnt = clamp((t - T_COUNT0) / 10), sec = t < T_COUNT0 ? 0 : Math.min(10, Math.floor(t - T_COUNT0 + 1e-3) + 1);
  const over = t >= T_END, kOver = eo(p(t, T_END + .2, .5));
  const hiA = t >= W('escolha', 'ligo') && t < W('escolha', 'ou'), hiB = t >= W('escolha', 'bato') && t < WE('escolha', 'porteiro?') + .4;
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
      <g opacity={.3}><Olho t={t}><Corredor t={t} dark={.6} /></Olho></g>
      <rect width={1080} height={1920} fill={C.bg} opacity={.6} />
      {!over || kOver < 1 ? (
        <g opacity={1 - kOver}>
          <g opacity={kCard}>
            <circle cx={540} cy={610} r={R0} fill="none" stroke={C.night3} strokeWidth={14} />
            <circle cx={540} cy={610} r={R0} fill="none" stroke={C.red} strokeWidth={14} strokeDasharray={L} strokeDashoffset={L * (1 - cnt)} transform="rotate(-90 540 610)" strokeLinecap="round" />
            <Txt x={540} y={642} s={92} f={MONO} w={800} c={sec >= 8 ? C.red : C.white} a="middle">{sec}</Txt>
            <Txt x={540} y={480} s={24} f={MONO} w={800} c={C.gray} a="middle" ls={4}>ALGUÉM ESTÁ SUBINDO · DEGRAU</Txt>
          </g>
          {opt(800, 'A', 'LIGAR PRA', 'DELEGADA', hiA, 0)}
          {opt(1000, 'B', 'BATER NA PORTA', 'DO PORTEIRO', hiB, .12)}
          <g opacity={kVote}><rect x={190} y={1205} width={700} height={74} rx={37} fill="none" stroke={C.light} strokeWidth={3} /><Txt x={540} y={1254} s={30} f={MONO} w={800} c={C.light} a="middle" ls={2}>VOTE NOS COMENTÁRIOS: A OU B</Txt></g>
        </g>
      ) : null}
      {over && (
        <g opacity={kOver}>
          <Txt x={540} y={760} s={150} f={HEAD} w={800} c={C.white} a="middle" ls={-4}>10</Txt>
          <Txt x={540} y={850} s={64} f={HEAD} w={800} c={C.red} a="middle" ls={10}>SEGUNDOS</Txt>
          <line x1={340} x2={740} y1={910} y2={910} stroke={C.night3} strokeWidth={3} />
          <Txt x={540} y={980} s={34} f={MONO} w={800} c={C.light} a="middle" ls={4}>O PRÉDIO · EP. 3 EM BREVE</Txt>
          <Txt x={540} y={560} s={30} f={MONO} w={800} c={C.red} a="middle" ls={6}>BATERAM NA MINHA PORTA.</Txt>
          <Txt x={540} y={1050} s={32} f={UI} w={700} c={C.gray} a="middle">Comenta A ou B. Eu faço o que vocês mandarem.</Txt>
        </g>
      )}
    </g>
  );
};

// ── HUD (barra de status): selo do episódio e hora real
const clockOf = (t: number) => {
  if (t < SC.recap.t0) return '02:47';
  if (t < SC.dia.t0) return `07:${pad2(40 + Math.min(4, (t - SC.recap.t0) / 7))}`;
  if (t < SC.notebook.t0) return '—';
  return `02:${pad2(47 + Math.min(2, (t - SC.notebook.t0) / 14))}`;
};
const Hud: React.FC<{t: number}> = ({t}) => {
  const end = t >= T_END + .2;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect x={90} y={262} width={164} height={52} rx={4} fill={C.red} />
      <Txt x={172} y={298} s={28} f={MONO} w={800} c={C.white} a="middle" ls={2}>● EP. 2</Txt>
      <Txt x={90} y={352} s={22} f={MONO} w={800} c={C.gray} ls={4}>10 SEGUNDOS · O PRÉDIO</Txt>
      {!end && <g><Txt x={990} y={300} s={44} f={MONO} w={800} c={C.light} a="end">{clockOf(t)}</Txt><Txt x={990} y={352} s={22} f={MONO} w={800} c={C.gray} a="end" ls={3}>{t >= SC.recap.t0 && t < SC.dia.t0 ? 'SÁBADO' : 'DOMINGO'}</Txt></g>}
    </svg>
  );
};

// ── Legendas palavra a palavra (Sora 800; palavra falada em vermelho nos momentos de perigo)
const DANGER = new Set(['foto', 'parou', 'saco', 'corrente', 'passos', 'escolha']);
const WHO: Record<string, string> = {elias: 'SEU ELIAS · ÁUDIO', delegada: 'DELEGADA ROCHA', valdir: 'SEU VALDIR'};
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
  ['foto', Foto], ['recap', Recap], ['play', Play], ['parou', Parou], ['valdir', ValdirFala], ['delegada', DelegadaFala], ['levou', Levou], ['dia', Dia],
  ['notebook', NotebookCena], ['saco', Saco], ['corrente', Corrente], ['passos', Passos],
];

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  loadFonts();
  const frame = useCurrentFrame(); const t = still ?? frame / TL.fps;
  const cur = SCENES.find(([k]) => inS(t, k));
  const isDec = t >= SC.escolha.t0;
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
          {TL.scenes.map((s) => (
            <Sequence key={s.key} from={Math.round(s.v0 * TL.fps)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
