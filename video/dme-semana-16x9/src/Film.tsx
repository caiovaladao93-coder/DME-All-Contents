import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, hash, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "A semana" (16:9, 57 s). A agenda de um dono de empresa (SEG–SEX, 8h–19h) enche de tarefas que são trabalho de
 * processo; a estratégia fica espremida na sexta às 18h30. No "Agora", cada solução (só fatos confirmados) retira da agenda,
 * de uma vez, todos os blocos de um tipo: CRM, agente de voz com IA, integração e processo padronizado. A semana se abre,
 * a estratégia vai para segunda de manhã e a assinatura fecha com "Automatizamos processos. Devolvemos tempo." (sem CTA).
 */
const W = 1920, H = 1080, A = C.accent;
const E = (k: SceneKey) => S[k];
const T = {
  tipo: [wt('tarefas', 'Cobrar'), wt('tarefas', 'Redigitar'), wt('tarefas', 'Atender'), wt('tarefas', 'Procurar'), wt('tarefas', 'Explicar')],
  toda: wt('cheia', 'Toda'), mesmas: wt('cheia', 'mesmas'), estr: wt('estrategia', 'estratégia?'), ficou: wt('estrategia', 'Ficou'),
  agora: wt('agora', 'Agora,'), mesma: wt('agora', 'a'), com: wt('agora', 'Com'),
  crmQ: wt('crm', 'retorno,'), crm: wt('crm', 'Cê-Erre-Eme'), agQ: wt('agente', 'ligação'), ag: wt('agente', 'agente'),
  v: [wt('agente', 'atende,'), wt('agente', 'qualifica,'), wt('agente', 'registra'), wt('agente', 'passa')],
  ped: wt('integra', 'pedido'), integ: wt('integra', 'integrados.'), sis: wt('integra', 'sistemas'),
  que: wt('processo', 'que'), vira: wt('processo', 'vira'), padr: wt('processo', 'padronizado.'),
  dme: wt('metodo', 'Dê-Eme-É'), ent: wt('metodo', 'entende'), plan: wt('metodo', 'planeja'), des: wt('metodo', 'desenvolve'), sob: wt('metodo', 'sob'),
  sig: E('assinatura').t0, auto: wt('assinatura', 'Automatizamos'), dev: wt('assinatura', 'Devolvemos'),
};
const STEEL = 'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, rgba(0,0,0,.05) 1px 3px), linear-gradient(135deg, #2A2E33 0%, #464C53 40%, #2B3035 70%, #383E44 100%)';
const BLUE_PLATE = 'linear-gradient(135deg, #2D5584 0%, #3A6EA5 45%, #264B71 100%)';

// ── agenda
const GX = 720, GW = 1080, COLW = GW / 5, GY = 205, SLOT = 34, NS = 22;      // 8h–19h em meias horas
const DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
const TIPOS = ['COBRAR RETORNO', 'REDIGITAR PEDIDO', 'ATENDER LIGAÇÃO', 'PROCURAR ARQUIVO', 'EXPLICAR DE NOVO'];
// solução de cada tipo: índice do selo
const SOLDE = [0, 2, 1, 3, 3];
const SELOS: Array<{l: [string, string]; t: () => number}> = [
  {l: ['CRM', 'RETORNO AUTOMÁTICO'], t: () => T.crm}, {l: ['AGENTE DE VOZ', 'COM IA'], t: () => T.ag},
  {l: ['INTEGRAÇÃO', 'DE SISTEMAS'], t: () => T.sis}, {l: ['PROCESSO', 'MAPEADO E PADRONIZADO'], t: () => T.vira},
];
type Blk = {d: number; s: number; n: number; k: number; i: number};
const BLOCKS: Blk[] = (() => {
  const out: Blk[] = []; let i = 0;
  for (let d = 0; d < 5; d++) { let s = 0;
    while (s < NS) { if (d === 4 && s === NS - 1) break;                       // sexta 18h30 fica para a estratégia
      let n = hash(d * 31 + s * 7) > .55 ? 2 : 1; if (d === 4 && s + n > NS - 1) n = NS - 1 - s; if (s + n > NS) n = NS - s;
      const k = Math.floor(hash(d * 13 + s * 5 + 3) * 5) % 5; out.push({d, s, n, k, i: i++}); s += n; } }
  return out;
})();
const bx = (d: number) => GX + d * COLW + 6, by = (s: number) => GY + s * SLOT + 3;
const seloPos = (j: number) => ({x: 120, y: 600 + j * 92, w: 520, h: 78});
// blocos da semana nova (depois da solução)
const NOVOS: Array<{l: string; d: number; s: number; n: number; t: () => number}> = [
  {l: 'ESTRATÉGIA', d: 0, s: 2, n: 4, t: () => T.ent}, {l: 'NOVOS CLIENTES', d: 2, s: 12, n: 4, t: () => T.plan},
  {l: 'EQUIPE', d: 3, s: 4, n: 2, t: () => T.des}, {l: 'FAMÍLIA', d: 4, s: 17, n: 4, t: () => T.sob},
];

const Agenda: React.FC<{t: number; o: number}> = ({t, o}) => {
  if (o <= 0) return null;
  const full = P(t, T.toda - .1, .4) * (1 - P(t, E('cheia').t1, .4));
  const sh = full > 0 ? Math.sin(t * 43) * 3 * full : 0;
  const estr = P(t, T.estr - .1, .45, BACK), estrMove = P(t, T.ent - .25, .8, EASE_IO);
  return <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translate(${sh.toFixed(1)}px, ${(sh * .5).toFixed(1)}px)`}}>
    {/* grade */}
    <div style={{position: 'absolute', left: GX, top: GY - 58, width: GW, height: NS * SLOT + 58, borderRadius: 16, background: 'rgba(28,31,34,.78)', border: '1.5px solid rgba(192,198,204,.28)'}} />
    {DAYS.map((d, i) => <div key={d} style={{position: 'absolute', left: GX + i * COLW, top: GY - 50, width: COLW, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 20, letterSpacing: '.22em', color: C.silver}}>{d}</div>)}
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {[...Array(NS + 1)].map((_, s) => <line key={s} x1={GX} y1={GY + s * SLOT} x2={GX + GW} y2={GY + s * SLOT} stroke="rgba(192,198,204,.08)" strokeWidth={s % 2 ? 1 : 1.5} />)}
      {[1, 2, 3, 4].map((d) => <line key={d} x1={GX + d * COLW} y1={GY - 50} x2={GX + d * COLW} y2={GY + NS * SLOT} stroke="rgba(192,198,204,.14)" strokeWidth="1.5" />)}
    </svg>
    {[8, 10, 12, 14, 16, 18].map((h) => <div key={h} style={{position: 'absolute', left: GX - 62, top: GY + (h - 8) * 2 * SLOT - 10, width: 50, textAlign: 'right', fontFamily: UI, fontWeight: 700, fontSize: 17, color: 'rgba(192,198,204,.55)'}}>{h}h</div>)}
    {/* tarefas */}
    {BLOCKS.map((b) => {
      const tin = T.tipo[b.k] - .1 + hash(b.i * 3.7) * .7; const a = P(t, tin, .35, BACK); if (a <= 0) return null;
      const j = SOLDE[b.k]; const ts = SELOS[j].t(); const ord = (b.d * NS + b.s) / (5 * NS);
      const hi = P(t, ts - .45, .25), fly = P(t, ts - .05 + ord * .55, .6, EASE_IN);
      if (fly >= 1) return null;
      const sp = seloPos(j); const x0 = bx(b.d), y0 = by(b.s); const x = lerp(x0, sp.x + sp.w / 2 - (COLW - 12) / 2, fly), y = lerp(y0, sp.y + sp.h / 2 - (b.n * SLOT - 6) / 2, fly);
      return <div key={b.i} style={{position: 'absolute', left: x, top: y + (1 - a) * -26, width: COLW - 12, height: b.n * SLOT - 6, borderRadius: 7,
        background: hi > .5 ? BLUE_PLATE : STEEL, borderLeft: `4px solid ${hi > .5 ? '#DCE8F5' : C.silver}`, opacity: clamp(a * 2) * (1 - fly * .9), transform: `scale(${(1 - .75 * fly).toFixed(3)})`,
        display: 'flex', alignItems: b.n > 1 ? 'flex-start' : 'center', padding: b.n > 1 ? '7px 10px' : '0 10px', boxShadow: '0 4px 10px rgba(0,0,0,.35)',
        fontFamily: UI, fontWeight: 800, fontSize: 13.5, letterSpacing: '.08em', color: hi > .5 ? '#fff' : 'rgba(242,244,246,.85)', overflow: 'hidden', whiteSpace: 'nowrap'}}>{TIPOS[b.k]}</div>; })}
    {/* estratégia espremida na sexta 18h30 → segunda de manhã */}
    {estr > 0 ? (() => { const n = lerp(1, 4, estrMove), d = lerp(4, 0, estrMove), s = lerp(NS - 1, 2, estrMove);
      return <div style={{position: 'absolute', left: bx(d), top: by(s), width: COLW - 12, height: n * SLOT - 6, borderRadius: 7, background: estrMove > .5 ? BLUE_PLATE : 'rgba(58,110,165,.35)',
        border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(estr * 2), transform: `scale(${(.6 + .4 * estr).toFixed(3)})`,
        fontFamily: UI, fontWeight: 800, fontSize: lerp(13, 20, estrMove), letterSpacing: '.12em', color: '#fff'}}>ESTRATÉGIA</div>; })() : null}
    {NOVOS.slice(1).map((nb) => { const p = P(t, nb.t() - .2, .5, BACK); if (p <= 0) return null;
      return <div key={nb.l} style={{position: 'absolute', left: bx(nb.d), top: by(nb.s), width: COLW - 12, height: nb.n * SLOT - 6, borderRadius: 7, background: BLUE_PLATE, border: '1.5px solid rgba(220,232,245,.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(p * 2), transform: `scale(${(.7 + .3 * p).toFixed(3)})`, fontFamily: UI, fontWeight: 800, fontSize: 18, letterSpacing: '.12em', color: '#fff'}}>{nb.l}</div>; })}
  </div>;
};

// ── selos da solução (coluna esquerda)
const Selos: React.FC<{t: number}> = ({t}) => {
  const out = P(t, E('metodo').t0 - .2, .4); if (out >= 1) return null;
  return <>{SELOS.map((s, j) => { const p = P(t, s.t() - .6, .45, BACK); if (p <= 0) return null; const sp = seloPos(j);
    const got = P(t, s.t() + .4, .6);
    return <div key={j} style={{position: 'absolute', left: sp.x, top: sp.y, width: sp.w, height: sp.h, borderRadius: 12, background: BLUE_PLATE, border: '1.5px solid rgba(220,232,245,.6)',
      boxShadow: '0 14px 28px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', opacity: clamp(p * 2) * (1 - out), transform: `translateX(${((1 - p) * -40).toFixed(1)}px) scale(${(1 + .04 * Math.sin(got * Math.PI)).toFixed(3)})`}}>
      <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 28, color: '#fff'}}>{s.l[0]}</span>
      <span style={{fontFamily: UI, fontWeight: 800, fontSize: 15, letterSpacing: '.14em', color: '#DCE8F5'}}>{s.l[1]}</span>
      <span style={{marginLeft: 'auto', fontFamily: UI, fontWeight: 800, fontSize: 26, color: '#fff', opacity: got}}>✓</span></div>; })}</>;
};

// ── tipografia
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size?: number; top?: number; left?: number; width?: number; align?: 'left' | 'center'; color?: string}> = ({t, tin, tout, segs, size = 62, top = 200, left = 120, width = 540, align = 'left', color = C.ink}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: '-.025em', color,
    opacity: 1 - q, transform: `translateY(${(-24 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, ac], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: ac ? A : undefined, opacity: p, transform: `translateY(${((1 - p) * 26).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};
// lista das tarefas (coluna esquerda), na palavra falada
const Lista: React.FC<{t: number}> = ({t}) => {
  const out = P(t, E('cheia').t1 - .3, .3, EASE_IN); if (t < T.tipo[0] - .2 || out >= 1) return null;
  const nomes = ['Cobrar retorno.', 'Redigitar pedido.', 'Atender ligação.', 'Procurar arquivo.', 'Explicar de novo.'];
  return <div style={{position: 'absolute', left: 120, top: 470, opacity: 1 - out}}>
    {nomes.map((n, i) => { const p = P(t, T.tipo[i] - .08, .35); return <div key={n} style={{display: 'flex', alignItems: 'center', gap: 16, height: 62, opacity: p, transform: `translateX(${((1 - p) * -24).toFixed(1)}px)`,
      fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: i === T.tipo.filter((x) => t >= x - .1).length - 1 ? C.ink : 'rgba(192,198,204,.55)'}}>
      <span style={{width: 12, height: 12, borderRadius: 3, background: C.silver}} />{n}</div>; })}
  </div>;
};
const Verbs: React.FC<{t: number}> = ({t}) => {
  const o = P(t, T.v[0] - .3, .3) * (1 - P(t, E('agente').t1 - .25, .3)); if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 120, width: 540, top: 420, display: 'flex', flexWrap: 'wrap', gap: 10, opacity: o}}>
    {['atende', 'qualifica', 'registra', 'passa para a equipe'].map((w, i) => { const on = P(t, T.v[i] - .05, .25);
      return <span key={w} style={{fontFamily: UI, fontWeight: 700, fontSize: 24, padding: '8px 16px', borderRadius: 8, border: `2px solid ${on > .5 ? A : 'rgba(192,198,204,.35)'}`,
        background: on > .5 ? 'rgba(58,110,165,.25)' : 'transparent', color: on > .5 ? C.ink : 'rgba(192,198,204,.5)'}}>{w}</span>; })}
  </div>;
};
// método (coluna esquerda)
const Metodo: React.FC<{t: number}> = ({t}) => {
  const m = E('metodo'); const a = P(t, m.t0 - .1, .4) * (1 - P(t, m.t1 - .3, .3)); if (a <= 0) return null;
  const plates: Array<[string, string, number]> = [['01', 'ENTENDER', T.ent], ['02', 'PLANEJAR', T.plan], ['03', 'DESENVOLVER', T.des]];
  return <div style={{opacity: a}}>{plates.map(([n, w, ta], i) => { const p = P(t, ta - .25, .45, BACK), on = P(t, ta - .05, .25);
    return <div key={w} style={{position: 'absolute', left: 120, top: 560 + i * 112, width: 520, height: 92, borderRadius: 12, background: on > .5 ? BLUE_PLATE : STEEL, border: '1.5px solid rgba(192,198,204,.5)',
      boxShadow: '0 16px 30px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', gap: 24, paddingLeft: 30, opacity: clamp(p * 2), transform: `perspective(1000px) rotateX(${((1 - p) * 40).toFixed(1)}deg)`}}>
      <span style={{fontFamily: UI, fontWeight: 800, fontSize: 22, color: 'rgba(242,244,246,.7)'}}>{n}</span><span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 44, color: C.ink}}>{w}</span></div>; })}
    {(() => { const s = P(t, T.sob - .1, .4, BACK); return s > 0 ? <div style={{position: 'absolute', left: 120, top: 905, fontFamily: UI, fontWeight: 800, fontSize: 24, letterSpacing: '.22em', color: A, opacity: s}}>SOB MEDIDA</div> : null; })()}
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

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const ag = E('agora');
  const inv = P(t, T.agora - .1, .2) * (1 - P(t, T.mesma - .05, .3, EASE_IN));
  const sig = P(t, T.sig - .15, .6, EASE_IO);
  const zoom = 1 + .025 * Math.sin(t * .18);
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.035) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 65% 55%, rgba(38,75,113,.30) 0%, rgba(10,11,12,0) 70%)'}} />
      <div style={{position: 'absolute', left: 120, top: 70, fontFamily: UI, fontWeight: 700, fontSize: 18, letterSpacing: '.26em', color: 'rgba(192,198,204,.6)', opacity: 1 - sig}}>AGENDA DA SEMANA · EXEMPLO ILUSTRATIVO</div>
      <AbsoluteFill style={{transform: `scale(${zoom.toFixed(4)})`, transformOrigin: '70% 55%'}}><Agenda t={t} o={1 - sig} /></AbsoluteFill>
      <Lista t={t} />
      <Selos t={t} />
      <Verbs t={t} />
      <Metodo t={t} />

      {/* ── textos (coluna esquerda) */}
      <Phrase t={t} tin={-1} tout={E('gancho').t1 - .2} segs={['Essa é a semana', '|', 'de quem tem', '|', 'uma ', ['empresa.']]} size={68} top={200} />
      <Phrase t={t} tin={T.tipo[0] - .3} tout={E('tarefas').t1 - .2} segs={['Toda segunda,', '|', 'a mesma lista.']} size={56} top={210} />
      <Phrase t={t} tin={T.toda - .1} tout={E('cheia').t1 - .25} segs={['Toda semana,', '|', 'as ', ['mesmas'], ' tarefas.']} size={56} top={210} />
      <Phrase t={t} tin={T.estr - .2} tout={E('estrategia').t1 - .1} segs={['E a ', ['estratégia?']]} size={62} top={210} />
      <Phrase t={t} tin={T.ficou - .1} tout={E('estrategia').t1 - .1} segs={['Ficou pra sexta,', '|', 'às 19h.']} size={56} top={300} color="rgba(242,244,246,.8)" />
      <Phrase t={t} tin={T.mesma - .1} tout={ag.t1 - .25} segs={['A mesma semana.', '|', 'Com ', ['processo.']]} size={62} top={210} />
      <Phrase t={t} tin={T.crmQ - .3} tout={E('crm').t1 - .25} segs={['O retorno?', '|', 'O CRM faz', '|', ['automático.']]} size={58} top={200} />
      <Phrase t={t} tin={T.agQ - .3} tout={E('agente').t1 - .25} segs={['Ligação fora', '|', 'do horário?']} size={58} top={200} />
      <Phrase t={t} tin={T.ped - .3} tout={E('integra').t1 - .25} segs={['O pedido entra', '|', ['uma vez.']]} size={58} top={200} />
      <Phrase t={t} tin={T.que - .3} tout={E('processo').t1 - .25} segs={['O que só você sabe', '|', 'vira ', ['processo.']]} size={54} top={200} />
      <Phrase t={t} tin={T.dme - .2} tout={E('metodo').t1 - .3} segs={['A ', ['DME'], ' entende,', '|', 'planeja e desenvolve.']} size={54} top={210} />

      {/* virada */}
      {inv > 0 ? <AbsoluteFill style={{opacity: inv, background: 'linear-gradient(160deg, #D5DADF 0%, #C0C6CC 55%, #A9B0B7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 260, letterSpacing: '-.04em', color: '#0A0B0C', transform: `scale(${(1.08 - .08 * P(t, T.agora - .1, .6)).toFixed(3)})`}}>Agora</div></AbsoluteFill> : null}

      {/* ── assinatura (sem CTA) */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 50% 45%, rgba(38,75,113,.55) 0%, rgba(10,11,12,.97) 80%)'}} />
        <Logo t={t} t0={T.sig + .05} w={480} x={960 - 240} y={250} />
        <Phrase t={t} tin={T.auto - .1} tout={99} segs={['Automatizamos processos.']} size={56} top={720} left={260} width={1400} align="center" color={C.silver} />
        <Phrase t={t} tin={T.dev - .1} tout={99} segs={[['Devolvemos tempo.']]} size={56} top={792} left={260} width={1400} align="center" color={C.silver} />
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
