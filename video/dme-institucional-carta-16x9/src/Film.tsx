import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · institucional 16:9 "Por que você abriu a sua empresa?" (59,7 s). Roteiro feito com a skill de copywriting.
 * Texto à esquerda, objetos de aço à direita: porta "ABERTO" (gancho e fecho), almoço com notificação, pastas "só eu sei",
 * escada da empresa × régua dos processos, logo que alinha a régua, fluxo que é entendido → alinhado → desenvolvido
 * (01 ENTENDER, 02 PLANEJAR, 03 DESENVOLVER; IA, AUTOMAÇÃO, INTEGRAÇÃO), provas (CRM e agente de voz) e assinatura sem CTA.
 */
const W = 1920, H = 1080, A = C.accent;
const E = (k: SceneKey) => S[k];
const T = {
  almoco: wt('almoco', 'almoço.'), arquivo: wt('arquivo', 'arquivo.'), unica: wt('arquivo', 'única'),
  cresce: wt('cresce', 'cresce'), processos: wt('cresce', 'processos.'), dme: wt('dme', 'Dê-Eme-É'), ponto: wt('dme', 'ponto.'),
  entende: wt('entender', 'entende'), trava: wt('entender', 'trava'), quem: wt('entender', 'quem', 0),
  mapeia: wt('planejar', 'mapeia'), padroniza: wt('planejar', 'padroniza'),
  desenvolve: wt('desenvolver', 'desenvolve'), ia: wt('desenvolver', 'inteligência'), auto: wt('desenvolver', 'automação'), integ: wt('desenvolver', 'integração'),
  crm: wt('provas', 'Cê-Erre-Eme'), lembrou: wt('provas', 'lembrou.'), agente: wt('provas', 'agente'), atende: wt('provas', 'atende'), sete: wt('provas', 'sete'), passa: wt('provas', 'passa'),
  voltar: wt('fecho', 'voltar'), abrir: wt('fecho', 'abrir'),
  sig: E('assinatura').t0, slogan: wt('assinatura', 'Automatizamos'), dev: wt('assinatura', 'Devolvemos'),
};
const STEEL = 'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, rgba(0,0,0,.05) 1px 3px), linear-gradient(135deg, #2A2E33 0%, #4A5057 38%, #2B3035 64%, #3B4147 100%)';
const STEEL_L = 'repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, rgba(0,0,0,.04) 1px 3px), linear-gradient(135deg, #8E959C 0%, #E3E7EA 34%, #9AA1A8 58%, #C9CED3 82%, #7D848B 100%)';
const BLUE_PLATE = 'linear-gradient(135deg, #2D5584 0%, #3A6EA5 45%, #264B71 100%)';
const SX = 1350, SY = 560; // centro do palco (lado direito)

// janela de cena: entrada e saída suaves do objeto do palco
const win = (t: number, a: number, b: number) => P(t, a - .2, .5, EASE_OUT) * (1 - P(t, b - .3, .4, EASE_IN));
const Stage: React.FC<{o: number; children: React.ReactNode; dx?: number}> = ({o, children, dx = 60}) => o <= 0 ? null :
  <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translateX(${((1 - o) * dx).toFixed(1)}px)`}}>{children}</div>;

// ── porta "ABERTO"
const Porta: React.FC<{t: number; open: number}> = ({t, open}) => {
  const ang = -12 - 58 * open;
  return <div style={{position: 'absolute', left: SX - 170, top: SY - 330, width: 340, height: 620, perspective: 1400}}>
    <div style={{position: 'absolute', inset: -18, border: '18px solid transparent', borderImage: 'linear-gradient(135deg,#8E959C,#E3E7EA,#7D848B) 1', boxShadow: '0 30px 60px rgba(0,0,0,.5)'}} />
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(58,110,165,${(.15 + .55 * open).toFixed(2)}), rgba(38,75,113,${(.1 + .4 * open).toFixed(2)}))`}} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: 'left center', transform: `rotateY(${ang.toFixed(1)}deg)`, background: STEEL, border: '1.5px solid rgba(192,198,204,.45)'}}>
      <div style={{position: 'absolute', right: 30, top: 300, width: 14, height: 70, borderRadius: 7, background: STEEL_L}} />
      <div style={{position: 'absolute', left: 70, top: 120, width: 200, height: 76, borderRadius: 10, background: STEEL_L, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: HEAD, fontWeight: 800, fontSize: 34, letterSpacing: '.14em', color: '#0A0B0C', transform: `rotate(${(Math.sin(t * 1.6) * 1.5).toFixed(2)}deg)`}}>ABERTO</div>
    </div>
    <div style={{position: 'absolute', left: -200, right: -200, top: 638, height: 2, background: 'linear-gradient(90deg, transparent, rgba(192,198,204,.5), transparent)'}} />
  </div>;
};

// ── almoço: prato visto de cima e celular vibrando
const Almoco: React.FC<{t: number}> = ({t}) => {
  const n = P(t, T.almoco - .9, .45, BACK); const vib = n > 0 ? Math.sin(t * 60) * 3 * (1 - P(t, T.almoco + .8, .5)) : 0;
  return <>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <circle cx={SX - 120} cy={SY + 60} r="230" fill="#1C1F22" stroke="rgba(192,198,204,.35)" strokeWidth="3" />
      <circle cx={SX - 120} cy={SY + 60} r="160" fill="none" stroke="rgba(192,198,204,.22)" strokeWidth="2" />
      <path d={`M${SX - 410} ${SY - 80} L${SX - 410} ${SY + 210} M${SX - 425} ${SY - 80} L${SX - 425} ${SY - 10} M${SX - 395} ${SY - 80} L${SX - 395} ${SY - 10}`} stroke="rgba(192,198,204,.55)" strokeWidth="6" strokeLinecap="round" />
      <path d={`M${SX + 165} ${SY - 80} L${SX + 165} ${SY + 210}`} stroke="rgba(192,198,204,.55)" strokeWidth="10" strokeLinecap="round" />
    </svg>
    <div style={{position: 'absolute', left: SX + 230 + vib, top: SY - 80, width: 170, height: 320, borderRadius: 26, background: '#0E1012', border: '5px solid #6E757C', boxShadow: '0 20px 40px rgba(0,0,0,.55)', transform: 'rotate(8deg)'}}>
      <div style={{position: 'absolute', inset: 10, borderRadius: 18, background: n > 0 ? 'linear-gradient(180deg,#1E2A38,#121518)' : '#121518'}} />
    </div>
    {n > 0 ? <div style={{position: 'absolute', left: SX - 40, top: SY - 290, width: 520, padding: '18px 22px', borderRadius: 18, background: 'rgba(36,40,45,.97)', border: '1.5px solid rgba(192,198,204,.3)',
      boxShadow: '0 20px 40px rgba(0,0,0,.5)', opacity: clamp(n * 2), transform: `translateY(${((1 - n) * -30).toFixed(1)}px) scale(${(.9 + .1 * n).toFixed(3)})`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 700, fontSize: 20, color: 'rgba(192,198,204,.75)'}}><span>EQUIPE</span><span>12:31</span></div>
      <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 6}}>Chefe, aprova o orçamento?</div></div> : null}
  </>;
};

// ── pastas: só uma tem a etiqueta "SÓ EU SEI"
const Pastas: React.FC<{t: number}> = ({t}) => {
  const k = P(t, T.unica - .1, .6, BACK);
  return <>{[0, 1, 2, 3, 4].map((i) => { const me = i === 2; const up = me ? k : 0;
    return <div key={i} style={{position: 'absolute', left: SX - 400 + i * 165, top: SY - 120 - 90 * up, width: 140, height: 220, opacity: me ? 1 : 1 - .45 * k}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 60, height: 24, borderRadius: '8px 8px 0 0', background: me && k > .5 ? BLUE_PLATE : STEEL_L}} />
      <div style={{position: 'absolute', left: 0, top: 20, right: 0, bottom: 0, borderRadius: '0 10px 10px 10px', background: me && k > .5 ? BLUE_PLATE : STEEL, border: '1.5px solid rgba(192,198,204,.45)', boxShadow: '0 18px 30px rgba(0,0,0,.45)'}} />
      {me ? <div style={{position: 'absolute', left: -30, right: -30, top: 250, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 24, letterSpacing: '.18em', color: '#fff', opacity: k}}>SÓ EU SEI</div> : null}
      {me && k > 0 ? <svg width="140" height="200" style={{position: 'absolute', left: 0, top: 20, opacity: k}}><rect x="52" y="90" width="36" height="30" rx="5" fill="none" stroke="#fff" strokeWidth="4" /><path d="M58 90 V78 a12 12 0 0 1 24 0 V90" fill="none" stroke="#fff" strokeWidth="4" /></svg> : null}
    </div>; })}</>;
};

// ── empresa (escada) × processos (régua); a DME alinha a régua
const Escada: React.FC<{t: number}> = ({t}) => {
  const bars = [0, 1, 2, 3, 4, 5]; const base = SY + 300, x0 = SX - 420;
  const fix = P(t, T.dme + .2, 1.3, EASE_IO);
  const ruleTop = (i: number) => lerp(base - 60 - Math.min(i, 2) * 30, base - 80 - i * 80, fix);
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {bars.map((i) => { const p = P(t, E('cresce').t0 + .2 + i * .22, .5, BACK); const h = (80 + i * 80) * p;
      return <rect key={i} x={x0 + i * 140} y={base - h} width="110" height={h} rx="6" fill="#2B3035" stroke="rgba(192,198,204,.55)" strokeWidth="2" />; })}
    <text x={x0 + 5 * 140 + 55} y={base - 520} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="20" letterSpacing="3" fill={C.silver} opacity={P(t, E('cresce').t0 + 1.4, .4)}>EMPRESA</text>
    {(() => { const p = P(t, T.processos - .4, .6, EASE_IO); const pts = bars.map((i) => `${x0 + i * 140 + 55},${ruleTop(i).toFixed(1)}`).join(' ');
      return <g opacity={p}><polyline points={pts} fill="none" stroke={fix > .5 ? A : C.ink} strokeWidth="6" strokeLinejoin="round" strokeDasharray={fix > .5 ? undefined : '14 10'} />
        {bars.map((i) => <circle key={i} cx={x0 + i * 140 + 55} cy={ruleTop(i)} r="9" fill={fix > .5 ? '#fff' : C.ink} stroke={fix > .5 ? A : 'none'} strokeWidth="3" />)}
        <text x={x0 + 55} y={ruleTop(0) + 46} fontFamily="Manrope" fontWeight={800} fontSize="20" letterSpacing="3" fill={fix > .5 ? '#DCE8F5' : C.silver}>PROCESSOS</text></g>; })()}
  </svg>;
};

// ── fluxo da operação: entendido (gargalo) → alinhado (planejar) → desenvolvido (selos e pulsos)
const NODES = ['ENTRADA', 'COMERCIAL', 'OPERAÇÃO', 'FINANCEIRO', 'ENTREGA'];
const Fluxo: React.FC<{t: number}> = ({t}) => {
  const al = P(t, T.mapeia - .1, 1.0, EASE_IO), pad = P(t, T.padroniza - .1, .6, EASE_IO);
  const dev = P(t, T.desenvolve - .1, .5);
  const pos = NODES.map((_, i) => ({x: SX - 380 + i * 190, y: SY + 40 + lerp([-90, 70, -30, 110, -60][i], 0, al), r: lerp([-9, 6, -4, 8, -6][i], 0, al), w: lerp([150, 120, 165, 130, 150][i], 160, pad)}));
  const ent = P(t, E('entender').t0 - .1, .6), gar = P(t, T.trava - .1, .4) * (1 - P(t, T.mapeia, .4));
  const plate = (n: string, w: string, a: number, b: number) => { const o = P(t, a - .1, .35) * (1 - P(t, b - .1, .3)); return o > 0 ? <div key={n} style={{position: 'absolute', left: SX - 220, top: 170, width: 440, height: 84, borderRadius: 12,
    background: BLUE_PLATE, border: '1.5px solid rgba(220,232,245,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: o, transform: `translateY(${((1 - o) * -16).toFixed(1)}px)`, boxShadow: '0 16px 30px rgba(0,0,0,.45)'}}>
    <span style={{fontFamily: UI, fontWeight: 800, fontSize: 22, color: '#DCE8F5'}}>{n}</span><span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: '#fff'}}>{w}</span></div> : null; };
  return <>
    {plate('01', 'ENTENDER', E('entender').t0, E('planejar').t0)}{plate('02', 'PLANEJAR', E('planejar').t0, E('desenvolver').t0)}{plate('03', 'DESENVOLVER', E('desenvolver').t0, E('desenvolver').t1 - .2)}
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {pos.slice(1).map((p, i) => { const a = pos[i]; const isG = i === 1; const draw = P(t, E('entender').t0 + .2 + i * .15, .5, EASE_IO);
        return <line key={i} x1={a.x} y1={a.y} x2={lerp(a.x, p.x, draw)} y2={lerp(a.y, p.y, draw)} stroke={dev > .5 ? A : 'rgba(192,198,204,.7)'} strokeWidth={isG && gar > 0 ? lerp(5, 2, gar) : 5} strokeDasharray={isG && gar > .3 ? '6 8' : undefined} />; })}
      {dev >= 1 ? [0, 1, 2].map((k) => { const u = ((t - T.desenvolve) * .3 + k / 3) % 1; const x = lerp(pos[0].x, pos[4].x, u); return <circle key={k} cx={x} cy={pos[0].y} r="10" fill="#fff" stroke={A} strokeWidth="4" />; }) : null}
      {gar > 0 ? (() => { const x = (pos[1].x + pos[2].x) / 2, y = (pos[1].y + pos[2].y) / 2; return <g opacity={gar}><circle cx={x} cy={y} r={42 - 8 * gar} fill="none" stroke={C.ink} strokeWidth="3.5" /><circle cx={x} cy={y} r="5" fill={C.ink} />
        {[0, 90, 180, 270].map((a) => <line key={a} x1={x} y1={y - 48} x2={x} y2={y - 62} stroke={C.ink} strokeWidth="3.5" transform={`rotate(${a} ${x} ${y})`} />)}
        <text x={x} y={y + 90} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize="18" letterSpacing="3" fill={C.ink}>QUEM ESPERA QUEM</text></g>; })() : null}
    </svg>
    {pos.map((p, i) => <div key={i} style={{position: 'absolute', left: p.x - p.w / 2, top: p.y - 34, width: p.w, height: 68, borderRadius: 10, background: dev > .5 ? BLUE_PLATE : STEEL,
      border: `1.5px solid ${dev > .5 ? 'rgba(220,232,245,.6)' : 'rgba(192,198,204,.45)'}`, transform: `rotate(${p.r.toFixed(2)}deg)`, opacity: P(t, E('entender').t0 + i * .12, .4), boxShadow: '0 12px 24px rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 17, letterSpacing: '.1em', color: C.ink}}>{NODES[i]}</div>)}
    {pad > 0 ? <div style={{position: 'absolute', left: SX - 400, width: 800, top: SY + 100, display: 'flex', justifyContent: 'space-between', opacity: pad * (1 - dev)}}>
      {NODES.map((n) => <span key={n} style={{width: 150, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 16, letterSpacing: '.16em', color: A}}>= PADRÃO =</span>)}</div> : null}
    {[['IA', T.ia], ['AUTOMAÇÃO', T.auto], ['INTEGRAÇÃO', T.integ]].map(([l, ta], i) => { const p = P(t, (ta as number) - .15, .45, BACK); if (p <= 0) return null;
      return <div key={l as string} style={{position: 'absolute', left: SX - 330 + i * 230, top: SY + 150, width: 200, height: 64, borderRadius: 32, background: STEEL_L, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: UI, fontWeight: 800, fontSize: 20, letterSpacing: '.14em', color: '#0A0B0C', opacity: clamp(p * 2), transform: `scale(${(.7 + .3 * p).toFixed(3)})`, boxShadow: '0 12px 24px rgba(0,0,0,.4)'}}>{l}</div>; })}
    {ent > 0 ? null : null}
  </>;
};

// ── provas: CRM e agente de voz (componentes ampliados)
const Card: React.FC<{top: number; a: number; head: [string, string]; line: string; chips: Array<[string, number, boolean]>; t: number}> = ({top, a, head, line, chips, t}) =>
  <div style={{position: 'absolute', left: SX - 380, top, width: 760, padding: '22px 28px', borderRadius: 18, background: 'rgba(36,40,45,.97)', border: '1.5px solid rgba(192,198,204,.3)', boxShadow: '0 22px 44px rgba(0,0,0,.5)',
    opacity: clamp(a * 2), transform: `translateY(${((1 - a) * 30).toFixed(1)}px)`}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 800, fontSize: 20, letterSpacing: '.16em', color: 'rgba(192,198,204,.75)'}}><span>{head[0]}</span><span>{head[1]}</span></div>
    <div style={{fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.ink, margin: '10px 0 16px'}}>{line}</div>
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>{chips.map(([c, tc, ok]) => { const p = P(t, tc, .35, BACK); return p > 0 ? <span key={c} style={{fontFamily: UI, fontWeight: 800, fontSize: 20, letterSpacing: '.12em', padding: '9px 16px', borderRadius: 8,
      background: ok ? A : 'rgba(192,198,204,.14)', color: '#fff', border: `1.5px solid ${ok ? A : 'rgba(192,198,204,.4)'}`, opacity: clamp(p * 2), transform: `scale(${(.85 + .15 * p).toFixed(3)})`}}>{ok ? '✓ ' : ''}{c}</span> : null; })}</div>
  </div>;

// ── tipografia
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size?: number; top?: number; left?: number; width?: number; align?: 'left' | 'center'; color?: string}> = ({t, tin, tout, segs, size = 62, top = 330, left = 120, width = 720, align = 'left', color = C.ink}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.1, letterSpacing: '-.025em', color,
    opacity: 1 - q, transform: `translateY(${(-24 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, ac], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: ac ? A : undefined, opacity: p, transform: `translateY(${((1 - p) * 26).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(1)}px)` : undefined}}>{w}</span>; })}
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
const Logo: React.FC<{t: number; t0: number; w: number; x: number; y: number; text?: boolean}> = ({t, t0, w, x, y, text = true}) => (
  <svg viewBox="0 0 750 610" width={w} height={w * 610 / 750} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" /></linearGradient></defs>
    {LOGO.map((d, i) => { const p = P(t, t0 + i * .1, .55, BACK); return <path key={i} d={d} fill="url(#lg)" stroke="#F2F4F6" strokeOpacity=".35" strokeWidth="1.5"
      opacity={clamp(p * 2)} transform={`translate(${((1 - p) * FROM[i][0]).toFixed(1)} ${((1 - p) * FROM[i][1]).toFixed(1)})`} />; })}
    {text ? <text x="14" y="592" fontFamily="Manrope, sans-serif" fontWeight={600} fontSize="64" textLength="722" lengthAdjust="spacing" fill="#C0C6CC" opacity={P(t, t0 + .55, .4)}>TECHNOLOGY</text> : null}
  </svg>
);

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const g = E('gancho'), al = E('almoco'), ar = E('arquivo'), cr = E('cresce'), dm = E('dme'), en = E('entender'), de = E('desenvolver'), pv = E('provas'), fe = E('fecho');
  const sig = P(t, T.sig - .15, .6, EASE_IO);
  const portaA = t < al.t0 ? 1 - P(t, g.t1 - .3, .4, EASE_IN) : P(t, fe.t0 - .2, .5) * (1 - sig);
  const portaOpen = t < al.t0 ? .15 * P(t, .2, 1.4, EASE_IO) : .15 + .85 * P(t, T.abrir - .3, 1.2, EASE_IO);
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.035) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(45% 70% at 70% 52%, rgba(38,75,113,.32) 0%, rgba(10,11,12,0) 70%)'}} />
      <div style={{position: 'absolute', left: 120, top: 80, fontFamily: UI, fontWeight: 700, fontSize: 18, letterSpacing: '.26em', color: 'rgba(192,198,204,.6)', opacity: 1 - sig}}>DME TECHNOLOGY · PARA QUEM TEM UMA EMPRESA</div>

      <Stage o={portaA}><Porta t={t} open={portaOpen} /></Stage>
      <Stage o={win(t, al.t0, al.t1)}><Almoco t={t} /></Stage>
      <Stage o={win(t, ar.t0, ar.t1)}><Pastas t={t} /></Stage>
      <Stage o={win(t, cr.t0, dm.t1)}><Escada t={t} /></Stage>
      {(() => { const o = P(t, T.dme - .2, .5, BACK) * (1 - P(t, dm.t1 - .3, .4)); return o > 0 ? <div style={{opacity: clamp(o * 2)}}><Logo t={t} t0={T.dme - .2} w={170} x={SX + 260} y={170} text={false} /></div> : null; })()}
      <Stage o={win(t, en.t0, de.t1)}><div style={{position: 'absolute', inset: 0, transform: 'scale(1.18)', transformOrigin: `${SX}px ${SY}px`}}><Fluxo t={t} /></div></Stage>
      <Stage o={win(t, pv.t0, pv.t1)}>
        <div style={{position: 'absolute', left: SX - 380, top: 140, fontFamily: UI, fontWeight: 700, fontSize: 18, letterSpacing: '.24em', color: 'rgba(192,198,204,.6)'}}>EXEMPLO ILUSTRATIVO</div>
        <Card t={t} top={190} a={P(t, T.crm - .3, .45)} head={['CRM · RETORNOS', 'QUI · 10:00']} line="Retornar para Marina · Loja Centro" chips={[['RETORNO ENVIADO', T.lembrou - .2, true]]} />
        <Card t={t} top={520} a={P(t, T.agente - .3, .45)} head={['AGENTE DE VOZ COM IA', '19:07']} line="Chamada recebida fora do horário" chips={[['ATENDIDA', T.atende, true], ['QUALIFICADA', T.sete, true], ['TRANSFERIDA PARA COMERCIAL', T.passa, true]]} />
      </Stage>

      {/* ── textos (coluna esquerda) */}
      <Phrase t={t} tin={-1} tout={g.t1 - .25} segs={['Você lembra', '|', 'por que abriu', '|', ['a sua empresa?']]} size={84} top={300} />
      <Phrase t={t} tin={al.t0 + .05} tout={al.t1 - .25} segs={['Provavelmente', '|', 'não foi pra responder', '|', 'mensagem no ', ['almoço.']]} size={58} top={340} />
      <Phrase t={t} tin={ar.t0 + .05} tout={ar.t1 - .25} segs={['Nem pra ser a única', '|', 'pessoa que sabe onde', '|', 'fica ', ['cada arquivo.']]} size={58} top={340} />
      <Phrase t={t} tin={cr.t0 + .05} tout={cr.t1 - .25} segs={['A empresa cresce', '|', 'mais rápido que', '|', 'os ', ['processos.']]} size={62} top={340} />
      <Phrase t={t} tin={dm.t0 + .3} tout={dm.t1 - .25} segs={['A ', ['DME'], ' trabalha', '|', 'exatamente', '|', 'nesse ponto.']} size={66} top={340} />
      <Phrase t={t} tin={en.t0 + .05} tout={en.t1 - .25} segs={['Entender onde', '|', 'a operação ', ['trava'], '|', 'e quem espera quem.']} size={56} top={340} />
      <Phrase t={t} tin={E('planejar').t0 + .05} tout={E('planejar').t1 - .25} segs={['Mapear e', '|', ['padronizar'], '|', 'cada etapa.']} size={66} top={340} />
      <Phrase t={t} tin={de.t0 + .05} tout={de.t1 - .25} segs={['Desenvolver', '|', 'a solução', '|', ['sob medida.']]} size={66} top={340} />
      <Phrase t={t} tin={T.crm - .2} tout={T.agente - .45} segs={['O retorno que', '|', ['ninguém lembrou.']]} size={62} top={340} />
      <Phrase t={t} tin={T.agente - .2} tout={pv.t1 - .25} segs={['O cliente das', '|', ['sete da noite.']]} size={62} top={340} />
      <Phrase t={t} tin={fe.t0 + .1} tout={T.sig - .3} segs={['Pra você voltar', '|', 'a cuidar do que fez', '|', 'você ', ['abrir a empresa.']]} size={60} top={330} />

      {/* ── assinatura (sem CTA) */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 50% 45%, rgba(38,75,113,.55) 0%, rgba(10,11,12,.97) 80%)'}} />
        <Logo t={t} t0={T.sig + .05} w={480} x={960 - 240} y={240} />
        <Phrase t={t} tin={T.slogan - .1} tout={99} segs={['Automatizamos processos.']} size={56} top={720} left={260} width={1400} align="center" color={C.silver} />
        <Phrase t={t} tin={T.dev - .1} tout={99} segs={[['Devolvemos tempo.']]} size={56} top={792} left={260} width={1400} align="center" color={C.silver} />
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
