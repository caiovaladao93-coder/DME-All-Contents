import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C} from './theme/colors';
import {SERIF, SANS, APOIO} from './theme/typography';
import {BrandMark, Selo} from './components/Brand';
import {loadFonts} from './components/Fonts';
import PAL from './data/palavras.json';

/*
 * ADV Station · anúncio vertical v2 COMERCIAL (formato "produto em uso" da referência do usuário).
 * Gancho em pergunta (aprovado), título que muda a cada benefício com entrada de impacto, janela do sistema com as telas
 * REAIS do "Escritório Demonstração" (dados fictícios), cursor e cliques simulados (aprovado), faixa "DADOS DEMONSTRATIVOS",
 * selos só com funções reais (sem números nem preço) e CTA aprovado: "Acesse advstation.io e veja na prática."
 */
loadFonts();
const PW = PAL as Array<{w: string; a: number; b: number}>;
const W = (i: number) => PW[i].a;
export const DUR = Math.round((PW[PW.length - 1].b + 1.9) * 30) / 30;

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const punch = Easing.bezier(0.2, 1.4, 0.4, 1);
const ramp = (t: number, a: number, d: number, e = ease) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

// ── tempos (palavras da narração) ────────────────────────────────────────────────────────────────
const T_JAN = W(10) - .2;                // a janela entra em "Com a ADV Station"
const T_PROTO = W(29) + .1;              // clique em "Protocolo" ("Um clique")
const T_TROCA = W(40) - .25;             // clique em "Trocar de sistema" ("Os prazos...")
const T_DASH = W(57) + .05;              // clique em "Dashboard" ("E o dashboard")
const T_PROD = W(69) - .2;               // os dois produtos
const T_CTA = W(78) - .15;               // "Acesse advstation.io"
const CLIQUES = [T_PROTO, T_TROCA, T_DASH];

type Tela = {src: string; w: number; h: number};
const TELAS: Record<string, Tela> = {
  clientes: {src: 'assets/telas/ml-clientes.png', w: 1915, h: 1075},
  protocolo: {src: 'assets/telas/ml-protocolo.png', w: 2000, h: 1121},
  prazos: {src: 'assets/telas/pg-prazos.png', w: 2000, h: 1124},
  dashboard: {src: 'assets/telas/pg-dashboard.png', w: 2000, h: 1124},
};
const telaDe = (t: number) => (t < T_PROTO + .12 ? 'clientes' : t < T_TROCA + .25 ? 'protocolo' : t < T_DASH + .12 ? 'prazos' : 'dashboard');

// câmera dentro da janela: [t, foco x, foco y, escala] (px da captura)
const CAM: Record<string, Array<[number, number, number, number]>> = {
  clientes: [[0, 640, 250, 1.45], [W(18) - .3, 700, 260, 1.5], [W(21), 941, 290, 2.05], [W(28) - .4, 941, 290, 2.05], [T_PROTO - .35, 260, 300, 1.6]],
  protocolo: [[T_PROTO, 260, 300, 1.6], [W(31) - .2, 1311, 330, 2.25], [W(39) + .6, 1311, 330, 2.25], [T_TROCA - .4, 260, 780, 1.45]],
  prazos: [[T_TROCA, 640, 330, 1.45], [W(44) - .3, 1120, 430, 1.8], [W(56) + .2, 1120, 430, 1.8], [T_DASH - .4, 260, 250, 1.5]],
  dashboard: [[T_DASH, 400, 260, 1.45], [W(62) - .4, 1126, 196, 1.7], [W(65) - .3, 1126, 700, 1.7], [T_PROD, 1000, 500, 1.3]],
};
const camAt = (nome: string, t: number) => {
  const k = CAM[nome];
  if (t <= k[0][0]) return k[0].slice(1) as number[];
  for (let i = 0; i < k.length - 1; i++) {
    if (t < k[i + 1][0]) { const u = ease((t - k[i][0]) / (k[i + 1][0] - k[i][0])); return [1, 2, 3].map((j) => k[i][j] + (k[i + 1][j] - k[i][j]) * u); }
  }
  return k[k.length - 1].slice(1) as number[];
};
// destaques dourados [início, fim, x, y, w, h]
const DEST: Record<string, Array<[number, number, number, number, number, number]>> = {
  clientes: [[W(21) - .1, W(28) - .3, 766, 158, 350, 290]],
  protocolo: [[W(32) - .1, W(36) + .2, 1164, 318, 150, 80], [W(36) + .2, T_TROCA - .5, 1164, 318, 294, 80]],
  prazos: [[W(45) - .1, W(48) - .1, 322, 360, 1610, 34], [W(48) - .1, W(52) - .1, 322, 404, 1610, 34], [W(52) - .1, T_DASH - .7, 322, 448, 1610, 78]],
  dashboard: [[W(62) - .1, W(65) - .3, 312, 136, 1630, 120], [W(65) - .1, T_PROD - .2, 312, 646, 1630, 106]],
};
const CUR: Array<[number, number, number]> = [
  [0, 1300, 700], [W(18) - .4, 1250, 650], [W(21) + .2, 1000, 330], [W(28) - .6, 980, 360], [T_PROTO - .15, 92, 292], [T_PROTO + .3, 92, 292],
  [W(32) - .1, 1240, 345], [W(39), 1400, 352], [T_TROCA - .15, 100, 1026], [T_TROCA + .4, 100, 1026],
  [W(44), 1500, 560], [W(47), 1000, 377], [W(50), 1000, 421], [W(55), 1000, 470], [T_DASH - .15, 98, 121], [T_DASH + .4, 98, 121],
  [W(62), 1200, 230], [W(65), 1300, 720], [T_PROD, 1400, 820],
];
const curAt = (t: number) => {
  if (t <= CUR[0][0]) return [CUR[0][1], CUR[0][2]];
  for (let i = 0; i < CUR.length - 1; i++) {
    if (t < CUR[i + 1][0]) { const u = ease((t - CUR[i][0]) / (CUR[i + 1][0] - CUR[i][0])); return [CUR[i][1] + (CUR[i + 1][1] - CUR[i][1]) * u, CUR[i][2] + (CUR[i + 1][2] - CUR[i][2]) * u]; }
  }
  return [CUR[CUR.length - 1][1], CUR[CUR.length - 1][2]];
};

// títulos de benefício (um por cena) e selos
const TITULOS: Array<[number, string, string]> = [
  [0, 'Onde está cada caso', 'agora?'],
  [T_JAN, 'Setor e etapa de', 'cada cliente.'],
  [W(28), 'Quem precisa de', 'atenção.'],
  [W(40), 'Prazos em', 'ordem.'],
  [W(57), 'Operação e financeiro', 'numa tela só.'],
  [T_PROD, 'Feitos pra advocacia', 'previdenciária.'],
];
const SELOS: Array<[number, string]> = [[W(24), 'Etapas por caso'], [W(35), 'Alertas de atenção'], [W(41), 'Prazos por prioridade'], [W(60), 'Dashboard executivo']];

// ── componentes ──────────────────────────────────────────────────────────────────────────────────
const JW = 960, JX = 60, JY = 560, BARRA = 40, JH = 740;
const Janela: React.FC<{t: number}> = ({t}) => {
  const ent = ramp(t, T_JAN, .55, punch), sai = ramp(t, T_PROD - .1, .45);
  if (ent <= 0 || sai >= 1) return null;
  const nome = telaDe(t); const tela = TELAS[nome];
  const base = JH / tela.h;
  const [fx, fy, s] = camAt(nome, t);
  const k = base * s;
  const tx = Math.min(0, Math.max(JW - tela.w * k, JW / 2 - fx * k)); const ty = Math.min(0, Math.max(JH - tela.h * k, JH / 2 - fy * k));
  const P = (x: number, y: number) => [tx + x * k, ty + y * k];
  const troca = Math.min(...CLIQUES.map((c) => Math.abs(t - (c + .15))));
  const pisca = troca < .12 ? 1 - troca / .12 : 0;
  const [cx, cy] = P(...(curAt(t) as [number, number]));
  const clique = CLIQUES.map((c) => t - c).find((d) => d >= 0 && d < .45);
  // impacto: a janela dá um "soco" de escala a cada troca de tela
  const bump = Math.max(0, ...CLIQUES.map((c) => { const d = t - c - .1; return d >= 0 && d < .35 ? Math.sin(Math.PI * d / .35) : 0; }));
  return (
    <div style={{position: 'absolute', left: JX, top: JY, width: JW, height: JH + BARRA, borderRadius: 18, overflow: 'hidden', background: C.ivory,
      boxShadow: `0 0 0 3px ${C.gold}, 0 30px 80px rgba(0,0,0,.45), 0 0 60px rgba(194,155,60,.3)`,
      transform: `translateY(${(1 - ent) * 260 - sai * 900}px) scale(${(.85 + .15 * ent) * (1 + .025 * bump)}) rotate(${sai * -4}deg)`, opacity: Math.min(1, ent * 1.4) * (1 - sai)}}>
      <div style={{height: BARRA, background: '#E8EBF0', display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', borderBottom: '1px solid #d5d9e0'}}>
        {['#e06c5f', '#e6b34a', '#5bb16a'].map((c) => <i key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, display: 'block'}} />)}
        <div style={{marginLeft: 18, flex: 1, height: 24, borderRadius: 12, background: '#fff', fontFamily: SANS, fontSize: 15, color: C.gray, display: 'flex', alignItems: 'center', paddingLeft: 14}}>advstation.io</div>
      </div>
      <div style={{position: 'relative', width: JW, height: JH, overflow: 'hidden'}}>
        <Img src={staticFile(tela.src)} style={{position: 'absolute', left: tx, top: ty, width: tela.w * k, height: tela.h * k}} />
        {DEST[nome].map(([a, b, x, y, w, h], i) => {
          const al = Math.min(ramp(t, a, .2), 1 - ramp(t, b - .2, .2));
          if (al <= 0) return null;
          const [px, py] = P(x, y); const sc = 1 + .08 * (1 - ramp(t, a, .3, punch));
          return <div key={i} style={{position: 'absolute', left: px - 6, top: py - 6, width: w * k + 12, height: h * k + 12, borderRadius: 10, opacity: al,
            border: `5px solid ${C.gold}`, background: 'rgba(194,155,60,.14)', transform: `scale(${sc})`}} />;
        })}
        {pisca > 0 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: pisca * .7}} /> : null}
        {clique !== undefined ? <div style={{position: 'absolute', left: cx - 30 * (clique / .45 + .3), top: cy - 30 * (clique / .45 + .3), width: 60 * (clique / .45 + .3),
          height: 60 * (clique / .45 + .3), borderRadius: '50%', border: `4px solid ${C.gold}`, opacity: 1 - clique / .45}} /> : null}
        <svg viewBox="0 0 24 24" width={48} height={48} style={{position: 'absolute', left: cx - 6, top: cy - 3, overflow: 'visible',
          transform: `scale(${clique !== undefined && clique < .15 ? .82 : 1})`, transformOrigin: '6px 3px', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.35))'}}>
          <path d="M5 3 L5 20 L9.5 15.5 L12.5 22 L15.5 20.6 L12.6 14.3 L19 14.3 Z" fill="#fff" stroke={C.navy} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Fita: React.FC<{t: number}> = ({t}) => {
  const a = ramp(t, T_JAN, .4) * (1 - ramp(t, T_PROD, .3));
  return (
    <div style={{position: 'absolute', right: -140, top: 84, width: 520, transform: `rotate(45deg)`, opacity: a,
      background: C.gold, color: C.navy, textAlign: 'center', padding: '12px 0', fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: '.1em', boxShadow: '0 6px 18px rgba(0,0,0,.3)'}}>
      DADOS DEMONSTRATIVOS
    </div>
  );
};

const Titulo: React.FC<{t: number}> = ({t}) => {
  if (t >= T_CTA) return null;
  const idx = TITULOS.reduce((m, x, i) => (t >= x[0] ? i : m), 0);
  const [t0, txt, chave] = TITULOS[idx];
  const prox = TITULOS[idx + 1]?.[0] ?? T_CTA;
  const e = ramp(t, t0, .32, punch), s = ramp(t, prox - .18, .18);
  const gancho = idx === 0, ultimo = idx === TITULOS.length - 1;
  const top = gancho ? 700 : ultimo ? 560 : 232;
  const fs = gancho ? 118 : ultimo ? 96 : 84;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: fs, lineHeight: 1.06, color: C.white,
      opacity: Math.min(1, e) * (1 - s), transform: `translateY(${(1 - e) * 40 - s * 30}px) scale(${1.18 - .18 * e})`}}>
      {gancho ? <div style={{fontFamily: APOIO, fontWeight: 800, fontSize: 40, letterSpacing: '.08em', color: C.gold, marginBottom: 28}}>ADVOGADO PREVIDENCIÁRIO:</div> : null}
      {txt} <span style={{color: C.gold}}>{chave}</span>
    </div>
  );
};

// blocos de legenda: até 4 palavras, sem atravessar pontuação
const BLOCOS: Array<[number, number]> = [];
{ let a = 0; PW.forEach((p, k) => { if (k + 1 - a >= 4 || /[.,:?!]$/.test(p.w) || k === PW.length - 1) { BLOCOS.push([a, k + 1]); a = k + 1; } }); }
const Legenda: React.FC<{t: number}> = ({t}) => {
  if (t < T_JAN || t >= T_PROD) return null;
  // trecho da fala atual (blocos de 4 palavras), palavra a palavra
  const i = PW.findIndex((p, k) => t >= p.a - .05 && (k + 1 >= PW.length || t < PW[k + 1].a - .05));
  if (i < 0) return null;
  const bl = BLOCOS.find(([a, b]) => i >= a && i < b) ?? [i, i + 1]; const ini = bl[0]; const pal = PW.slice(bl[0], bl[1]).map((p) => p.w);
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 1374, textAlign: 'center', fontFamily: APOIO, fontWeight: 800, fontSize: 46, color: C.white, lineHeight: 1.15}}>
      {pal.map((w, k) => <span key={k} style={{color: ini + k === i ? C.gold : C.white, opacity: ini + k <= i ? 1 : .35}}>{w} </span>)}
    </div>
  );
};

const Selos: React.FC<{t: number}> = ({t}) => {
  if (t >= T_PROD) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1500, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16}}>
      {SELOS.map(([ts, txt]) => {
        const a = ramp(t, ts, .3, punch);
        return <div key={txt} style={{opacity: Math.min(1, a), transform: `scale(${.6 + .4 * a})`, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 24px 13px 14px', borderRadius: 999,
          background: 'rgba(194,155,60,.16)', border: `2px solid ${C.gold}`, color: C.white, fontFamily: APOIO, fontWeight: 800, fontSize: 30}}>
          <svg viewBox="0 0 24 24" width={30} height={30}><circle cx={12} cy={12} r={11} fill={C.gold} /><path d="M7 12.5l3.2 3.2L17 9" stroke={C.navy} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {txt}
        </div>;
      })}
    </div>
  );
};

const Topo: React.FC<{t: number}> = ({t}) => {
  const a = ramp(t, 0, .4) * (1 - ramp(t, T_CTA - .1, .2));
  const prod = t < T_TROCA + .25 ? 'maternidade' : 'previdenciario';
  const ps = ramp(t, T_JAN + .2, .4) * (1 - ramp(t, T_PROD - .1, .2));
  const tr = t > T_TROCA - .05 && t < T_TROCA + .5 ? Math.abs(1 - 2 * ramp(t, T_TROCA, .5)) : 1;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 84, display: 'flex', justifyContent: 'center', opacity: a}}><BrandMark size={74} nameSize={26} variant="dark" /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 452, display: 'flex', justifyContent: 'center', opacity: ps * tr}}>
        <Selo produto={prod as any} nome={prod === 'maternidade' ? 'Maternidade Legal' : 'Previdenciário Geral'} u={1.1} />
      </div>
    </>
  );
};

const Produtos: React.FC<{t: number}> = ({t}) => {
  if (t < T_PROD || t >= T_CTA) return null;
  const a = ramp(t, W(69) - .1, .35, punch), b = ramp(t, W(72) - .1, .35, punch), s = ramp(t, T_CTA - .2, .2);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60, opacity: 1 - s}}>
      <div style={{transform: `scale(${1.6 * a})`, opacity: Math.min(1, a)}}><Selo produto="maternidade" nome="Maternidade Legal" u={1} /></div>
      <div style={{transform: `scale(${1.6 * b})`, opacity: Math.min(1, b), marginTop: 40}}><Selo produto="previdenciario" nome="Previdenciário Geral" u={1} /></div>
    </div>
  );
};

const CTA: React.FC<{t: number}> = ({t}) => {
  if (t < T_CTA) return null;
  const m = ramp(t, T_CTA, .4, punch), bt = ramp(t, T_CTA + .25, .4, punch), v = ramp(t, W(PW.length - 4) - .1, .4);
  const pulso = 1 + .035 * Math.max(0, Math.sin((t - T_CTA - .7) * Math.PI * 2 / .9));
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 520, transform: `scale(${.7 + .3 * m})`, opacity: Math.min(1, m)}}><BrandMark size={210} nameSize={60} variant="dark" /></div>
      <div style={{position: 'absolute', top: 1010, transform: `scale(${(.6 + .4 * bt) * pulso})`, opacity: Math.min(1, bt), background: C.gold, color: C.navy,
        borderRadius: 999, padding: '30px 64px', fontFamily: APOIO, fontWeight: 800, fontSize: 52, letterSpacing: '.04em', boxShadow: '0 18px 50px rgba(194,155,60,.35)'}}>
        ACESSE ADVSTATION.IO
      </div>
      <div style={{position: 'absolute', top: 1180, fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.white, opacity: v}}>
        e veja na <span style={{color: C.gold}}>prática.</span>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, #22406f 0%, ${C.navy} 52%, ${C.navyDeep} 100%)`, overflow: 'hidden'}}>
      {audio ? <Audio src={staticFile('assets/audio/mix.wav')} /> : null}
      <Topo t={t} />
      <Titulo t={t} />
      <Janela t={t} />
      <Legenda t={t} />
      <Selos t={t} />
      <Produtos t={t} />
      <CTA t={t} />
      <Fita t={t} />
    </AbsoluteFill>
  );
};

export const EVENTOS = {T_JAN, T_PROTO, T_TROCA, T_DASH, T_PROD, T_CTA};
