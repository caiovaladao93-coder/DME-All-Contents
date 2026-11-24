import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C} from './theme/colors';
import {SERIF, SANS, APOIO} from './theme/typography';
import {BrandMark, Selo} from './components/Brand';
import {loadFonts} from './components/Fonts';
import PAL from './data/palavras.json';

/*
 * ADV Station · anúncio vertical no formato "produto em uso" (referência enviada pelo usuário: título fixo, janela do sistema
 * com cursor, legenda embaixo, selos de prova e cartão final). Fundo marinho, marca oficial, Gelasio/Nunito Sans (substitutas
 * livres de Iowan/Avenir; Fieldwork pendente). As telas são capturas REAIS do "Escritório Demonstração" (dados fictícios);
 * o cursor e os cliques são simulados sobre elas, com aprovação do usuário, e a faixa "Dados demonstrativos" fica visível.
 * Selos: só funções que aparecem nas telas (sem números nem preço).
 */
loadFonts();
const W = (i: number) => (PAL as any[])[i].a as number;
export const DUR = 31.0;

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const ramp = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// ── telas reais (px da captura) ──────────────────────────────────────────────────────────────────
type Tela = {src: string; w: number; h: number};
const TELAS: Record<string, Tela> = {
  clientes: {src: 'assets/telas/ml-clientes.png', w: 1915, h: 1075},
  protocolo: {src: 'assets/telas/ml-protocolo.png', w: 2000, h: 1121},
  prazos: {src: 'assets/telas/pg-prazos.png', w: 2000, h: 1124},
  dashboard: {src: 'assets/telas/pg-dashboard.png', w: 2000, h: 1124},
};
// tempos-chave (palavras da narração)
const T_PROTO = W(24) + .15;          // clique em "Protocolo" (na palavra "clique")
const T_TROCA = W(34) - .25;          // clique em "Trocar de sistema" (antes de "No Previdenciário Geral")
const T_DASH = W(48) + .05;           // clique em "Dashboard" ("E o dashboard")
const T_FIM = W(59) - .15;            // cartão final ("ADV Station.")
const telaDe = (t: number) => (t < T_PROTO + .12 ? 'clientes' : t < T_TROCA + .25 ? 'protocolo' : t < T_DASH + .12 ? 'prazos' : 'dashboard');

// câmera dentro da janela: [t, foco x, foco y, escala] por tela (px da captura)
const CAM: Record<string, Array<[number, number, number, number]>> = {
  clientes: [[0, 640, 250, 1.45], [W(17) - .3, 700, 260, 1.5], [W(17) + .9, 941, 290, 2.0], [W(23) - .5, 941, 290, 2.0], [T_PROTO - .4, 260, 300, 1.6]],
  protocolo: [[T_PROTO, 260, 300, 1.6], [W(27), 675, 230, 1.75], [W(31) - .2, 1311, 330, 2.2], [W(33) + .8, 1311, 330, 2.2], [T_TROCA - .5, 260, 780, 1.45]],
  prazos: [[T_TROCA, 640, 330, 1.45], [W(38) - .2, 900, 360, 1.5], [W(39) + .5, 1120, 430, 1.75], [W(47) + .4, 1120, 430, 1.75], [T_DASH - .5, 260, 250, 1.5]],
  dashboard: [[T_DASH, 400, 260, 1.45], [W(53) - .5, 1126, 196, 1.65], [W(56) - .3, 1126, 700, 1.65], [T_FIM - .3, 1000, 500, 1.3]],
};
const camAt = (nome: string, t: number) => {
  const k = CAM[nome];
  if (t <= k[0][0]) return k[0].slice(1) as number[];
  for (let i = 0; i < k.length - 1; i++) {
    if (t < k[i + 1][0]) { const u = ease((t - k[i][0]) / (k[i + 1][0] - k[i][0])); return [1, 2, 3].map((j) => k[i][j] + (k[i + 1][j] - k[i][j]) * u); }
  }
  return k[k.length - 1].slice(1) as number[];
};

// destaques dourados [início, fim, x, y, w, h] (px da captura)
const DEST: Record<string, Array<[number, number, number, number, number, number]>> = {
  clientes: [[W(21) - .2, W(23) - .3, 766, 158, 350, 290]],
  protocolo: [[W(27) + .1, W(31) - .3, 342, 194, 666, 34], [W(33) - .2, T_TROCA - .7, 1164, 318, 294, 80]],
  prazos: [[W(42) - .1, W(44) - .1, 322, 360, 1610, 34], [W(44) - .1, W(47) - .1, 322, 404, 1610, 34], [W(47) - .1, T_DASH - .8, 322, 448, 1610, 78]],
  dashboard: [[W(53) - .1, W(56) - .3, 312, 136, 1630, 120], [W(56) - .1, T_FIM - .4, 312, 646, 1630, 106]],
};
// cursor: [t, x, y] (px da captura) e cliques
const CUR: Array<[number, number, number]> = [
  [0, 1300, 900], [W(17) - .4, 1250, 820], [W(19) + .2, 1000, 330], [W(23) - .6, 980, 360], [T_PROTO - .15, 92, 292], [T_PROTO + .3, 92, 292],
  [W(27) + .2, 700, 240], [W(31) - .1, 1250, 345], [W(33) + .7, 1300, 352], [T_TROCA - .15, 100, 1026], [T_TROCA + .4, 100, 1026],
  [W(39) + .2, 1500, 600], [W(42), 1000, 377], [W(44), 1000, 421], [W(47), 1000, 470], [T_DASH - .15, 98, 121], [T_DASH + .4, 98, 121],
  [W(53), 1200, 230], [W(56), 1300, 720], [T_FIM, 1400, 820],
];
const CLIQUES = [T_PROTO, T_TROCA, T_DASH];
const curAt = (t: number) => {
  if (t <= CUR[0][0]) return [CUR[0][1], CUR[0][2]];
  for (let i = 0; i < CUR.length - 1; i++) {
    if (t < CUR[i + 1][0]) { const u = ease((t - CUR[i][0]) / (CUR[i + 1][0] - CUR[i][0])); return [CUR[i][1] + (CUR[i + 1][1] - CUR[i][1]) * u, CUR[i][2] + (CUR[i + 1][2] - CUR[i][2]) * u]; }
  }
  return [CUR[CUR.length - 1][1], CUR[CUR.length - 1][2]];
};

// legenda (frases da narração) e selos de função
const FRASES: Array<[number, number, string, string]> = [
  [0, 4, 'Advogado previdenciário: cada caso tem o seu', 'caminho.'],
  [4, 23, 'Cada cliente com o setor e a', 'etapa em que está.'],
  [23, 34, 'Um clique, e o protocolo mostra o que precisa de', 'atenção.'],
  [34, 48, 'Os prazos em ordem: vencidos, do dia e os', 'próximos.'],
  [48, 59, 'O dashboard reúne a operação e o', 'financeiro.'],
];
const SELOS: Array<[number, string]> = [[W(19), 'Etapas por caso'], [W(33), 'Alertas de atenção'], [W(38), 'Prazos por prioridade'], [W(50), 'Dashboard executivo']];

// ── componentes ──────────────────────────────────────────────────────────────────────────────────
const JW = 960, JX = 60, JY = 596, BARRA = 40, JH = 740;            // janela do navegador
const Janela: React.FC<{t: number}> = ({t}) => {
  const nome = telaDe(t); const tela = TELAS[nome];
  const base = JH / tela.h;                       // a tela preenche a altura da janela (o texto fica maior)
  const [fx, fy, s] = camAt(nome, t);
  const k = base * s;
  const tx = Math.min(0, Math.max(JW - tela.w * k, JW / 2 - fx * k)); const ty = Math.min(0, Math.max(JH - tela.h * k, JH / 2 - fy * k));
  const P = (x: number, y: number) => [tx + x * k, ty + y * k];
  const troca = Math.min(...CLIQUES.map((c) => Math.abs(t - (c + .15))));
  const pisca = troca < .12 ? 1 - troca / .12 : 0;
  const [cx, cy] = P(...(curAt(t) as [number, number]));
  const clique = CLIQUES.map((c) => t - c).find((d) => d >= 0 && d < .45);
  const entra = ramp(t, .15, .6);
  return (
    <div style={{position: 'absolute', left: JX, top: JY, width: JW, height: JH + BARRA, borderRadius: 18, overflow: 'hidden', background: C.ivory,
      boxShadow: `0 0 0 3px ${C.gold}, 0 30px 80px rgba(0,0,0,.45), 0 0 60px rgba(194,155,60,.28)`, transform: `translateY(${(1 - entra) * 80}px) scale(${.94 + .06 * entra})`, opacity: entra}}>
      <div style={{height: BARRA, background: '#E8EBF0', display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', borderBottom: '1px solid #d5d9e0'}}>
        {['#e06c5f', '#e6b34a', '#5bb16a'].map((c) => <i key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, display: 'block'}} />)}
        <div style={{marginLeft: 18, flex: 1, height: 24, borderRadius: 12, background: '#fff', fontFamily: SANS, fontSize: 15, color: C.gray, display: 'flex', alignItems: 'center', paddingLeft: 14}}>advstation.io</div>
      </div>
      <div style={{position: 'relative', width: JW, height: JH, overflow: 'hidden'}}>
        <Img src={staticFile(tela.src)} style={{position: 'absolute', left: tx, top: ty, width: tela.w * k, height: tela.h * k}} />
        {DEST[nome].map(([a, b, x, y, w, h], i) => {
          const al = Math.min(ramp(t, a, .3), 1 - ramp(t, b - .3, .3));
          if (al <= 0) return null;
          const [px, py] = P(x, y);
          return <div key={i} style={{position: 'absolute', left: px - 6, top: py - 6, width: w * k + 12, height: h * k + 12, borderRadius: 10, opacity: al,
            border: `4px solid ${C.gold}`, background: 'rgba(194,155,60,.12)'}} />;
        })}
        {pisca > 0 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: pisca * .7}} /> : null}
        {clique !== undefined ? <div style={{position: 'absolute', left: cx - 30 * (clique / .45 + .3), top: cy - 30 * (clique / .45 + .3), width: 60 * (clique / .45 + .3),
          height: 60 * (clique / .45 + .3), borderRadius: '50%', border: `4px solid ${C.gold}`, opacity: 1 - clique / .45}} /> : null}
        <svg viewBox="0 0 24 24" width={46} height={46} style={{position: 'absolute', left: cx - 6, top: cy - 3, overflow: 'visible',
          transform: `scale(${clique !== undefined && clique < .15 ? .82 : 1})`, transformOrigin: '6px 3px', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.35))'}}>
          <path d="M5 3 L5 20 L9.5 15.5 L12.5 22 L15.5 20.6 L12.6 14.3 L19 14.3 Z" fill="#fff" stroke={C.navy} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Fita: React.FC<{t: number}> = ({t}) => {
  const a = ramp(t, .8, .5);
  return (
    <div style={{position: 'absolute', right: -140, top: 84, width: 520, transform: `rotate(45deg) translateY(${(1 - a) * -60}px)`, opacity: a,
      background: C.gold, color: C.navy, textAlign: 'center', padding: '12px 0', fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: '.1em', boxShadow: '0 6px 18px rgba(0,0,0,.3)'}}>
      DADOS DEMONSTRATIVOS
    </div>
  );
};

const Legenda: React.FC<{t: number}> = ({t}) => {
  const f = FRASES.find(([a, b]) => t >= W(a) - .1 && t < (b < (PAL as any[]).length ? W(b) - .1 : DUR));
  if (!f) return null;
  const [a, b, txt, chave] = f;
  const al = Math.min(ramp(t, W(a) - .1, .25), 1 - ramp(t, W(b) - .35, .25));
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1404, textAlign: 'center', fontFamily: APOIO, fontWeight: 800, fontSize: 44, lineHeight: 1.18,
      color: C.white, opacity: al, transform: `translateY(${(1 - Math.min(1, ramp(t, W(a) - .1, .3))) * 18}px)`}}>
      {txt} <span style={{color: C.gold}}>{chave}</span>
    </div>
  );
};

const Selos: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 70, right: 70, top: 1536, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
    {SELOS.map(([ts, txt]) => {
      const a = ramp(t, ts, .35);
      return <div key={txt} style={{opacity: a, transform: `scale(${.7 + .3 * a})`, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 26px 14px 16px', borderRadius: 999,
        background: 'rgba(255,255,255,.08)', border: `2px solid ${a > .99 ? C.gold : 'rgba(194,155,60,.6)'}`, color: C.white, fontFamily: APOIO, fontWeight: 700, fontSize: 30}}>
        <svg viewBox="0 0 24 24" width={30} height={30}><circle cx={12} cy={12} r={11} fill={C.gold} /><path d="M7 12.5l3.2 3.2L17 9" stroke={C.navy} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {txt}
      </div>;
    })}
  </div>
);

const Cabeca: React.FC<{t: number}> = ({t}) => {
  const a1 = ramp(t, 0, .5), a2 = ramp(t, .35, .5), a3 = ramp(t, .7, .5);
  const prod = t < T_TROCA + .25 ? 'maternidade' : 'previdenciario';
  const troca = ramp(t, T_TROCA + .1, .35);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 84, display: 'flex', justifyContent: 'center', opacity: a1}}>
        <BrandMark size={74} nameSize={26} variant="dark" />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 236, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 84, lineHeight: 1.08, color: C.white,
        opacity: a2, transform: `translateY(${(1 - a2) * 24}px)`}}>
        Cada caso tem seu <span style={{color: C.gold}}>caminho.</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 432, textAlign: 'center', fontFamily: APOIO, fontWeight: 600, fontSize: 36, color: 'rgba(244,246,249,.82)', opacity: a3}}>
        Sua gestão precisa acompanhar.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 506, display: 'flex', justifyContent: 'center', opacity: a3 * (t > T_TROCA - .1 && t < T_TROCA + .45 ? Math.abs(1 - 2 * troca) : 1)}}>
        <Selo produto={prod as any} nome={prod === 'maternidade' ? 'Maternidade Legal' : 'Previdenciário Geral'} u={1.05} />
      </div>
    </>
  );
};

const CartaoFinal: React.FC<{t: number}> = ({t}) => {
  const a = ramp(t, T_FIM, .5), m = ramp(t, T_FIM + .2, .7), p = ramp(t, W(60) - .1, .5), u = ramp(t, W(60) + .5, .5);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #22396a 0%, ${C.navy} 48%, ${C.navyDeep} 100%)`, opacity: a, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 640, transform: `translateY(${(1 - m) * 40}px) scale(${.9 + .1 * m})`, opacity: m}}>
        <BrandMark size={230} nameSize={64} variant="dark" />
      </div>
      <div style={{position: 'absolute', top: 1130, padding: '18px 40px', borderRadius: 999, border: `3px solid ${C.gold}`, color: C.white, fontFamily: SERIF, fontWeight: 700,
        fontSize: 44, opacity: p, transform: `scale(${.9 + .1 * p})`}}>Cada caso tem seu caminho.</div>
      <div style={{position: 'absolute', top: 1265, color: C.gold, fontFamily: APOIO, fontWeight: 800, fontSize: 46, letterSpacing: '.04em', opacity: u}}>advstation.io</div>
      <div style={{position: 'absolute', top: 1345, color: 'rgba(244,246,249,.8)', fontFamily: APOIO, fontWeight: 600, fontSize: 32, opacity: u}}>Conheça nossas soluções</div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, #203a6b 0%, ${C.navy} 52%, ${C.navyDeep} 100%)`, overflow: 'hidden'}}>
      {audio ? <Audio src={staticFile('assets/audio/mix.wav')} /> : null}
      <Cabeca t={t} />
      <Janela t={t} />
      <Legenda t={t} />
      <Selos t={t} />
      <Fita t={t} />
      {t >= T_FIM ? <CartaoFinal t={t} /> : null}
    </AbsoluteFill>
  );
};

export const EVENTOS = {DUR, T_PROTO, T_TROCA, T_DASH, T_FIM, SELOS: SELOS.map((s) => s[0]), CLIQUES,
  DEST: Object.values(DEST).flat().map((d) => d[0])};
