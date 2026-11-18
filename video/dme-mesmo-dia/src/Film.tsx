import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, keyed, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "Mesmo dia" (9:16, 60 s). Duas empresas iguais, o mesmo dia, o mesmo relógio: o painel de cima (EMPRESA A · SEM
 * PROCESSO) acumula pendências; o de baixo (EMPRESA B · COM PROCESSO) resolve os mesmos acontecimentos com integração de
 * sistemas, CRM com retorno automático e agente de voz com IA (só fatos confirmados). Depois: "A diferença é o processo.",
 * método Entender → Planejar → Desenvolver, a pergunta "De que lado está a sua empresa?" (loop) e a assinatura.
 * Tudo é função do quadro (t = frame / 30); os tempos vêm das palavras reais da locução.
 */
const W = 1080, H = 1920, A = C.accent;
const E = (k: SceneKey) => S[k];
const T = {
  oito: wt('pedido', 'Oito'), chega: wt('pedido', 'Chega'), digitado: wt('pedido2', 'digitado'), integrados: wt('pedido2', 'integrados.'), outro1: wt('pedido2', 'Do'),
  dez: wt('proposta', 'Dez'), proposta: wt('proposta', 'proposta'), retornoP: wt('proposta', 'retorno'),
  quatro: wt('retorno', 'Quatro'), depende: wt('retorno', 'depende'), lembrar: wt('retorno', 'lembrar.'), crm: wt('retorno', 'Cê-Erre-Eme'), auto: wt('retorno', 'automático.'),
  sete: wt('ligacao', 'Sete'), liga: wt('ligacao', 'liga.'), caixa: wt('ligacao2', 'caixa'), agente: wt('ligacao2', 'agente'),
  v: [wt('ligacao2', 'atende,'), wt('ligacao2', 'qualifica,'), wt('ligacao2', 'registra'), wt('ligacao2', 'passa')],
  mesmo: wt('diferenca', 'Mesmo'), dif: wt('diferenca', 'A'), processo: wt('diferenca', 'processo.'),
  dme: wt('metodo', 'Dê-Eme-É'), ent: wt('metodo', 'entende'), plan: wt('metodo', 'planeja'), des: wt('metodo', 'desenvolve'), sob: wt('metodo', 'sob'),
  lado: wt('pergunta', 'De'), sig: E('assinatura').t0, envie: wt('assinatura', 'Envie'),
};
const STEEL = 'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, rgba(0,0,0,.05) 1px 3px), linear-gradient(135deg, #2A2E33 0%, #4A5057 38%, #2B3035 64%, #3B4147 100%)';
const BLUE_PLATE = 'linear-gradient(135deg, #2D5584 0%, #3A6EA5 45%, #264B71 100%)';

// ── relógio do dia (minutos desde 00:00), rolando rápido entre os horários da fala
const clockMin = (t: number) => keyed(t, [[0, 480], [T.oito - .8, 480], [T.oito + .1, 492], [T.dez - .8, 492], [T.dez + .1, 630], [T.quatro - .8, 630], [T.quatro + .1, 960], [T.sete - .8, 960], [T.sete + .1, 1147]])[0];
const hhmm = (m: number) => { const h = Math.floor(m / 60), mm = Math.floor(m % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
const DAY0 = 7.5 * 60, DAY1 = 20 * 60;

// ── estações (iguais nos dois painéis)
const ST = ['PEDIDO', 'SISTEMAS', 'PROPOSTA', 'ATENDIMENTO'];
const SX = [170, 410, 650, 890];
const Glyph: React.FC<{k: number; col: string}> = ({k, col}) => {
  const s = {fill: 'none', stroke: col, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  if (k === 0) return <g {...s}><path d="M-14 -20 H8 L16 -12 V20 H-14 Z" /><path d="M-7 -4 H9 M-7 4 H9 M-7 12 H3" /></g>;
  if (k === 1) return <g {...s}><rect x="-20" y="-20" width="26" height="20" rx="3" /><rect x="-6" y="0" width="26" height="20" rx="3" /></g>;
  if (k === 2) return <g {...s}><path d="M-14 -20 H8 L16 -12 V20 H-14 Z" /><path d="M-7 4 L-1 10 L10 -3" /></g>;
  return <g {...s}><path d="M-15 -14 C-15 -18 -12 -20 -9 -20 L-4 -20 L0 -9 L-5 -5 C-2 2 3 7 9 10 L13 5 L24 9 L24 14 C24 17 22 20 18 20 C2 20 -15 3 -15 -14 Z" transform="translate(-4 0)" /></g>;
};

type Side = 'A' | 'B';
// estado de cada painel em t: posição do item, rótulos e pendências
const EVENTS = (side: Side) => [
  {t: T.chega - .1, hora: '08:12', titulo: 'Pedido recebido', status: side === 'A' ? ['DIGITADO EM 2 SISTEMAS', T.digitado] : ['SISTEMAS INTEGRADOS', T.integrados - .2], ok: side === 'B'},
  {t: T.proposta - .1, hora: '10:30', titulo: 'Proposta enviada · retorno à tarde', status: ['AGUARDANDO RETORNO', T.retornoP], ok: false, neutro: true},
  {t: T.quatro - .1, hora: '16:00', titulo: 'Hora do retorno ao cliente', status: side === 'A' ? ['DEPENDE DE ALGUÉM LEMBRAR', T.depende] : ['CRM · RETORNO AUTOMÁTICO', T.crm], ok: side === 'B'},
  {t: T.sete - .1, hora: '19:07', titulo: 'Cliente liga fora do horário', status: side === 'A' ? ['CAIXA POSTAL', T.caixa] : ['AGENTE DE VOZ COM IA', T.agente - .1], ok: side === 'B'},
] as Array<{t: number; hora: string; titulo: string; status: [string, number]; ok: boolean; neutro?: boolean}>;
const PEND = [T.digitado + .2, T.lembrar, T.caixa + .3];

const Panel: React.FC<{t: number; side: Side; top: number; dim: number}> = ({t, side, top, dim}) => {
  const isB = side === 'B', col = isB ? A : C.silver;
  const evs = EVENTS(side); const cur = evs.reduce((m, e, i) => (t >= e.t ? i : m), -1);
  const pend = isB ? 0 : PEND.filter((x) => t >= x).length;
  const pendPop = isB ? 0 : Math.max(0, ...PEND.map((x) => (t >= x ? 1 - P(t, x, .5) : 0)));
  // item (token): estação ativa e movimento
  const stOf = [1, 2, 2, 3]; const from = cur <= 0 ? 0 : stOf[cur - 1];
  const mv = cur < 0 ? 0 : P(t, evs[cur].t + .15, .9, EASE_IO);
  const tokX = cur < 0 ? SX[0] : lerp(cur === 0 ? SX[0] : SX[from], SX[stOf[cur]], mv);
  const stuck = !isB && cur >= 0 && !evs[cur].neutro && t >= evs[cur].status[1];
  const shake = stuck ? Math.sin(t * 40) * 3 * (1 - P(t, evs[cur].status[1] + .4, .4)) : 0;
  const trackY = 150;
  const fill = isB ? clamp((tokX - SX[0]) / (SX[3] - SX[0])) : 0;
  return <div style={{position: 'absolute', left: 60, top, width: 960, height: 420, borderRadius: 18, border: `1.5px solid ${isB ? 'rgba(58,110,165,.65)' : 'rgba(192,198,204,.32)'}`,
    background: isB ? 'linear-gradient(180deg, rgba(38,75,113,.22), rgba(28,31,34,.85))' : 'rgba(28,31,34,.85)', opacity: 1 - .55 * dim, overflow: 'hidden'}}>
    {/* cabeçalho */}
    <div style={{position: 'absolute', left: 30, right: 30, top: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{fontFamily: UI, fontWeight: 800, fontSize: 24, letterSpacing: '.18em', color: isB ? '#DCE8F5' : C.silver}}>
        EMPRESA {side} <span style={{color: isB ? A : 'rgba(192,198,204,.55)'}}>· {isB ? 'COM PROCESSO' : 'SEM PROCESSO'}</span></div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: UI, fontWeight: 700, fontSize: 20, letterSpacing: '.16em', color: 'rgba(192,198,204,.7)'}}>
        PENDÊNCIAS<span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: isB ? '#DCE8F5' : C.ink, display: 'inline-block', minWidth: 30, textAlign: 'center', transform: `scale(${(1 + .35 * pendPop).toFixed(3)})`}}>{pend}</span></div>
    </div>
    {/* trilho e estações */}
    <svg width="960" height="420" style={{position: 'absolute', inset: 0}}>
      <line x1={SX[0] - 60} y1={trackY} x2={SX[3] - 60} y2={trackY} stroke="rgba(192,198,204,.22)" strokeWidth="4" strokeDasharray={isB ? undefined : '10 10'} />
      {isB ? <line x1={SX[0] - 60} y1={trackY} x2={lerp(SX[0], SX[3], fill) - 60} y2={trackY} stroke={A} strokeWidth="5" /> : null}
      {ST.map((n, k) => { const act = cur >= 0 && stOf[cur] === k && mv > .7;
        return <g key={n} transform={`translate(${SX[k] - 60} ${trackY})`}>
          <rect x="-48" y="-48" width="96" height="96" rx="16" fill={act && isB ? '#264B71' : '#22262B'} stroke={act ? col : 'rgba(192,198,204,.35)'} strokeWidth={act ? 3 : 1.5} />
          <Glyph k={k} col={act ? (isB ? '#fff' : C.ink) : 'rgba(192,198,204,.6)'} />
          <text y="78" textAnchor="middle" fontFamily="Manrope" fontWeight={700} fontSize="17" letterSpacing="2.2" fill={act ? C.ink : 'rgba(192,198,204,.55)'}>{n}</text></g>; })}
      {/* toque do telefone às 19:07 */}
      {cur === 3 ? [0, 1, 2].map((i) => { const k = ((t - T.sete) * 1.2 + i / 3) % 1; const on = isB ? 1 - P(t, T.agente, .4) : 1 - P(t, T.caixa, .4);
        return <circle key={i} cx={SX[3] - 60} cy={trackY} r={52 + 40 * k} fill="none" stroke={col} strokeWidth="2.5" opacity={(1 - k) * on} />; }) : null}
      {/* item */}
      {cur >= 0 ? <g transform={`translate(${tokX - 60 + shake} ${trackY - 70})`}>
        <rect x="-15" y="-15" width="30" height="30" rx="4" transform="rotate(45)" fill={stuck ? '#7D848B' : isB && evs[cur].ok && t >= evs[cur].status[1] ? '#fff' : C.silver} stroke={isB ? A : '#0A0B0C'} strokeWidth="3" />
        {stuck && cur === 0 ? <rect x="-15" y="-15" width="30" height="30" rx="4" transform="translate(16 -10) rotate(45)" fill="#7D848B" stroke="#0A0B0C" strokeWidth="3" /> : null}</g> : null}
    </svg>
    {/* cartão do acontecimento */}
    {evs.map((e, i) => { const a = P(t, e.t, .35) * (i < evs.length - 1 ? 1 - P(t, evs[i + 1].t - .1, .25) : 1); if (a <= 0) return null;
      const s = P(t, e.status[1], .35, BACK);
      return <div key={i} style={{position: 'absolute', left: 30, right: 30, top: 270, opacity: a, transform: `translateY(${((1 - a) * 16).toFixed(1)}px)`, display: 'flex', alignItems: 'center', gap: 20}}>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: isB ? '#DCE8F5' : C.ink, letterSpacing: '-.01em'}}>{e.hora}</span>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <span style={{fontFamily: UI, fontWeight: 700, fontSize: 26, color: 'rgba(242,244,246,.85)'}}>{e.titulo}</span>
          <span style={{alignSelf: 'flex-start', fontFamily: UI, fontWeight: 800, fontSize: 20, letterSpacing: '.14em', padding: '8px 14px', borderRadius: 6, opacity: clamp(s * 2), transform: `scale(${(.9 + .1 * s).toFixed(3)})`, transformOrigin: 'left',
            color: e.ok ? '#fff' : C.ink, background: e.ok ? A : e.neutro ? 'rgba(192,198,204,.12)' : 'repeating-linear-gradient(45deg, rgba(192,198,204,.18) 0 8px, rgba(192,198,204,.06) 8px 16px)',
            border: `1.5px solid ${e.ok ? A : 'rgba(192,198,204,.5)'}`}}>{e.ok ? '✓ ' : ''}{e.status[0]}</span>
        </div></div>; })}
    {/* verbos do agente (painel B) */}
    {isB ? (() => { const o = P(t, T.v[0] - .3, .3) * (1 - P(t, E('ligacao2').t1 - .2, .3)); if (o <= 0) return null;
      return <div style={{position: 'absolute', left: 30, right: 30, top: 364, display: 'flex', gap: 10, opacity: o}}>
        {['ATENDE', 'QUALIFICA', 'REGISTRA NO CRM', 'PASSA PARA A EQUIPE'].map((w, i) => { const on = P(t, T.v[i] - .05, .25);
          return <span key={w} style={{fontFamily: UI, fontWeight: 800, fontSize: 17, letterSpacing: '.1em', padding: '7px 11px', borderRadius: 6, border: `1.5px solid ${on > .5 ? A : 'rgba(192,198,204,.3)'}`, background: on > .5 ? 'rgba(58,110,165,.35)' : 'transparent', color: on > .5 ? '#fff' : 'rgba(192,198,204,.45)'}}>{w}</span>; })}
      </div>; })() : null}
    {/* carimbo de fim de dia */}
    {(() => { const k = P(t, E('diferenca').t0 - .2, .45, BACK); if (k <= 0) return null;
      return <div style={{position: 'absolute', right: 30, top: 290, padding: '10px 18px', borderRadius: 8, border: `2.5px solid ${isB ? A : C.silver}`, fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: '.16em',
        color: isB ? '#DCE8F5' : C.ink, background: isB ? 'rgba(58,110,165,.25)' : 'rgba(10,11,12,.6)', opacity: clamp(k * 2), transform: `rotate(-3deg) scale(${(1.3 - .3 * k).toFixed(3)})`}}>{isB ? 'DIA FECHADO' : `${pend} PENDÊNCIAS PARA AMANHÃ`}</div>; })()}
  </div>;
};

// ── faixa do relógio
const Clock: React.FC<{t: number; o: number}> = ({t, o}) => {
  if (o <= 0) return null;
  const m = clockMin(t), u = (m - DAY0) / (DAY1 - DAY0);
  const marks = [[492, T.chega], [630, T.proposta], [960, T.quatro], [1147, T.sete]];
  return <div style={{position: 'absolute', left: 60, top: 548, width: 960, height: 110, opacity: o}}>
    <div style={{position: 'absolute', left: 0, top: 6, fontFamily: HEAD, fontWeight: 800, fontSize: 88, letterSpacing: '-.02em', color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{hhmm(m)}</div>
    <svg width="960" height="110" style={{position: 'absolute', inset: 0}}>
      <line x1="320" y1="62" x2="940" y2="62" stroke="rgba(192,198,204,.3)" strokeWidth="3" />
      <line x1="320" y1="62" x2={320 + 620 * u} y2="62" stroke={C.silver} strokeWidth="5" />
      {[8, 10, 12, 14, 16, 18, 20].map((h) => { const x = 320 + 620 * (h * 60 - DAY0) / (DAY1 - DAY0); return <g key={h}><line x1={x} y1="54" x2={x} y2="70" stroke="rgba(192,198,204,.5)" strokeWidth="2" />
        <text x={x} y="98" textAnchor="middle" fontFamily="Manrope" fontWeight={700} fontSize="17" fill="rgba(192,198,204,.6)">{`${h}h`}</text></g>; })}
      {marks.map(([mm, ta], i) => { const x = 320 + 620 * (mm - DAY0) / (DAY1 - DAY0), p = P(t, ta - .1, .35, BACK); return p > 0 ? <circle key={i} cx={x} cy="62" r={9 * p} fill={A} stroke="#fff" strokeWidth="2" /> : null; })}
      <circle cx={320 + 620 * u} cy="62" r="11" fill="#fff" />
    </svg>
  </div>;
};

// ── tipografia
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size?: number; top?: number; left?: number; width?: number; align?: 'left' | 'center'; color?: string}> = ({t, tin, tout, segs, size = 72, top = 300, left = 90, width = 900, align = 'left', color = C.ink}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: '-.025em', color,
    opacity: 1 - q, transform: `translateY(${(-26 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, acc], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? A : undefined, opacity: p, transform: `translateY(${((1 - p) * 28).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};

// ── método: três placas de aço
const Metodo: React.FC<{t: number}> = ({t}) => {
  const m = E('metodo'); const a = P(t, m.t0 - .1, .4) * (1 - P(t, m.t1 - .3, .3)); if (a <= 0) return null;
  const plates: Array<[string, string, number]> = [['01', 'ENTENDER', T.ent], ['02', 'PLANEJAR', T.plan], ['03', 'DESENVOLVER', T.des]];
  const line = P(t, T.ent - .1, T.des - T.ent + .6, EASE_IO);
  return <AbsoluteFill style={{opacity: a}}>
    {plates.map(([n, w, ta], i) => { const p = P(t, ta - .25, .5, BACK), on = P(t, ta - .05, .25);
      return <div key={w} style={{position: 'absolute', left: 150, top: 760 + i * 220, width: 840, height: 170, borderRadius: 14, opacity: clamp(p * 2),
        transform: `perspective(1200px) rotateX(${((1 - p) * 40).toFixed(1)}deg) translateY(${((1 - p) * 40).toFixed(1)}px)`, background: on > .5 ? BLUE_PLATE : STEEL,
        border: '1.5px solid rgba(192,198,204,.5)', boxShadow: '0 24px 40px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', gap: 34, paddingLeft: 48}}>
        <span style={{fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: '.1em', color: 'rgba(242,244,246,.7)'}}>{n}</span>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 68, letterSpacing: '-.01em', color: C.ink}}>{w}</span></div>; })}
    {line > 0 ? <div style={{position: 'absolute', left: 108, top: 790, width: 6, height: 560 * line, background: A, borderRadius: 3}} /> : null}
    {(() => { const s = P(t, T.sob - .1, .4, BACK); return s > 0 ? <div style={{position: 'absolute', left: 150, top: 1440, fontFamily: UI, fontWeight: 800, fontSize: 32, letterSpacing: '.22em', color: A, opacity: s}}>SOLUÇÃO SOB MEDIDA</div> : null; })()}
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

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const dif = E('diferenca'), met = E('metodo'), pg = E('pergunta');
  // painéis: dia inteiro; somem no método; voltam compactos na pergunta
  const panelsOut = P(t, met.t0 - .2, .5, EASE_IN), panelsBack = P(t, pg.t0 - .1, .5, EASE_OUT) * (1 - P(t, T.sig - .2, .4, EASE_IN));
  const pv = t < pg.t0 - .2 ? 1 - panelsOut : panelsBack;
  const dimA = P(t, T.dif - .1, .5) * (t < met.t0 ? 1 : 0);
  const slide = t < pg.t0 - .2 ? panelsOut * 260 : (1 - panelsBack) * 260;
  const sig = P(t, T.sig - .15, .6, EASE_IO);
  const qA = t >= pg.t0 ? P(t, T.lado + .6, .4, BACK) : 0;
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.04) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 60%, rgba(38,75,113,.28) 0%, rgba(10,11,12,0) 70%)'}} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 250, display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 700, fontSize: 19, letterSpacing: '.24em', color: 'rgba(192,198,204,.6)', opacity: 1 - sig}}>
        <span>UM DIA DE OPERAÇÃO</span><span>EXEMPLO ILUSTRATIVO</span></div>

      <Clock t={t} o={(1 - P(t, T.dif - .2, .35)) * (1 - sig)} />
      {pv > 0 ? <div style={{position: 'absolute', inset: 0, opacity: pv, transform: `translateY(${slide.toFixed(1)}px)`}}>
        <Panel t={Math.min(t, met.t0)} side="A" top={690} dim={dimA} />
        <Panel t={Math.min(t, met.t0)} side="B" top={1135} dim={0} />
        {qA > 0 ? ['A', 'B'].map((s, i) => <div key={s} style={{position: 'absolute', right: 96, top: 690 + i * 445 + 300, width: 92, height: 92, borderRadius: 46, border: `3px solid ${i ? A : C.silver}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: i ? A : C.ink, background: '#0A0B0C', transform: `scale(${qA.toFixed(3)})`}}>{s}</div>) : null}
      </div> : null}
      <Metodo t={t} />

      {/* ── textos */}
      <Phrase t={t} tin={-1} tout={E('gancho').t1 - .25} segs={['Mesma empresa.', '|', 'Mesmo dia.', '|', ['Uma diferença.']]} size={64} top={296} />
      <Phrase t={t} tin={T.oito - .1} tout={E('pedido2').t1 - .3} segs={['Chega um ', ['pedido.']]} size={72} top={330} />
      <Phrase t={t} tin={T.dez - .1} tout={E('proposta').t1 - .3} segs={['A ', ['proposta'], ' sai.']} size={72} top={330} />
      <Phrase t={t} tin={T.quatro - .1} tout={E('retorno').t1 - .3} segs={['Hora do ', ['retorno.']]} size={72} top={330} />
      <Phrase t={t} tin={T.sete - .1} tout={E('ligacao2').t1 - .3} segs={['Um cliente ', ['liga.']]} size={72} top={330} />
      <Phrase t={t} tin={T.mesmo - .1} tout={dif.t1 - .25} segs={['Mesmo esforço.']} size={72} top={300} />
      <Phrase t={t} tin={T.dif - .1} tout={dif.t1 - .25} segs={['A diferença é', '|', 'o ', ['processo.']]} size={72} top={390} />
      <Phrase t={t} tin={T.dme - .2} tout={met.t1 - .3} segs={['A ', ['DME'], ' entende,', '|', 'planeja e desenvolve.']} size={66} top={330} />
      <Phrase t={t} tin={T.lado - .1} tout={pg.t1 - .2} segs={['De que lado está', '|', ['a sua empresa?']]} size={74} top={320} />

      {/* ── assinatura */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 45%, rgba(38,75,113,.55) 0%, rgba(10,11,12,.95) 80%)'}} />
        <Logo t={t} t0={T.sig + .05} w={560} x={540 - 280} y={520} />
        <Phrase t={t} tin={T.sig + .6} tout={99} segs={['Automatizamos processos.']} size={52} top={1060} align="center" color={C.silver} />
        <Phrase t={t} tin={T.sig + .8} tout={99} segs={['Devolvemos tempo.']} size={52} top={1126} align="center" color={C.silver} />
        <Phrase t={t} tin={T.envie - .1} tout={99} segs={['Envie ', ['COMERCIAL'], '|', 'no direct.']} size={76} top={1270} align="center" />
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
