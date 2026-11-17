// Série "72 HORAS" · Parte 1 "O GALPÃO" (9:16). Câmera subjetiva: só objetos, telas e papéis; nenhuma pessoa em cena.
// Todos os tempos vêm de src/data/timeline.json (falas reais). Dados da história são fictícios.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
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
const inScene = (t: number, k: string, pre = 0, post = 0) => t >= SC[k].t0 - pre && t < SC[k].t1 + post;
const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');

// ── relógio da história: 72 h começam quando ela acende as luzes (06:40). Entre marcos, o tempo corre acelerado.
const tHoras = W('gancho', 'horas'), tSeis = W('luzes', 'Seis'), tOito = W('telefone', 'Oito'), tDez = W('email', 'Dez');
const KEYS: Array<[number, number]> = [[tHoras, 0], [tSeis, tSeis - tHoras], [tOito, tSeis - tHoras + 80 * 60], [tDez, tSeis - tHoras + 215 * 60]];
const storyS = (t: number) => {
  if (t <= KEYS[0][0]) return 0;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [a, sa] = KEYS[i], [b, sb] = KEYS[i + 1];
    if (t < b) { const k = (t - a) / (b - a); return sa + (sb - sa) * (i === 0 ? k : eio(k)); }
  }
  const [a, sa] = KEYS[KEYS.length - 1]; return sa + (t - a);
};
const T_END_COUNT = SC.escolha.t0 + .25 + 10; // fim da contagem de 10 s
const remaining = (t: number) => Math.max(0, 72 * 3600 - storyS(Math.min(t, T_END_COUNT)));
const fmtClock = (s: number) => `${pad2(s / 3600)}:${pad2((s % 3600) / 60)}:${pad2(s % 60)}`;
const wallClock = (t: number) => { const s = 6 * 3600 + 40 * 60 + (storyS(Math.min(t, T_END_COUNT)) - (tSeis - tHoras)); return `${pad2(s / 3600)}:${pad2((s % 3600) / 60)}`; };

// ── peças comuns
const Txt: React.FC<{x: number; y: number; s: number; f?: string; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; ls?: number; o?: number; children: React.ReactNode; it?: boolean}> = ({x, y, s, f = UI, w = 700, c = C.steel, a = 'start', ls = 0, o = 1, children, it}) => (
  <text x={x} y={y} fontSize={s} fontFamily={f} fontWeight={w} fill={c} textAnchor={a} letterSpacing={ls} opacity={o} fontStyle={it ? 'italic' : 'normal'}>{children}</text>
);
const Stamp: React.FC<{x: number; y: number; t: number; at: number; text: string; s?: number; rot?: number; sub?: string}> = ({x, y, t, at, text, s = 64, rot = -9, sub}) => {
  const k = p(t, at, .16); if (k <= 0) return null;
  const sc = mix(2.1, 1, eo(k)); const wdt = text.length * s * .66 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={clamp(k * 3)}>
      <rect x={-wdt / 2} y={-s * .95} width={wdt} height={s * (sub ? 1.75 : 1.35)} rx={10} fill="none" stroke={C.red} strokeWidth={7} />
      <Txt x={0} y={s * .1} s={s} f={HEAD} w={800} c={C.red} a="middle" ls={3}>{text}</Txt>
      {sub && <Txt x={0} y={s * .62} s={s * .36} f={MONO} w={700} c={C.red} a="middle" ls={2}>{sub}</Txt>}
    </g>
  );
};
const Circle: React.FC<{cx: number; cy: number; rx: number; ry: number; t: number; at: number; c?: string; sw?: number}> = ({cx, cy, rx, ry, t, at, c = C.red, sw = 7}) => {
  const k = eo(p(t, at, .35)); if (k <= 0) return null; const L = 2 * Math.PI * Math.max(rx, ry) * 1.15;
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} transform={`rotate(-4 ${cx} ${cy})`} />;
};
const Tag: React.FC<{x: number; y: number; t: number; at: number; text: string; c?: string; a?: 'start' | 'middle'}> = ({x, y, t, at, text, c = C.amber, a = 'middle'}) => {
  const k = eo(p(t, at, .3)); if (k <= 0) return null; const w = text.length * 19.5 + 56; const x0 = a === 'middle' ? x - w / 2 : x;
  return (
    <g opacity={k} transform={`translate(0 ${(1 - k) * 18})`}>
      <rect x={x0} y={y - 40} width={w} height={60} rx={6} fill={C.bg} stroke={c} strokeWidth={3} />
      <Txt x={x0 + w / 2} y={y} s={30} f={MONO} w={800} c={c} a="middle" ls={1}>{text}</Txt>
    </g>
  );
};
// poeira determinística sobre superfícies
const Dust: React.FC<{n: number; x: number; y: number; w: number; h: number; seed?: number; o?: number}> = ({n, x, y, w, h, seed = 1, o = .12}) => (
  <g opacity={o}>{Array.from({length: n}, (_, i) => <circle key={i} cx={x + rnd(i + seed) * w} cy={y + rnd(i * 3.1 + seed) * h} r={.8 + rnd(i * 7.7 + seed) * 2.2} fill={C.steel} />)}</g>
);

// ── CENAS ─────────────────────────────────────────────────────────────────────

// 1 · Portão do galpão à noite; a chave gira; o portão sobe em "vida"
const Gancho: React.FC<{t: number}> = ({t}) => {
  const tChave = SC.gancho.t0 + .35, tGira = W('gancho', 'pai…') - .1, tSobe = W('gancho', 'vida.') + .15;
  const kIn = eo(p(t, tChave, .9)), kRot = eio(p(t, tGira, .35)), kUp = eio(p(t, tSobe, .7));
  const slats = Array.from({length: 24}, (_, i) => i);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill={C.bg} />
      {/* luz de poste: feixe duro vindo de cima à esquerda */}
      <polygon points="80,300 260,300 760,1400 -200,1400" fill={C.steel} opacity={.045} />
      {/* interior escuro atrás do portão */}
      <rect x={150} y={470} width={780} height={790} fill="#050606" />
      {/* portão de aço */}
      <g transform={`translate(0 ${-kUp * 790})`}>
        <rect x={150} y={470} width={780} height={790} fill={C.surf} />
        {slats.map((i) => <g key={i}><rect x={150} y={470 + i * 33} width={780} height={33} fill={i % 2 ? '#1f2226' : '#22262a'} /><line x1={150} x2={930} y1={470 + i * 33} y2={470 + i * 33} stroke="#2f343a" strokeWidth={2} /><line x1={150} x2={930} y1={471 + i * 33 + 30} y2={471 + i * 33 + 30} stroke="#121416" strokeWidth={2} /></g>)}
        <Txt x={540} y={640} s={34} f={MONO} w={700} c={C.faint} a="middle" ls={8}>GALPÃO 3</Txt>
        {/* fechadura */}
        <rect x={500} y={1170} width={80} height={60} rx={6} fill={C.surf2} stroke={C.line} strokeWidth={3} />
        <circle cx={540} cy={1194} r={9} fill={C.bg} /><rect x={536} y={1196} width={8} height={18} fill={C.bg} />
      </g>
      <rect x={130} y={450} width={20} height={830} fill={C.surf2} /><rect x={930} y={450} width={20} height={830} fill={C.surf2} />
      <rect x={130} y={438} width={820} height={34} fill={C.surf2} />
      <line x1={0} x2={1080} y1={1281} y2={1281} stroke={C.line} strokeWidth={3} />
      {/* molho de chaves: entra pela direita e gira na fechadura */}
      {kUp < .05 && (
        <g transform={`translate(${mix(560, 0, kIn)} ${mix(420, 0, kIn)})`} opacity={kIn}>
          <g transform={`translate(540 1200) rotate(${kRot * 90})`}>
            <rect x={-7} y={-6} width={14} height={30} fill={C.steel} />
            <circle cx={0} cy={58} r={36} fill="none" stroke={C.steel} strokeWidth={14} />
            <circle cx={0} cy={58} r={12} fill={C.bg} />
          </g>
          <g transform={`translate(540 1258) rotate(${18 + Math.sin(t * 9) * 3 * (1 - kRot)})`}>
            <circle cx={0} cy={44} r={34} fill="none" stroke={C.dim} strokeWidth={6} />
            <rect x={20} y={70} width={14} height={90} rx={4} fill={C.dim} transform="rotate(-25)" />
            <rect x={-40} y={66} width={12} height={78} rx={4} fill={C.amberDeep} transform="rotate(20)" />
          </g>
        </g>
      )}
    </g>
  );
};

// 2 · Crachá cai na mesa empoeirada; carimbo "NENHUM"
const Cracha: React.FC<{t: number}> = ({t}) => {
  const t0 = SC.cracha.t0, kF = p(t, t0 + .05, .45);
  const y = mix(-300, 0, back(kF)), rot = mix(-22, -3, eo(kF));
  return (
    <g>
      <rect width={1080} height={1920} fill={C.surf} />
      <Dust n={160} x={60} y={420} w={960} h={900} seed={3} o={.18} />
      <line x1={0} x2={1080} y1={1290} y2={1250} stroke={C.line} strokeWidth={3} />
      <g transform={`translate(540 ${880 + y}) rotate(${rot})`}>
        <rect x={-290} y={-410} width={580} height={800} rx={26} fill="#0006" transform="translate(14 18)" />
        <rect x={-290} y={-410} width={580} height={800} rx={26} fill={C.paper} />
        <rect x={-60} y={-388} width={120} height={22} rx={11} fill={C.surf} />
        <rect x={-290} y={-340} width={580} height={86} fill={C.surf} />
        <Txt x={0} y={-284} s={34} f={MONO} w={800} c={C.steel} a="middle" ls={6}>ACESSO · GALPÃO 3</Txt>
        <rect x={-230} y={-220} width={200} height={240} fill="#B8B3A3" stroke="#8E8A7E" strokeWidth={3} strokeDasharray="10 8" />
        <Txt x={-130} y={-92} s={22} f={MONO} w={700} c="#6E6A60" a="middle" ls={2}>SEM FOTO</Txt>
        <Txt x={0} y={-176} s={56} f={HEAD} w={800} c={C.bg}>JÚLIA M.</Txt>
        <Txt x={0} y={-128} s={28} f={MONO} w={700} c="#4A4740" ls={2}>HERDEIRA</Txt>
        <g opacity={eo(p(t, W('cracha', 'Trinta'), .25))}><Txt x={0} y={-60} s={28} f={MONO} w={700} c="#4A4740" ls={2}>31 ANOS</Txt></g>
        <g opacity={eo(p(t, W('cracha', 'Nunca'), .25))}><Txt x={-230} y={74} s={28} f={MONO} w={700} c="#4A4740" ls={1}>TEMPO DE CASA: 0 DIAS</Txt></g>
        <line x1={-230} x2={230} y1={104} y2={104} stroke="#A8A393" strokeWidth={3} />
        <Txt x={-230} y={150} s={30} f={MONO} w={800} c="#4A4740" ls={2}>NÍVEL DE ACESSO:</Txt>
        <rect x={-230} y={190} width={460} height={120} rx={8} fill="#BDB8A8" />
        <Stamp x={0} y={272} t={t} at={W('cracha', 'quis.')} text="NENHUM" s={82} rot={-7} />
      </g>
    </g>
  );
};

// 3 · Galpão em perspectiva; luzes acendem de perto para longe
const K = 430, VX = 540, VY = 780;
const pr = (X: number, Y: number, z: number): [number, number] => [VX + (X * K) / z, VY + (Y * K) / z];
const poly = (pts: Array<[number, number]>) => pts.map((q) => q.join(',')).join(' ');
const LAMPS = [1.9, 2.7, 3.8, 5.3, 7.4, 10.4, 14.5];
const POSTS = [1.35, 1.75, 2.3, 3.0, 3.9, 5.1, 6.7, 8.8, 11.6, 15.3];
const Galpao: React.FC<{t: number; lit: (i: number) => number; dim?: number}> = ({t, lit, dim = 1}) => {
  const L = LAMPS.map((_, i) => lit(i)); const amb = L.reduce((a, b) => a + b, 0) / L.length;
  const shade = (base: number) => { const v = Math.round(base + amb * 26 * dim); return `rgb(${v},${v + 3},${v + 6})`; };
  const racks = (X: number) => POSTS.slice(0, -1).map((z1, i) => {
    const z2 = POSTS[i + 1];
    return (
      <g key={`${X}-${i}`}>
        {[1.6, .85, .1].map((Y, j) => (
          <polygon key={j} points={poly([pr(X, Y - .62, z1 + .06), pr(X, Y - .62, z2 - .06), pr(X, Y - .02, z2 - .06), pr(X, Y - .02, z1 + .06)])} fill={shade(22 + ((i + j) % 3) * 4)} stroke={shade(14)} strokeWidth={1.5} />
        ))}
        <line x1={pr(X, 1.6, z1)[0]} y1={pr(X, 1.6, z1)[1]} x2={pr(X, -.65, z1)[0]} y2={pr(X, -.65, z1)[1]} stroke={shade(38)} strokeWidth={Math.max(2, 12 / z1)} />
      </g>
    );
  });
  return (
    <g>
      <rect width={1080} height={1920} fill="#060708" />
      <polygon points={poly([pr(-2.4, 1.6, 1.2), pr(2.4, 1.6, 1.2), pr(2.4, 1.6, 30), pr(-2.4, 1.6, 30)])} fill={shade(14)} />
      {[-2.2, 2.2].map((X) => <g key={X}>{racks(X)}</g>)}
      {LAMPS.map((z, i) => (
        <g key={z}>
          <polygon points={poly([pr(-.22, -1.25, z), pr(.22, -1.25, z), pr(1.0, 1.6, z), pr(-1.0, 1.6, z)])} fill={C.steel} opacity={.055 * L[i] * dim} />
          <polygon points={poly([pr(-.9, 1.6, z - .25), pr(.9, 1.6, z - .25), pr(.9, 1.6, z + .25), pr(-.9, 1.6, z + .25)])} fill={C.steel} opacity={.07 * L[i] * dim} />
          <polygon points={poly([pr(-.3, -1.32, z), pr(.3, -1.32, z), pr(.22, -1.25, z), pr(-.22, -1.25, z)])} fill={L[i] > .5 ? '#E8ECEF' : '#24282c'} />
          <line x1={pr(0, -1.32, z)[0]} y1={pr(0, -1.32, z)[1]} x2={pr(0, -2, z)[0]} y2={pr(0, -2, z)[1]} stroke="#24282c" strokeWidth={2} />
        </g>
      ))}
    </g>
  );
};
const Luzes: React.FC<{t: number}> = ({t}) => {
  const ta = W('luzes', 'acende') - .05;
  // reatores com falha: cada luz pisca antes de firmar
  const lit = (i: number) => { const a = ta + i * .16; const k = p(t, a, .02); const flick = t > a && t < a + .22 && Math.floor((t - a) * 30) % 3 === 1 ? .2 : 1; return k * flick; };
  const push = eo(p(t, SC.luzes.t0, SC.luzes.t1 - SC.luzes.t0));
  return <g transform={`translate(540 800) scale(${1 + push * .08}) translate(-540 -800)`}><Galpao t={t} lit={lit} /></g>;
};

// 4 · Caixas paradas + contador 0 → 1.247
const Pedidos: React.FC<{t: number}> = ({t}) => {
  const a = W('pedidos', 'Mil'), b = WE('pedidos', 'sete') + .15, kc = eo(p(t, a, b - a));
  const n = Math.round(1247 * kc), hit = p(t, b, .25);
  const boxes = Array.from({length: 30}, (_, i) => i);
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <polygon points="300,300 780,300 1080,1300 0,1300" fill={C.steel} opacity={.035} />
      <Txt x={540} y={520} s={30} f={MONO} w={700} c={C.dim} a="middle" ls={8}>PEDIDOS NA FILA</Txt>
      <g transform={`translate(540 680) scale(${1 + (hit > 0 && hit < 1 ? Math.sin(hit * Math.PI) * .08 : 0)})`}>
        <Txt x={0} y={0} s={190} f={MONO} w={800} c={C.amber} a="middle">{n.toLocaleString('pt-BR')}</Txt>
      </g>
      {boxes.map((i) => {
        const col = i % 6, row = Math.floor(i / 6), kb = eo(p(t, a + (i / 30) * (b - a), .18));
        const x = 120 + col * 142, y = 1210 - row * 92 - (1 - kb) * 160;
        return kb > 0 && (
          <g key={i} opacity={kb}>
            <rect x={x} y={y} width={130} height={86} fill={i % 4 === 1 ? C.surf2 : C.surf} stroke={C.line} strokeWidth={2} />
            <rect x={x + 54} y={y} width={22} height={86} fill={C.faint} opacity={.6} />
            <rect x={x + 12} y={y + 40} width={36} height={24} fill={C.paperDim} opacity={.8} />
          </g>
        );
      })}
      <Stamp x={540} y={830} t={t} at={W('pedidos', 'parados.')} text="PARADOS" s={60} rot={-5} />
    </g>
  );
};

// 5 · Três planilhas, três totais diferentes
const Planilhas: React.FC<{t: number}> = ({t}) => {
  const ta = W('planilhas', 'Três'), circ = [W('planilhas', 'Nenhuma'), W('planilhas', 'bate'), W('planilhas', 'outra.')];
  const files = [['pedidos_final.xlsx', '1.247'], ['pedidos_final_v2.xlsx', '1.198'], ['pedidos_FINAL_beto.xlsx', '1.302']];
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      {files.map(([f, tot], i) => {
        const k = eo(p(t, ta + i * .17, .3)); const y = 440 + i * 285, x = 90;
        return (
          <g key={f} opacity={k} transform={`translate(${(1 - k) * 80} 0)`}>
            <rect x={x} y={y} width={900} height={255} rx={10} fill={C.surf} stroke={C.line} strokeWidth={2} />
            <rect x={x} y={y} width={900} height={50} rx={10} fill={C.surf2} />
            <Txt x={x + 26} y={y + 34} s={24} f={MONO} w={700} c={C.steel}>{f}</Txt>
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <line x1={x + 20} x2={x + 880} y1={y + 92 + r * 40} y2={y + 92 + r * 40} stroke={C.line} strokeWidth={1.5} />
                {[0, 1, 2, 3].map((c) => <rect key={c} x={x + 30 + c * 200} y={y + 66 + r * 40} width={60 + rnd(i * 40 + r * 7 + c) * 100} height={12} rx={3} fill={C.faint} />)}
              </g>
            ))}
            <Txt x={x + 30} y={y + 225} s={30} f={MONO} w={800} c={C.dim} ls={2}>TOTAL</Txt>
            <Txt x={x + 860} y={y + 228} s={52} f={MONO} w={800} c={C.steel} a="end">{tot}</Txt>
            <Circle cx={x + 760} cy={y + 210} rx={130} ry={46} t={t} at={circ[i]} />
          </g>
        );
      })}
    </g>
  );
};

// 6 · Quadro de bilhetes; aproxima no "só o Beto sabe"
const NOTES: Array<[string, string, number, number, number]> = [
  ['ligar p/\nfornecedor', C.paper, 250, 590, -6], ['NÃO mexer\nno sistema', C.paper, 600, 560, 5], ['NF só com\nassinatura', C.paper, 860, 700, -3],
  ['senha do\nbanco?', C.paper, 270, 900, 4], ['pedido 0412\n???', C.paper, 820, 1010, 7], ['só o Beto\nsabe', C.amber, 540, 880, -4],
];
const Quadro: React.FC<{t: number}> = ({t}) => {
  const a = W('quadro', 'quadro'), b = W('quadro', 'bilhetes.'), z = eio(p(t, W('quadro', 'Só') - .25, .7));
  const cx = 540, cy = 880, S = mix(1, 2.35, z);
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <g transform={`translate(540 860) scale(${S}) translate(${-mix(540, cx, z)} ${-mix(860, cy, z)})`}>
        <rect x={80} y={440} width={920} height={760} rx={8} fill={C.cork} stroke={C.surf2} strokeWidth={14} />
        <Dust n={260} x={95} y={455} w={890} h={730} seed={9} o={.1} />
        {NOTES.map(([txt, col, x, y, r], i) => {
          const k = eo(p(t, a + (i / NOTES.length) * (b - a + .5), .25)); const key = i === NOTES.length - 1;
          return k > 0 && (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${mix(1.3, 1, k)})`} opacity={k * (key ? 1 : mix(1, .35, z))}>
              <rect x={-118} y={-104} width={236} height={208} fill="#0007" transform="translate(6 8)" />
              <rect x={-118} y={-104} width={236} height={208} fill={col} />
              <circle cx={0} cy={-88} r={9} fill={key ? C.red : C.dim} />
              {txt.split('\n').map((l, j) => <Txt key={j} x={0} y={-12 + j * 46} s={36} f={HEAD} w={700} c={C.bg} a="middle" it>{l}</Txt>)}
            </g>
          );
        })}
      </g>
    </g>
  );
};

// 7 · Cadeira vazia do Beto; carta de demissão + carimbo
const Beto: React.FC<{t: number}> = ({t}) => {
  const t0 = SC.beto.t0, sw = Math.sin((t - t0) * 2.4) * 6 * Math.exp(-(t - t0) * .45);
  const kc = eo(p(t, W('beto', 'pediu') - .1, .45));
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <polygon points="700,300 1000,300 1080,1300 420,1300" fill={C.steel} opacity={.035} />
      <rect x={0} y={1180} width={1080} height={4} fill={C.line} />
      {/* mesa */}
      <rect x={640} y={860} width={440} height={30} fill={C.surf2} /><rect x={1000} y={890} width={24} height={300} fill={C.surf} />
      {/* caneca BETO */}
      <g transform="translate(780 760)">
        <rect x={0} y={0} width={110} height={100} rx={8} fill={C.steel} /><path d="M110 22 h22 a20 20 0 0 1 0 50 h-22" fill="none" stroke={C.steel} strokeWidth={12} />
        <Txt x={55} y={62} s={28} f={HEAD} w={800} c={C.bg} a="middle">BETO</Txt>
      </g>
      {/* cadeira de escritório vazia, girando sozinha */}
      <g transform={`translate(400 1180) rotate(${sw} 0 -300)`}>
        <rect x={-130} y={-760} width={210} height={330} rx={40} fill={C.surf2} stroke={C.line} strokeWidth={3} />
        <rect x={-30} y={-440} width={30} height={90} fill={C.surf} />
        <rect x={-180} y={-370} width={300} height={66} rx={22} fill={C.surf2} stroke={C.line} strokeWidth={3} />
        <rect x={-170} y={-420} width={130} height={18} rx={9} fill={C.surf} />
        <rect x={-26} y={-304} width={22} height={200} fill={C.dim} />
        <line x1={-180} x2={160} y1={-80} y2={-80} stroke={C.dim} strokeWidth={14} strokeLinecap="round" />
        {[-180, -10, 160].map((x) => <circle key={x} cx={x} cy={-50} r={24} fill={C.surf} stroke={C.dim} strokeWidth={5} />)}
      </g>
      <Tag x={540} y={520} t={t} at={W('beto', 'único')} text="BETO · 14 ANOS DE CASA" />
      {/* carta de demissão */}
      {kc > 0 && (
        <g transform={`translate(540 ${mix(1500, 900, kc)}) rotate(${mix(10, -2, kc)})`} opacity={kc}>
          <rect x={-330} y={-400} width={660} height={800} fill="#0009" transform="translate(12 16)" />
          <rect x={-330} y={-400} width={660} height={800} fill={C.paper} />
          <Txt x={0} y={-300} s={40} f={HEAD} w={800} c={C.bg} a="middle" ls={2}>CARTA DE DEMISSÃO</Txt>
          {Array.from({length: 9}, (_, i) => <rect key={i} x={-260} y={-220 + i * 42} width={420 + rnd(i + 3) * 100} height={14} rx={4} fill="#A9A493" />)}
          <path d="M-240 230 c40 -60 70 40 110 -10 s50 -30 90 10 s40 -10 80 -20" fill="none" stroke={C.bg} strokeWidth={5} strokeLinecap="round" />
          <Txt x={-240} y={290} s={26} f={MONO} w={700} c="#4A4740">Roberto “Beto” A.</Txt>
          <Stamp x={30} y={80} t={t} at={W('beto', 'ontem.')} text="DESLIGADO" sub="ONTEM, 18:02" s={78} rot={-12} />
        </g>
      )}
    </g>
  );
};

// 8–9 · Celular sobre a mesa: toca, atende, voz do cliente
const Phone: React.FC<{t: number; mode: 'off' | 'ring' | 'call'}> = ({t, mode}) => {
  const ring = mode === 'ring' && (t * 2.2) % 1 < .62; const jx = ring ? Math.sin(t * 95) * 5 : 0, jy = ring ? Math.cos(t * 83) * 4 : 0;
  const cT = SC.cliente.t0, speak = mode === 'call' && t >= SC.cliente.v0 && t <= SC.cliente.v1;
  return (
    <g transform={`translate(${540 + jx} ${840 + jy}) rotate(-4) scale(.88)`}>
      {ring && [0, 1, 2].map((i) => { const k = ((t * 2.2) % 1) / .62; return <rect key={i} x={-230 - 30 - i * 26} y={-450 - 30 - i * 26} width={460 + 60 + i * 52} height={900 + 60 + i * 52} rx={70 + i * 20} fill="none" stroke={C.steel} strokeWidth={3} opacity={(1 - k) * (.5 - i * .14)} />; })}
      <rect x={-230} y={-450} width={460} height={900} rx={60} fill="#0008" transform="translate(16 20)" />
      <rect x={-230} y={-450} width={460} height={900} rx={60} fill={C.surf2} stroke={C.line} strokeWidth={4} />
      <rect x={-208} y={-428} width={416} height={856} rx={44} fill={mode === 'off' ? '#08090a' : C.bg} />
      {mode !== 'off' && (
        <g>
          <Txt x={0} y={-330} s={24} f={MONO} w={700} c={C.dim} a="middle" ls={3}>{mode === 'ring' ? 'CHAMADA RECEBIDA' : `EM CHAMADA · 00:${pad2(Math.max(0, t - cT))}`}</Txt>
          <circle cx={0} cy={-200} r={70} fill={C.surf2} /><Txt x={0} y={-180} s={56} f={HEAD} w={800} c={C.steel} a="middle">A</Txt>
          <Txt x={0} y={-60} s={40} f={HEAD} w={800} c={C.steel} a="middle">ATLAS</Txt>
          <Txt x={0} y={-16} s={26} f={MONO} w={700} c={C.dim} a="middle" ls={2}>DISTRIBUIDORA</Txt>
          {mode === 'ring' ? (
            <g>
              <circle cx={-110} cy={300} r={52} fill={C.red} /><circle cx={110} cy={300} r={52} fill={C.steel} />
              <Txt x={-110} y={312} s={34} f={HEAD} w={800} c={C.bg} a="middle">✕</Txt>
            </g>
          ) : (
            <g>
              {Array.from({length: 23}, (_, i) => { const h = speak ? 14 + Math.abs(Math.sin(t * 13 + i * 1.7) * Math.sin(t * 5.3 + i * .6)) * 120 : 8; return <rect key={i} x={-176 + i * 16} y={140 - h / 2} width={9} height={h} rx={4} fill={C.amber} />; })}
              <circle cx={0} cy={330} r={52} fill={C.red} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};
const Telefone: React.FC<{t: number}> = ({t}) => {
  const ring = t >= W('telefone', 'telefone') - .1;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.surf} /><Dust n={120} x={40} y={420} w={1000} h={900} seed={21} o={.14} />
      <Phone t={t} mode={ring ? 'ring' : 'off'} />
      <g transform="translate(0 -10)">
        <Tag x={540} y={1322} t={t} at={W('telefone', 'maior')} text="60% DO FATURAMENTO" />
      </g>
    </g>
  );
};
const Cliente: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={1080} height={1920} fill={C.surf} /><Dust n={120} x={40} y={420} w={1000} h={900} seed={21} o={.14} />
    <Phone t={t} mode="call" />
  </g>
);

// 10–11 · Monitor antigo: login → caixa de entrada → e-mail do Beto
const Monitor: React.FC<{children: React.ReactNode; kb?: React.ReactNode}> = ({children, kb}) => (
  <g>
    <rect width={1080} height={1920} fill={C.bg} />
    <polygon points="0,1180 1080,1180 1080,1920 0,1920" fill={C.surf} />
    <rect x={70} y={470} width={940} height={670} rx={30} fill={C.surf2} stroke={C.line} strokeWidth={4} />
    <rect x={100} y={500} width={880} height={610} rx={10} fill="#0E1012" />
    <svg x={100} y={500} width={880} height={610} viewBox="0 0 880 620">{children}</svg>
    <rect x={480} y={1140} width={120} height={40} fill={C.surf2} />
    <polygon points="190,1260 890,1260 940,1330 140,1330" fill={C.surf2} stroke={C.line} strokeWidth={3} />
    {Array.from({length: 36}, (_, i) => { const c = i % 12, r = Math.floor(i / 12); return <rect key={i} x={208 + c * 56 - r * 12} y={1270 + r * 19} width={46 + r * 2} height={14} rx={3} fill={C.faint} />; })}
    {kb}
  </g>
);
const Login: React.FC<{t: number}> = ({t}) => {
  const ta = W('login', 'tenta'), tS = W('login', 'Senha?'), tP = W('login', 'Pergunta') - .15;
  const nUser = Math.round(clamp((t - SC.login.t0 - .2) / .6) * 7), nPw = Math.floor(clamp((t - ta) / 1.2) * 8);
  const err = t >= tS, kP = eo(p(t, tP, .45)), blink = Math.floor(t * 2.5) % 2 === 0;
  return (
    <Monitor kb={kP > 0 && (
      <g transform={`translate(${mix(560, 790, kP)} ${mix(1330, 1200, kP)}) rotate(${mix(0, -8, kP)})`} opacity={clamp(kP * 3)}>
        <rect x={-150} y={-120} width={300} height={240} fill="#0008" transform="translate(8 10)" />
        <rect x={-150} y={-120} width={300} height={240} fill={C.amber} />
        <Txt x={0} y={-20} s={40} f={HEAD} w={700} c={C.bg} a="middle" it>pergunta</Txt>
        <Txt x={0} y={36} s={40} f={HEAD} w={700} c={C.bg} a="middle" it>pro Beto</Txt>
      </g>
    )}>
      <Txt x={440} y={90} s={26} f={MONO} w={700} c={C.dim} a="middle" ls={4}>SISTEMA DE PEDIDOS v2.3</Txt>
      <Txt x={440} y={124} s={20} f={MONO} w={500} c={C.faint} a="middle">© 2009 · uso interno</Txt>
      <Txt x={140} y={250} s={26} f={MONO} w={700} c={C.dim}>USUÁRIO</Txt>
      <rect x={140} y={266} width={600} height={66} rx={4} fill="none" stroke={C.line} strokeWidth={3} />
      <Txt x={162} y={310} s={32} f={MONO} w={700} c={C.steel}>{'paulo.m'.slice(0, nUser)}</Txt>
      <Txt x={140} y={390} s={26} f={MONO} w={700} c={C.dim}>SENHA</Txt>
      <rect x={140} y={406} width={600} height={66} rx={4} fill="none" stroke={err ? C.red : C.line} strokeWidth={3} />
      <Txt x={162} y={452} s={34} f={MONO} w={800} c={C.steel} ls={6}>{'•'.repeat(nPw)}{blink && !err ? '|' : ''}</Txt>
      {err && <Txt x={140} y={530} s={28} f={MONO} w={800} c={C.red}>SENHA INCORRETA · 3/3</Txt>}
    </Monitor>
  );
};
const INBOX: Array<[string, string]> = [['Atlas Distribuidora', 'URGENTE: entrega de hoje'], ['Banco', 'Aviso de limite'], ['Fornecedor', 'Cobrança · 2ª via']];
const Email: React.FC<{t: number}> = ({t}) => {
  const tC = W('email', 'Chega'), tR = W('email', 'Remetente:'), kN = eo(p(t, tC, .3)), open = t >= tR - .1;
  const subj = (WORDS.email || []).filter((w) => w[1] >= W('email', 'Eu') - .01);
  const typed = subj.filter((w) => t >= w[1]).map((w) => w[0]).join(' ');
  const showAtt = t >= WE('email', 'pararam.') + .15;
  return (
    <Monitor>
      {!open ? (
        <g>
          <rect x={0} y={0} width={880} height={70} fill={C.surf2} /><Txt x={30} y={46} s={26} f={MONO} w={700} c={C.steel}>Caixa de entrada</Txt>
          {[...(kN > 0 ? [['Beto Almeida', '(sem prévia)']] : []), ...INBOX].map(([de, as], i) => {
            const novo = kN > 0 && i === 0; const y = 90 + i * 120 + (kN > 0 && i > 0 ? 0 : 0);
            return (
              <g key={de} opacity={novo ? kN : 1} transform={`translate(${novo ? (1 - kN) * 200 : 0} ${!novo && kN > 0 ? 0 : 0})`}>
                <rect x={16} y={y} width={848} height={104} rx={8} fill={novo ? C.surf2 : C.surf} />
                {novo && <circle cx={50} cy={y + 52} r={11} fill={C.amber} />}
                <Txt x={80} y={y + 44} s={30} f={UI} w={800} c={novo ? C.steel : C.dim}>{de}</Txt>
                <Txt x={80} y={y + 82} s={24} f={UI} w={600} c={C.dim}>{as}</Txt>
                <Txt x={840} y={y + 44} s={22} f={MONO} w={700} c={novo ? C.amber : C.faint} a="end">{novo ? '10:15' : ['07:58', '06:12', 'ontem'][i - (kN > 0 ? 1 : 0)]}</Txt>
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          <rect x={0} y={0} width={880} height={70} fill={C.surf2} /><Txt x={30} y={46} s={26} f={MONO} w={700} c={C.steel}>‹ Mensagem</Txt>
          <Txt x={40} y={140} s={26} f={MONO} w={700} c={C.dim}>De:</Txt><Txt x={160} y={140} s={30} f={UI} w={800} c={C.amber}>Beto Almeida</Txt>
          <Txt x={40} y={190} s={26} f={MONO} w={700} c={C.dim}>Para:</Txt><Txt x={160} y={190} s={30} f={UI} w={700} c={C.steel}>Júlia M.</Txt>
          <Txt x={40} y={240} s={26} f={MONO} w={700} c={C.dim}>Hora:</Txt><Txt x={160} y={240} s={30} f={UI} w={700} c={C.steel}>10:15</Txt>
          <line x1={40} x2={840} y1={280} y2={280} stroke={C.line} strokeWidth={2} />
          <Txt x={40} y={336} s={26} f={MONO} w={700} c={C.dim}>Assunto:</Txt>
          <foreignObject x={40} y={350} width={800} height={150}>
            <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 44, lineHeight: 1.2, color: C.steel}}>{typed && `“${typed}${typed.endsWith('.') ? '”' : ''}`}<span style={{color: C.amber, opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>▍</span></div>
          </foreignObject>
          {showAtt && (
            <g opacity={eo(p(t, WE('email', 'pararam.') + .15, .3))}>
              <rect x={40} y={520} width={420} height={70} rx={8} fill={C.surf2} stroke={C.amber} strokeWidth={3} />
              <rect x={58} y={538} width={34} height={34} rx={4} fill={C.amber} />
              <Txt x={110} y={566} s={26} f={MONO} w={700} c={C.steel}>IMG_0412.jpg · 2,4 MB</Txt>
            </g>
          )}
        </g>
      )}
    </Monitor>
  );
};

// 12 · Download do anexo e a foto: mesa do sócio, "PROPOSTA DE COMPRA" de cabeça para baixo
const Foto: React.FC<{t: number; circleAt: number; zoom: number}> = ({t, circleAt, zoom}) => (
  <g transform={`translate(440 310) scale(${1 + zoom * .9}) translate(${-mix(440, 560, zoom)} ${-mix(310, 450, zoom)})`}>
    <rect x={0} y={0} width={880} height={620} fill="#17130F" />
    {Array.from({length: 9}, (_, i) => <line key={i} x1={0} x2={880} y1={i * 72 + 20} y2={i * 72 + 34} stroke="#211B15" strokeWidth={8} />)}
    <rect x={60} y={60} width={250} height={320} fill="#3A3226" transform="rotate(-8 185 220)" /><rect x={80} y={80} width={250} height={320} fill="#4A4030" transform="rotate(-3 205 240)" />
    <g transform="translate(560 330) rotate(184)">
      <rect x={-170} y={-210} width={340} height={420} fill={C.paper} />
      <Txt x={0} y={-140} s={30} f={HEAD} w={800} c={C.bg} a="middle">PROPOSTA DE</Txt>
      <Txt x={0} y={-102} s={30} f={HEAD} w={800} c={C.bg} a="middle">COMPRA</Txt>
      {Array.from({length: 7}, (_, i) => <rect key={i} x={-130} y={-60 + i * 30} width={200 + rnd(i + 11) * 60} height={10} rx={3} fill="#A9A493" />)}
    </g>
    <rect x={520} y={500} width={300} height={60} rx={4} fill="#2E2A24" /><Txt x={670} y={540} s={24} f={MONO} w={700} c={C.paperDim} a="middle">SÉRGIO R. · SÓCIO</Txt>
    <circle cx={180} cy={500} r={56} fill="none" stroke="#3A2E22" strokeWidth={10} />
    <rect x={330} y={430} width={170} height={14} rx={7} fill={C.steel} transform="rotate(-24 415 437)" />
    <g transform="translate(0 0)"><Circle cx={562} cy={462} rx={175} ry={62} t={t} at={circleAt} sw={7} /></g>
  </g>
);
const Anexo: React.FC<{t: number}> = ({t}) => {
  const tU = W('anexo', 'uma'), tM = W('anexo', 'mesa') - .1, tS = W('anexo', 'sócio');
  const kd = eo(p(t, tU, WE('anexo', 'foto…') - tU)), showFoto = t >= tM, z = eio(p(t, tS - .1, .6));
  return (
    <Monitor>
      {!showFoto ? (
        <g>
          <rect x={0} y={0} width={880} height={70} fill={C.surf2} /><Txt x={30} y={46} s={26} f={MONO} w={700} c={C.steel}>Anexo</Txt>
          <rect x={290} y={170} width={300} height={220} rx={10} fill={C.surf2} stroke={C.amber} strokeWidth={3} />
          <polygon points="330,350 410,260 470,320 510,280 560,350" fill={C.faint} /><circle cx={520} cy={230} r={22} fill={C.faint} />
          <Txt x={440} y={450} s={30} f={MONO} w={700} c={C.steel} a="middle">IMG_0412.jpg</Txt>
          <rect x={190} y={490} width={500} height={18} rx={9} fill={C.surf2} /><rect x={190} y={490} width={500 * kd} height={18} rx={9} fill={C.amber} />
          <Txt x={440} y={560} s={24} f={MONO} w={700} c={C.dim} a="middle">{Math.round(kd * 100)}%</Txt>
        </g>
      ) : (
        <g opacity={eo(p(t, tM, .2))}>
          <Foto t={t} circleAt={tS + .2} zoom={z} />
          <rect x={0} y={0} width={880} height={56} fill="#000a" /><Txt x={24} y={38} s={24} f={MONO} w={700} c={C.steel}>IMG_0412.jpg</Txt>
        </g>
      )}
    </Monitor>
  );
};

// 13 · Porta de vidro da diretoria se abre; só a luz entra (sem pessoas)
const Porta: React.FC<{t: number}> = ({t}) => {
  const tA = W('porta', 'porta') - .1, k = eio(p(t, tA, .8)), h = eio(p(t, tA - .25, .3));
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      <polygon points={`300,1300 780,1300 ${780 + k * 260},1700 ${300 - k * 60},1700`} fill={C.steel} opacity={.08 * k} />
      <rect x={290} y={430} width={500} height={870} fill="#121416" stroke={C.surf2} strokeWidth={18} />
      <rect x={300} y={440} width={480} height={850} fill={C.steel} opacity={.06 + .1 * k} />
      <g transform={`translate(300 0) scale(${1 - k * .72} 1)`}>
        <rect x={0} y={440} width={480} height={850} fill="#2A2F34" opacity={.92} />
        <rect x={0} y={440} width={480} height={850} fill="none" stroke={C.line} strokeWidth={6} />
        <Txt x={240} y={700} s={44} f={HEAD} w={700} c={C.dim} a="middle" ls={10}>DIRETORIA</Txt>
        <g transform={`translate(420 880) rotate(${h * 38})`}><rect x={-44} y={-10} width={60} height={20} rx={10} fill={C.steel} /><circle cx={0} cy={0} r={16} fill={C.steel} /></g>
      </g>
      <line x1={0} x2={1080} y1={1300} y2={1300} stroke={C.line} strokeWidth={3} />
      <Tag x={540} y={540} t={t} at={W('porta', 'abre.') + .1} text="SÉRGIO R. · SÓCIO · 50%" />
    </g>
  );
};

// 14 · Na mesa: a foto ainda aberta no monitor; uma pasta "PROPOSTA" desliza para perto
const Socio: React.FC<{t: number}> = ({t}) => {
  const t0 = SC.socio.t0, kF = eo(p(t, W('socio', 'Vamos'), .6)), push = eo(p(t, t0, SC.socio.t1 - t0));
  return (
    <g transform={`translate(540 860) scale(${1 + push * .06}) translate(-540 -860)`}>
      <Monitor>
        <Foto t={t} circleAt={-1} zoom={1} />
        <rect x={0} y={0} width={880} height={56} fill="#000a" /><Txt x={24} y={38} s={24} f={MONO} w={700} c={C.steel}>IMG_0412.jpg</Txt>
      </Monitor>
      <polygon points="0,1180 1080,1180 1080,1920 0,1920" fill={C.steel} opacity={.04} />
      {kF > 0 && (
        <g transform={`translate(${mix(1300, 800, kF)} ${mix(1180, 1200, kF)}) rotate(${mix(25, 6, kF)}) scale(.8)`}>
          <rect x={-230} y={-80} width={460} height={250} rx={8} fill="#0009" transform="translate(10 12)" />
          <rect x={-230} y={-80} width={460} height={250} rx={8} fill="#3A3226" />
          <rect x={-230} y={-100} width={180} height={30} rx={6} fill="#3A3226" />
          <Txt x={0} y={50} s={40} f={HEAD} w={800} c={C.paper} a="middle" ls={4}>PROPOSTA</Txt>
        </g>
      )}
    </g>
  );
};

// 15–17 · Dez segundos: relógio no centro, cursor sobre o anexo; cartão de decisão A/B com contagem; voto
const Decisao: React.FC<{t: number}> = ({t}) => {
  const tE = SC.escolha.t0, kCard = eo(p(t, tE, .4)), cnt = clamp(1 - (t - (tE + .25)) / 10, 0, 1), sec = Math.ceil(cnt * 10 - 1e-6);
  const over = t >= T_END_COUNT, kOver = eo(p(t, T_END_COUNT + .2, .5));
  const hiA = t >= W('escolha', 'abre') && t < W('escolha', 'ou'), hiB = t >= W('escolha', 'finge') && t < WE('escolha', 'viu?') + .3;
  const kVote = eo(p(t, W('contagem', 'Comenta') - .1, .35));
  const R0 = 92, L = 2 * Math.PI * R0;
  const opt = (y: number, letter: string, txt: string, hi: boolean, d: number) => {
    const k = eo(p(t, tE + .15 + d, .35));
    return (
      <g opacity={k} transform={`translate(${(1 - k) * 60} 0)`}>
        <rect x={90} y={y} width={900} height={150} rx={14} fill={hi ? C.amber : C.surf} stroke={hi ? C.amber : C.line} strokeWidth={4} />
        <rect x={112} y={y + 22} width={106} height={106} rx={10} fill={hi ? C.bg : C.surf2} />
        <Txt x={165} y={y + 98} s={72} f={HEAD} w={800} c={hi ? C.amber : C.steel} a="middle">{letter}</Txt>
        <Txt x={250} y={y + 96} s={46} f={HEAD} w={800} c={hi ? C.bg : C.steel}>{txt}</Txt>
      </g>
    );
  };
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />
      {kCard <= 0 ? (
        // "A Júlia tem dez segundos": cursor parado sobre o anexo
        <g>
          <rect x={240} y={760} width={600} height={110} rx={12} fill={C.surf} stroke={C.amber} strokeWidth={3} />
          <rect x={268} y={790} width={50} height={50} rx={6} fill={C.amber} />
          <Txt x={340} y={830} s={36} f={MONO} w={700} c={C.steel}>IMG_0412.jpg</Txt>
          <path d={`M ${640} ${840} l 0 64 l 16 -15 l 12 28 l 12 -6 l -12 -27 l 22 0 z`} fill={C.steel} stroke={C.bg} strokeWidth={3} transform={`translate(${Math.sin(t * 3) * 3} 0)`} />
          <g opacity={eo(p(t, W('dez', 'dez'), .3))}><Txt x={540} y={620} s={150} f={MONO} w={800} c={C.amber} a="middle">00:10</Txt></g>
        </g>
      ) : !over || kOver < 1 ? (
        <g opacity={1 - kOver}>
          <g opacity={kCard}>
            <Txt x={540} y={470} s={30} f={MONO} w={800} c={C.dim} a="middle" ls={8}>DECISÃO</Txt>
            <circle cx={540} cy={640} r={R0} fill="none" stroke={C.surf2} strokeWidth={14} />
            <circle cx={540} cy={640} r={R0} fill="none" stroke={sec <= 3 ? C.red : C.amber} strokeWidth={14} strokeDasharray={L} strokeDashoffset={L * (1 - cnt)} transform="rotate(-90 540 640)" strokeLinecap="round" />
            <Txt x={540} y={672} s={92} f={MONO} w={800} c={sec <= 3 ? C.red : C.steel} a="middle">{sec}</Txt>
          </g>
          {opt(800, 'A', 'MOSTRAR A FOTO', hiA, 0)}
          {opt(980, 'B', 'FINGIR QUE NÃO VIU', hiB, .12)}
          <g opacity={kVote} transform={`translate(0 ${(1 - kVote) * 20})`}>
            <rect x={190} y={1170} width={700} height={76} rx={38} fill="none" stroke={C.steel} strokeWidth={3} />
            <Txt x={540} y={1220} s={32} f={MONO} w={800} c={C.steel} a="middle" ls={2}>VOTE NOS COMENTÁRIOS: A OU B</Txt>
          </g>
        </g>
      ) : null}
      {over && (
        <g opacity={kOver}>
          <Txt x={540} y={560} s={36} f={MONO} w={800} c={C.red} a="middle" ls={8}>TEMPO ESGOTADO</Txt>
          <Txt x={540} y={790} s={190} f={HEAD} w={800} c={C.steel} a="middle" ls={-4}>72</Txt>
          <Txt x={540} y={900} s={92} f={HEAD} w={800} c={C.amber} a="middle" ls={14}>HORAS</Txt>
          <line x1={340} x2={740} y1={970} y2={970} stroke={C.line} strokeWidth={3} />
          <Txt x={540} y={1040} s={38} f={MONO} w={800} c={C.steel} a="middle" ls={4}>PARTE 2 · EM BREVE</Txt>
          <Txt x={540} y={1120} s={34} f={UI} w={700} c={C.dim} a="middle">Comente A ou B. Você decide.</Txt>
        </g>
      )}
    </g>
  );
};

// ── HUD fixo: selo da parte, relógio de 72 h, local · dia · hora
const Hud: React.FC<{t: number}> = ({t}) => {
  const g = SC.gancho, kMove = eio(p(t, g.t1 - .55, .55)), big = t < g.t1;
  const rem = remaining(t), clock = fmtClock(rem), ticking = t >= tHoras;
  const inDec = t >= SC.dez.t0, endCard = t >= T_END_COUNT + .2;
  const local = t >= SC.telefone.t0 ? 'ESCRITÓRIO' : 'GALPÃO';
  const showLoc = t >= tSeis - .1 && !inDec;
  const flash = (tk: number) => t >= tk && t < tk + .5 && Math.floor((t - tk) * 8) % 2 === 0;
  const locFlash = flash(tSeis) || flash(tOito) || flash(tDez);
  // relógio: grande no centro no gancho, depois no canto superior direito
  const cx = mix(540, 990, kMove), cy = mix(900, 318, kMove), cs = mix(150, 50, kMove), anchor = kMove < .5 ? 'middle' : 'end';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g opacity={eo(p(t, .2, .4))}>
        <circle cx={104} cy={300} r={11} fill={C.red} opacity={Math.floor(t * 1.2) % 2 ? 1 : .35} />
        <Txt x={128} y={312} s={32} f={MONO} w={800} c={C.steel} ls={3}>PARTE 1</Txt>
        <Txt x={90} y={352} s={24} f={MONO} w={700} c={C.dim} ls={4}>O GALPÃO</Txt>
      </g>
      {!endCard && (
        <g>
          {big && kMove < .01 && <Txt x={540} y={760} s={30} f={MONO} w={700} c={C.dim} a="middle" ls={6}>TEMPO DE VIDA DA EMPRESA</Txt>}
          <text x={kMove < .5 ? cx : 990} y={cy} fontSize={cs} fontFamily={MONO} fontWeight={800} fill={ticking ? C.amber : C.steel} textAnchor={anchor} style={{fontVariantNumeric: 'tabular-nums'}}
            transform={kMove > 0 && kMove < 1 ? undefined : undefined}>{clock}</text>
          {kMove >= 1 && <Txt x={990} y={352} s={22} f={MONO} w={700} c={C.dim} a="end" ls={4}>RESTANTES</Txt>}
        </g>
      )}
      {showLoc && (
        <g opacity={eo(p(t, tSeis - .1, .3))}>
          <rect x={90} y={392} width={430} height={44} rx={4} fill={locFlash ? C.amber : 'none'} />
          <Txt x={104} y={424} s={26} f={MONO} w={700} c={locFlash ? C.bg : C.steel} ls={2}>{`${local} · DIA 1 · ${wallClock(t)}`}</Txt>
        </g>
      )}
    </svg>
  );
};

// ── Legendas palavra a palavra (Sora 800, caixa alta; palavra falada em âmbar; falas de personagens em itálico)
const Captions: React.FC<{t: number}> = ({t}) => {
  const cap = CAPS.find((c) => t >= c.start - .02 && t < c.end);
  if (!cap) return null;
  const who = cap.voz === 'cliente' ? 'ATLAS · AO TELEFONE' : cap.voz === 'socio' ? 'SÉRGIO' : '';
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1400, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
      {who && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: C.dim, marginBottom: 6}}>{who}</div>}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, fontFamily: HEAD, fontWeight: 800, fontSize: 70, lineHeight: 1.1, textTransform: 'uppercase', fontStyle: who ? 'italic' : 'normal'}}>
        {cap.words.map(([w, s, e], i) => {
          const k = eo(p(t, s - .04, .12)); const cur = t >= s - .04 && (t < e + .08 || i === cap.words.length - 1);
          const red = /cancelo/i.test(w) && t >= s; const shake = red ? Math.sin(t * 70) * 4 * clamp(1 - (t - s) / .6) : 0;
          return (
            <span key={i} style={{opacity: k, transform: `translate(${shake}px, ${(1 - k) * 14}px) scale(${mix(1.12, 1, k)})`, display: 'inline-block',
              color: red ? C.red : cur ? C.amber : '#F1F3F4', textShadow: '0 4px 0 #000, 0 0 2px #000'}}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};

const SCENES: Array<[string, React.FC<{t: number}>]> = [
  ['gancho', Gancho], ['cracha', Cracha], ['luzes', Luzes], ['pedidos', Pedidos], ['planilhas', Planilhas], ['quadro', Quadro], ['beto', Beto],
  ['telefone', Telefone], ['cliente', Cliente], ['login', Login], ['email', Email], ['anexo', Anexo], ['porta', Porta], ['socio', Socio],
];

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  loadFonts();
  const frame = useCurrentFrame(); const t = still ?? frame / TL.fps;
  const cur = SCENES.find(([k]) => inScene(t, k));
  const isDec = t >= SC.dez.t0;
  // corte seco com leve "punch-in" de 4 quadros na entrada de cada cena
  const sc = cur ? SC[cur[0]] : SC.dez; const kIn = p(t, sc.t0, .14); const punch = mix(1.035, 1, eo(kIn));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
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
