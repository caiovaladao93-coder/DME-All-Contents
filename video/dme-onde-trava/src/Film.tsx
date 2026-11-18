import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, keyed, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "Onde a operação trava" (9:16, 60 s). Tom de relatório de consultoria: prancha técnica, fichas "CASO 0X" e maquetes
 * isométricas de aço. Um MARCADOR (fio condutor) procura o gargalo: na planta genérica, depois em 4 cenários típicos de setor
 * (clínica, serviços B2B, distribuidora, construtora). Em cada caso: fila de itens parada no gargalo → solução (só fatos
 * confirmados) → fluxo azul contínuo. Depois o método Entender → Planejar → Desenvolver, a pergunta (loop) e a assinatura.
 * Tudo é função do quadro (t = frame / 30); os tempos vêm das palavras reais da locução.
 */
const W = 1080, H = 1920;
const E = (k: SceneKey) => S[k];
const A = C.accent;
const T = {
  gargalo: wt('gancho', 'gargalo'), procura: wt('gancho', 'procura.'),
  parece: wt('processo', 'Parece'), quase: wt('processo', 'Quase'), proc: wt('processo', 'processo.'),
  c1liga: wt('c1p', 'liga'), c1ning: wt('c1p', 'Ninguém'), c1agente: wt('c1s', 'agente'),
  c1v: [wt('c1s', 'atende,'), wt('c1s', 'qualifica,'), wt('c1s', 'registra'), wt('c1s', 'passa')],
  c2ret: wt('c2p', 'retorno'), c2mem: wt('c2p', 'memória'), c2crm: wt('c2s', 'Cê-Erre-Eme'), c2auto: wt('c2s', 'retornos'),
  c3ped: wt('c3p', 'pedido'), c3dois: wt('c3p', 'dois'), c3int: wt('c3s', 'Integração'),
  c4so: wt('c4p', 'só'), c4orc: wt('c4p', 'orçamento.'), c4map: wt('c4s', 'Mapeamento'), c4pad: wt('c4s', 'padronização'),
  cada: wt('metodo', 'Cada'), diferente: wt('metodo', 'diferente.'), porisso: wt('metodo', 'Por'), ent: wt('metodo', 'entende,'), plan: wt('metodo', 'planeja'), des: wt('metodo', 'desenvolve'), sob: wt('metodo', 'sob'),
  onde: wt('pergunta', 'Onde'), sig: E('assinatura').t0, envie: wt('assinatura', 'Envie'),
};

// ── projeção isométrica com órbita
type V3 = [number, number, number];
type Cam = {th: number; ph: number; s: number; cx: number; cy: number};
const proj = (p: V3, c: Cam): [number, number] => {
  const th = c.th * Math.PI / 180, ph = c.ph * Math.PI / 180, [x, y, z] = p;
  const xr = x * Math.cos(th) - z * Math.sin(th), zr = x * Math.sin(th) + z * Math.cos(th);
  return [c.cx + c.s * xr, c.cy - c.s * y * Math.cos(ph) + c.s * zr * Math.sin(ph)];
};
const pts = (a: V3[], c: Cam) => a.map((p) => proj(p, c).map((v) => v.toFixed(1)).join(',')).join(' ');
const facing = (n: V3, c: Cam) => { const th = c.th * Math.PI / 180, ph = c.ph * Math.PI / 180;
  const nz = n[0] * Math.sin(th) + n[2] * Math.cos(th); return n[1] * Math.sin(ph) + nz * Math.cos(ph) > 1e-3; };
const faces = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => [
  {n: [0, 0, -1] as V3, f: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] as V3[], tone: 2},
  {n: [-1, 0, 0] as V3, f: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] as V3[], tone: 2},
  {n: [1, 0, 0] as V3, f: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] as V3[], tone: 1},
  {n: [0, 0, 1] as V3, f: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] as V3[], tone: 1},
  {n: [0, 1, 0] as V3, f: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] as V3[], tone: 0},
];
const TONES = ['#3A4047', '#262A2F', '#1B1E22'];
const segLen = (a: V3[]) => a.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - a[i][0], p[2] - a[i][2]), 0);
const along = (a: V3[], d: number): V3 => {
  for (let i = 1; i < a.length; i++) { const L = Math.hypot(a[i][0] - a[i - 1][0], a[i][2] - a[i - 1][2]);
    if (d <= L) { const k = d / L; return [lerp(a[i - 1][0], a[i][0], k), lerp(a[i - 1][1], a[i][1], k), lerp(a[i - 1][2], a[i][2], k)]; } d -= L; }
  return a[a.length - 1];
};

// ── cenários: nós (blocos de aço) ligados em sequência; G = índice do gargalo; SOL = blocos que substituem o gargalo
type Node = {l: string; x: number; z: number; w?: number; d?: number; h?: number};
type Caso = {key: 'c1' | 'c2' | 'c3' | 'c4'; tag: string; nodes: Node[]; g: number; gl: string; sol: Node[]; ficha: [string, string]; back?: boolean};
const CASOS: Caso[] = [
  {key: 'c1', tag: 'CASO 01 · CLÍNICA', g: 1, gl: '19:00 · SEM RESPOSTA',
    nodes: [{l: 'LIGAÇÃO', x: -250, z: -170, w: 90, d: 70, h: 40}, {l: 'TELEFONE', x: -40, z: -60}, {l: 'AGENDA', x: 120, z: 90}, {l: 'EQUIPE', x: 260, z: 230, h: 90}],
    sol: [{l: 'AGENTE DE VOZ · IA', x: -40, z: -60, w: 150, h: 70}, {l: 'CRM', x: 120, z: 90}],
    ficha: ['Ligação fora do horário sem atendimento', 'Agente de voz com IA: atende, qualifica, registra no CRM e passa para a equipe']},
  {key: 'c2', tag: 'CASO 02 · SERVIÇOS B2B', g: 3, gl: 'RETORNO ?', back: true,
    nodes: [{l: 'COMERCIAL', x: -220, z: -150, h: 90}, {l: 'PROPOSTA', x: 0, z: -150, w: 90, h: 40}, {l: 'CLIENTE', x: 220, z: 20}, {l: 'MEMÓRIA', x: -20, z: 170, w: 80, d: 80, h: 30}],
    sol: [{l: 'CRM · RETORNO AUTOMÁTICO', x: -20, z: 170, w: 150, h: 70}],
    ficha: ['Retorno da proposta depende da memória de alguém', 'CRM personalizado com retornos automáticos']},
  {key: 'c3', tag: 'CASO 03 · DISTRIBUIDORA', g: 2, gl: 'REDIGITAÇÃO',
    nodes: [{l: 'PEDIDO', x: -270, z: -120, w: 80, d: 70, h: 40}, {l: 'SISTEMA A', x: -110, z: -20, h: 100}, {l: 'PRANCHETA', x: 50, z: 80, w: 70, d: 90, h: 24}, {l: 'SISTEMA B', x: 230, z: 190, h: 100}],
    sol: [{l: 'INTEGRAÇÃO', x: 50, z: 80, w: 150, d: 50, h: 30}],
    ficha: ['O mesmo pedido é digitado em dois sistemas', 'Integração de sistemas']},
  {key: 'c4', tag: 'CASO 04 · CONSTRUTORA', g: 1, gl: 'SÓ 1 PESSOA SABE',
    nodes: [{l: 'CLIENTE', x: -250, z: -160, w: 90, d: 70, h: 50}, {l: 'ORÇAMENTO', x: -40, z: -20, w: 90, d: 90, h: 50}, {l: 'OBRA', x: 230, z: 160, w: 150, d: 120, h: 120}],
    sol: [{l: 'LEVANTAR', x: -110, z: -60, w: 70, d: 60, h: 40}, {l: 'PADRÃO', x: -10, z: 10, w: 70, d: 60, h: 40}, {l: 'ORÇAR', x: 90, z: 80, w: 70, d: 60, h: 40}],
    ficha: ['Só uma pessoa sabe montar o orçamento', 'Mapeamento e padronização do processo']},
];
// planta genérica (gancho e pergunta)
const GEN: Node[] = [{l: 'ATENDIMENTO', x: -190, z: -150}, {l: 'COMERCIAL', x: 170, z: -150}, {l: 'FINANCEIRO', x: 170, z: 150}, {l: 'OPERAÇÃO', x: -190, z: 150}];
const GEN_FLOW: V3[] = [[-190, 0, -150], [170, 0, -150], [170, 0, 150], [-190, 0, 150], [-190, 0, -150]];
const GEN_G: V3 = [170, 0, 0]; // gargalo escondido entre COMERCIAL e FINANCEIRO

const caseTimes = (k: Caso['key']) => ({t0: E(`${k}p` as SceneKey).t0, ts: E(`${k}s` as SceneKey).t0, t1: E(`${k}s` as SceneKey).t1});

// ── bloco de aço com rótulo
const Block: React.FC<{n: Node; c: Cam; o: number; draw: number; hatch?: number; sol?: number; key2: string; lift?: number}> = ({n, c, o, draw, hatch = 0, sol = 0, key2, lift = 0}) => {
  const w = n.w ?? 110, d = n.d ?? 90, h = (n.h ?? 70) * (0.15 + .85 * draw);
  const fs = faces(n.x - w / 2, n.x + w / 2, lift, lift + h, n.z - d / 2, n.z + d / 2).filter((f) => facing(f.n, c));
  const [lx, ly] = proj([n.x, lift + h, n.z - d / 2], c);
  const top = fs.find((f) => f.n[1] === 1);
  return <g opacity={o}>
    {fs.map((f, j) => <polygon key={key2 + j} points={pts(f.f, c)} fill={f.n[1] === 1 && sol > 0 ? `rgba(58,110,165,${(.35 + .5 * sol).toFixed(2)})` : TONES[f.tone]}
      stroke={sol > .5 ? 'rgba(120,170,220,.9)' : 'rgba(192,198,204,.75)'} strokeWidth="1.6" strokeLinejoin="round" />)}
    {hatch > 0 && top ? <polygon points={pts(top.f, c)} fill="url(#hatch)" opacity={hatch} /> : null}
    <text x={lx} y={ly - 16} textAnchor="middle" fontFamily="Manrope" fontWeight={700} fontSize="19" letterSpacing="2.4" fill={sol > .5 ? '#DCE8F5' : C.silver} opacity={clamp(draw * 1.5 - .3)}>{n.l}</text>
  </g>;
};

// ── fluxo entre nós, com itens (tokens) que fazem fila no gargalo (problema) ou correm (solução)
const Flow: React.FC<{path: V3[]; c: Cam; t: number; t0: number; draw: number; o: number; stopAt?: number; solved: number; key2: string; dashedFrom?: number; n?: number}> = ({path, c, t, t0, draw, o, stopAt, solved, key2, dashedFrom, n = 14}) => {
  const L = segLen(path); const els: React.ReactNode[] = [];
  const P2 = (a: V3[]) => 'M' + a.map((p) => proj(p, c).map((v) => v.toFixed(1)).join(' ')).join(' L');
  // trecho até o gargalo: sólido; depois: tracejado e apagado (problema)
  const cut = dashedFrom ?? L;
  const sub = (a0: number, a1: number) => { const r: V3[] = [along(path, a0)]; let acc = 0;
    for (let i = 1; i < path.length; i++) { acc += Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2]); if (acc > a0 && acc < a1) r.push(path[i]); }
    r.push(along(path, a1)); return r; };
  const col = solved > .5 ? A : 'rgba(192,198,204,.85)';
  els.push(<path key={key2 + 'a'} d={P2(sub(0, cut))} fill="none" stroke={col} strokeWidth={4 + 2 * solved} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />);
  if (cut < L) els.push(<path key={key2 + 'b'} d={P2(sub(cut, L))} fill="none" stroke={solved > .5 ? A : 'rgba(192,198,204,.35)'} strokeWidth={solved > .5 ? 6 : 2.5} strokeDasharray={solved > .5 ? undefined : '8 10'} strokeLinejoin="round" opacity={draw} />);
  // tokens
  if (draw >= 1) {
    for (let i = 0; i < n; i++) {
      const ts = t0 + .2 + i * .42; if (t < ts) break;
      const v = 150; let d: number;
      if (solved > .5) d = ((t - ts) * v * 1.5 + i * 37) % L;
      else d = Math.min((t - ts) * v, (stopAt ?? L) - 26 - i * 24);
      if (d < 0) continue;
      const [x, y] = proj(along(path, d), c);
      els.push(<rect key={key2 + 'k' + i} x={x - 9} y={y - 9 - 6} width="18" height="18" rx="3" transform={`rotate(45 ${x} ${y - 6})`} fill={solved > .5 ? '#fff' : '#C0C6CC'} stroke={solved > .5 ? A : '#0A0B0C'} strokeWidth="2.5" />);
    }
  }
  return <g opacity={o}>{els}</g>;
};

// ── maquete de um caso
// câmera do caso: centraliza a maquete (extremos dos blocos) no quadro e ajusta a escala para caber com margem
const fitCam = (nodes: Node[], th: number, ph: number, maxW = 900, maxS = 1.6, cyMid = 1000): Cam => {
  const c0: Cam = {th, ph, s: 1, cx: 0, cy: 0}; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  nodes.forEach((n) => { const w = (n.w ?? 110) / 2 + 10, d = (n.d ?? 90) / 2 + 10; [[-w, -d], [w, -d], [w, d], [-w, d]].forEach(([dx, dz]) => [0, (n.h ?? 70) + 40].forEach((y) => {
    const [px, py] = proj([n.x + dx, y, n.z + dz], c0); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); })); });
  const s = Math.min(maxS, maxW / (x1 - x0));
  return {th, ph, s, cx: 540 - s * (x0 + x1) / 2, cy: cyMid - s * (y0 + y1) / 2};
};
const CASE_BY: Record<string, Caso> = {};
const caseCam = (t: number, t0: number, t1: number, key?: string): Cam => {
  const cs = key ? CASE_BY[key] : CASOS.find((c) => caseTimes(c.key).t0 === t0)!;
  return fitCam([...cs.nodes, ...cs.sol], lerp(-40, -28, clamp((t - t0) / (t1 - t0))), 40);
};
const Model: React.FC<{cs: Caso; t: number}> = ({cs, t}) => {
  const {t0, ts, t1} = caseTimes(cs.key);
  const inn = P(t, t0 - .25, .7, EASE_OUT), out = P(t, t1 - .3, .45, EASE_IN);
  if (inn <= 0 || out >= 1) return null;
  const c0 = caseCam(t, t0, t1); const c: Cam = {...c0, cx: c0.cx + (1 - inn) * 260 - out * 260};
  const solved = P(t, ts + .1, .5, EASE_IO);
  const nodes = cs.nodes; const path: V3[] = nodes.map((n) => [n.x, 0, n.z]);
  if (cs.back) path.push([nodes[0].x, 0, nodes[0].z]);
  const gPt: V3 = [nodes[cs.g].x, 0, nodes[cs.g].z];
  let acc = 0, gD = 0; for (let i = 1; i < path.length; i++) { acc += Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2]); if (i === cs.g) gD = acc; }
  const draw = (k: number) => P(t, t0 - .15 + k * .12, .6, EASE_IO);
  const els: React.ReactNode[] = [];
  // chão
  for (let i = -4; i <= 4; i++) {
    els.push(<path key={'gx' + i} d={'M' + [[i * 80, 0, -300], [i * 80, 0, 300]].map((p) => proj(p as V3, c).join(' ')).join(' L')} stroke="rgba(192,198,204,.08)" strokeWidth="1" />);
    els.push(<path key={'gz' + i} d={'M' + [[-360, 0, i * 70], [360, 0, i * 70]].map((p) => proj(p as V3, c).join(' ')).join(' L')} stroke="rgba(192,198,204,.08)" strokeWidth="1" />);
  }
  els.push(<Flow key="fl" key2="fl" path={path} c={c} t={t} t0={t0} draw={draw(1)} o={1} stopAt={gD} solved={solved} dashedFrom={gD} />);
  // blocos: os de problema somem e os da solução sobem no lugar do gargalo
  const order = nodes.map((n, i) => ({n, i})).sort((a, b) => (a.n.x + a.n.z) - (b.n.x + b.n.z));
  order.forEach(({n, i}) => {
    const isG = i === cs.g, replaced = cs.sol.some((s) => Math.abs(s.x - n.x) < 1 && Math.abs(s.z - n.z) < 1);
    const o = isG ? 1 - solved : replaced ? 1 - solved : 1;
    if (o > 0) els.push(<Block key={'b' + i} key2={'b' + i} n={n} c={c} o={o} draw={draw(i)} hatch={isG ? P(t, t0 + .5, .4) : 0} />);
  });
  cs.sol.forEach((n, i) => { const p = P(t, ts + .15 + i * .18, .55, BACK); if (p > 0) els.push(<Block key={'s' + i} key2={'s' + i} n={n} c={c} o={clamp(p * 2)} draw={p} sol={solved} />); });
  // rótulo do gargalo
  const gl = P(t, t0 + .6, .4) * (1 - solved);
  const [gx, gy] = proj([gPt[0], 0, gPt[2] + 70], c);
  els.push(<g key="gl" opacity={gl}><rect x={gx - 120} y={gy + 6} width="240" height="38" rx="4" fill="#0A0B0C" stroke={C.silver} strokeWidth="1.5" />
    <text x={gx} y={gy + 32} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="18" letterSpacing="2.4" fill={C.ink}>{cs.gl}</text></g>);
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: (1 - out)}}>
    <defs><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#1B1E22" /><line x1="0" y1="0" x2="0" y2="10" stroke="#C0C6CC" strokeWidth="3" /></pattern></defs>
    {els}</svg>;
};

// ── planta genérica (gancho e pergunta): 4 setores, marcador procurando
const genCam = (t: number): Cam => fitCam(GEN, -35 + 8 * Math.sin(t * .35), 36, 860, 1.5);
const Generic: React.FC<{t: number; o: number; t0: number; found: number}> = ({t, o, t0, found}) => {
  // os itens já estão parados na fila desde o quadro 0: o gargalo existe, só não foi encontrado
  if (o <= 0) return null;
  const c = genCam(t); const draw = (k: number) => P(t, t0 - .6 + k * .1, .6, EASE_IO);
  const gD = 360 + 150; // distância até o gargalo (meio do lado direito)
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
    <defs><pattern id="hatch2" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#1B1E22" /><line x1="0" y1="0" x2="0" y2="10" stroke="#C0C6CC" strokeWidth="3" /></pattern></defs>
    {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => <g key={i}>
      <path d={'M' + [[i * 80, 0, -300], [i * 80, 0, 300]].map((p) => proj(p as V3, c).join(' ')).join(' L')} stroke="rgba(192,198,204,.08)" />
      <path d={'M' + [[-380, 0, i * 70], [380, 0, i * 70]].map((p) => proj(p as V3, c).join(' ')).join(' L')} stroke="rgba(192,198,204,.08)" /></g>)}
    <Flow key2="gf" path={GEN_FLOW} c={c} t={t} t0={t0 - 8} draw={t0 <= 0 ? 1 : draw(1)} o={1} stopAt={gD} solved={0} dashedFrom={gD + 20} n={12} />
    {found > 0 ? (() => { const [x, y] = proj(GEN_G, c); return <g opacity={found}><ellipse cx={x} cy={y} rx="46" ry="24" fill="url(#hatch2)" stroke={C.silver} strokeWidth="2" /></g>; })() : null}
    {GEN.map((n, i) => <Block key={i} key2={'g' + i} n={n} c={c} o={1} draw={draw(i)} />)}
  </svg>;
};

// ── marcador (fio condutor): posição em tela por chaves de tempo
const markerAt = (t: number, tc: number): {x: number; y: number; lock: number; ok: number; r: number} => {
  const gc = genCam(tc);
  const genPt = (p: V3) => proj(p, gc);
  const keys: number[][] = [];
  // gancho: varre os 4 setores
  GEN.forEach((n, i) => { const [x, y] = genPt([n.x, 70, n.z]); keys.push([.2 + i * .75, x, y]); });
  const [gx, gy] = genPt(GEN_G); keys.push([T.quase - .2, gx, gy]); keys.push([E('processo').t1 - .3, gx, gy]);
  CASOS.forEach((cs) => { const {t0, ts, t1} = caseTimes(cs.key); const n = cs.nodes[cs.g];
    const cA = caseCam(t0 + .6, t0, t1), cB = caseCam(t1 - .4, t0, t1);
    const a = proj([n.x, 0, n.z], cA), b = proj([n.x, 0, n.z], cB);
    keys.push([t0 + .6, a[0], a[1]]); keys.push([t1 - .4, b[0], b[1]]); void ts; });
  const [x, y] = keyed(t, keys);
  // trava: perto do alvo (gargalo) em cada caso; ok = resolvido
  let lock = P(t, T.quase - .2, .3) * (1 - P(t, E('processo').t1 - .3, .3)), ok = 0;
  CASOS.forEach((cs) => { const {t0, ts, t1} = caseTimes(cs.key); lock = Math.max(lock, P(t, t0 + .6, .3) * (1 - P(t, t1 - .4, .25))); ok = Math.max(ok, P(t, ts + .2, .4) * (1 - P(t, t1 - .4, .25))); });
  return {x, y, lock, ok, r: 52 - 14 * lock};
};
const Marker: React.FC<{t: number; o: number; tc: number}> = ({t, o, tc}) => {
  if (o <= 0) return null;
  const m = markerAt(t, tc); const col = m.ok > .5 ? A : C.ink; const rot = t * 40 * (1 - m.lock);
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
    <g transform={`translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
      <circle r={m.r} fill="none" stroke={col} strokeWidth="3" strokeDasharray={m.lock > .5 ? undefined : '14 10'} />
      {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-(m.r + 8)} x2={0} y2={-(m.r + 22)} stroke={col} strokeWidth="3" transform={`rotate(${a})`} />)}
      <circle r="5" fill={col} />
      {m.ok > 0 ? <path d="M-14 0 L-4 10 L16 -12" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity={m.ok} transform={`rotate(${-rot})`} /> : null}
    </g></svg>;
};

// ── tipografia
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size?: number; top?: number; left?: number; width?: number; align?: 'left' | 'center'; color?: string}> = ({t, tin, tout, segs, size = 76, top = 360, left = 90, width = 900, align = 'left', color = C.ink}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: '-.025em', color,
    opacity: 1 - q, transform: `translateY(${(-30 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, acc], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? A : undefined, opacity: p, transform: `translateY(${((1 - p) * 30).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};
const Tag: React.FC<{t: number; tin: number; tout: number; text: string; top?: number}> = ({t, tin, tout, text, top = 290}) => {
  const a = P(t, tin, .35) * (1 - P(t, tout, .3)); if (a <= 0) return null;
  return <div style={{position: 'absolute', left: 90, top, display: 'flex', alignItems: 'center', gap: 14, opacity: a, fontFamily: UI, fontWeight: 800, fontSize: 26, letterSpacing: '.22em', color: A}}>
    <span style={{width: 34, height: 3, background: A, transform: `scaleX(${a})`, transformOrigin: 'left'}} />{text}</div>;
};
// verbos que acendem na palavra falada
const Verbs: React.FC<{t: number; items: Array<[string, number]>; tout: number; top: number}> = ({t, items, tout, top}) => {
  const o = P(t, items[0][1] - .3, .3) * (1 - P(t, tout, .3)); if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 90, width: 900, top, display: 'flex', flexWrap: 'wrap', gap: 14, opacity: o}}>
    {items.map(([w, ta]) => { const on = P(t, ta - .05, .25), a = P(t, ta - .2, .3, BACK);
      return <span key={w} style={{fontFamily: UI, fontWeight: 700, fontSize: 30, padding: '10px 20px', borderRadius: 8, border: `2px solid ${on > .5 ? A : 'rgba(192,198,204,.35)'}`,
        background: on > .5 ? 'rgba(58,110,165,.22)' : 'transparent', color: on > .5 ? C.ink : 'rgba(192,198,204,.5)', transform: `scale(${(.9 + .1 * a).toFixed(3)})`, opacity: clamp(a * 1.5)}}>{w}</span>; })}
  </div>;
};

// ── ficha do caso (rodapé): GARGALO e SOLUÇÃO
const Ficha: React.FC<{t: number; cs: Caso}> = ({t, cs}) => {
  const {t0, ts, t1} = caseTimes(cs.key);
  const a = P(t, t0 + .4, .45, EASE_OUT) * (1 - P(t, t1 - .3, .3, EASE_IN)); if (a <= 0) return null;
  const s = P(t, ts + .1, .45, EASE_OUT);
  const row = (k: string, v: string, on: number, blue: boolean) => <div style={{display: 'flex', gap: 22, alignItems: 'baseline', padding: '14px 0', borderTop: '1px solid rgba(192,198,204,.22)', opacity: on, transform: `translateY(${((1 - on) * 14).toFixed(1)}px)`}}>
    <span style={{width: 150, flex: 'none', fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: '.2em', color: blue ? A : C.silver}}>{k}</span>
    <span style={{fontFamily: UI, fontWeight: 700, fontSize: 28, lineHeight: 1.25, color: blue ? C.ink : 'rgba(242,244,246,.85)'}}>{v}</span></div>;
  return <div style={{position: 'absolute', left: 90, width: 860, top: 1340, opacity: a, transform: `translateY(${((1 - a) * 30).toFixed(1)}px)`}}>
    {row('GARGALO', cs.ficha[0], 1, false)}
    {row('SOLUÇÃO', cs.ficha[1], s, true)}
    <div style={{borderTop: '1px solid rgba(192,198,204,.22)', paddingTop: 10, fontFamily: UI, fontWeight: 600, fontSize: 20, letterSpacing: '.14em', color: 'rgba(192,198,204,.6)'}}>CENÁRIO ILUSTRATIVO</div>
  </div>;
};

// ── método: 4 casos resumidos e 3 placas de aço
const Metodo: React.FC<{t: number}> = ({t}) => {
  const m = E('metodo'); const a = P(t, m.t0 - .1, .4) * (1 - P(t, m.t1 - .3, .3)); if (a <= 0) return null;
  const mini = P(t, T.cada - .1, .5) * (1 - P(t, T.porisso - .2, .4));
  const plates: Array<[string, string, number]> = [['01', 'ENTENDER', T.ent], ['02', 'PLANEJAR', T.plan], ['03', 'DESENVOLVER', T.des]];
  const line = P(t, T.ent - .1, T.des - T.ent + .6, EASE_IO);
  return <AbsoluteFill style={{opacity: a}}>
    {/* 4 casos: cada um com o gargalo em um ponto diferente */}
    <div style={{position: 'absolute', left: 90, top: 760, width: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, opacity: mini}}>
      {CASOS.map((cs, i) => { const p = P(t, T.cada + i * .15, .4, BACK); const pos = [[.3, .7], [.75, .35], [.55, .55], [.25, .3]][i];
        return <div key={cs.key} style={{height: 250, borderRadius: 10, border: '1.5px solid rgba(192,198,204,.4)', background: 'rgba(28,31,34,.8)', position: 'relative', opacity: clamp(p * 2), transform: `scale(${(.9 + .1 * p).toFixed(3)})`}}>
          <div style={{position: 'absolute', left: 20, top: 16, fontFamily: UI, fontWeight: 800, fontSize: 20, letterSpacing: '.16em', color: C.silver}}>{cs.tag.split(' · ')[1]}</div>
          <svg width="420" height="250" style={{position: 'absolute', inset: 0}}>
            <path d="M40 200 L150 120 L260 170 L380 90" fill="none" stroke="rgba(192,198,204,.5)" strokeWidth="3" strokeDasharray="8 8" />
            <g transform={`translate(${40 + pos[0] * 340} ${90 + pos[1] * 110})`}><circle r="22" fill="none" stroke={A} strokeWidth="3" /><circle r="4" fill={A} /></g>
          </svg></div>; })}
    </div>
    {/* 3 placas */}
    {plates.map(([n, w, ta], i) => { const p = P(t, ta - .15, .5, BACK), on = P(t, ta - .05, .25);
      return <div key={w} style={{position: 'absolute', left: 140, top: 760 + i * 210, width: 800, height: 160, borderRadius: 12, opacity: clamp(p * 2) * (1 - mini * 0),
        transform: `perspective(1200px) rotateX(${((1 - p) * 40).toFixed(1)}deg) translateY(${((1 - p) * 40).toFixed(1)}px)`,
        background: on > .5 ? 'linear-gradient(135deg, #2D5584 0%, #3A6EA5 45%, #264B71 100%)' : 'repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, rgba(0,0,0,.05) 1px 3px), linear-gradient(135deg, #2A2E33 0%, #4A5057 38%, #2B3035 64%, #3B4147 100%)',
        border: '1.5px solid rgba(192,198,204,.5)', boxShadow: '0 24px 40px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', gap: 34, paddingLeft: 44}}>
        <span style={{fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: '.1em', color: 'rgba(242,244,246,.7)'}}>{n}</span>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 64, letterSpacing: '-.01em', color: C.ink}}>{w}</span></div>; })}
    {line > 0 ? <div style={{position: 'absolute', left: 104, top: 790, width: 6, height: 520 * line, background: A, borderRadius: 3}} /> : null}
    {(() => { const s = P(t, T.sob - .1, .4, BACK); return s > 0 ? <div style={{position: 'absolute', left: 140, top: 1420, fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: '.22em', color: A, opacity: s}}>SOB MEDIDA</div> : null; })()}
  </AbsoluteFill>;
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

// ── prancha: grade, cantos, cabeçalho do relatório
const header = (t: number): [string, string] => {
  for (const cs of CASOS) { const {t0, t1} = caseTimes(cs.key); if (t >= t0 - .2 && t < t1) return [cs.tag.split(' · ')[0], 'CENÁRIO ILUSTRATIVO']; }
  if (t >= E('metodo').t0 - .2 && t < E('pergunta').t0) return ['MÉTODO', 'DME'];
  return ['VISÃO GERAL', 'PLANTA DA OPERAÇÃO'];
};
const Sheet: React.FC<{t: number}> = ({t}) => {
  const [h1, h2] = header(t); const stepIdx = CASOS.findIndex((cs) => { const {t0, t1} = caseTimes(cs.key); return t >= t0 - .2 && t < t1; });
  return <>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.045) 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.08) 1px, transparent 1px)', backgroundSize: '120px 120px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 55%, rgba(10,11,12,0) 0%, rgba(10,11,12,.7) 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {[[54, 230, 1, 1], [1026, 230, -1, 1], [1026, 1640, -1, -1], [54, 1640, 1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M${x} ${y + 36 * sy} L${x} ${y} L${x + 36 * sx} ${y}`} fill="none" stroke={C.silver} strokeWidth="2" opacity=".7" />)}
    </svg>
    <div style={{position: 'absolute', left: 90, right: 90, top: 248, display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 700, fontSize: 19, letterSpacing: '.24em', color: 'rgba(192,198,204,.6)'}}>
      <span>RELATÓRIO · {h1}</span><span>{h2}</span></div>
    {/* progresso dos casos */}
    <div style={{position: 'absolute', left: 90, top: 1610, display: 'flex', gap: 10}}>
      {CASOS.map((cs, i) => <span key={cs.key} style={{width: 60, height: 5, borderRadius: 3, background: i === stepIdx ? A : i < stepIdx || t > E('c4s').t1 ? 'rgba(58,110,165,.55)' : 'rgba(192,198,204,.2)'}} />)}
    </div>
  </>;
};

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const g = E('gancho'), pr = E('processo'), pg = E('pergunta');
  const genA = (1 - P(t, pr.t1 - .35, .45, EASE_IN)) + (t >= pg.t0 - .5 ? P(t, pg.t0 - .4, .5) * (1 - P(t, E('assinatura').t0 - .1, .5)) : 0);
  const found = P(t, T.quase - .1, .4) * (t < pg.t0 - .5 ? 1 : 0);
  const markerO = clamp(1 - P(t, E('c4s').t1 - .3, .3)) + (t >= pg.t0 ? P(t, pg.t0, .4) * (1 - P(t, E('assinatura').t0 - .1, .4)) : 0);
  const sig = P(t, T.sig - .15, .6, EASE_IO);
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 55%, rgba(38,75,113,.30) 0%, rgba(38,75,113,0) 70%)'}} />
      <Sheet t={t} />
      <Generic t={t} o={genA} t0={t < pg.t0 - .5 ? 0 : pg.t0} found={found} />
      {CASOS.map((cs) => <Model key={cs.key} cs={cs} t={t} />)}
      {t < pg.t0 ? <Marker t={t} tc={t} o={markerO} /> : <Marker t={Math.min(t - pg.t0, T.quase - .6)} tc={t} o={markerO} />}
      {CASOS.map((cs) => <Ficha key={'f' + cs.key} t={t} cs={cs} />)}
      <Metodo t={t} />

      {/* ── textos */}
      <Phrase t={t} tin={-1} tout={g.t1 - .25} segs={['O ', ['gargalo'], ' quase', '|', 'nunca está onde', '|', 'a empresa procura.']} size={82} top={330} />
      <Phrase t={t} tin={T.parece - .05} tout={pr.t1 - .3} segs={['Parece falta', '|', 'de gente.']} size={80} top={330} />
      <Phrase t={t} tin={T.quase - .05} tout={pr.t1 - .3} segs={['Quase sempre', '|', 'é ', ['processo.']]} size={80} top={520} />

      <Tag t={t} tin={E('c1p').t0} tout={E('c1s').t1 - .3} text="CASO 01 · CLÍNICA" />
      <Phrase t={t} tin={E('c1p').t0 + .15} tout={E('c1p').t1 - .2} segs={['O paciente liga', '|', 'às 19h.']} size={80} top={350} />
      <Phrase t={t} tin={T.c1ning - .05} tout={E('c1p').t1 - .2} segs={[['Ninguém atende.']]} size={80} top={540} />
      <Phrase t={t} tin={T.c1agente - .3} tout={E('c1s').t1 - .3} segs={['Agente de voz', '|', ['com IA']]} size={80} top={350} />
      <Verbs t={t} tout={E('c1s').t1 - .3} top={560} items={[['atende', T.c1v[0]], ['qualifica', T.c1v[1]], ['registra no CRM', T.c1v[2]], ['passa para a equipe', T.c1v[3]]]} />

      <Tag t={t} tin={E('c2p').t0} tout={E('c2s').t1 - .3} text="CASO 02 · SERVIÇOS B2B" />
      <Phrase t={t} tin={E('c2p').t0 + .15} tout={E('c2p').t1 - .2} segs={['O retorno da proposta', '|', 'depende da', '|', ['memória de alguém.']]} size={72} top={350} />
      <Phrase t={t} tin={T.c2crm - .3} tout={E('c2s').t1 - .3} segs={['CRM personalizado', '|', 'com ', ['retornos'], '|', ['automáticos.']]} size={76} top={350} />

      <Tag t={t} tin={E('c3p').t0} tout={E('c3s').t1 - .3} text="CASO 03 · DISTRIBUIDORA" />
      <Phrase t={t} tin={E('c3p').t0 + .15} tout={E('c3p').t1 - .2} segs={['O mesmo pedido,', '|', 'digitado em', '|', ['dois sistemas.']]} size={76} top={350} />
      <Phrase t={t} tin={T.c3int - .3} tout={E('c3s').t1 - .3} segs={[['Integração'], '|', 'de sistemas.']} size={84} top={350} />

      <Tag t={t} tin={E('c4p').t0} tout={E('c4s').t1 - .3} text="CASO 04 · CONSTRUTORA" />
      <Phrase t={t} tin={E('c4p').t0 + .15} tout={E('c4p').t1 - .2} segs={['Só ', ['uma pessoa'], '|', 'sabe montar', '|', 'o orçamento.']} size={76} top={350} />
      <Phrase t={t} tin={T.c4map - .3} tout={E('c4s').t1 - .3} segs={[['Mapeamento'], ' e', '|', ['padronização'], '|', 'do processo.']} size={76} top={350} />

      <Phrase t={t} tin={T.cada - .05} tout={T.porisso - .3} segs={['Cada empresa trava', '|', 'num ', ['ponto diferente.']]} size={72} top={350} />
      <Phrase t={t} tin={T.porisso - .05} tout={E('metodo').t1 - .3} segs={['Por isso, a ', ['DME'], '|', 'entende, planeja', '|', 'e desenvolve.']} size={72} top={350} />

      <Phrase t={t} tin={T.onde - .1} tout={pg.t1 - .2} segs={['Onde a ', ['sua'], '|', 'operação trava?']} size={88} top={360} />

      {/* ── assinatura */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 45%, rgba(38,75,113,.55) 0%, rgba(10,11,12,.9) 80%)'}} />
        <Logo t={t} t0={T.sig + .05} w={560} x={540 - 280} y={520} />
        <Phrase t={t} tin={T.sig + .6} tout={99} segs={['Automatizamos processos.']} size={52} top={1060} left={90} width={900} align="center" color={C.silver} />
        <Phrase t={t} tin={T.sig + .8} tout={99} segs={['Devolvemos tempo.']} size={52} top={1126} left={90} width={900} align="center" color={C.silver} />
        <Phrase t={t} tin={T.envie - .1} tout={99} segs={['Envie ', ['COMERCIAL'], '|', 'no direct.']} size={76} top={1270} left={90} width={900} align="center" />
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
