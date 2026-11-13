import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, hash, keyed, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "A planta da operação" (16:9, ~69 s). Linguagem de desenho técnico: prancha com grade, régua, escala e carimbo.
 * A empresa é uma maquete isométrica de aço (4 pavimentos) com projeção 3D própria (órbita θ, elevação φ).
 * Raio-X revela os fluxos → laudo FIG. 01–04 → "É aqui que a DME entra" (REV. A → REV. B) → planta baixa redesenhada
 * (mapeamento, padronização, automação, IA, integração) → maquete com fluxos azuis → loop → logo e CTA.
 * Tudo é função do quadro (t = frame / 30); os tempos vêm das palavras reais da locução.
 */
const T = {
  toda: wt('gancho', 'Toda'), poucas: wt('gancho', 'Poucas'), fora: wt('fora', 'Por'), dentro: wt('raiox', 'Por'),
  info: wt('laudo', 'Informação'), aprov: wt('laudo', 'Aprovação'), tarefa: wt('laudo', 'Tarefa'),
  isso: wt('tensao', 'Isso'), eFalta: wt('tensao', 'É'), eng: wt('tensao', 'projeto'),
  aqui: wt('virada', 'É'), dme: wt('virada', 'Dê-Eme-É'),
  ent: wt('metodo', 'Entendemos'), ident: wt('metodo', 'identificamos'), redes: wt('metodo', 'redesenhamos'), mapa: wt('metodo', 'mapeamento'), padr: wt('metodo', 'padronização'), auto: wt('metodo', 'automação'),
  ia: wt('tecnologia', 'inteligência'), integ: wt('tecnologia', 'integração'), onde: wt('tecnologia', 'onde'),
  result: wt('nova', 'Uma'), clara: wt('nova', 'clara'), conect: wt('nova', 'conectada'), prep: wt('nova', 'preparada'),
  toda2: wt('loop', 'Toda'), agora: wt('loop', 'Agora'), sua: wt('loop', 'sua'),
  sig: S.assinatura.t0, tec: wt('assinatura', 'Automatizamos'), cta: wt('assinatura', 'Devolvemos'),
};
const E = (k: SceneKey) => S[k];
const MINT = C.accent; // azul DME (palavra-chave / elementos da DME)

// ── projeção axonométrica com órbita
type V3 = [number, number, number];
type Cam = {th: number; ph: number; s: number; cx: number; cy: number};
const proj = (p: V3, c: Cam): [number, number] => {
  const th = c.th * Math.PI / 180, ph = c.ph * Math.PI / 180, [x, y, z] = p;
  const xr = x * Math.cos(th) - z * Math.sin(th), zr = x * Math.sin(th) + z * Math.cos(th);
  return [c.cx + c.s * xr, c.cy - c.s * ((y - 300) * Math.cos(ph)) + c.s * zr * Math.sin(ph)];
};
const pts = (a: V3[], c: Cam) => a.map((p) => proj(p, c).map((v) => v.toFixed(1)).join(',')).join(' ');
const pathOf = (a: V3[], c: Cam) => 'M' + a.map((p) => proj(p, c).map((v) => v.toFixed(1)).join(' ')).join(' L');
const facing = (n: V3, c: Cam) => { const th = c.th * Math.PI / 180, ph = c.ph * Math.PI / 180;
  const nx = n[0] * Math.cos(th) - n[2] * Math.sin(th), nz = n[0] * Math.sin(th) + n[2] * Math.cos(th); return n[1] * Math.sin(ph) + nz * Math.cos(ph) > 1e-3 || (n[1] === 0 && nz > 0); };

// ── edifício: 5 lajes (4 pavimentos), pilares, escada, fachada
const W2 = 260, D2 = 170, FH = 150, SL = 14;
const SLABS = [0, 1, 2, 3, 4].map((i) => i * FH);
const SECT = ['ATENDIMENTO', 'COMERCIAL', 'FINANCEIRO', 'OPERAÇÃO'];
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
  const v = (x: number, y: number, z: number): V3 => [x, y, z];
  return [
    {n: [0, 1, 0] as V3, f: [v(x0, y1, z0), v(x1, y1, z0), v(x1, y1, z1), v(x0, y1, z1)], tone: 0},
    {n: [0, 0, 1] as V3, f: [v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)], tone: 1},
    {n: [1, 0, 0] as V3, f: [v(x1, y0, z0), v(x1, y0, z1), v(x1, y1, z1), v(x1, y1, z0)], tone: 2},
    {n: [-1, 0, 0] as V3, f: [v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0)], tone: 2},
    {n: [0, 0, -1] as V3, f: [v(x0, y0, z0), v(x1, y0, z0), v(x1, y1, z0), v(x0, y1, z0)], tone: 1},
  ];
};
const TONES = ['#2A2F35', '#1F2328', '#171A1E'];
// fluxos "antes" (tracejados, emaranhados) e "depois" (ortogonal, contínuo)
const BEFORE: V3[][] = [
  [[-200, 70, 110], [-60, 70, -40], [40, 220, 120], [-160, 220, -100], [120, 370, 60], [-20, 370, 120], [-200, 70, 110]],
  [[180, 70, -60], [60, 220, -120], [200, 220, 80], [-120, 370, -40], [170, 520, -110], [-180, 520, 60], [60, 370, 140]],
  [[-80, 520, 100], [210, 520, 20], [210, 70, 20], [-30, 70, -120]],
];
const AFTER: V3[] = [[-210, 70, 110], [210, 70, 110], [210, 220, 110], [-210, 220, 110], [-210, 370, 110], [210, 370, 110], [210, 520, 110], [-210, 520, 110]];
const lenOf = (a: V3[]) => a.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - a[i][0], p[1] - a[i][1], p[2] - a[i][2]), 0);
const along = (a: V3[], u: number): V3 => { let d = u * lenOf(a);
  for (let i = 1; i < a.length; i++) { const L = Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1], a[i][2] - a[i - 1][2]);
    if (d <= L) { const k = d / L; return [lerp(a[i - 1][0], a[i][0], k), lerp(a[i - 1][1], a[i][1], k), lerp(a[i - 1][2], a[i][2], k)]; } d -= L; }
  return a[a.length - 1]; };
// figuras do laudo (âncora 3D, slot do rótulo à direita)
const FIGS: Array<{n: string; a: V3; txt: [string, string]; slot: number}> = [
  {n: '01', a: [0, 228, -30], txt: ['MESMA INFORMAÇÃO', 'EM 3 LUGARES'], slot: 0},
  {n: '02', a: [70, 378, 0], txt: ['APROVAÇÃO', 'EM ESPERA'], slot: 1},
  {n: '03', a: [210, 300, 20], txt: ['TAREFA RETORNA', 'À ORIGEM'], slot: 2},
  {n: '04', a: [-170, 450, -20], txt: ['SISTEMAS SEM', 'COMUNICAÇÃO'], slot: 3},
];
const figT = [T.info, T.aprov, T.tarefa, T.isso + .2];

// ── câmera da maquete [t, θ, φ, escala, cx, cy]
const CAMK: number[][] = [
  [0, -40, 28, .95, 1290, 560], [E('gancho').t1, -34, 28, 1, 1290, 560], [E('fora').t1, -26, 28, 1, 1290, 560], [E('raiox').t1, -24, 30, 1, 1290, 560],
  [T.info + .3, -22, 30, 1.12, 1270, 610], [T.aprov + .3, -18, 30, 1.12, 1240, 640], [T.tarefa + .3, -14, 30, 1.08, 1200, 600], [E('laudo').t1, -14, 30, 1.0, 1270, 560],
  [E('tensao').t1, -16, 30, .96, 1290, 560],
  [E('nova').t0, -30, 30, .98, 1290, 570], [E('nova').t1, 4, 30, 1.02, 1290, 570], [E('loop').t1, 12, 30, 1.0, 1290, 570],
];
const camAt = (t: number): Cam => { const [th, ph, s, cx, cy] = keyed(t, CAMK); return {th, ph, s, cx, cy}; };

// ── tipografia
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size?: number; top?: number; left?: number; width?: number; align?: 'left' | 'center'}> = ({t, tin, tout, segs, size = 64, top = 300, left = 120, width = 720, align = 'left'}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: '-.025em', color: C.ink,
    opacity: 1 - q, transform: `translateY(${(-30 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, acc], i) => { if (w === '|') return <br key={i} />; const p = P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? MINT : undefined, opacity: p, transform: `translateY(${((1 - p) * 30).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};
const Spec: React.FC<{t: number; items: Array<[string, number, boolean?]>; tin: number; tout: number; top: number}> = ({t, items, tin, tout, top}) => {
  const out = P(t, tout, .3, EASE_IN); if (t < tin || out >= 1) return null;
  return <div style={{position: 'absolute', left: 120, top, opacity: 1 - out}}>
    {items.map(([w, ta, sub], i) => { const a = P(t, ta - .12, .4); const on = P(t, ta - .08, .2) * (i < items.length - 1 ? 1 - P(t, items[i + 1][1] - .08, .2) : 1);
      return <div key={w} style={{display: 'flex', alignItems: 'center', gap: 16, height: sub ? 44 : 56, marginLeft: sub ? 46 : 0, opacity: a, transform: `translateX(${((1 - a) * -24).toFixed(1)}px)`,
        fontFamily: UI, fontWeight: 700, fontSize: sub ? 22 : 28, letterSpacing: '.18em', color: on > .5 ? C.ink : 'rgba(192,198,204,.55)'}}>
        <span style={{width: sub ? 10 : 14, height: sub ? 10 : 14, border: `2px solid ${on > .5 ? MINT : 'rgba(192,198,204,.5)'}`, background: on > .5 ? MINT : 'transparent', transform: sub ? 'rotate(45deg)' : undefined}} />{w}</div>; })}
  </div>;
};

// ── logo DME (montagem das 4 peças)
const LOGO = [
  'M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z',
  'M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z',
  'M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z',
  'M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z',
];
const FROM = [[-260, 40], [0, -240], [260, -120], [180, 240]];
const Logo: React.FC<{t: number; t0: number; w: number; x: number; y: number}> = ({t, t0, w, x, y}) => (
  <svg viewBox="0 0 750 610" width={w} height={w * 610 / 750} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" /></linearGradient></defs>
    {LOGO.map((d, i) => { const p = P(t, t0 + i * .1, .55, BACK); return <path key={i} d={d} fill="url(#lg)" stroke="#F2F4F6" strokeOpacity=".35" strokeWidth="1.5"
      opacity={clamp(p * 2)} transform={`translate(${((1 - p) * FROM[i][0]).toFixed(1)} ${((1 - p) * FROM[i][1]).toFixed(1)})`} />; })}
    <text x="14" y="592" fontFamily="Manrope, sans-serif" fontWeight={600} fontSize="64" textLength="722" lengthAdjust="spacing" fill="#C0C6CC" opacity={P(t, t0 + .55, .4)}>TECHNOLOGY</text>
  </svg>
);

// ── maquete isométrica (SVG)
const Model: React.FC<{t: number; c: Cam; mode: 'before' | 'after'}> = ({t, c, mode}) => {
  const draw = (k: number) => P(t, -.7 + k * .45, 1.3, EASE_IO);                  // desenho inicial das linhas
  const solid = P(t, E('fora').t0 - .2, .8) * (mode === 'before' ? 1 : 1);         // maquete preenchida (aço)
  const scanY = mode === 'before' ? lerp(-30, 640, P(t, T.dentro + .2, 2.6, EASE_IO)) : 999;
  const xray = (y: number) => mode === 'after' ? .78 : (t > T.dentro ? clamp((scanY - y) / 60) : 0);
  const dark = P(t, T.isso - .1, .6) * (mode === 'before' ? 1 : 0);
  const lineCol = 'rgba(192,198,204,.8)';
  const els: React.ReactNode[] = [];
  // grade de chão (planta)
  for (let i = -3; i <= 3; i++) {
    els.push(<path key={'gx' + i} d={pathOf([[i * 100, -2, -260], [i * 100, -2, 260]], c)} stroke="rgba(192,198,204,.10)" strokeWidth="1" />);
    els.push(<path key={'gz' + i} d={pathOf([[-360, -2, i * 80], [360, -2, i * 80]], c)} stroke="rgba(192,198,204,.10)" strokeWidth="1" />);
  }
  // pilares e escada (atrás das lajes de cima, desenhados primeiro)
  const PIL: Array<[number, number]> = [[-W2 + 26, -D2 + 26], [W2 - 26, -D2 + 26], [W2 - 26, D2 - 26], [-W2 + 26, D2 - 26], [0, -D2 + 26]];
  PIL.forEach(([x, z], i) => { const d = draw(1); els.push(<path key={'p' + i} d={pathOf([[x, 0, z], [x, 4 * FH, z]], c)} stroke={lineCol} strokeWidth="2" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} opacity={1 - .5 * dark} />); });
  for (let f = 0; f < 4; f++) { const d = draw(2); els.push(<path key={'st' + f} d={pathOf([[-W2 + 60, f * FH + SL, -D2 + 40], [-W2 + 150, (f + 1) * FH, -D2 + 40]], c)} stroke="rgba(192,198,204,.5)" strokeWidth="2" strokeDasharray="6 6" opacity={d * (1 - .5 * dark)} />); }
  // lajes (de baixo para cima)
  SLABS.forEach((y, i) => {
    const xr = xray(y), fillO = solid * (1 - .82 * xr) * (1 - .55 * dark), d = draw(0);
    box(-W2, W2, y - SL, y, -D2, D2).forEach((fc, j) => { if (!facing(fc.n, c)) return;
      els.push(<polygon key={`s${i}-${j}`} points={pts(fc.f, c)} fill={TONES[fc.tone]} fillOpacity={fillO} stroke={mode === 'after' && j === 0 ? 'rgba(58,110,165,.55)' : lineCol} strokeWidth="1.6"
        strokeDasharray={d < 1 ? '1 1' : undefined} pathLength={d < 1 ? 1 : undefined} strokeDashoffset={d < 1 ? 1 - d : undefined} />); });
  });
  // fachada com janelas (some com o raio-X)
  for (let f = 0; f < 4; f++) {
    const y0 = f * FH + 30, y1 = (f + 1) * FH - SL - 22, op = solid * (1 - xray(f * FH + 60)) * (1 - dark);
    if (op <= .01) continue;
    for (let k = 0; k < 7; k++) { const x0 = -W2 + 30 + k * 72, on = .35 + .65 * (0.5 + 0.5 * Math.sin(t * 2.2 + k * 1.7 + f * 2.3)) * (hash(k + f * 7) > .35 ? 1 : .2);
      els.push(<polygon key={`w${f}-${k}`} points={pts([[x0, y0, D2], [x0 + 52, y0, D2], [x0 + 52, y1, D2], [x0, y1, D2]], c)} fill={`rgba(192,198,204,${(.08 + .22 * on).toFixed(2)})`} stroke="rgba(192,198,204,.25)" strokeWidth="1" opacity={op} />); }
  }
  // fluxos
  if (mode === 'before') {
    BEFORE.forEach((pl, i) => { const seen = clamp((scanY - Math.min(...pl.map((p) => p[1]))) / 300); if (seen <= 0) return;
      els.push(<path key={'b' + i} d={pathOf(pl, c)} fill="none" stroke="rgba(192,198,204,.85)" strokeWidth="2.6" strokeDasharray="10 9" strokeLinejoin="round" opacity={seen} />); });
    // FIG 01: mesma informação em 3 telas
    const f1 = P(t, T.info - .1, .5);
    if (f1 > 0) [-150, 0, 150].forEach((x, i) => { els.push(<polygon key={'f1' + i} points={pts([[x - 34, 190, -30], [x + 34, 190, -30], [x + 34, 250, -30], [x - 34, 250, -30]], c)} fill="#2A2F35" stroke={C.silver} strokeWidth="1.6" opacity={f1} />);
      if (i) els.push(<path key={'f1l' + i} d={pathOf([[x - 150 + 34, 220, -30], [x - 34, 220, -30]], c)} stroke={C.silver} strokeDasharray="5 5" strokeWidth="2" opacity={f1} />); });
    // FIG 02: aprovação em espera (barreira + relógio)
    const f2 = P(t, T.aprov - .1, .5);
    if (f2 > 0) { els.push(<polygon key="f2" points={pts([[70, 300, -60], [70, 300, 60], [70, 430, 60], [70, 430, -60]], c)} fill="#2A2F35" stroke={C.silver} strokeWidth="2" opacity={f2} />);
      const [x, y] = proj([70, 470, 0], c); const a = t * 3; els.push(<g key="clk" opacity={f2}><circle cx={x} cy={y} r="22" fill="#121417" stroke={C.silver} strokeWidth="2.5" /><line x1={x} y1={y} x2={x + 15 * Math.sin(a)} y2={y - 15 * Math.cos(a)} stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" /></g>); }
    // FIG 03: laço que volta ao térreo
    const f3 = P(t, T.tarefa - .1, .9, EASE_IO);
    if (f3 > 0) { const loop: V3[] = [[200, 520, 140], [300, 520, 140], [300, 70, 140], [200, 70, 140]];
      els.push(<path key="f3" d={pathOf(loop, c)} fill="none" stroke={C.ink} strokeWidth="3" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - f3} />);
      const [ax, ay] = proj([200, 70, 140], c); els.push(<path key="f3a" d={`M${ax + 14} ${ay - 8} L${ax} ${ay} L${ax + 14} ${ay + 8}`} fill="none" stroke={C.ink} strokeWidth="3" opacity={f3 >= 1 ? 1 : 0} />); }
    // FIG 04: sistemas sem comunicação
    const f4 = P(t, figT[3] - .1, .5);
    if (f4 > 0) { [[-230, 400, -90], [-110, 470, -90]].forEach(([x, y, z], i) => box(x, x + 70, y, y + 50, z, z + 60).forEach((fc, j) => { if (facing(fc.n, c)) els.push(<polygon key={`f4${i}${j}`} points={pts(fc.f, c)} fill={TONES[fc.tone]} stroke={C.silver} strokeWidth="1.5" opacity={f4} />); }));
      els.push(<path key="f4l" d={pathOf([[-160, 425, -60], [-140, 450, -60]], c)} stroke={C.silver} strokeWidth="3" opacity={f4} />);
      els.push(<path key="f4m" d={pathOf([[-128, 470, -60], [-110, 490, -60]], c)} stroke={C.silver} strokeWidth="3" opacity={f4} />); }
    // plano de raio-X
    if (t > T.dentro && t < T.dentro + 3.2) { const o = 1 - P(t, T.dentro + 2.8, .4); const pl: V3[] = [[-W2 - 40, scanY, -D2 - 40], [W2 + 40, scanY, -D2 - 40], [W2 + 40, scanY, D2 + 40], [-W2 - 40, scanY, D2 + 40]];
      els.push(<polygon key="scan" points={pts(pl, c)} fill="rgba(58,110,165,.16)" stroke={MINT} strokeWidth="2.5" opacity={o} />); }
  } else {
    const d = P(t, E('nova').t0 + .2, 1.6, EASE_IO);
    els.push(<path key="after" d={pathOf(AFTER, c)} fill="none" stroke={MINT} strokeWidth="5" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} />);
    if (d >= 1) [0, 1, 2, 3].forEach((i) => { const u = ((t - E('nova').t0) * .14 + i / 4) % 1; const [x, y] = proj(along(AFTER, u), c); els.push(<circle key={'pa' + i} cx={x} cy={y} r="9" fill="#fff" stroke={MINT} strokeWidth="4" />); });
  }
  // cotas dos pavimentos (à esquerda da maquete)
  const cot = P(t, .9, .8) * (1 - P(t, E('laudo').t0 - .4, .4)) + (mode === 'after' ? P(t, E('nova').t0 + .6, .5) : 0);
  if (cot > 0) SECT.forEach((n, f) => { const [x, y] = proj([-W2, f * FH + 75, D2], c); els.push(<g key={'c' + f} opacity={Math.min(1, cot)}>
    <line x1={x - 16} y1={y} x2={x - 70} y2={y} stroke="rgba(192,198,204,.6)" strokeWidth="1.5" /><text x={x - 80} y={y + 6} textAnchor="end" fontFamily="Manrope" fontWeight={700} fontSize="17" letterSpacing="3" fill={C.silver}>{`PAV. 0${f + 1} · ${n}`}</text></g>); });
  return <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>{els}</svg>;
};

// ── rótulos do laudo (lado direito) com linha de chamada até a âncora
const Callouts: React.FC<{t: number; c: Cam; o: number}> = ({t, c, o}) => (
  <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: o}}>
    {FIGS.map((fg, i) => { const k = P(t, figT[i] - .05, .35, EASE_IO), tx = P(t, figT[i] + .25, .35); if (k <= 0) return null;
      const [ax, ay] = proj(fg.a, c), lx = 1600, ly = 250 + fg.slot * 150;
      return <g key={fg.n}>
        <circle cx={ax} cy={ay} r={8} fill={C.ink} />
        <path d={`M${ax} ${ay} L${lerp(ax, lx - 20, k)} ${lerp(ay, ly, k)}`} stroke={C.ink} strokeWidth="1.6" />
        <g opacity={tx}><circle cx={lx} cy={ly} r="22" fill="none" stroke={C.ink} strokeWidth="2" /><text x={lx} y={ly + 7} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="18" fill={C.ink}>{fg.n}</text>
          <text x={lx + 36} y={ly - 16} fontFamily="Manrope" fontWeight={700} fontSize="15" letterSpacing="3" fill={MINT}>{`FIG. ${fg.n}`}</text>
          <text x={lx + 36} y={ly + 6} fontFamily="Manrope" fontWeight={700} fontSize="18" letterSpacing="2" fill={C.ink}>{fg.txt[0]}</text>
          <text x={lx + 36} y={ly + 28} fontFamily="Manrope" fontWeight={700} fontSize="18" letterSpacing="2" fill={C.ink}>{fg.txt[1]}</text></g>
      </g>; })}
  </svg>
);

// ── planta baixa (2D): salas, caos, fluxograma, padronização, automação, IA e integração
const ROOMS = SECT.map((n, i) => ({n, x: 960 + i * 215, y: 250, w: 200, h: 600}));
const BOXES = ROOMS.map((r, i) => [{x: r.x + 30, y: 400, w: [130, 110, 150, 120][i], r: [-6, 4, -3, 7][i]}, {x: r.x + 30, y: 640, w: [110, 150, 120, 140][i], r: [5, -7, 6, -4][i]}]);
const FLOW_PTS = (() => { const p: Array<[number, number]> = []; ROOMS.forEach((r, i) => { if (i % 2 === 0) { p.push([r.x + 100, 428], [r.x + 100, 668]); } else { p.push([r.x + 100, 668], [r.x + 100, 428]); } }); return p; })();
const flowLen = FLOW_PTS.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - FLOW_PTS[i][0], p[1] - FLOW_PTS[i][1]), 0);
const flowAt = (u: number): [number, number] => { let d = u * flowLen; for (let i = 1; i < FLOW_PTS.length; i++) { const L = Math.hypot(FLOW_PTS[i][0] - FLOW_PTS[i - 1][0], FLOW_PTS[i][1] - FLOW_PTS[i - 1][1]);
  if (d <= L) return [lerp(FLOW_PTS[i - 1][0], FLOW_PTS[i][0], d / L), lerp(FLOW_PTS[i - 1][1], FLOW_PTS[i][1], d / L)]; d -= L; } return FLOW_PTS[FLOW_PTS.length - 1]; };
// figuras do laudo na planta: cada número fica no problema que representa, com glifo e legenda
const PFIG: Array<[string, number, number, [string, string?]]> = [['01', ROOMS[1].x + 60, 335, ['INFORMAÇÃO', 'REPETIDA']], ['02', ROOMS[2].x + 60, 335, ['APROVAÇÃO', 'EM ESPERA']],
  ['03', 1380, 790, ['RETRABALHO']], ['04', ROOMS[3].x - 7.5, 520, ['SEM', 'COMUNICAÇÃO']]];
const Plan: React.FC<{t: number}> = ({t}) => {
  const v = P(t, E('virada').t0 - .02, .25) * (1 - P(t, E('nova').t0 - .1, .3));
  if (v <= 0) return null;
  const walls = P(t, E('virada').t0, 1.0, EASE_IO), cot = P(t, T.ent - .1, 1.0, EASE_IO), figs = P(t, T.ident - .1, .4, BACK);
  const erase = P(t, T.redes - .05, .8, EASE_IO), map = P(t, T.mapa - .1, .8, EASE_IO), pad = P(t, T.padr - .05, .9, EASE_IO), auto = P(t, T.auto - .05, 1.0, EASE_IO);
  const iaT = P(t, T.ia - .1, .45, BACK), inT = P(t, T.integ - .1, .45, BACK);
  const chaos = ['M1060 420 C1200 300 1300 700 1480 520 S1700 380 1500 760 S1100 780 1060 420', 'M1260 330 C1400 380 1250 600 1700 640 S1580 300 1380 360', 'M1700 780 C1500 880 1200 880 1060 760'];
  return <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: v}}>
    {ROOMS.map((r, i) => <g key={r.n}>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="rgba(38,75,113,.08)" stroke={C.silver} strokeWidth="2.5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - walls} />
      <rect x={r.x + 7} y={r.y + 7} width={r.w - 14} height={r.h - 14} fill="none" stroke="rgba(192,198,204,.35)" strokeWidth="1" opacity={walls} />
      <text x={r.x + r.w / 2} y={r.y + 36} textAnchor="middle" fontFamily="Manrope" fontWeight={700} fontSize="15" letterSpacing="2.5" fill={C.silver} opacity={walls}>{r.n}</text>
      {/* cotas (entender) */}
      <g opacity={cot}><line x1={r.x} y1={r.y - 26} x2={r.x + r.w * cot} y2={r.y - 26} stroke={MINT} strokeWidth="1.5" /><line x1={r.x} y1={r.y - 34} x2={r.x} y2={r.y - 18} stroke={MINT} strokeWidth="1.5" /><line x1={r.x + r.w} y1={r.y - 34} x2={r.x + r.w} y2={r.y - 18} stroke={MINT} strokeWidth="1.5" opacity={cot >= 1 ? 1 : 0} /></g>
    </g>)}
    {/* caos (tracejado) apagando no sentido inverso */}
    {chaos.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(192,198,204,.75)" strokeWidth="2.4" strokeDasharray="9 8" opacity={(walls) * (1 - erase)} />)}
    {/* figuras numeradas (identificar) */}
    {/* glifos dos problemas (somem quando o processo é redesenhado) */}
    {(() => { const g = figs * (1 - P(t, T.mapa, .5)); if (g <= 0) return null; const [cx, cy] = [ROOMS[1].x + 140, 335], [fx, fy] = [ROOMS[2].x + 140, 335];
      return <g opacity={g}>
        {[0, 1, 2].map((k) => <rect key={k} x={cx - 18 + k * 8} y={cy - 22 + k * 8} width="26" height="32" rx="3" fill="#16191C" stroke={C.silver} strokeWidth="1.8" />)}
        <circle cx={fx} cy={fy} r="20" fill="#16191C" stroke={C.silver} strokeWidth="2" /><line x1={fx} y1={fy} x2={fx + 12 * Math.sin(t * 3)} y2={fy - 12 * Math.cos(t * 3)} stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
        <path d={`M${ROOMS[3].x + 160} 790 L${ROOMS[0].x + 40} 790`} stroke={C.silver} strokeWidth="2.4" strokeDasharray="9 7" fill="none" />
        <path d={`M${ROOMS[0].x + 56} 780 L${ROOMS[0].x + 40} 790 L${ROOMS[0].x + 56} 800`} stroke={C.silver} strokeWidth="2.4" fill="none" />
        <line x1={ROOMS[3].x - 52} y1="470" x2={ROOMS[3].x - 20} y2="470" stroke={C.silver} strokeWidth="3" /><line x1={ROOMS[3].x + 5} y1="470" x2={ROOMS[3].x + 37} y2="470" stroke={C.silver} strokeWidth="3" />
      </g>; })()}
    {PFIG.map(([n, x, y, lab], i) => { const ok = P(t, T.onde + .1 + i * .3, .3, BACK), a = P(t, T.ident - .1 + i * .15, .4, BACK), hide = i === 3 ? P(t, T.integ - .1, .3) : 0;
      return <g key={n} opacity={a * (1 - hide)}>
        <g transform={`translate(${x} ${y}) scale(${a.toFixed(3)})`}><circle r="22" fill="#0A0B0C" stroke={ok > .5 ? MINT : C.ink} strokeWidth="2.5" /><text y="7" textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="17" fill={C.ink} opacity={1 - ok}>{n}</text>
          {ok > 0 ? <path d="M-9 0 L-2 7 L10 -7" fill="none" stroke={MINT} strokeWidth="3.5" strokeLinecap="round" opacity={ok} /> : null}</g>
        {lab.map((l, k) => l ? <text key={k} x={x} y={y + 44 + k * 18} textAnchor="middle" fontFamily="Manrope" fontWeight={700} fontSize="13" letterSpacing="1.6" fill={ok > .5 ? MINT : C.silver}>{l}</text> : null)}
      </g>; })}
    {/* fluxograma: caixas (mapeamento → padronização) e losango de decisão */}
    {BOXES.map((bx, i) => bx.map((b, j) => { const w = lerp(b.w, 140, pad), x = lerp(b.x, ROOMS[i].x + 30, pad), r = lerp(b.r, 0, pad);
      return <g key={`${i}${j}`} opacity={map} transform={`rotate(${r.toFixed(2)} ${x + w / 2} ${b.y + 28})`}>
        <rect x={x} y={b.y} width={w} height={56} rx="6" fill="#16191C" stroke={auto > .5 ? MINT : C.silver} strokeWidth="2" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - map} />
        <rect x={x + 14} y={b.y + 22} width={(w - 28) * map} height="6" rx="3" fill="rgba(192,198,204,.35)" /></g>; }))}
    {(() => { const [x, y] = [ROOMS[2].x + 100, 548]; return <g opacity={map}><path d={`M${x} ${y - 34} L${x + 34} ${y} L${x} ${y + 34} L${x - 34} ${y} Z`} fill="#16191C" stroke={iaT > .5 ? MINT : C.silver} strokeWidth="2" /></g>; })()}
    {/* cotas de igualdade (padronização) */}
    {pad > 0 ? ROOMS.map((r, i) => <text key={'eq' + i} x={r.x + 100} y={r.y + r.h - 24} textAnchor="middle" fontFamily="Manrope" fontWeight={700} fontSize="16" letterSpacing="3" fill={MINT} opacity={pad * (1 - P(t, T.auto + .3, .3))}>= 140 =</text>) : null}
    {/* automação: conector contínuo e pulso */}
    <polyline points={FLOW_PTS.map((p) => p.join(',')).join(' ')} fill="none" stroke={MINT} strokeWidth="4" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - auto} />
    {auto >= 1 ? [0, 1, 2].map((i) => { const [x, y] = flowAt(((t - T.auto) * .22 + i / 3) % 1); return <circle key={'pl' + i} cx={x} cy={y} r="8" fill="#fff" stroke={MINT} strokeWidth="3.5" />; }) : null}
    {/* IA e INTEGRAÇÃO */}
    {iaT > 0 ? <g transform={`translate(${ROOMS[2].x + 100} 548) scale(${iaT.toFixed(3)})`}><rect x="-36" y="-17" width="72" height="34" rx="17" fill={MINT} /><text y="7" textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="18" fill="#fff">IA</text></g> : null}
    {inT > 0 ? <g transform={`translate(${ROOMS[3].x - 8} 470) scale(${inT.toFixed(3)})`}><rect x="-84" y="-18" width="168" height="36" rx="18" fill={MINT} /><text y="7" textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="16" letterSpacing="2" fill="#fff">INTEGRAÇÃO</text></g> : null}
  </svg>;
};

// ── prancha: moldura, régua, escala, indicador de etapa e carimbo
const STEPS: Array<[string, number]> = [['01 LEVANTAMENTO', 0], ['02 DIAGNÓSTICO', E('laudo').t0 - .1], ['03 PROJETO', E('virada').t0], ['04 EXECUÇÃO', E('nova').t0]];
const Sheet: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const blue = P(t, E('virada').t0, .4) * (1 - P(t, E('nova').t0, .6) * .5);
  const step = STEPS.reduce((m, s, i) => (t >= s[1] ? i : m), 0);
  const revB = P(t, T.aqui + .25, .5, EASE_IO), aprov = P(t, T.sua, .5);
  const ruler = (c.th * 4) % 60;
  return <>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(rgba(${blue > .1 ? '58,110,165' : '192,198,204'},${(.05 + .03 * blue).toFixed(3)}) 1px, transparent 1px), linear-gradient(90deg, rgba(${blue > .1 ? '58,110,165' : '192,198,204'},${(.05 + .03 * blue).toFixed(3)}) 1px, transparent 1px)`, backgroundSize: '24px 24px'}} />
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.09) 1px, transparent 1px)', backgroundSize: '120px 120px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(80% 90% at 30% 40%, rgba(10,11,12,0) 0%, rgba(10,11,12,.65) 100%)'}} />
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {[[64, 64, 1, 1], [1856, 64, -1, 1], [1856, 1016, -1, -1], [64, 1016, 1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M${x} ${y + 40 * sy} L${x} ${y} L${x + 40 * sx} ${y}`} fill="none" stroke={C.silver} strokeWidth="2" opacity=".8" />)}
      {[...Array(29)].map((_, i) => { const x = 140 + i * 60 - ruler; return <line key={i} x1={x} y1={64} x2={x} y2={i % 5 ? 72 : 80} stroke="rgba(192,198,204,.45)" strokeWidth="1.2" />; })}
      <text x="96" y="1004" fontFamily="Manrope" fontWeight={600} fontSize="15" letterSpacing="3" fill="rgba(192,198,204,.6)">ESC. 1:1 · OPERAÇÃO</text>
      <line x1="96" y1="984" x2="276" y2="984" stroke="rgba(192,198,204,.6)" strokeWidth="2" />{[0, 1, 2, 3].map((k) => <rect key={k} x={96 + k * 45} y="978" width="22.5" height="6" fill="rgba(192,198,204,.6)" />)}
    </svg>
    {/* indicador de etapa */}
    <div style={{position: 'absolute', right: 96, top: 96, display: 'flex', gap: 22, fontFamily: UI, fontWeight: 700, fontSize: 15, letterSpacing: '.2em'}}>
      {STEPS.map(([n], i) => <span key={n} style={{color: i === step ? C.ink : 'rgba(192,198,204,.38)', borderBottom: `2px solid ${i === step ? MINT : 'transparent'}`, paddingBottom: 6}}>{n}</span>)}</div>
    {/* carimbo */}
    <div style={{position: 'absolute', right: 96, bottom: 96, width: 430, border: '1.5px solid rgba(192,198,204,.55)', fontFamily: UI, fontWeight: 600, fontSize: 14, letterSpacing: '.16em', color: 'rgba(192,198,204,.8)'}}>
      <div style={{display: 'flex', borderBottom: '1px solid rgba(192,198,204,.35)'}}><div style={{flex: 1, padding: '8px 12px', color: C.ink, fontWeight: 800}}>DME TECHNOLOGY</div><div style={{padding: '8px 12px', borderLeft: '1px solid rgba(192,198,204,.35)'}}>DOC 001</div></div>
      <div style={{display: 'flex'}}><div style={{flex: 1, padding: '8px 12px'}}>{t > T.dentro + 3 && t < T.dentro + 4.4 ? <span style={{color: MINT}}>LEVANTAMENTO CONCLUÍDO</span> : 'PLANTA DA OPERAÇÃO'}</div>
        <div style={{position: 'relative', padding: '8px 12px', borderLeft: '1px solid rgba(192,198,204,.35)', minWidth: 96}}>
          <span style={{position: 'relative'}}>REV. A<span style={{position: 'absolute', left: -2, right: -2, top: '50%', height: 2, background: MINT, transform: `scaleX(${revB.toFixed(3)})`, transformOrigin: 'left'}} /></span>
          {revB > 0 ? <span style={{marginLeft: 8, color: MINT, opacity: revB}}>B</span> : null}</div></div>
      {aprov > 0 ? <div style={{borderTop: '1px solid rgba(192,198,204,.35)', padding: '8px 12px', color: MINT, fontWeight: 800, opacity: aprov}}>APROVADO</div> : null}
    </div>
  </>;
};

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const c = camAt(t);
  const sig = P(t, T.sig - .2, .8, EASE_IO);
  const showBefore = t < E('virada').t0, showAfter = t >= E('nova').t0 - .05;
  const collapse = P(t, T.sig - .3, .9, EASE_IO);
  const mc: Cam = {...c, s: c.s * (1 - .85 * collapse), cx: lerp(c.cx, 960, collapse), cy: lerp(c.cy, 420, collapse)};
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(60% 80% at 0% 40%, rgba(38,75,113,.35) 0%, rgba(38,75,113,0) 60%)'}} />
      <Sheet t={t} c={c} />
      {showBefore ? <Model t={t} c={c} mode="before" /> : null}
      {showBefore ? <Callouts t={t} c={c} o={1 - P(t, E('tensao').t1 - .3, .3)} /> : null}
      {/* tensão: véu sobre a maquete */}
      <Plan t={t} />
      {showAfter ? <div style={{position: 'absolute', inset: 0, opacity: (P(t, E('nova').t0 - .05, .3)) * (1 - collapse)}}><Model t={t} c={mc} mode="after" /></div> : null}

      {/* ── textos (coluna esquerda) */}
      <Phrase t={t} tin={-1} tout={E('gancho').t1 - .3} segs={['Toda empresa', '|', 'tem uma planta.']} size={72} top={300} />
      <Phrase t={t} tin={T.poucas - .08} tout={E('gancho').t1 - .3} segs={['Poucas conhecem', '|', ['a sua.']]} size={72} top={470} />
      <Phrase t={t} tin={T.fora - .05} tout={E('fora').t1 - .3} segs={['Por fora, tudo', '|', 'parece ', ['funcionar.']]} size={64} top={330} />
      <Phrase t={t} tin={T.dentro - .05} tout={E('raiox').t1 - .3} segs={['Por dentro,', '|', 'caminhos que', '|', ['ninguém desenhou.']]} size={64} top={330} />
      <Phrase t={t} tin={T.info - .05} tout={T.aprov - .35} segs={['Informação', '|', 'que ', ['se repete.']]} size={64} top={330} />
      <Phrase t={t} tin={T.aprov - .05} tout={T.tarefa - .35} segs={['Aprovação', '|', 'que ', ['espera.']]} size={64} top={330} />
      <Phrase t={t} tin={T.tarefa - .05} tout={E('laudo').t1 - .3} segs={['Tarefa que volta', '|', ['para o início.']]} size={64} top={330} />
      <Phrase t={t} tin={T.isso - .05} tout={E('tensao').t1 - .1} segs={['Não é falta', '|', 'de esforço.']} size={66} top={300} />
      <Phrase t={t} tin={T.eFalta - .05} tout={E('tensao').t1 - .1} segs={['É falta de', '|', ['projeto.']]} size={76} top={470} />
      <Phrase t={t} tin={T.aqui - .05} tout={E('virada').t1 - .3} segs={['É aqui que', '|', 'a ', ['DME'], ' entra.']} size={72} top={330} />
      <Spec t={t} tin={T.ent - .2} tout={E('metodo').t1 - .3} top={300} items={[['01 ENTENDER', T.ent], ['02 IDENTIFICAR', T.ident], ['03 REDESENHAR', T.redes], ['MAPEAMENTO', T.mapa, true], ['PADRONIZAÇÃO', T.padr, true], ['AUTOMAÇÃO', T.auto, true]]} />
      <Phrase t={t} tin={T.ia - .25} tout={T.onde - .35} segs={['Inteligência artificial', '|', 'e ', ['integração.']]} size={60} top={330} />
      <Phrase t={t} tin={T.onde - .05} tout={E('tecnologia').t1 - .3} segs={['Onde resolvem', '|', 'um ', ['problema real.']]} size={64} top={330} />
      <Phrase t={t} tin={T.result - .05} tout={E('nova').t1 - .3} segs={['Uma operação', '|', 'desenhada', '|', 'com ', ['propósito.']]} size={60} top={250} />
      <Spec t={t} tin={T.clara - .2} tout={E('nova').t1 - .3} top={540} items={[['CLARA', T.clara], ['CONECTADA', T.conect], ['PREPARADA PARA EVOLUIR', T.prep]]} />
      <Phrase t={t} tin={T.toda2 - .05} tout={E('loop').t1 - .1} segs={['Toda empresa', '|', 'tem uma planta.']} size={68} top={300} />
      <Phrase t={t} tin={T.agora - .05} tout={E('loop').t1 - .1} segs={['Agora, você', '|', 'conhece ', ['a sua.']]} size={68} top={460} />

      {/* ── assinatura */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <Logo t={t} t0={T.sig + .1} w={440} x={960 - 220} y={220} />
        <Phrase t={t} tin={T.tec - .1} tout={99} segs={['Automatizamos processos.']} size={60} top={650} left={260} width={1400} align="center" />
        <Phrase t={t} tin={T.cta - .1} tout={99} segs={[['Devolvemos tempo.']]} size={60} top={730} left={260} width={1400} align="center" />
        {(() => { const b = P(t, T.cta + .4, 1.0, EASE_IO); return <div style={{position: 'absolute', left: 960 - 260, top: 836, width: 520, height: 3, background: `linear-gradient(90deg, rgba(58,110,165,0), ${MINT}, rgba(58,110,165,0))`, transform: `scaleX(${b.toFixed(3)})`}} />; })()}
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
