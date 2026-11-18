// "1 CONTRA 10.000" · vídeo-teste de retenção no formato "batalha de multidão" (9:16, 62 s).
// Original: arena, unidades, portais e chefão são desenhados em código (canvas), sem arte, nome ou personagens de terceiros.
// A simulação é determinística: tudo sai de src/data/plano.json (frente da batalha, contagens, portais e eventos).
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import P from './data/plano.json';
import {HEAD, loadFonts} from './theme/typography';

type KF = Array<[number, number]>;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const p = (t: number, a: number, d: number) => clamp((t - a) / d);
const kf = (k: KF, t: number) => { if (t <= k[0][0]) return k[0][1]; for (let i = 0; i < k.length - 1; i++) { const [a, va] = k[i], [b, vb] = k[i + 1]; if (t < b) return va + (vb - va) * sm((t - a) / (b - a)); } return k[k.length - 1][1]; };
const kfLog = (k: KF, t: number) => Math.round(Math.exp(kf(k.map(([a, v]) => [a, Math.log(v + 1)]) as KF, t)) - 1);
const hash = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const fmt = (n: number) => Math.max(0, Math.round(n)).toLocaleString('pt-BR');
const E = P.eventos;
const DUR = P.dur, FPS = 30;

// ── estrada em S (Catmull-Rom), amostrada por comprimento de arco
const CTRL: Array<[number, number]> = [[540, 240], [300, 400], [250, 620], [760, 830], [830, 1050], [320, 1230], [290, 1430], [540, 1640]];
const PATH = (() => {
  const pts: Array<[number, number]> = [];
  const c = [CTRL[0], ...CTRL, CTRL[CTRL.length - 1]];
  for (let i = 1; i < c.length - 2; i++) for (let k = 0; k < 60; k++) {
    const u = k / 60, [p0, p1, p2, p3] = [c[i - 1], c[i], c[i + 1], c[i + 2]];
    const f = (a: number, b: number, cc: number, d: number) => .5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u * u + (-a + 3 * b - 3 * cc + d) * u * u * u);
    pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  pts.push(CTRL[CTRL.length - 1]);
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return {pts, L, len: L[L.length - 1]};
})();
const at = (s: number) => { // s em px ao longo da estrada → x, y e normal
  s = clamp(s, 0, PATH.len); let lo = 0, hi = PATH.L.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (PATH.L[m] < s) lo = m; else hi = m; }
  const k = (s - PATH.L[lo]) / Math.max(1e-6, PATH.L[hi] - PATH.L[lo]); const a = PATH.pts[lo], b = PATH.pts[hi];
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
  return {x: a[0] + dx * k, y: a[1] + dy * k, nx: -dy / d, ny: dx / d};
};

// ── estado da batalha no tempo t
const estado = (t: number) => {
  const tt = Math.min(t, E.derrota);
  const m = kf(P.front as KF, tt), B = kfLog(P.azul as KF, tt), R = kfLog(P.vermelho as KF, tt);
  const portais = P.portais.map((g) => ({...g, on: t >= g.t0 && m < g.s, k: eo(p(t, g.t0, .35)), quebra: m >= g.s}));
  const chefe = t >= E.chefe && t < E.derrota + .1;
  const chefeS = t < E.chefeDesce[0] ? mix(-0.05, kf(P.front as KF, E.chefeDesce[0]) - .03, eo(p(t, E.chefe, E.chefeDesce[0] - E.chefe))) : m - .03;
  const chefeHP = kf([[E.chefe, 50000], [E.chefeDesce[0], 50000], [E.chefeDesce[1], 2600]], t);
  return {m, B, R, portais, chefe, chefeS, chefeHP};
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ── desenho (canvas)
const C = {chao: '#1A2633', chao2: '#22313F', borda: '#0F1720', estrada: '#E3D2A6', estrada2: '#CDB98A', ver: '#E5383B', verE: '#9E1F22', azul: '#2F7BFF', azulE: '#1B4FB0', ouro: '#F2B705', branco: '#FFFFFF'};
const desenha = (ctx: CanvasRenderingContext2D, t: number) => {
  const S = estado(t); const LEN = PATH.len, mL = S.m * LEN;
  ctx.save();
  ctx.fillStyle = C.chao; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 26; i++) { ctx.fillStyle = i % 2 ? C.chao : C.chao2; ctx.fillRect(0, i * 80 - ((t * 6) % 80), 1080, 40); }
  // câmera: zoom e tremor por evento
  let z = 1, cx = 540, cy = 960, sh = 0;
  if (t < E.hook[1] + .5) { z = mix(1.12, 1, eo(p(t, 0, E.hook[1] + .5))); }
  const zoomEv = (t0: number, d: number, zz: number, x: number, y: number) => { const k = Math.sin(Math.PI * clamp((t - t0) / d)); if (k > 0) { z = mix(z, zz, k); cx = mix(cx, x, k); cy = mix(cy, y, k); } };
  const g5 = at(P.portais[4].s * LEN); zoomEv(E.ouro - .2, 2.6, 1.25, g5.x, g5.y);
  zoomEv(E.chefe, 2.2, 1.3, 540, 420);
  if (t >= E.ultimo) { const k = eo(p(t, E.ultimo, .8)); z = mix(z, 1.7, k); cx = mix(cx, 540, k); cy = mix(cy, 1560, k); }
  if (t >= E.chefeDesce[0] && t < E.derrota) { const ph = ((t - E.chefeDesce[0]) % 1.2) / 1.2; sh = ph < .12 ? (1 - ph / .12) * 14 : 0; }
  for (const g of S.portais) if (g.quebra) { const tb = P.portais.indexOf(P.portais.find((x) => x.s === g.s)!); void tb; }
  ctx.translate(540 + Math.sin(t * 90) * sh, 960 + Math.cos(t * 77) * sh); ctx.scale(z, z); ctx.translate(-cx, -cy);
  // estrada
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const trace = () => { ctx.beginPath(); PATH.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
  trace(); ctx.strokeStyle = C.borda; ctx.lineWidth = 214; ctx.stroke();
  trace(); ctx.strokeStyle = C.estrada2; ctx.lineWidth = 192; ctx.stroke();
  trace(); ctx.strokeStyle = C.estrada; ctx.lineWidth = 176; ctx.stroke();
  // portal vermelho (topo) e castelo azul (base)
  ctx.fillStyle = '#2A0E10'; ctx.beginPath(); ctx.ellipse(540, 210, 140, 70, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.verE; ctx.fillRect(400, 130, 280, 40); ctx.fillStyle = C.ver; ctx.fillRect(400, 130, 280, 14);
  const cast = (x: number, y: number, w: number, h: number) => { ctx.fillStyle = C.azulE; ctx.fillRect(x, y, w, h); ctx.fillStyle = C.azul; ctx.fillRect(x, y, w, 16); for (let i = 0; i < w; i += 28) ctx.fillRect(x + i, y - 14, 16, 14); };
  cast(360, 1660, 360, 120); cast(330, 1600, 80, 180); cast(670, 1600, 80, 180);
  // vermelhos (descem); densidade cresce com o tamanho do exército
  const dV = clamp(Math.log10(S.R + 1) / 4.45, .05, 1);
  for (let k = 0; k < 4200; k++) {
    if (hash(k * 3.1) > dV) continue;
    const s = (k * .62 + t * 150) % (LEN * 1.0); if (s > mL || mL < 8) continue;
    const o = (hash(k) - .5) * 158, w = Math.sin(t * 9 + k) * 1.5, q = at(s);
    const x = q.x + q.nx * o + w, y = q.y + q.ny * o;
    ctx.fillStyle = C.verE; ctx.fillRect(x - 5, y - 2, 10, 8); ctx.fillStyle = C.ver; ctx.fillRect(x - 5, y - 6, 10, 7);
  }
  // azuis (sobem a partir do canhão); cada portal multiplica a densidade acima dele
  const gAll = S.portais.filter((g) => g.on).reduce((a, g) => a * g.mult, 1);
  const dTop = S.B <= 0 ? 0 : clamp(Math.log10(S.B + 1) / 4.5, .015, 1);
  if (S.B > 0 && t > E.hook[1]) for (let k = 0; k < 4200; k++) {
    const s = LEN * .965 - ((k * .62 + t * 175) % (LEN * .965)); if (s < mL) continue;
    const gs = S.portais.filter((g) => g.on && g.s * LEN > s).reduce((a, g) => a * g.mult, 1);
    if (hash(k * 7.7) > dTop * gs / gAll) continue;
    const o = (hash(k * 1.7) - .5) * 158, w = Math.sin(t * 8 + k) * 1.5, q = at(s);
    const x = q.x + q.nx * o + w, y = q.y + q.ny * o;
    ctx.fillStyle = C.azulE; ctx.fillRect(x - 5, y - 2, 10, 8); ctx.fillStyle = C.azul; ctx.fillRect(x - 5, y - 6, 10, 7);
  }
  // o "1" do começo: um soldado azul parado diante do castelo
  if (t < E.hook[1] + .6) { const q = at(LEN * .93); ctx.fillStyle = C.azulE; ctx.fillRect(q.x - 12, q.y - 4, 24, 18); ctx.fillStyle = C.azul; ctx.fillRect(q.x - 12, q.y - 16, 24, 16); ctx.fillStyle = '#fff'; ctx.fillRect(q.x - 6, q.y - 12, 4, 4); ctx.fillRect(q.x + 2, q.y - 12, 4, 4); }
  // portais (atravessam a estrada); quebram quando a frente passa por eles
  for (const g of S.portais) {
    if (t < g.t0) continue; const q = at(g.s * LEN); const ang = Math.atan2(q.ny, q.nx);
    if (g.quebra) { // destroços
      const tq = t; for (let i = 0; i < 10; i++) { ctx.fillStyle = g.ouro ? C.ouro : '#7FB2FF'; ctx.globalAlpha = .7; ctx.fillRect(q.x + (hash(i + g.s * 100) - .5) * 200, q.y + (hash(i * 2 + g.s * 50) - .5) * 60, 10, 10); } ctx.globalAlpha = 1; void tq; continue;
    }
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(ang); ctx.scale(g.k, g.k);
    ctx.fillStyle = g.ouro ? 'rgba(242,183,5,.35)' : 'rgba(47,123,255,.32)'; ctx.fillRect(-100, -10, 200, 20);
    ctx.fillStyle = g.ouro ? C.ouro : '#4F8CFF'; ctx.fillRect(-108, -18, 16, 36); ctx.fillRect(92, -18, 16, 36);
    ctx.restore();
    // placa do portal (sempre de pé)
    const bob = Math.sin(t * 4 + g.s * 20) * 3;
    ctx.save(); ctx.translate(q.x, q.y - 62 + bob); ctx.scale(g.k, g.k);
    ctx.fillStyle = g.ouro ? C.ouro : C.azul; ctx.fillRect(-70, -34, 140, 60); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-70, 18, 140, 8);
    ctx.fillStyle = g.ouro ? '#3A2A00' : C.branco; ctx.font = `800 44px ${HEAD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g.rot, 0, -4);
    ctx.restore();
  }
  // faíscas na frente da batalha
  if (S.B > 0 && t > E.hook[1] && S.m > .02) for (let i = 0; i < 46; i++) {
    const ph = (t * 3 + hash(i)) % 1, q = at(mL + (hash(i * 5) - .5) * 26), o = (hash(i * 9.1 + Math.floor(t * 3 + hash(i))) - .5) * 160;
    ctx.globalAlpha = 1 - ph; ctx.fillStyle = i % 3 ? '#FFF3C4' : C.branco; const r = 3 + (1 - ph) * 5;
    ctx.fillRect(q.x + q.nx * o - r / 2, q.y + q.ny * o - r / 2 - ph * 30, r, r);
  }
  ctx.globalAlpha = 1;
  // chefão
  if (S.chefe) {
    const q = at(Math.max(0, S.chefeS) * LEN), step = Math.abs(Math.sin(t * Math.PI / 1.2)) * -10;
    ctx.save(); ctx.translate(q.x, q.y + step);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 70, 90, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.verE; ctx.fillRect(-70, -40, 140, 110); ctx.fillStyle = C.ver; ctx.fillRect(-70, -70, 140, 50);
    ctx.fillStyle = '#2A0E10'; ctx.fillRect(-46, -56, 22, 14); ctx.fillRect(24, -56, 22, 14);
    ctx.fillStyle = '#F5F0E6'; ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(-96, -120); ctx.lineTo(-50, -70); ctx.fill(); ctx.beginPath(); ctx.moveTo(70, -70); ctx.lineTo(96, -120); ctx.lineTo(50, -70); ctx.fill();
    ctx.fillStyle = '#5A4636'; ctx.save(); ctx.rotate(Math.sin(t * Math.PI / 1.2) * .8 - .4); ctx.fillRect(70, -20, 22, 120); ctx.fillStyle = '#3A2E25'; ctx.fillRect(58, 90, 46, 46); ctx.restore();
    // barra de vida
    const hp = S.chefeHP / 50000; ctx.fillStyle = '#000'; ctx.fillRect(-90, -160, 180, 22); ctx.fillStyle = C.ver; ctx.fillRect(-88, -158, 176 * hp, 18);
    ctx.fillStyle = C.branco; ctx.font = `800 20px ${HEAD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(fmt(S.chefeHP), 0, -149);
    ctx.restore();
    // onda de choque a cada pisada
    if (t >= E.chefeDesce[0]) { const ph = ((t - E.chefeDesce[0]) % 1.2) / 1.2; if (ph < .45) { ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - ph / .45)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(q.x, q.y + 60, 40 + ph * 420, 14 + ph * 140, 0, 0, Math.PI * 2); ctx.stroke(); } }
  }
  // canhão azul, com recuo a cada disparo
  const qc = at(LEN * .975), rec = S.B > 0 && t > E.hook[1] && t < E.derrota ? ((t * 7) % 1) * 10 : 0;
  ctx.fillStyle = '#0E1B33'; ctx.beginPath(); ctx.arc(qc.x, qc.y + 10, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.azul; ctx.fillRect(qc.x - 22, qc.y - 58 + rec, 44, 70); ctx.fillStyle = C.azulE; ctx.fillRect(qc.x - 28, qc.y - 64 + rec, 56, 14);
  // vida do castelo no fim
  if (t >= E.alarme) {
    const hp = t < E.ultimo ? 3 : t < E.derrota - .25 ? 2 : t < E.derrota ? 1 : 0;
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < hp ? C.azul : '#3A3A3A'; ctx.fillRect(470 + i * 50, 1810, 40, 22); }
  }
  ctx.restore();
  // alarme: bordas vermelhas pulsando
  if (t >= E.alarme && t < E.derrota) { const a = .25 + .25 * Math.sin(t * 14); ctx.strokeStyle = `rgba(229,56,59,${a})`; ctx.lineWidth = 40; ctx.strokeRect(0, 0, 1080, 1920); }
  // derrota: cinza
  if (t >= E.derrota) { const k = eo(p(t, E.derrota, .4)); ctx.fillStyle = `rgba(30,30,30,${.72 * k})`; ctx.fillRect(0, 0, 1080, 1920); }
};

// ── sobreposições (texto)
const Txt: React.FC<{children: React.ReactNode; size: number; color?: string; top: number; o?: number; s?: number; rot?: number; stroke?: number}> = ({children, size, color = '#fff', top, o = 1, s = 1, rot = 0, stroke = 12}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.02, color, opacity: o, transform: `scale(${s}) rotate(${rot}deg)`, WebkitTextStroke: `${stroke}px #0B0F14`, paintOrder: 'stroke fill', textTransform: 'uppercase'}}>{children}</div>
);
const Banner: React.FC<{t: number; t0: number; d: number; children: React.ReactNode; color: string; top?: number}> = ({t, t0, d, children, color, top = 720}) => {
  if (t < t0 || t > t0 + d) return null; const k = eo(p(t, t0, .18)), out = 1 - p(t, t0 + d - .25, .25);
  return <Txt size={104} color={color} top={top} s={1.4 - .4 * k} o={k * out} rot={-3}>{children}</Txt>;
};
const Contadores: React.FC<{t: number}> = ({t}) => {
  if (t >= E.escolha) return null; const S = estado(t);
  const pill = (bg: string, label: string, n: number, side: 'left' | 'right') => (
    <div style={{position: 'absolute', top: 262, [side]: 90, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(11,15,20,.82)', borderRadius: 18, padding: '10px 22px 10px 14px', border: `4px solid ${bg}`}}>
      <div style={{width: 44, height: 44, borderRadius: 10, background: bg}} />
      <div style={{fontFamily: HEAD, fontWeight: 800, color: '#fff', lineHeight: 1}}><div style={{fontSize: 22, opacity: .75, letterSpacing: 2}}>{label}</div><div style={{fontSize: 62}}>{fmt(n)}</div></div>
    </div>
  );
  return <>{pill(C.ver, 'VERMELHO', S.R, 'left')}{pill(C.azul, 'AZUL', S.B, 'right')}</>;
};
// números que sobem dos portais quando o azul passa
const Ganhos: React.FC<{t: number}> = ({t}) => {
  const S = estado(t); if (t >= E.derrota) return null; const out: React.ReactNode[] = [];
  S.portais.forEach((g, gi) => {
    if (!g.on || t < g.t0 + .4) return; const q = at(g.s * PATH.len);
    for (let j = 0; j < 3; j++) { const ph = (t * 1.6 + j / 3 + gi * .17) % 1; out.push(<div key={`${gi}-${j}`} style={{position: 'absolute', left: q.x + 90 + j * 8, top: q.y - 40 - ph * 90, fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: g.ouro ? C.ouro : '#9CC2FF', opacity: 1 - ph, WebkitTextStroke: '6px #0B0F14', paintOrder: 'stroke fill'}}>{g.rot}</div>); }
  });
  return <>{out}</>;
};
const Escolha: React.FC<{t: number}> = ({t}) => {
  if (t < E.escolha) return null; const k = eo(p(t, E.escolha, .4)), cnt = clamp((t - (E.escolha + 1.2)) / 6), sec = Math.max(0, Math.ceil(6 - (t - (E.escolha + 1.2))));
  const porta = (lbl: string, cor: string, x: number, d: number) => { const kk = eo(p(t, E.escolha + .3 + d, .35)); return (
    <div style={{position: 'absolute', left: x, top: 820, width: 400, height: 420, transform: `scale(${kk}) rotate(${(x < 500 ? -2 : 2)}deg)`, background: cor, borderRadius: 28, border: '10px solid #0B0F14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 128, color: '#fff', WebkitTextStroke: '10px #0B0F14', paintOrder: 'stroke fill', boxShadow: '0 30px 0 rgba(0,0,0,.35)'}}>{lbl}</div>
  ); };
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(11,15,20,${.86 * k})`}}>
      <Txt size={64} top={330} o={k} color="#fff">Você tem <span style={{color: C.azul}}>100</span> soldados.</Txt>
      <Txt size={92} top={460} o={eo(p(t, E.escolha + .2, .3))} color={C.ouro} rot={-2}>Qual porta te salva?</Txt>
      {porta('×50', C.azul, 110, 0)}{porta('+5.000', C.ver, 570, .12)}
      <Txt size={54} top={1290} o={eo(p(t, E.escolha + 1.0, .3))}>Esquerda ou direita?</Txt>
      <Txt size={74} top={1380} color={C.ouro} o={eo(p(t, E.escolha + 1.2, .3))} rot={-2}>Comenta!</Txt>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={540} cy={1590} r={56} fill="none" stroke="#333" strokeWidth={12} />
        <circle cx={540} cy={1590} r={56} fill="none" stroke={C.ouro} strokeWidth={12} strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 * cnt} transform="rotate(-90 540 1590)" strokeLinecap="round" />
        <text x={540} y={1608} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={52} fill="#fff">{sec}</text>
      </svg>
    </div>
  );
};

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  loadFonts();
  const frame = useCurrentFrame(); const t = still ?? frame / FPS;
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (c) { const ctx = c.getContext('2d'); if (ctx) desenha(ctx, Math.min(t, E.escolha)); } }, [t]);
  const S = estado(t);
  return (
    <AbsoluteFill style={{backgroundColor: '#0B0F14'}}>
      <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', inset: 0}} />
      <Ganhos t={t} />
      <Contadores t={t} />
      {t < E.hook[1] + .4 && <Txt size={150} top={560} s={mix(1.25, 1, eo(p(t, 0, .25)))} o={1 - p(t, E.hook[1], .4)} rot={-3}>1 contra<br /><span style={{color: C.ver}}>10.000</span></Txt>}
      <Banner t={t} t0={E.onda2} d={2.4} color={C.ver}>Onda 2<br />+20.000</Banner>
      <Banner t={t} t0={E.ouro} d={2.4} color={C.ouro}>Porta<br />dourada ×20</Banner>
      <Banner t={t} t0={E.chefe} d={2.4} color={C.ver} top={800}>Chefão!</Banner>
      <Banner t={t} t0={E.alarme} d={2.2} color={C.ver} top={760}>Ele está<br />chegando!</Banner>
      {t >= E.ultimo && t < E.derrota && <Txt size={92} top={600} color="#fff" rot={-2} s={1 + .04 * Math.sin(t * 20)}>Último soldado<br /><span style={{color: C.azul}}>{fmt(S.B)}</span> × <span style={{color: C.ver}}>{fmt(S.R)}</span></Txt>}
      {t >= E.derrota && t < E.escolha && <><Txt size={150} top={700} color="#BDBDBD" s={mix(1.5, 1, eo(p(t, E.derrota, .3)))}>Derrota</Txt><Txt size={64} top={900} color={C.ver} o={eo(p(t, E.derrota + .6, .3))}>Faltou 1 soldado.</Txt></>}
      <Escolha t={t} />
      {audio && !still && <Audio src={staticFile('assets/audio/trilha.wav')} />}
    </AbsoluteFill>
  );
};
