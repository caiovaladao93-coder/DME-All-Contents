import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C, STEEL, STEEL_DARK} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, clamp, hash, keyed, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "Processos que fluem com tecnologia". Plano-sequência: a câmera segue um único PEDIDO (token de aço)
 * num mundo contínuo. Barreiras → labirinto → "Agora" (as paredes giram e viram trilhos) → método → fluxo → loop → logo.
 * Tudo é função do quadro (t = frame / 30). Tempos ancorados nas palavras reais da locução.
 */
// ── tempos (palavras reais)
const T = {
  para: wt('gancho', 'para'), esp: [wt('barreiras', 'Espera', 0), wt('barreiras', 'Espera', 1), wt('barreiras', 'Espera', 2)],
  prob: wt('caminho', 'problema'), eCam: wt('caminho', 'É'), silence0: S.caminho.v1 + .05,
  agora: wt('virada', 'Agora'), muda: wt('virada', 'caminho'),
  diag: wt('metodo', 'diagnóstico'), mapa: wt('metodo', 'mapeia'), padr: wt('metodo', 'padroniza'), auto: wt('metodo', 'automatiza'), integra: wt('metodo', 'Integra'),
  anda: wt('fluxo', 'E'), andar: wt('fluxo', 'andar'), monta: S.fluxo.v1 + .1,
  entao: wt('fecho', 'Então'), voce: wt('fecho', 'você'),
  loop: S.loop.t0, eFlui: wt('loop', 'E'), flui: wt('loop', 'flui'),
  sig: S.assinatura.t0, proc: wt('assinatura', 'Processos'), cta: wt('assinatura', 'Comente'),
};
const HOURS = ['09:00', '11:00', '15:00', '18:00'];
const HT = HOURS.map((_, i) => T.monta + .1 + i * .62);

// ── o pedido (posição no mundo)
const tokenY = (t: number): number => {
  if (t < T.para) return lerp(40, 610, EASE_IN(clamp(t / T.para)));
  if (t < T.para + .5) return 610 - 46 * Math.sin(Math.PI * (t - T.para) / .5) * (1 - (t - T.para) / .9);
  const f0 = T.anda + .25, f1 = T.andar + .35;
  if (t < f0) return 610;
  if (t < f1) return lerp(610, 1650, EASE_IN(clamp((t - f0) / (f1 - f0))));
  if (t < T.loop) return 1650 + 1500 * (t - f1);
  // loop: desce de novo até a parede, que se abre em "E", e atravessa em "flui"
  const l0 = T.loop, open = T.eFlui;
  if (t < open + .12) return lerp(40, 520, EASE_OUT(clamp((t - l0) / (open + .12 - l0))));
  return 520 + 2600 * Math.pow(t - open - .12, 1.5);
};
// ── câmera [t, cx, cy, zoom, rotação°]
const CAM: number[][] = [
  [0, 0, 250, 1.25, 0], [T.para, 0, 290, 1.25, 0], [T.esp[0] - .1, 0, 300, 1.2, 0], [S.barreiras.v1 + .1, 0, 430, .62, 0],
  [S.caminho.t0 + .1, 0, 440, .62, 0], [T.silence0, 0, 600, .36, -3], [T.agora + .02, 0, 600, .36, -3],
  [S.virada.t1 - .05, 0, 760, .5, 0], [S.metodo.t0 + .75, 0, 832, .9, 0], [T.anda + .25, 0, 832, .9, 0],
  [T.andar + .35, 0, 1160, .9, 0], [T.monta + .55, 0, 1150, .32, 0], [S.fecho.t0 + .2, 0, 1150, .3, 0], [T.loop - .001, 0, 1050, .26, 0],
  [T.loop, 0, 250, 1.25, 0], [T.eFlui + .1, 0, 290, 1.25, 0], [S.loop.t1, 0, 1100, 1.1, 0],
];
const shake = (t: number) => {
  const d = t - T.para; if (d < 0 || d > .45) return [0, 0];
  const a = 26 * Math.exp(-d * 9); return [a * Math.sin(d * 95), a * .6 * Math.cos(d * 120)];
};

// ── fundo por trecho: escuro no problema, aço claro na virada, azul na demonstração, azul profundo na assinatura
const lightness = (t: number) => P(t, T.agora - .02, .18, EASE_OUT) * (1 - P(t, S.virada.t1 - .35, .5, EASE_IO));
const blueness = (t: number) => P(t, S.virada.t1 - .35, .6) * (1 - P(t, T.loop - .2, .2)) + P(t, T.sig, .8);

// ── labirinto: paredes de 200 em 200, determinísticas
const CELL = 200;
type Wall = {x: number; y: number; a0: number; d: number; stuck: boolean};
const WALLS: Wall[] = [];
for (let gx = -6; gx <= 5; gx++) for (let gy = -7; gy <= 13; gy++) {
  const x = gx * CELL + 100, y = gy * CELL + 100, h = hash(gx * 31 + gy * 7);
  WALLS.push({x, y, a0: (h > .5 ? 0 : 90) + (hash(gx + gy * 13) - .5) * 14, d: Math.hypot(x, y - 610), stuck: hash(gx * 3 + gy * 11) > .82});
}
const Walls: React.FC<{t: number}> = ({t}) => {
  const L = lightness(t), inMethod = P(t, S.virada.t1 - .3, .8);
  return <>{WALLS.map((w, i) => {
    const app = P(t, S.caminho.t0 + .05 + w.d * .0007, .35, BACK);
    if (app <= 0) return null;
    const rot = lerp(w.a0, 90, P(t, T.agora + .12 + w.d * .00045, .42, EASE_IO));
    const lane = Math.abs(w.x) === 100; // trilhos do pedido
    const blink = w.stuck && t > S.caminho.t0 + .4 && t < T.silence0 ? .5 + .5 * Math.sin((t - S.caminho.t0) * 9 + i) : 0;
    const o = lane ? 1 : lerp(1, .22, inMethod);
    return <div key={i} style={{position: 'absolute', left: w.x - CELL / 2, top: w.y - 11, width: CELL, height: 22, borderRadius: 4,
      transform: `rotate(${rot}deg) scale(${app.toFixed(3)})`, opacity: o, background: L > .5 ? STEEL_DARK : STEEL,
      boxShadow: `0 ${10}px 18px rgba(0,0,0,${(.45 * (1 - L)).toFixed(2)})`, outline: blink > 0 ? `0 solid` : undefined}}>
      {blink > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: 4, background: C.light, opacity: blink * .85}} /> : null}
    </div>;
  })}</>;
};

// ── cartões de barreira (viram os sistemas conectados)
const ICON: Record<string, React.ReactNode> = {
  mail: <svg viewBox="0 0 48 48" width="54" height="54"><rect x="5" y="11" width="38" height="26" rx="4" fill="none" stroke={C.silver} strokeWidth="3" /><path d="M7 14l17 13 17-13" fill="none" stroke={C.silver} strokeWidth="3" /></svg>,
  grid: <svg viewBox="0 0 48 48" width="54" height="54"><rect x="6" y="8" width="36" height="32" rx="4" fill="none" stroke={C.silver} strokeWidth="3" /><path d="M6 19h36M6 30h36M19 8v32" stroke={C.silver} strokeWidth="3" /></svg>,
  bell: <svg viewBox="0 0 48 48" width="54" height="54"><path d="M12 33V22a12 12 0 0124 0v11l4 4H8z" fill="none" stroke={C.silver} strokeWidth="3" strokeLinejoin="round" /><path d="M20 41a4 4 0 008 0" fill="none" stroke={C.silver} strokeWidth="3" /></svg>,
};
const CARDS = [
  {k: 'mail', label: 'E-mail', p0: [-330, 470], p1: [-330, 900], i: 0},
  {k: 'grid', label: 'Planilha', p0: [330, 400], p1: [330, 1150], i: 1},
  {k: 'bell', label: 'Lembrete', p0: [0, 330], p1: [-330, 1400], i: 2},
];
const NODES = [900, 1150, 1400];
const STATIONS = ['Pedido', 'Aprovação', 'Entrega'];
const Card: React.FC<{t: number; c: typeof CARDS[number]}> = ({t, c}) => {
  const tin = T.esp[c.i] - .05, a = P(t, tin, .45, BACK), gone = P(t, T.agora + .05, .3, EASE_IN), back = P(t, T.integra - .05 + c.i * .14, .55, BACK);
  if (a <= 0 || (gone >= 1 && back <= 0)) return null;
  const [x, y] = back > 0 ? [lerp(c.p1[0] * 2.2, c.p1[0], back), c.p1[1]] : c.p0;
  const s = back > 0 ? back : a * (1 - gone);
  const dim = 1 - .55 * P(t, T.anda, .4);
  return <div style={{position: 'absolute', left: x - 140, top: y - 64, width: 280, height: 128, borderRadius: 22, transform: `scale(${s.toFixed(3)})`, opacity: dim,
    background: `linear-gradient(180deg, #2A2F35, ${C.graphite})`, border: '2px solid rgba(192,198,204,.35)', boxShadow: '0 26px 40px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.12)',
    display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px', boxSizing: 'border-box'}}>
    {ICON[c.k]}<div style={{fontFamily: UI, fontWeight: 700, fontSize: 38, color: C.ink}}>{c.label}</div>
  </div>;
};

// ── método: gargalo, mapa, padronização, automação, integração (no trilho central)
const Method: React.FC<{t: number}> = ({t}) => {
  const vis = P(t, S.metodo.t0 + .1, .5) * (1 - P(t, T.loop - .3, .25));
  if (vis <= 0) return null;
  const scan = P(t, T.diag - .05, .8, EASE_IO), scanOn = t > T.diag - .1 && t < T.diag + 1.0;
  const pad = P(t, T.padr - .05, .55, EASE_IO), map = P(t, T.mapa - .05, .7, EASE_OUT), auto = P(t, T.auto - .05, 1.1, EASE_IO);
  const bott = P(t, T.diag + .55, .3, BACK) * (1 - pad);
  const W0 = [120, 176, 96], R0 = [9, -13, 6], X0 = [-14, 9, 7];
  return <div style={{position: 'absolute', left: 0, top: 0, opacity: vis}}>
    {/* gargalo: duas placas tortas estreitam o trilho */}
    {[-1, 1].map((sgn) => <div key={sgn} style={{position: 'absolute', left: lerp(sgn * 42, sgn * 82, pad) - 45, top: 1260 - 13, width: 90, height: 26, borderRadius: 4, background: STEEL,
      transform: `rotate(${lerp(sgn * 22, 90, pad)}deg)`, opacity: P(t, S.metodo.t0 + .2, .4) * (1 - P(t, T.padr + .45, .3))}} />)}
    {bott > 0 ? <svg style={{position: 'absolute', left: -150, top: 1185, overflow: 'visible'}} width="300" height="150"><path d="M10 0H-6V150H10M290 0H306V150H290" fill="none" stroke={C.accent} strokeWidth="6" opacity={bott} /></svg> : null}
    {/* linha central do mapa + automação (preenchimento azul que desce) */}
    <div style={{position: 'absolute', left: -3, top: 690, width: 6, height: 900 * map, background: 'rgba(192,198,204,.45)', borderRadius: 3}} />
    <div style={{position: 'absolute', left: -3, top: 690, width: 6, height: 900 * auto, background: C.accent, borderRadius: 3}} />
    {/* estações: tamanhos irregulares → padronizadas */}
    {NODES.map((y, i) => {
      const a = P(t, T.mapa + i * .12, .4, BACK), lit = P(t, T.anda + .25 + .35 + i * .18, .15);
      const w = lerp(W0[i], 150, pad), r = lerp(R0[i], 0, pad), x = lerp(X0[i], 0, pad);
      return <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - 26, width: w, height: 52, borderRadius: 12, transform: `rotate(${r}deg) scale(${a.toFixed(3)})`,
        background: STEEL_DARK, border: `3px solid ${lit > 0 ? C.accent : 'rgba(192,198,204,.5)'}`, boxShadow: '0 14px 22px rgba(0,0,0,.5)'}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, background: lit > 0 ? C.accent : C.silver}} />
      </div>;
    })}
    {/* scanner do diagnóstico */}
    {scanOn ? <div style={{position: 'absolute', left: -190, top: lerp(640, 1290, scan) - 4, width: 380, height: 8, background: C.light, borderRadius: 4, opacity: .9 * (1 - P(t, T.diag + .8, .2))}} /> : null}
    {/* cabos: cartões → estações */}
    {CARDS.map((c) => { const k = P(t, T.integra + .35 + c.i * .14, .45, EASE_OUT); if (k <= 0) return null;
      const x0 = c.p1[0] > 0 ? 190 : -190, x1 = c.p1[0] > 0 ? 75 : -75, y = c.p1[1];
      return <svg key={c.k} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="1" height="1">
        <line x1={x0} y1={y} x2={lerp(x0, x1, k)} y2={y} stroke={C.accent} strokeWidth="6" strokeLinecap="round" opacity={1 - .5 * P(t, T.anda, .4)} />
        {k >= 1 ? <circle cx={x1} cy={y} r="9" fill={C.accent} /> : null}</svg>; })}
    {/* rótulos das estações no fluxo (lado oposto ao cartão) */}
    {NODES.map((y, i) => { const a = P(t, T.anda + i * .12, .35); if (a <= 0) return null; const right = CARDS[i].p1[0] < 0;
      return <div key={i} style={{position: 'absolute', top: y - 26, ...(right ? {left: 118} : {right: 118}), fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.ink, opacity: a, whiteSpace: 'nowrap',
        transform: `translateX(${((1 - a) * (right ? 20 : -20)).toFixed(1)}px)`}}>{STATIONS[i]}</div>; })}
  </div>;
};

// ── pedidos em paralelo (montagem de tempo)
const Flow: React.FC<{t: number}> = ({t}) => {
  const v = P(t, T.monta, .4) * (1 - P(t, T.loop - .25, .2)); if (v <= 0) return null;
  const out: React.ReactNode[] = [];
  for (let k = -5; k <= 5; k++) for (let j = 0; j < 2; j++) {
    if (k === 0 && j === 0) continue;
    const sp = 900 + 500 * hash(k * 5 + j), ph = hash(k * 17 + j * 3) * 5600;
    const y = ((t - T.monta) * sp + ph) % 5600 - 1700;
    out.push(<TokenBox key={`${k}-${j}`} x={k * CELL} y={y} s={.9} speed={sp} />);
  }
  return <div style={{position: 'absolute', left: 0, top: 0, opacity: v * (1 - .7 * P(t, S.fecho.t0, .8))}}>{out}</div>;
};
const TokenBox: React.FC<{x: number; y: number; s?: number; speed?: number}> = ({x, y, s = 1, speed = 0}) => {
  const trail = clamp(speed / 1800);
  return <>
    {trail > .05 ? [1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: x - 70 * s, top: y - 70 * s - i * 70 * trail, width: 140 * s, height: 140 * s, borderRadius: 28 * s, background: STEEL, opacity: .22 / i}} />) : null}
    {trail > .05 ? [-34, 34].map((dx) => <div key={dx} style={{position: 'absolute', left: x + dx * s - 2, top: y - 70 * s - 360 * trail, width: 4, height: 300 * trail, background: 'linear-gradient(180deg, rgba(192,198,204,0), rgba(192,198,204,.55))'}} />) : null}
    <div style={{position: 'absolute', left: x - 70 * s, top: y - 70 * s, width: 140 * s, height: 140 * s, borderRadius: 28 * s, background: STEEL,
      boxShadow: '0 22px 34px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 0 rgba(0,0,0,.25)'}}>
      {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 34 * s, top: (40 + i * 22) * s, width: (i === 2 ? 44 : 72) * s, height: 8 * s, borderRadius: 4 * s, background: 'rgba(28,31,34,.55)'}} />)}
      <div style={{position: 'absolute', right: 26 * s, top: 26 * s, width: 18 * s, height: 18 * s, borderRadius: 9 * s, background: C.accent}} />
    </div>
  </>;
};

// ── tipografia: frase montada palavra por palavra (desfoque de movimento); saída para cima antes da próxima entrar
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size: number; top: number; dark?: boolean; align?: 'left' | 'center'}> = ({t, tin, tout, segs, size, top, dark, align = 'left'}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left: 90, right: 90, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: '-.025em',
    color: dark ? C.black : C.ink, opacity: 1 - q, transform: `translateY(${(-40 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, acc], i) => { const p = tin < 0 ? 1 : P(t, tin + i * .055, .32);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? C.accent : undefined, opacity: p, transform: `translateY(${((1 - p) * 36).toFixed(1)}px)`,
        filter: p < 1 ? `blur(${((1 - p) * 10).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};

// ── logo DME: 4 peças que se montam (única animação permitida do logo)
const LOGO = [
  'M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z',
  'M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z',
  'M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z',
  'M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z',
];
const FROM = [[-260, 40], [0, -240], [260, -120], [180, 240]];
const Logo: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const w = 560, h = w * 610 / 750;
  return <svg viewBox="0 0 750 610" width={w} height={h} style={{position: 'absolute', left: 540 - w / 2, top: 470, overflow: 'visible'}}>
    <defs><linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" /></linearGradient></defs>
    {LOGO.map((d, i) => { const p = P(t, t0 + i * .1, .55, BACK); return <path key={i} d={d} fill="url(#steel)" stroke="#F2F4F6" strokeOpacity=".35" strokeWidth="1.5"
      opacity={clamp(p * 2)} transform={`translate(${((1 - p) * FROM[i][0]).toFixed(1)} ${((1 - p) * FROM[i][1]).toFixed(1)})`} />; })}
    <text x="14" y="592" fontFamily="Manrope, sans-serif" fontWeight={600} fontSize="64" textLength="722" lengthAdjust="spacing" fill="#C0C6CC" opacity={P(t, t0 + .55, .4)}>TECHNOLOGY</text>
  </svg>;
};

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const [cx, cy, z, rot] = keyed(t, CAM); const [sx, sy] = shake(t);
  const L = lightness(t), B = blueness(t);
  const ty = tokenY(t), tv = (tokenY(t + 1 / 30) - ty) * 30;
  const inWorld = t < T.sig + .7;
  const impactWall = t < T.loop ? P(t, -1, .1) * (1 - P(t, T.agora + .1, .4)) : 1;
  const split = P(t, T.eFlui - .05, .3, EASE_OUT);
  const bg = `rgb(${[lerp(10, 216, L), lerp(11, 221, L), lerp(12, 226, L)].map(Math.round).join(',')})`;
  const sigP = P(t, T.sig, .7, EASE_IO);
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      {/* luz lateral fria + azul da demonstração */}
      <AbsoluteFill style={{background: `radial-gradient(120% 70% at 0% 30%, rgba(38,75,113,${(.42 * (1 - L) + .25 * B).toFixed(2)}) 0%, rgba(38,75,113,0) 62%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(14,28,46,${(.75 * B).toFixed(2)}), rgba(10,11,12,${(.4 * B).toFixed(2)}))`}} />
      {inWorld ? <AbsoluteFill style={{opacity: 1 - sigP}}>
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
          transform: `translate(${(540 + sx).toFixed(2)}px, ${(960 + sy).toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${z.toFixed(5)}) translate(${(-cx).toFixed(2)}px, ${(-cy).toFixed(2)}px)`}}>
          {/* piso: grade fina */}
          <div style={{position: 'absolute', left: -2400, top: -2200, width: 4800, height: 7200, opacity: .06 * (1 - L) + .05,
            backgroundImage: `linear-gradient(${C.silver} 2px, transparent 2px), linear-gradient(90deg, ${C.silver} 2px, transparent 2px)`, backgroundSize: '200px 200px'}} />
          {t < T.loop ? <Walls t={t} /> : null}
          {t < T.loop ? <Method t={t} /> : null}
          {t < T.loop ? CARDS.map((c) => <Card key={c.k} t={t} c={c} />) : null}
          {t < T.loop ? <Flow t={t} /> : null}
          {/* parede do impacto (no loop, ela se abre) */}
          {impactWall > 0 ? [-1, 1].map((sgn) => <div key={sgn} style={{position: 'absolute', left: (sgn < 0 ? -170 : 0) + sgn * 260 * (t >= T.loop ? split : 0), top: 682, width: 170, height: 34,
            borderRadius: sgn < 0 ? '6px 0 0 6px' : '0 6px 6px 0', background: STEEL, opacity: impactWall, boxShadow: '0 18px 26px rgba(0,0,0,.55)',
            transform: t < T.loop ? `rotate(${lerp(0, 90, P(t, T.agora + .1, .4, EASE_IO))}deg)` : undefined}} />) : null}
          <TokenBox x={0} y={ty} speed={Math.max(0, tv)} />
        </div>
      </AbsoluteFill> : null}

      {/* véu superior: o texto nunca disputa com o labirinto ou os trilhos */}
      {(() => { const v = P(t, S.barreiras.t1 - .6, .5) * (1 - P(t, T.loop - .15, .1)); if (v <= 0) return null;
        const c = bg.replace('rgb(', 'rgba(').replace(')', '');
        return <AbsoluteFill style={{opacity: v, background: `linear-gradient(180deg, ${c},.94) 0px, ${c},.9) 600px, ${c},0) 790px)`}} />; })()}
      {/* ── texto (zona segura: y 250–1580, margens de 90 px) */}
      <Phrase t={t} tin={-1} tout={S.gancho.t1 - .25} segs={['Um pedido entra.']} size={112} top={290} />
      <Phrase t={t} tin={T.para - .08} tout={S.gancho.t1 - .25} segs={['E ', ['para.']]} size={112} top={530} />
      <Phrase t={t} tin={T.esp[0] - .05} tout={T.esp[1] - .4} segs={['Espera um ', ['e-mail.']]} size={100} top={300} />
      <Phrase t={t} tin={T.esp[1] - .05} tout={T.esp[2] - .4} segs={['Espera uma ', ['planilha.']]} size={100} top={300} />
      <Phrase t={t} tin={T.esp[2] - .05} tout={S.barreiras.t1 - .1} segs={['Espera alguém ', ['lembrar.']]} size={100} top={300} />
      <Phrase t={t} tin={T.prob - .1} tout={T.eCam - .4} segs={['O problema não é a equipe.']} size={96} top={300} />
      <Phrase t={t} tin={T.eCam - .05} tout={T.agora - .32} segs={['É o ', ['caminho.']]} size={120} top={300} />
      <Phrase t={t} tin={T.agora - .02} tout={T.muda - .5} segs={['Agora']} size={250} top={330} dark />
      <Phrase t={t} tin={T.muda - .15} tout={S.virada.t1 - .25} segs={['o caminho ', ['muda.']]} size={120} top={300} dark />
      {/* lista do método: item ativo acende na palavra falada */}
      {(() => { const v = P(t, S.metodo.t0 + .15, .4) * (1 - P(t, T.integra - .35, .3, EASE_IN)); if (v <= 0) return null;
        const items = [['Diagnóstico', T.diag], ['Mapeamento', T.mapa], ['Padronização', T.padr], ['Automação', T.auto]] as const;
        return <div style={{position: 'absolute', left: 90, top: 270, opacity: v, transform: `translateY(${(-30 * P(t, T.integra - .35, .3, EASE_IN)).toFixed(1)}px)`}}>
          {items.map(([w, ta], i) => { const on = P(t, ta - .08, .2) * (i < 3 ? 1 - P(t, items[i + 1][1] - .08, .2) : 1), seen = t > ta;
            return <div key={w} style={{display: 'flex', alignItems: 'center', gap: 22, height: 86, fontFamily: HEAD, fontWeight: 800, fontSize: 64, letterSpacing: '-.02em',
              color: on > .5 ? C.ink : seen ? 'rgba(242,244,246,.55)' : 'rgba(192,198,204,.3)', transform: `translateX(${(on * 14).toFixed(1)}px)`}}>
              <div style={{width: 14, height: 14 + on * 40, borderRadius: 7, background: on > .3 ? C.accent : 'rgba(192,198,204,.35)'}} />{w}</div>; })}
        </div>; })()}
      <Phrase t={t} tin={T.integra - .05} tout={S.metodo.t1 - .2} segs={['Sistemas ', ['conectados.']]} size={100} top={300} />
      {t > T.integra && t < S.metodo.t1 + .1 ? <div style={{position: 'absolute', left: 90, top: 1530, fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.soft, letterSpacing: '.04em',
        padding: '8px 16px', border: `1px solid ${C.line}`, borderRadius: 10, opacity: P(t, T.integra + .2, .3) * (1 - P(t, S.metodo.t1 - .1, .2))}}>Exemplo ilustrativo</div> : null}
      <Phrase t={t} tin={T.anda - .05} tout={T.monta - .05} segs={['E o caminho volta a ', ['andar.']]} size={96} top={300} />
      {/* montagem de tempo: horário troca no mesmo lugar */}
      {HOURS.map((h, i) => <Phrase key={h} t={t} tin={HT[i]} tout={i < 3 ? HT[i + 1] - .3 : S.fluxo.t1 - .2} segs={i === 3 ? [[h]] : [h]} size={200} top={330} align="center" />)}
      <Phrase t={t} tin={T.entao - .05} tout={T.voce - .38} segs={['Então, enquanto o processo ', ['flui,']]} size={96} top={300} />
      <Phrase t={t} tin={T.voce - .05} tout={S.fecho.t1 - .25} segs={['você cuida do que faz a empresa ', ['crescer.']]} size={92} top={300} />
      {/* chips da vida, em 3 profundidades */}
      {[['Estratégia', 250, 980, 1], ['Clientes', 620, 1200, .8], ['Equipe', 300, 1400, .66]].map(([w, x, y, d], i) => {
        const a = P(t, T.voce + .2 + i * .18, .5, BACK) * (1 - P(t, S.fecho.t1 - .3, .3, EASE_IN)); if (a <= 0) return null;
        const dy = Math.sin((t + i) * 1.6) * 10 * (d as number);
        return <div key={i} style={{position: 'absolute', left: x as number, top: (y as number) + dy, transform: `scale(${((d as number) * a).toFixed(3)})`, transformOrigin: 'left center', opacity: .55 + .45 * (d as number),
          padding: '22px 38px', borderRadius: 60, background: `linear-gradient(180deg, #2A2F35, ${C.graphite})`, border: '2px solid rgba(192,198,204,.3)', boxShadow: '0 24px 40px rgba(0,0,0,.5)',
          fontFamily: UI, fontWeight: 700, fontSize: 46, color: C.ink, display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 16, height: 16, borderRadius: 8, background: C.accent}} />{w}</div>; })}
      <Phrase t={t} tin={T.loop + .02} tout={S.loop.t1 - .2} segs={['Um pedido entra.']} size={112} top={290} />
      <Phrase t={t} tin={T.eFlui - .08} tout={S.loop.t1 - .2} segs={['E ', ['flui.']]} size={112} top={530} />

      {/* ── assinatura */}
      {t > T.sig - .1 ? <AbsoluteFill style={{opacity: sigP}}>
        {(() => { const p = P(t, T.sig, .55, EASE_OUT), k = P(t, T.sig + .45, .35, EASE_IN); if (k >= 1) return null;
          return <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(540px, ${lerp(-120, 698, p).toFixed(1)}px) scale(${lerp(1, .35, k).toFixed(3)})`, opacity: 1 - k}}><TokenBox x={0} y={0} /></div>; })()}
        <Logo t={t} t0={T.sig + .72} />
        <Phrase t={t} tin={T.proc - .05} tout={99} segs={['Processos que fluem com ', ['tecnologia.']]} size={74} top={1010} align="center" />
        {(() => { const a = P(t, T.cta - .1, .5, BACK); if (a <= 0) return null;
          return <div style={{position: 'absolute', left: 140, right: 140, top: 1290, padding: '30px 30px 34px', borderRadius: 34, textAlign: 'center', transform: `scale(${a.toFixed(3)})`,
            background: `linear-gradient(180deg, #23272C, ${C.graphite})`, border: '2px solid rgba(192,198,204,.32)', boxShadow: '0 30px 50px rgba(0,0,0,.5)'}}>
            <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: C.ink, letterSpacing: '-.02em'}}>Comente <span style={{color: C.accent}}>COMERCIAL</span></div>
            <div style={{fontFamily: UI, fontWeight: 600, fontSize: 40, color: C.silver, marginTop: 8}}>e receba um diagnóstico</div>
          </div>; })()}
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
