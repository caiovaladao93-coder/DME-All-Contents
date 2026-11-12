import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C, STEEL, STEEL_DARK} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, clamp, hash, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "Bastidores". Um painel de aço com FRENTE (o que o cliente vê) e VERSO (os bastidores da empresa).
 * Gancho na frente → o painel gira e revela o caos → trinca → tensão → "Agora" (aço claro) → método (entender,
 * identificar, desenvolver) transforma o caos numa placa de circuito → IA, automações, integração → o painel volta
 * para a frente (loop) → logo e CTA. Tudo é função do quadro (t = frame / 30); tempos ancorados nas palavras reais.
 */
const T = {
  isto: wt('gancho', 'isto'), mas: wt('flip', 'Mas'), bast: wt('flip', 'bastidores'), isto2: wt('flip', 'isto'),
  info: wt('trinca', 'Informação'), tarefa: wt('trinca', 'Tarefa'), sistema: wt('trinca', 'Sistema'),
  prob: wt('tensao', 'problema'), como: wt('tensao', 'como'), agora: wt('virada', 'Agora'), tec: wt('virada', 'tecnologia'),
  entende: wt('metodo', 'entende'), ident: wt('metodo', 'identifica'), desenv: wt('metodo', 'desenvolve'),
  ia: wt('conecta', 'Inteligência'), auto: wt('conecta', 'automações'), integ: wt('conecta', 'sistemas'),
  entao: wt('fecho', 'Então'), o: wt('fecho', 'o'), negocio: wt('fecho', 'negócio'), frente: wt('fecho', 'frente'),
  sig: S.assinatura.t0, slogan: wt('assinatura', 'Automatizamos'), cta: wt('assinatura', 'Comente'),
};
const PW = 820, PH = 1000;

// ── tipografia (palavra por palavra, desfoque de movimento; saída para cima)
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size: number; top: number; dark?: boolean; align?: 'left' | 'center'}> = ({t, tin, tout, segs, size, top, dark, align = 'left'}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left: 90, right: 90, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: '-.025em',
    color: dark ? C.black : C.ink, opacity: 1 - q, transform: `translateY(${(-40 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, acc], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .055, .32);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? C.accent : undefined, opacity: p, transform: `translateY(${((1 - p) * 36).toFixed(1)}px)`,
        filter: p < 1 ? `blur(${((1 - p) * 10).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};
/** lista que cresce na fala: cada item aparece quando é dito; o ativo acende */
const List: React.FC<{t: number; items: Array<[string, number]>; tout: number; top?: number; size?: number}> = ({t, items, tout, top = 270, size = 64}) => {
  const out = P(t, tout, .3, EASE_IN); if (t < items[0][1] - .2 || out >= 1) return null;
  return <div style={{position: 'absolute', left: 90, top, opacity: 1 - out, transform: `translateY(${(-30 * out).toFixed(1)}px)`}}>
    {items.map(([w, ta], i) => { const app = P(t, ta - .12, .4), on = P(t, ta - .08, .2) * (i < items.length - 1 ? 1 - P(t, items[i + 1][1] - .08, .2) : 1);
      return <div key={w} style={{display: 'flex', alignItems: 'center', gap: 22, height: size * 1.32, fontFamily: HEAD, fontWeight: 800, fontSize: size, letterSpacing: '-.02em', opacity: app,
        filter: app < 1 ? `blur(${((1 - app) * 8).toFixed(1)}px)` : undefined, color: on > .5 ? C.ink : 'rgba(242,244,246,.5)', transform: `translateX(${(on * 14 - (1 - app) * 30).toFixed(1)}px)`}}>
        <div style={{width: 14, height: 14 + on * (size * .6), borderRadius: 7, background: on > .3 ? C.accent : 'rgba(192,198,204,.35)'}} />{w}</div>; })}
  </div>;
};

// ── FRENTE: o que o cliente vê (limpo)
const Front: React.FC<{t: number}> = ({t}) => {
  const conn = P(t, T.frente - .1, .5, BACK);
  return <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: `linear-gradient(180deg, #22262B, ${C.graphite} 55%)`, border: '2px solid rgba(192,198,204,.35)', overflow: 'hidden',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12)'}}>
    <div style={{position: 'absolute', left: 56, right: 56, top: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: '.14em', color: C.soft}}>SEU PEDIDO</div>
      <div style={{width: 64, height: 64, borderRadius: 32, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg viewBox="0 0 24 24" width="36" height="36"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
    </div>
    <div style={{position: 'absolute', left: 56, right: 56, top: 170, fontFamily: HEAD, fontWeight: 800, fontSize: 76, lineHeight: 1.04, letterSpacing: '-.03em', color: C.ink}}>Pedido<br />confirmado</div>
    <div style={{position: 'absolute', left: 56, top: 350, fontFamily: UI, fontWeight: 600, fontSize: 34, color: C.soft}}>#4821 · hoje, 14:32</div>
    {[['Pagamento', 'Aprovado'], ['Entrega prevista', 'Amanhã'], ['Atendimento', 'Respondido']].map(([k, v], i) => (
      <div key={k} style={{position: 'absolute', left: 56, right: 56, top: 460 + i * 120, height: 96, borderRadius: 24, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', fontFamily: UI, fontSize: 34}}>
        <span style={{color: C.soft, fontWeight: 600}}>{k}</span><span style={{color: C.ink, fontWeight: 700}}>{v}</span></div>))}
    <div style={{position: 'absolute', left: 56, bottom: 60, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderRadius: 40, border: `1.5px solid ${C.accent}`, background: 'rgba(58,110,165,.14)',
      fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.ink, opacity: conn, transform: `scale(${(.85 + .15 * conn).toFixed(3)})`, transformOrigin: 'left center'}}>
      <span style={{width: 14, height: 14, borderRadius: 7, background: C.accent}} />Operação conectada</div>
    <div style={{position: 'absolute', right: 56, bottom: 72, fontFamily: UI, fontWeight: 600, fontSize: 22, color: 'rgba(192,198,204,.55)', letterSpacing: '.04em'}}>Exemplo ilustrativo</div>
  </div>;
};

// ── VERSO: bastidores. Caos → método → placa de circuito
const WINS = [
  {n: 'planilha_final_v3.xlsx', x: 40, y: 70, w: 440, h: 250, r: -6, k: 'grid'}, {n: 'Caixa de entrada (37)', x: 360, y: 120, w: 410, h: 230, r: 5, k: 'mail'},
  {n: 'Pedidos – cópia (2)', x: 70, y: 380, w: 400, h: 220, r: 4, k: 'grid'}, {n: 'sistema_antigo', x: 420, y: 430, w: 360, h: 210, r: -7, k: 'sys'},
  {n: 'Relatório (2).pdf', x: 120, y: 680, w: 360, h: 200, r: -3, k: 'doc'}, {n: 'Mensagens', x: 440, y: 700, w: 340, h: 210, r: 6, k: 'msg'},
];
const NOTES = [['cobrar cliente', 80, 300, -9], ['conferir estoque', 560, 360, 8], ['reenviar proposta', 330, 620, -4]] as const;
const MODS = [['Atendimento', 70, 120], ['Comercial', 450, 120], ['Financeiro', 70, 700], ['Operação', 450, 700]] as const;
const HUBS = [['IA', 410, 330, () => T.ia], ['Automação', 410, 500, () => T.auto], ['Integração', 410, 670, () => T.integ]] as const;
const Back: React.FC<{t: number}> = ({t}) => {
  const scatter = P(t, T.info - .1, .6, EASE_OUT), lift = P(t, T.agora + .2, .9, EASE_IO), dim = P(t, T.prob, .5) * (1 - P(t, T.agora, .3));
  const order = P(t, T.desenv - .1, .9, EASE_IO);          // caos → placa
  const hl = (a: number, b: number) => P(t, a - .1, .25) * (1 - P(t, b - .15, .2));
  const hlInfo = hl(T.info, T.tarefa), hlTar = hl(T.tarefa, T.sistema), hlSis = hl(T.sistema, T.prob);
  const board = P(t, T.desenv + .2, .7);
  return <div style={{position: 'absolute', inset: 0, borderRadius: 44, overflow: 'hidden', background: `linear-gradient(180deg, #1A1D21, #121417)`, border: '2px solid rgba(192,198,204,.3)'}}>
    {/* placa de circuito (aparece no desenvolvimento) */}
    <div style={{position: 'absolute', inset: 0, opacity: board, backgroundImage: 'linear-gradient(rgba(192,198,204,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(192,198,204,.07) 2px, transparent 2px)', backgroundSize: '40px 40px'}} />
    {/* fios emaranhados → trilhas retas */}
    <svg width={PW} height={PH} style={{position: 'absolute', inset: 0, opacity: 1 - lift * .4}}>
      {[0, 1, 2, 3].map((i) => { const m = MODS[i]; const x0 = m[1] + 150, y0 = m[2] + 90; const hub = HUBS[[0, 1, 2, 1][i]]; const x1 = hub[1], y1 = hub[2];
        const wild = `M${x0} ${y0} C ${x0 + 300 * Math.sin(i * 2.1)} ${y0 + 260}, ${x1 - 340 * Math.cos(i * 1.7)} ${y1 - 300}, ${x1} ${y1}`;
        const neat = `M${x0} ${y0} C ${x0} ${(y0 + y1) / 2}, ${x0} ${(y0 + y1) / 2}, ${(x0 + x1) / 2} ${(y0 + y1) / 2} S ${x1} ${(y0 + y1) / 2}, ${x1} ${y1}`;
        return <path key={i} d={order < .5 ? wild : neat} fill="none" stroke={order > .5 ? 'rgba(192,198,204,.55)' : 'rgba(192,198,204,.35)'} strokeWidth={order > .5 ? 5 : 3}
          strokeDasharray={order > .5 ? undefined : '2 0'} opacity={order > .45 && order < .55 ? 0 : 1} />; })}
      {/* gargalo marcado */}
      {(() => { const g = P(t, T.ident + .3, .35, BACK) * (1 - P(t, T.desenv + .1, .3)); return g > 0 ? <g opacity={g}><circle cx="400" cy="520" r={70 * g} fill="none" stroke={C.accent} strokeWidth="6" />
        <text x="400" y="640" textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="34" fill={C.ink}>gargalo</text></g> : null; })()}
      {/* pulsos azuis nas trilhas (integração) */}
      {[0, 1, 2, 3].map((i) => { const k = P(t, T.ia - .2 + i * .12, .4); if (k <= 0 || order < 1) return null; const m = MODS[i]; const hub = HUBS[[0, 1, 2, 1][i]];
        const u = ((t * .9 + i * .27) % 1); const x = lerp(m[1] + 150, hub[1], u), y = lerp(m[2] + 90, hub[2], u);
        return <circle key={'p' + i} cx={x} cy={y} r="10" fill={C.accent} opacity={k} />; })}
    </svg>
    {/* janelas do caos → módulos organizados */}
    {WINS.map((w, i) => {
      const sc = 1 - .0 * scatter, dx = (w.x + w.w / 2 - PW / 2) * .18 * scatter, dy = (w.y + w.h / 2 - PH / 2) * .14 * scatter;
      const target = MODS[i % 4], toMod = i < 4 ? order : 0, gone = i >= 4 ? order : 0;
      const x = lerp(w.x + dx, target[1], toMod), y = lerp(w.y + dy, target[2], toMod), W = lerp(w.w, 300, toMod), H = lerp(w.h, 180, toMod), r = lerp(w.r * (1 + scatter * .6), 0, toMod);
      const lifted = 1 + .06 * lift * (1 - toMod);
      const isHl = hlInfo > 0 ? hlInfo : 0;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: W, height: H, borderRadius: 18, transform: `rotate(${r.toFixed(2)}deg) scale(${lifted.toFixed(3)})`, opacity: 1 - gone,
        background: toMod > .5 ? STEEL_DARK : '#22262B', border: `2px solid ${isHl > .5 || toMod > .9 ? C.accent : 'rgba(192,198,204,.28)'}`, boxShadow: '0 18px 30px rgba(0,0,0,.45)', overflow: 'hidden'}}>
        {toMod < .5 ? <>
          <div style={{height: 40, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', fontFamily: UI, fontWeight: 600, fontSize: 21, color: C.soft, whiteSpace: 'nowrap', overflow: 'hidden'}}>
            {[0, 1, 2].map((d) => <span key={d} style={{width: 10, height: 10, borderRadius: 5, background: 'rgba(192,198,204,.35)'}} />)}<span style={{marginLeft: 6}}>{w.n}</span></div>
          {w.k === 'grid' ? <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 12}}>{[...Array(20)].map((_, j) => <div key={j} style={{height: 26, background: 'rgba(192,198,204,.1)', borderRadius: 3}} />)}</div>
            : <div style={{padding: 16}}>{[...Array(4)].map((_, j) => <div key={j} style={{height: 14, width: `${60 + 35 * hash(i * 9 + j)}%`, marginTop: 14, borderRadius: 7, background: 'rgba(192,198,204,.16)'}} />)}</div>}
        </> : <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px'}}>
          <div style={{width: 18, height: 18, borderRadius: 9, background: C.accent, marginBottom: 14}} />
          <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 38, color: C.ink, letterSpacing: '-.02em'}}>{target[0]}</div></div>}
      </div>; })}
    {/* post-its */}
    {NOTES.map(([n, x, y, r], i) => { const g = 1 - order; if (g <= 0) return null; return <div key={n} style={{position: 'absolute', left: x, top: y + 20 * scatter * (i - 1), width: 210, padding: '18px 18px', background: '#C9CED3',
      color: '#1C1F22', fontFamily: UI, fontWeight: 700, fontSize: 26, transform: `rotate(${r}deg) scale(${(1 + .05 * lift).toFixed(3)})`, opacity: g, boxShadow: '0 12px 20px rgba(0,0,0,.4)'}}>{n}</div>; })}
    {/* tarefa repetida: copiar/colar em loop */}
    {(() => { const a = hlTar; if (a <= 0) return null; const n = 12 + Math.floor((t - T.tarefa) * 6);
      return <div style={{position: 'absolute', left: PW / 2 - 230, top: 400, width: 460, padding: '26px 30px', borderRadius: 26, background: '#2A2F35', border: `3px solid ${C.accent}`, opacity: a, transform: `scale(${(.9 + .1 * a).toFixed(3)})`,
        display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 30px 50px rgba(0,0,0,.6)'}}>
        <svg viewBox="0 0 48 48" width="70" height="70" style={{transform: `rotate(${(t * 220) % 360}deg)`}}><path d="M40 24a16 16 0 11-5-11.6" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" /><path d="M36 4v9h-9" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" /></svg>
        <div><div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: C.ink}}>Copiar · Colar</div><div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.soft}}>de novo × {n}</div></div></div>; })()}
    {/* sistemas que não conversam */}
    {(() => { const a = hlSis; if (a <= 0) return null; const gap = 40 + 20 * Math.sin(t * 6);
      return <div style={{position: 'absolute', left: 60, right: 60, top: 380, height: 240, opacity: a}}>
        {[0, 1].map((k) => <div key={k} style={{position: 'absolute', [k ? 'right' : 'left']: 0, top: 30, width: 250, height: 180, borderRadius: 24, background: STEEL_DARK, border: '2px solid rgba(192,198,204,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: C.ink, boxShadow: '0 24px 40px rgba(0,0,0,.6)'}}>Sistema {k ? 'B' : 'A'}</div>)}
        <div style={{position: 'absolute', left: 250, top: 116, width: (700 - 500) / 2 - gap / 2, height: 8, background: C.silver}} />
        <div style={{position: 'absolute', right: 250, top: 116, width: (700 - 500) / 2 - gap / 2, height: 8, background: C.silver}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center', fontFamily: UI, fontWeight: 700, fontSize: 28, color: C.accent}}>sem conexão</div></div>; })()}
    {/* hubs: IA, automação, integração */}
    {HUBS.map(([n, x, y, tf]) => { const a = P(t, tf() - .15, .45, BACK); if (a <= 0 || order < 1) return null;
      return <div key={n} style={{position: 'absolute', left: x - 120, top: y - 44, width: 240, height: 88, borderRadius: 44, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: '#fff', transform: `scale(${a.toFixed(3)})`, boxShadow: '0 20px 34px rgba(0,0,0,.5)'}}>{n}</div>; })}
    {/* scanner do entender */}
    {t > T.entende - .1 && t < T.entende + 1.2 ? <div style={{position: 'absolute', left: 0, right: 0, top: lerp(-10, PH, P(t, T.entende - .1, 1.1, EASE_IO)), height: 8, background: C.light, opacity: .85}} /> : null}
    <div style={{position: 'absolute', inset: 0, background: '#000', opacity: .45 * dim, pointerEvents: 'none'}} />
  </div>;
};

// ── painel 3D com espessura (lâminas)
const Panel: React.FC<{t: number; ry: number; rx: number; s: number; cy: number}> = ({t, ry, rx, s, cy}) => (
  <div style={{position: 'absolute', left: 540 - PW / 2, top: cy - PH / 2, width: PW, height: PH, perspective: 2600}}>
    <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `scale(${s.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`}}>
      {[...Array(13)].map((_, i) => <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 44, background: i % 3 ? '#5E656C' : '#9AA1A8', transform: `translateZ(${(-12 + i * 2)}px)`}} />)}
      <div style={{position: 'absolute', inset: 0, transform: 'translateZ(14px)', backfaceVisibility: 'hidden'}}><Front t={t} /></div>
      <div style={{position: 'absolute', inset: 0, transform: 'rotateY(180deg) translateZ(14px)', backfaceVisibility: 'hidden'}}><Back t={t} /></div>
    </div>
  </div>
);

// ── logo DME (4 peças que se montam)
const LOGO = [
  'M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z',
  'M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z',
  'M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z',
  'M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z',
];
const FROM = [[-260, 40], [0, -240], [260, -120], [180, 240]];
const Logo: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const w = 600, h = w * 610 / 750;
  return <svg viewBox="0 0 750 610" width={w} height={h} style={{position: 'absolute', left: 540 - w / 2, top: 470, overflow: 'visible'}}>
    <defs><linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" /></linearGradient></defs>
    {LOGO.map((d, i) => { const p = P(t, t0 + i * .1, .55, BACK); return <path key={i} d={d} fill="url(#steel)" stroke="#F2F4F6" strokeOpacity=".35" strokeWidth="1.5"
      opacity={clamp(p * 2)} transform={`translate(${((1 - p) * FROM[i][0]).toFixed(1)} ${((1 - p) * FROM[i][1]).toFixed(1)})`} />; })}
    <text x="14" y="592" fontFamily="Manrope, sans-serif" fontWeight={600} fontSize="64" textLength="722" lengthAdjust="spacing" fill="#C0C6CC" opacity={P(t, t0 + .55, .4)}>TECHNOLOGY</text>
  </svg>;
};

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  // giros: frente → verso (em "bastidores") e verso → frente (em "negócio … frente")
  const flip1 = P(t, T.bast - .35, .85, EASE_IO), flip2 = P(t, T.negocio - .25, .95, EASE_IO);
  const ry = 180 * flip1 + 180 * flip2 + 6 * Math.sin(Math.PI * flip1) * 0;
  const rx = 4 * Math.sin(Math.PI * flip1) + 4 * Math.sin(Math.PI * flip2) + 2.5 * Math.sin(t * .9);
  const light = P(t, T.agora - .03, .2) * (1 - P(t, S.virada.t1 - .35, .5, EASE_IO));
  const zoomOut = P(t, T.prob - .2, .8, EASE_IO) * (1 - P(t, T.agora - .05, .6, EASE_IO));
  const sig = P(t, T.sig - .2, .8, EASE_IO);
  const s = lerp(1, .84, zoomOut) * lerp(1, .92, P(t, S.metodo.t0 - .2, .5) * (1 - P(t, S.fecho.t0, .5))) * (1 - .55 * sig) * (1 + .02 * P(t, -1, 1));
  const cy = lerp(1060, 1120, zoomOut) + lerp(0, 40, P(t, S.metodo.t0 - .2, .5) * (1 - P(t, S.fecho.t0, .5)));
  const bg = `rgb(${[lerp(10, 216, light), lerp(11, 221, light), lerp(12, 226, light)].map(Math.round).join(',')})`;
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(110% 60% at 0% 35%, rgba(38,75,113,${(.5 * (1 - light)).toFixed(2)}) 0%, rgba(38,75,113,0) 60%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(70% 40% at 50% 62%, rgba(192,198,204,${(.07 * (1 - light)).toFixed(3)}) 0%, rgba(0,0,0,0) 70%)`}} />
      {/* sombra de contato do painel */}
      <div style={{position: 'absolute', left: 540 - 380 * s, top: cy + PH / 2 * s + 24, width: 760 * s, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,.55)', filter: 'blur(26px)', opacity: 1 - sig}} />
      {sig < 1 ? <div style={{position: 'absolute', inset: 0, opacity: 1 - sig}}><Panel t={t} ry={ry} rx={rx} s={s} cy={cy} /></div> : null}

      {/* ── texto (zona segura: y 250–1580, margens de 90 px) */}
      <Phrase t={t} tin={-1} tout={T.mas - .3} segs={['Seu cliente', '|', 'vê ', ['isto.']]} size={112} top={260} />
      <Phrase t={t} tin={T.mas - .05} tout={S.flip.t1 - .2} segs={['Nos bastidores,', '|', 'a sua empresa é ', ['isto.']]} size={84} top={270} />
      <Phrase t={t} tin={T.info - .05} tout={T.tarefa - .35} segs={['Informação', '|', ['espalhada.']]} size={104} top={265} />
      <Phrase t={t} tin={T.tarefa - .05} tout={T.sistema - .35} segs={['Tarefa', '|', ['repetida.']]} size={104} top={265} />
      <Phrase t={t} tin={T.sistema - .05} tout={S.trinca.t1 - .15} segs={['Sistema que', '|', 'não ', ['conversa.']]} size={104} top={265} />
      <Phrase t={t} tin={T.prob - .1} tout={T.agora - .3} segs={['O problema não é', '|', 'falta de tecnologia.']} size={76} top={262} />
      <Phrase t={t} tin={T.como - .05} tout={T.agora - .3} segs={['É como o processo', '|', 'está ', ['estruturado.']]} size={76} top={440} />
      <Phrase t={t} tin={T.agora - .02} tout={T.tec - .45} segs={['Agora']} size={250} top={280} dark />
      <Phrase t={t} tin={T.tec - .12} tout={S.virada.t1 - .25} segs={['A tecnologia começa', '|', 'pelo seu ', ['negócio.']]} size={80} top={270} dark />
      <List t={t} items={[['Entender', T.entende], ['Identificar', T.ident], ['Desenvolver', T.desenv]]} tout={S.metodo.t1 - .25} />
      <List t={t} items={[['Inteligência artificial', T.ia], ['Automações', T.auto], ['Sistemas integrados', T.integ]]} tout={S.conecta.t1 - .25} size={58} />
      <Phrase t={t} tin={T.entao - .05} tout={T.o - .35} segs={['Enquanto a tecnologia', '|', 'opera nos ', ['bastidores,']]} size={80} top={270} />
      <Phrase t={t} tin={T.o - .05} tout={S.fecho.t1 - .2} segs={['o seu negócio', '|', 'avança na ', ['frente.']]} size={92} top={265} />

      {/* ── assinatura */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 42%, rgba(38,75,113,.45) 0%, rgba(10,11,12,0) 70%)'}} />
        <Logo t={t} t0={T.sig + .1} />
        <Phrase t={t} tin={T.slogan - .1} tout={99} segs={['Automatizamos processos.', '|', ['Devolvemos tempo.']]} size={66} top={1010} align="center" />
        {(() => { const a = P(t, T.cta - .1, .5, BACK); if (a <= 0) return null;
          return <div style={{position: 'absolute', left: 130, right: 130, top: 1250, padding: '30px 30px 34px', borderRadius: 34, textAlign: 'center', transform: `scale(${a.toFixed(3)})`,
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
