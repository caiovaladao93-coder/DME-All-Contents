import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, clamp, hash, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * W-EV · apresentação (16:9, ~40 s). O posto em wireframe abre o filme e vira o centro da rede que conecta
 * Motorista, Parceiros e Operação; depois, cada público ganha sua tela (app do motorista em 4 estados, app do parceiro,
 * console), as três se alinham ("Uma plataforma. Muitas jornadas.") e a assinatura fecha com a marca.
 * Dados de interface são fictícios (selo "Exemplo ilustrativo"); valores espelham os cenários de teste do repositório.
 */
const T = {
  proximo: wt('abertura', 'próximo'), eletrico: wt('abertura', 'elétrico'),
  plataforma: wt('conecta', 'plataforma'), multi: wt('conecta', 'multimarcas'), dirige: wt('conecta', 'dirige'), energia: wt('conecta', 'energia'), opera: wt('conecta', 'opera'),
  mot: wt('motorista', 'motorista'), mapa: wt('motorista', 'encontre'), qr: wt('motorista', 'leia'), valor: wt('motorista', 'escolha'), acomp: wt('motorista', 'acompanhe'), fim: wt('motorista', 'fim'),
  parc: wt('parceiros', 'parceiros'), vendas: wt('parceiros', 'vendas'), repasses: wt('parceiros', 'repasses'),
  op: wt('operacao', 'operação'), est: wt('operacao', 'estações'), ses: wt('operacao', 'sessões'), fin: wt('operacao', 'financeiro'), aud: wt('operacao', 'auditoria'), console: wt('operacao', 'console'),
  uma: wt('jornadas', 'Uma'), muitas: wt('jornadas', 'Muitas'), energiaSig: wt('assinatura', 'Energia'),
};
const fade = (t: number, a: number, b: number, din = .45, dout = .35) => P(t, a, din) * (1 - P(t, b, dout, EASE_IN));

// ── tipografia: frase palavra por palavra; <em> em menta
type Seg = string | [string];
const Words: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size: number; weight?: number; x: number; y: number; w?: number; align?: 'left' | 'center'; color?: string}> = ({t, tin, tout, segs, size, weight = 500, x, y, w = 1100, align = 'left', color = C.ink}) => {
  if (t < tin - .01 || t > tout + .35) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((wd) => words.push([wd, typeof s !== 'string'])));
  const q = P(t, tout, .32, EASE_IN);
  return <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: align, fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight: 1.06, letterSpacing: '-.03em', color,
    opacity: 1 - q, transform: `translateY(${(-26 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(6 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([wd, acc], i) => { if (wd === '|') return <br key={i} />; const p = P(t, tin + i * .05, .38);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? C.mint : undefined, opacity: p, transform: `translateY(${((1 - p) * 30).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 8).toFixed(1)}px)` : undefined}}>{wd}</span>; })}
  </div>;
};
const Kicker: React.FC<{t: number; tin: number; tout: number; x: number; y: number; children: React.ReactNode; align?: 'left' | 'center'}> = ({t, tin, tout, x, y, children, align = 'left'}) => {
  const v = fade(t, tin, tout, .4, .3); if (v <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: align === 'center' ? 1920 - 2 * x : undefined, textAlign: align, display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', alignItems: 'center', gap: 14,
    fontFamily: UI, fontWeight: 600, fontSize: 22, letterSpacing: '.22em', color: C.mint, opacity: v, transform: `translateX(${((1 - v) * -16).toFixed(1)}px)`}}>
    <span style={{width: 10, height: 10, borderRadius: 5, background: C.mint, boxShadow: `0 0 14px ${C.mint}`}} />{children}</div>;
};

// ── posto em wireframe isométrico (linhas que se desenham)
const STATION: Array<[string, number]> = [  // [path, ordem]
  ['M60 250 L360 120 L700 220 L400 360 Z', 0], ['M60 250 L60 270 L400 380 L400 360', 0], ['M400 380 L700 240 L700 220', 0],                         // cobertura
  ['M150 300 L150 560', 1], ['M610 255 L610 515', 1], ['M380 370 L380 640', 1],                                                                    // pilares
  ['M40 600 L380 740 L760 560 L420 440 Z', 2],                                                                                                   // piso
  ['M200 470 L240 455 L240 590 L200 605 Z M240 455 L270 467 L270 602 L240 590', 3], ['M330 505 L370 490 L370 625 L330 640 Z M370 490 L400 502 L400 637 L370 625', 3],
  ['M460 535 L500 520 L500 655 L460 670 Z M500 520 L530 532 L530 667 L500 655', 3],                                                              // carregadores
  ['M212 500 L228 494 L228 520 L212 526 Z', 4], ['M342 535 L358 529 L358 555 L342 561 Z', 4], ['M472 565 L488 559 L488 585 L472 591 Z', 4],     // telas
];
const Station: React.FC<{t: number; t0: number; scale?: number; glow?: number}> = ({t, t0, scale = 1, glow = 1}) => (
  <svg viewBox="0 0 800 760" width={800 * scale} height={760 * scale} style={{overflow: 'visible'}}>
    {STATION.map(([d, k], i) => { const p = P(t, t0 + k * .32 + (i % 3) * .06, .9, EASE_IO);
      return <path key={i} d={d} fill={k === 4 ? `rgba(100,230,181,${(.35 * p).toFixed(2)})` : 'none'} stroke={k === 2 ? C.line : C.mint} strokeOpacity={k === 2 ? .9 : .85} strokeWidth={k === 2 ? 2 : 2.4}
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{filter: k === 4 || k === 0 ? `drop-shadow(0 0 ${(6 * glow).toFixed(1)}px rgba(100,230,181,.55))` : undefined}} />; })}
  </svg>
);

// ── ícones lineares
const Ico: React.FC<{k: 'car' | 'bolt' | 'grid' | 'pin' | 'qr' | 'coin' | 'chart' | 'list' | 'shield'; s?: number; c?: string}> = ({k, s = 40, c = C.mint}) => {
  const d: Record<string, React.ReactNode> = {
    car: <><path d="M6 30l4-11c1-3 3-4 6-4h16c3 0 5 1 6 4l4 11" /><rect x="4" y="30" width="40" height="10" rx="4" /><circle cx="13" cy="40" r="3" /><circle cx="35" cy="40" r="3" /></>,
    bolt: <path d="M27 4L11 27h11l-3 17 17-24H25z" />, grid: <><rect x="6" y="6" width="15" height="15" rx="3" /><rect x="27" y="6" width="15" height="15" rx="3" /><rect x="6" y="27" width="15" height="15" rx="3" /><rect x="27" y="27" width="15" height="15" rx="3" /></>,
    pin: <><path d="M24 44s14-13 14-24a14 14 0 10-28 0c0 11 14 24 14 24z" /><circle cx="24" cy="20" r="5" /></>, qr: <><rect x="6" y="6" width="14" height="14" /><rect x="28" y="6" width="14" height="14" /><rect x="6" y="28" width="14" height="14" /><path d="M28 28h6v6h-6zM36 36h6v6h-6z" /></>,
    coin: <><circle cx="24" cy="24" r="17" /><path d="M24 14v20M29 18h-7a4 4 0 000 8h4a4 4 0 010 8h-7" /></>, chart: <><path d="M6 40h36" /><path d="M10 32l9-10 7 6 12-14" /></>,
    list: <><path d="M16 12h26M16 24h26M16 36h26" /><circle cx="8" cy="12" r="2" /><circle cx="8" cy="24" r="2" /><circle cx="8" cy="36" r="2" /></>, shield: <><path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" /><path d="M17 24l5 5 10-10" /></>,
  };
  return <svg viewBox="0 0 48 48" width={s} height={s} fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{d[k]}</svg>;
};

// ── celular (moldura própria) e telas do app
const Phone: React.FC<{x: number; y: number; s?: number; o?: number; rot?: number; children: React.ReactNode}> = ({x, y, s = 1, o = 1, rot = 0, children}) => (
  <div style={{position: 'absolute', left: x - 215, top: y - 440, width: 430, height: 880, borderRadius: 64, background: 'linear-gradient(160deg,#2B302E,#0E1110 60%)', padding: 12, boxSizing: 'border-box', opacity: o,
    transform: `scale(${s.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`, boxShadow: '0 60px 110px rgba(0,0,0,.6), 0 0 0 1.5px rgba(100,230,181,.18), inset 0 1px 0 rgba(255,255,255,.12)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden', background: C.bg2}}>
      {children}
      <div style={{position: 'absolute', left: '50%', top: 14, width: 120, height: 32, marginLeft: -60, borderRadius: 18, background: '#000'}} />
    </div>
  </div>
);
const AppHeader: React.FC<{title: string}> = ({title}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 58, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 28, letterSpacing: '-.08em', color: C.mint}}>W-EV <span style={{fontFamily: UI, fontWeight: 600, fontSize: 18, letterSpacing: 0, color: C.muted}}>{title}</span></div>
    <div style={{width: 40, height: 40, borderRadius: 20, background: C.raised, border: `1px solid ${C.line2}`}} />
  </div>
);
const Chip: React.FC<{on?: boolean; children: React.ReactNode; size?: number}> = ({on, children, size = 22}) => (
  <div style={{padding: '12px 20px', borderRadius: 16, fontFamily: UI, fontWeight: 700, fontSize: size, color: on ? C.mintInk : C.ink, background: on ? C.mint : C.raised, border: `1px solid ${on ? C.mint : C.line2}`}}>{children}</div>
);
const ScreenMapa: React.FC<{t: number}> = ({t}) => {
  const card = P(t, T.mapa + .5, .5, BACK);
  return <AbsoluteFill style={{background: '#0E1412'}}>
    <svg width="406" height="856" style={{position: 'absolute', inset: 0}}>
      {[...Array(9)].map((_, i) => <path key={i} d={`M${-40 + i * 60} 0 L${60 + i * 60} 856`} stroke="#1D2A25" strokeWidth={i % 3 ? 3 : 7} />)}
      {[...Array(8)].map((_, i) => <path key={'h' + i} d={`M0 ${80 + i * 110} L406 ${40 + i * 110}`} stroke="#1D2A25" strokeWidth={i % 2 ? 3 : 8} />)}
      <path d="M40 700 C140 600 160 420 260 360 S 380 220 400 160" stroke={C.mint} strokeOpacity={.55} strokeWidth="5" fill="none" strokeDasharray="10 12" />
    </svg>
    {[[90, 300, 0], [250, 360, 1], [320, 210, 0], [150, 520, 0]].map(([x, y, sel], i) => { const a = P(t, T.mapa + .1 + i * .08, .4, BACK);
      return <div key={i} style={{position: 'absolute', left: x - 22, top: y - 50, transform: `scale(${(a * (sel ? 1.25 : 1)).toFixed(3)})`, transformOrigin: 'bottom center'}}><Ico k="pin" s={46} c={sel ? C.mint : C.muted} /></div>; })}
    <AppHeader title="Motorista" />
    <div style={{position: 'absolute', left: 18, right: 18, bottom: 28, padding: 24, borderRadius: 28, background: C.surface, border: `1px solid ${C.line2}`, transform: `translateY(${((1 - card) * 200).toFixed(1)}px)`}}>
      <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.ink}}>Posto Horizonte</div>
      <div style={{fontFamily: UI, fontSize: 19, color: C.muted, marginTop: 6}}>2 conectores livres · 0,8 km</div>
      <div style={{display: 'flex', gap: 10, marginTop: 18}}><Chip on>Ver conectores</Chip><Chip>Rota</Chip></div>
    </div>
  </AbsoluteFill>;
};
const ScreenQR: React.FC<{t: number}> = ({t}) => {
  const scan = (t - T.qr) % 1.2 / 1.2, ok = P(t, T.qr + 1.25, .35, BACK);
  return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1A2420, #070908)'}}>
    <AppHeader title="Ler QR" />
    <div style={{position: 'absolute', left: 63, top: 200, width: 280, height: 280}}>
      <svg viewBox="0 0 29 29" width="280" height="280" style={{opacity: .9}}>{[...Array(29 * 29)].map((_, i) => { const x = i % 29, y = Math.floor(i / 29);
        const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7 && (x === a || x === a + 6 || y === b || y === b + 6 || (x >= a + 2 && x <= a + 4 && y >= b + 2 && y <= b + 4));
        const inF = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
        const on = inF ? finder(0, 0) || finder(22, 0) || finder(0, 22) : hash(i * 3.1) > .52;
        return on ? <rect key={i} x={x} y={y} width="1" height="1" fill={C.ink} /> : null; })}</svg>
      {[[0, 0, 0], [1, 0, 90], [1, 1, 180], [0, 1, 270]].map(([a, b, r], i) => <div key={i} style={{position: 'absolute', left: a ? 250 : -20, top: b ? 250 : -20, width: 50, height: 50, borderTop: `5px solid ${C.mint}`, borderLeft: `5px solid ${C.mint}`, borderRadius: '10px 0 0 0', transform: `rotate(${r}deg)`}} />)}
      {ok < 1 ? <div style={{position: 'absolute', left: -10, right: -10, top: 280 * scan, height: 4, background: C.mint, boxShadow: `0 0 18px ${C.mint}`}} /> : null}
    </div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 560, textAlign: 'center', fontFamily: UI, fontSize: 22, color: C.muted}}>Aponte para o QR do conector</div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 630, padding: 22, borderRadius: 24, background: C.surface, border: `1px solid ${C.mint}`, opacity: ok, transform: `scale(${(.9 + .1 * ok).toFixed(3)})`}}>
      <div style={{fontFamily: UI, fontSize: 18, color: C.mint, fontWeight: 700}}>CONECTOR IDENTIFICADO</div>
      <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 6}}>Conector 2 · Livre</div>
    </div>
  </AbsoluteFill>;
};
const ScreenValor: React.FC<{t: number}> = ({t}) => {
  const sel = P(t, T.valor + .6, .25), press = P(t, T.valor + 1.0, .2);
  return <AbsoluteFill style={{background: C.bg2}}>
    <AppHeader title="Recarga" />
    <div style={{position: 'absolute', left: 30, top: 150, fontFamily: HEAD, fontWeight: 600, fontSize: 36, color: C.ink, lineHeight: 1.15}}>Quanto você<br />quer recarregar?</div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 300, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
      {['R$ 20', 'R$ 40', 'R$ 60', 'R$ 80'].map((v, i) => <div key={v} style={{height: 110, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 36,
        background: i === 1 && sel > .5 ? C.mint : C.surface, color: i === 1 && sel > .5 ? C.mintInk : C.ink, border: `1.5px solid ${i === 1 ? C.mint : C.line2}`, transform: i === 1 ? `scale(${(1 + .05 * Math.sin(Math.PI * sel)).toFixed(3)})` : undefined}}>{v}</div>)}
    </div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 560, fontFamily: UI, fontSize: 20, color: C.muted, lineHeight: 1.4}}>Você paga pelo que usar.<br />A diferença retorna ao final.</div>
    <div style={{position: 'absolute', left: 30, right: 30, bottom: 40, height: 84, borderRadius: 22, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      fontFamily: HEAD, fontWeight: 800, fontSize: 28, color: C.mintInk, transform: `scale(${(1 - .04 * Math.sin(Math.PI * press)).toFixed(3)})`}}><Ico k="bolt" s={30} c={C.mintInk} />Iniciar recarga</div>
  </AbsoluteFill>;
};
const ScreenRecarga: React.FC<{t: number}> = ({t}) => {
  const p = P(t, T.acomp + .1, T.fim - T.acomp - .1, EASE_IO), done = P(t, T.fim, .4, BACK);
  const kwh = 12.5 * p, rs = 25 * p, R = 120, L = 2 * Math.PI * R;
  return <AbsoluteFill style={{background: C.bg2}}>
    <AppHeader title="Recarga" />
    <div style={{position: 'absolute', left: 30, top: 140, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 20, background: done > .5 ? C.raised : 'rgba(100,230,181,.12)',
      fontFamily: UI, fontWeight: 700, fontSize: 20, color: C.mint}}><span style={{width: 10, height: 10, borderRadius: 5, background: C.mint, opacity: done > .5 ? 1 : .5 + .5 * Math.sin(t * 8)}} />{done > .5 ? 'Concluída' : 'Carregando'}</div>
    <svg width="300" height="300" style={{position: 'absolute', left: 53, top: 210}}>
      <circle cx="150" cy="150" r={R} stroke={C.raised} strokeWidth="18" fill="none" />
      <circle cx="150" cy="150" r={R} stroke={C.mint} strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray={`${(L * p * .625).toFixed(1)} ${L}`} transform="rotate(-90 150 150)" style={{filter: `drop-shadow(0 0 10px ${C.mint})`}} />
    </svg>
    <div style={{position: 'absolute', left: 53, top: 210, width: 300, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: C.ink, letterSpacing: '-.03em'}}>{kwh.toFixed(1).replace('.', ',')}</div>
      <div style={{fontFamily: UI, fontWeight: 600, fontSize: 22, color: C.muted}}>kWh entregues</div>
    </div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 560, display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontSize: 21, color: C.muted}}>
      <span>Consumo</span><span style={{color: C.ink, fontWeight: 700}}>R$ {rs.toFixed(2).replace('.', ',')} de R$ 40,00</span></div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 600, height: 10, borderRadius: 5, background: C.raised}}><div style={{width: `${(p * 62.5).toFixed(1)}%`, height: '100%', borderRadius: 5, background: C.mint}} /></div>
    <div style={{position: 'absolute', left: 30, right: 30, bottom: 34, padding: 22, borderRadius: 24, background: C.surface, border: `1px solid ${C.mint}`, opacity: done, transform: `translateY(${((1 - done) * 60).toFixed(1)}px)`}}>
      <div style={{fontFamily: UI, fontSize: 18, fontWeight: 700, color: C.mint}}>COMPROVANTE</div>
      <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 26, color: C.ink, marginTop: 6}}>12,5 kWh · R$ 25,00</div>
      <div style={{fontFamily: UI, fontSize: 18, color: C.muted, marginTop: 4}}>Devolução de R$ 15,00 em andamento</div>
    </div>
  </AbsoluteFill>;
};
const ScreenParceiro: React.FC<{t: number}> = ({t}) => {
  const v = P(t, T.vendas - .1, .5), r = P(t, T.repasses - .1, .5);
  const bars = [.35, .5, .42, .7, .58, .82, 1];
  return <AbsoluteFill style={{background: C.bg2}}>
    <AppHeader title="Parceiros" />
    <div style={{position: 'absolute', left: 24, right: 24, top: 130, padding: 24, borderRadius: 26, background: C.surface, border: `1px solid ${C.line2}`, opacity: v, transform: `translateY(${((1 - v) * 30).toFixed(1)}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontFamily: UI, fontSize: 20, color: C.muted}}>Vendas · 7 dias</span><Ico k="chart" s={30} /></div>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 48, color: C.ink, marginTop: 8}}>R$ 25,00</div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, marginTop: 14}}>{bars.map((b, i) => <div key={i} style={{flex: 1, height: `${(b * 100 * P(t, T.vendas + i * .06, .45)).toFixed(1)}%`, borderRadius: 8, background: i === 6 ? C.mint : '#24332D'}} />)}</div>
    </div>
    <div style={{position: 'absolute', left: 24, right: 24, top: 470, padding: 24, borderRadius: 26, background: C.surface, border: `1px solid ${r > .5 ? C.mint : C.line2}`, opacity: r, transform: `translateY(${((1 - r) * 30).toFixed(1)}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontFamily: UI, fontSize: 20, color: C.muted}}>Repasse calculado</span><Ico k="coin" s={30} /></div>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 48, color: C.ink, marginTop: 8}}>R$ 22,00</div>
      <div style={{fontFamily: UI, fontSize: 18, color: C.muted, marginTop: 6}}>Venda R$ 25,00 · comissão R$ 3,00</div>
    </div>
    <div style={{position: 'absolute', left: 24, right: 24, top: 690, padding: '18px 22px', borderRadius: 20, background: C.raised, display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontSize: 19, color: C.muted, opacity: r}}>
      <span>Posto Horizonte · Conector 2</span><span style={{color: C.mint, fontWeight: 700}}>Concluída</span></div>
  </AbsoluteFill>;
};

// ── console da operação (navegador)
const Console: React.FC<{t: number; w?: number}> = ({t, w = 1500}) => {
  const items: Array<[string, 'grid' | 'list' | 'coin' | 'shield', number]> = [['Estações', 'grid', T.est], ['Sessões', 'list', T.ses], ['Financeiro', 'coin', T.fin], ['Auditoria', 'shield', T.aud]];
  const act = items.reduce((m, it, i) => (t >= it[2] - .1 ? i : m), -1);
  const kpis: Array<[string, string]> = [['Receita simulada', 'R$ 25,00'], ['Sessões ativas', '01'], ['Carregadores online', '1 / 1'], ['Energia registrada', '12,5 kWh']];
  const panel = (i: number) => ({opacity: P(t, items[i][2] - .15, .35), border: `1.5px solid ${act === i ? C.mint : C.line2}`, boxShadow: act === i ? `0 0 0 4px rgba(100,230,181,.08)` : undefined});
  return <div style={{width: w, height: w * .58, borderRadius: 22, background: C.bg2, border: `1px solid ${C.line2}`, overflow: 'hidden', boxShadow: '0 60px 120px rgba(0,0,0,.6)', position: 'relative'}}>
    <div style={{height: 44, background: '#121614', display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px'}}>{['#3a403d', '#3a403d', '#3a403d'].map((c, i) => <span key={i} style={{width: 12, height: 12, borderRadius: 6, background: c}} />)}
      <span style={{marginLeft: 18, fontFamily: UI, fontSize: 15, color: C.dim}}>W-EV Console</span></div>
    <div style={{position: 'absolute', left: 0, top: 44, bottom: 0, width: 84, background: '#0E1110', borderRight: `1px solid ${C.line2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 22}}>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 30, color: C.mint, letterSpacing: '-.08em'}}>W</div>
      {items.map(([n, k], i) => <div key={n} style={{width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: act === i ? 'rgba(100,230,181,.14)' : 'transparent'}}><Ico k={k} s={30} c={act === i ? C.mint : C.dim} /></div>)}
    </div>
    <div style={{position: 'absolute', left: 120, right: 36, top: 76}}>
      <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 38, color: C.ink, letterSpacing: '-.02em'}}>Visão geral da rede</div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 22}}>{kpis.map(([k, v], i) => { const a = P(t, T.op + i * .08, .4);
        return <div key={k} style={{padding: '18px 20px', borderRadius: 18, background: C.surface, border: `1px solid ${C.line2}`, opacity: a, transform: `translateY(${((1 - a) * 18).toFixed(1)}px)`}}>
          <div style={{fontFamily: UI, fontSize: 16, color: C.muted}}>{k}</div><div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 36, color: i === 0 ? C.gold : C.ink, marginTop: 6}}>{v}</div></div>; })}</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '218px 218px', gap: 16, marginTop: 16}}>
        <div style={{borderRadius: 18, background: C.surface, padding: 18, position: 'relative', ...panel(0)}}><PanelTitle k="grid" n="Estações" />
          <div style={{display: 'flex', gap: 12, marginTop: 14}}>{['DEMO-001', 'DEMO-002', 'SIM-001'].map((s, i) => <div key={s} style={{flex: 1, padding: 14, borderRadius: 14, background: C.raised}}>
            <div style={{fontFamily: UI, fontSize: 15, color: C.muted}}>{s}</div><div style={{fontFamily: UI, fontWeight: 700, fontSize: 17, color: i === 1 ? C.gold : C.mint, marginTop: 6}}>{i === 1 ? 'Carregando' : 'Disponível'}</div></div>)}</div></div>
        <div style={{borderRadius: 18, background: C.surface, padding: 18, ...panel(1)}}><PanelTitle k="list" n="Sessões" />
          {[['12,5 kWh', 'R$ 25,00', 'Concluída'], ['4,0 kWh', 'R$ 8,00', 'Carregando']].map((r, i) => <div key={i} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 14, padding: '12px 14px', borderRadius: 12, background: C.raised, fontFamily: UI, fontSize: 17, color: C.ink}}>
            <span>{r[0]}</span><span>{r[1]}</span><span style={{color: i ? C.gold : C.mint, fontWeight: 700}}>{r[2]}</span></div>)}</div>
        <div style={{borderRadius: 18, background: C.surface, padding: 18, ...panel(2)}}><PanelTitle k="coin" n="Financeiro" />
          <svg width="560" height="140" style={{marginTop: 8}}><path d="M10 120 L90 118 L170 116 L250 117 L330 110 L410 104 L490 40" stroke={C.gold} strokeWidth="4" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - P(t, T.fin, .9, EASE_IO)} />
            <path d="M10 130 H550" stroke={C.line2} /></svg></div>
        <div style={{borderRadius: 18, background: C.surface, padding: 18, ...panel(3)}}><PanelTitle k="shield" n="Auditoria" />
          {['Recarga concluída · DEMO-001', 'Devolução registrada', 'Repasse calculado'].map((e, i) => { const a = P(t, T.aud + .1 + i * .12, .3);
            return <div key={e} style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, fontFamily: UI, fontSize: 17, color: C.ink, opacity: a}}><span style={{width: 9, height: 9, borderRadius: 5, background: C.mint}} />{e}</div>; })}</div>
      </div>
    </div>
  </div>;
};
const PanelTitle: React.FC<{k: 'grid' | 'list' | 'coin' | 'shield'; n: string}> = ({k, n}) => <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: HEAD, fontWeight: 700, fontSize: 22, color: C.ink}}><Ico k={k} s={26} />{n}</div>;

const Seal: React.FC<{o: number; x: number; y: number}> = ({o, x, y}) => o <= 0 ? null : <div style={{position: 'absolute', left: x, top: y, padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.line}`, fontFamily: UI, fontWeight: 600, fontSize: 18, letterSpacing: '.06em', color: C.muted, opacity: o}}>Exemplo ilustrativo</div>;

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const sMot = S.motorista.t0, sPar = S.parceiros.t0, sOp = S.operacao.t0, sJor = S.jornadas.t0, sSig = S.assinatura.t0;
  // posto: abertura (direita) → centro da rede → some antes dos apps
  const stP = P(t, S.conecta.t0 - .2, .9, EASE_IO), stOut = P(t, sMot - .5, .5, EASE_IN);
  const stX = lerp(1080, 760, stP), stY = lerp(150, 230, stP), stS = lerp(1.05, .62, stP);
  // celular: motorista (direita) → parceiros (mesmo aparelho, troca de app) → jornadas (esquerda)
  const phIn = P(t, sMot - .1, .7, EASE_OUT), phOutOp = P(t, sOp - .3, .5, EASE_IN), phBack = P(t, sJor - .1, .8, EASE_IO);
  const scr = [[0, 'mapa'], [T.qr - .15, 'qr'], [T.valor - .15, 'valor'], [T.acomp - .15, 'rec'], [sPar - .1, 'par']] as Array<[number, string]>;
  let cur = 0; scr.forEach((s, i) => { if (t >= s[0]) cur = i; });
  const sw = cur > 0 ? P(t, scr[cur][0], .35, EASE_IO) : 1;
  const screenOf = (k: string) => k === 'mapa' ? <ScreenMapa t={t} /> : k === 'qr' ? <ScreenQR t={t} /> : k === 'valor' ? <ScreenValor t={t} /> : k === 'rec' ? <ScreenRecarga t={t} /> : <ScreenParceiro t={t} />;
  const phoneX = t < sJor ? lerp(1500, 1380, P(t, sPar - .3, .6, EASE_IO)) : lerp(1380, 520, phBack);
  const phoneVis = phIn * (t < sJor ? 1 - phOutOp : phBack);
  // console: entra na operação, fica à direita nas jornadas
  const coIn = P(t, sOp - .15, .8, EASE_OUT), coJ = P(t, sJor - .1, .8, EASE_IO);
  const coS = t < sJor ? lerp(.92, 1, coIn) : lerp(1, .62, coJ), coX = t < sJor ? 960 : lerp(960, 1340, coJ), coY = t < sJor ? lerp(640, 600, coIn) : lerp(600, 610, coJ);
  const sig = P(t, sSig - .15, .7, EASE_IO);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 78% 30%, rgba(31,82,56,.33) 0%, rgba(11,16,14,0) 70%)'}} />
      <AbsoluteFill style={{opacity: .5, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '96px 96px',
        maskImage: 'radial-gradient(80% 70% at 50% 60%, #000 0%, transparent 75%)', WebkitMaskImage: 'radial-gradient(80% 70% at 50% 60%, #000 0%, transparent 75%)', transform: `translateY(${(-(t * 6) % 96).toFixed(1)}px)`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - sig}}>
        {/* ── abertura e rede */}
        {stOut < 1 ? <div style={{position: 'absolute', left: stX, top: stY, transform: `scale(${stS.toFixed(4)})`, transformOrigin: '0 0', opacity: 1 - stOut}}><Station t={t} t0={-.9} /></div> : null}
        <Kicker t={t} tin={-1} tout={S.abertura.t1 - .3} x={140} y={330}>UMA NOVA ENERGIA PARA IR ALÉM</Kicker>
        <Words t={t} tin={T.proximo - .25} tout={S.abertura.t1 - .3} segs={['O próximo passo | é ', ['elétrico.']]} size={128} x={140} y={390} w={1000} />
        <Words t={t} tin={T.plataforma - .3} tout={sMot - .45} segs={['Uma plataforma de recarga ', ['multimarcas.']]} size={68} x={140} y={110} w={1640} />
        {/* nós da rede: motorista, parceiros, operação */}
        {([['Motorista', 'car', T.dirige, 330, 690], ['Parceiros', 'bolt', T.energia, 1330, 400], ['Operação', 'grid', T.opera, 1330, 820]] as const).map(([n, k, ta, x, y], i) => {
          const a = P(t, ta - .2, .5, BACK), o = 1 - stOut, cx = 1010, cy = 470, ln = P(t, ta - .3, .5, EASE_IO);
          if (a <= 0) return null;
          const pulse = ((t - ta) * .7 + i * .33) % 1;
          return <React.Fragment key={n}>
            <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: o}}>
              <line x1={cx} y1={cy} x2={lerp(cx, x, ln)} y2={lerp(cy, y, ln)} stroke={C.mint} strokeOpacity=".5" strokeWidth="2.5" strokeDasharray="8 10" />
              {ln >= 1 ? <circle cx={lerp(cx, x, pulse)} cy={lerp(cy, y, pulse)} r="7" fill={C.mint} style={{filter: `drop-shadow(0 0 8px ${C.mint})`}} /> : null}
            </svg>
            <div style={{position: 'absolute', left: x - 140, top: y - 52, width: 280, height: 104, borderRadius: 26, background: C.surface, border: `1.5px solid ${C.line2}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', boxSizing: 'border-box',
              opacity: o, transform: `scale(${a.toFixed(3)})`, boxShadow: '0 30px 60px rgba(0,0,0,.45)'}}>
              <div style={{width: 58, height: 58, borderRadius: 16, background: 'rgba(100,230,181,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Ico k={k} s={36} /></div>
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: C.ink}}>{n}</div></div>
          </React.Fragment>; })}

        {/* ── motorista: lista de passos à esquerda; celular à direita */}
        <Kicker t={t} tin={T.mot - .2} tout={sPar - .35} x={140} y={170}>PARA O MOTORISTA</Kicker>
        {(() => { const items: Array<[string, number, 'pin' | 'qr' | 'coin' | 'bolt']> = [['Encontre a estação no mapa', T.mapa, 'pin'], ['Leia o QR do conector', T.qr, 'qr'], ['Escolha o valor', T.valor, 'coin'], ['Acompanhe do início ao fim', T.acomp, 'bolt']];
          const out = P(t, sPar - .35, .3, EASE_IN); if (t < T.mapa - .2 || out >= 1) return null;
          return <div style={{position: 'absolute', left: 140, top: 250, opacity: 1 - out}}>{items.map(([n, ta, k], i) => { const a = P(t, ta - .12, .45), on = a * (i < 3 ? 1 - P(t, items[i + 1][1] - .12, .25) : 1);
            return <div key={n} style={{display: 'flex', alignItems: 'center', gap: 26, height: 150, opacity: a, transform: `translateX(${((1 - a) * -30).toFixed(1)}px)`, filter: a < 1 ? `blur(${((1 - a) * 6).toFixed(1)}px)` : undefined}}>
              <div style={{width: 84, height: 84, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on > .5 ? C.mint : C.surface, border: `1.5px solid ${on > .5 ? C.mint : C.line2}`}}><Ico k={k} s={44} c={on > .5 ? C.mintInk : C.mint} /></div>
              <div><div style={{fontFamily: UI, fontWeight: 700, fontSize: 20, letterSpacing: '.18em', color: on > .5 ? C.mint : C.dim}}>0{i + 1}</div>
                <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 52, letterSpacing: '-.025em', color: on > .5 ? C.ink : 'rgba(237,245,239,.55)'}}>{n}</div></div></div>; })}</div>; })()}
        {/* ── parceiros e operação: títulos */}
        <Kicker t={t} tin={T.parc - .2} tout={sOp - .35} x={140} y={300}>PARA OS PARCEIROS</Kicker>
        <Words t={t} tin={T.vendas - .15} tout={sOp - .35} segs={['Vendas e repasses | ', ['visíveis'], ' em | cada recarga.']} size={84} x={140} y={370} w={1000} />
        <Kicker t={t} tin={T.op - .25} tout={sJor - .35} x={210} y={70}>NA OPERAÇÃO</Kicker>
        {/* ── console */}
        {coIn > 0 ? <div style={{position: 'absolute', left: coX, top: coY, transform: `translate(-50%, -50%) scale(${coS.toFixed(4)})`, opacity: t < sJor ? coIn : 1}}><Console t={t} /></div> : null}
        {/* ── celular */}
        {phoneVis > 0 ? <Phone x={phoneX} y={t < sJor ? 560 : 610} s={t < sJor ? lerp(.92, 1, phIn) : lerp(1, .78, phBack)} o={phoneVis}>
          {cur > 0 && sw < 1 ? <div style={{position: 'absolute', inset: 0, transform: `translateX(${(-sw * 40).toFixed(1)}px)`, opacity: 1 - sw}}>{screenOf(scr[cur - 1][1])}</div> : null}
          <div style={{position: 'absolute', inset: 0, opacity: sw, transform: `translateX(${((1 - sw) * 40).toFixed(1)}px)`}}>{screenOf(scr[cur][1])}</div>
        </Phone> : null}
        <Seal o={fade(t, T.mapa, sOp - .3) + fade(t, T.op, sJor - .3)} x={140} y={980} />
        {/* ── jornadas */}
        {t > sJor - .2 ? <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: P(t, T.uma, .5) * (1 - P(t, sSig - .4, .3))}}>
          <path d="M520 950 C 760 1010, 1000 1010, 1340 940" stroke={C.mint} strokeWidth="3" fill="none" strokeOpacity=".6" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - P(t, T.uma, 1.2, EASE_IO)} />
        </svg> : null}
        <Words t={t} tin={T.uma - .15} tout={sSig - .35} segs={['Uma plataforma.']} size={76} x={160} y={70} w={1600} align="center" />
        <Words t={t} tin={T.muitas - .15} tout={sSig - .35} segs={['Muitas ', ['jornadas.']]} size={76} x={160} y={160} w={1600} align="center" />
      </div>

      {/* ── assinatura */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(50% 55% at 50% 48%, rgba(31,82,56,.55) 0%, rgba(11,16,14,0) 75%)'}} />
        {(() => { const a = P(t, sSig + .05, .8, EASE_OUT);
          return <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: a, transform: `scale(${(.94 + .06 * a).toFixed(4)})`, filter: a < 1 ? `blur(${((1 - a) * 10).toFixed(1)}px)` : undefined}}>
            <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 250, letterSpacing: '-.08em', lineHeight: 1, color: C.mint, display: 'flex', alignItems: 'flex-start'}}>W-EV<span style={{fontSize: 40, letterSpacing: 0, marginTop: 22, marginLeft: 14}}>®</span></div></div>; })()}
        {(() => { const b = P(t, sSig + .35, 1.1, EASE_IO); return <div style={{position: 'absolute', left: 960 - 330, top: 610, width: 660, height: 3, background: `linear-gradient(90deg, rgba(100,230,181,0), ${C.mint}, rgba(100,230,181,0))`, transform: `scaleX(${b.toFixed(3)})`}} />; })()}
        <Words t={t} tin={T.energiaSig - .1} tout={99} segs={['Energia em movimento.']} size={64} weight={500} x={160} y={655} w={1600} align="center" />
        {(() => { const a = P(t, T.energiaSig + 1.2, .6); return <div style={{position: 'absolute', left: 0, right: 0, top: 940, textAlign: 'center', fontFamily: UI, fontWeight: 700, fontSize: 22, letterSpacing: '.3em', color: C.mint, opacity: a * .9}}>POWERED BY WERBOS</div>; })()}
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
