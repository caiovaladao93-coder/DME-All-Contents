import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import MON from './data/monitor.json';
import {C} from './theme/colors';
import {APOIO, SERIF} from './theme/typography';
import {loadFonts} from './components/Fonts';
import {Selo, Vinheta} from './components/Brand';

loadFonts();
/*
 * ADV Station · demonstração real do produto (68 s, 9:16).
 * Um único computador (foto Pexels 6483591, parede passada a marinho) recebe as CAPTURAS REAIS dos sistemas na área útil da tela,
 * sem esticar (1918 × 1077 ↔ 2878 × 1617). A câmera alterna três escalas: equipamento → tela frontal → detalhe da operação.
 * Destaques dourados marcam uma região real por vez; os textos ficam numa camada de leitura fora da câmera.
 * A vinheta padrão (réplica oficial de .asvv + jingle) abre e fecha o filme. Tudo é função do quadro (t = frame / 30).
 */
const EIO = Easing.bezier(0.65, 0, 0.35, 1), EOUT = Easing.bezier(0.22, 1, 0.36, 1);
const P = (t: number, a: number, d: number, e = EOUT) => interpolate(t, [a, a + Math.max(1e-3, d)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const norm = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/gi, '').toLowerCase();
const wt = (fid: string, w: string) => { const h = (TL.words as any)[fid].find((x: any) => norm(x[0]) === norm(w)); if (!h) throw new Error(`${fid}:${w}`); return h[1] as number; };

// ── telas reais (mesma resolução das capturas originais)
const TELAS = {
  mlCli: 'assets/telas/ml-clientes.png', mlProt: 'assets/telas/ml-protocolo.png',
  pgAdm: 'assets/telas/pg-administrativo.png', pgDash: 'assets/telas/pg-dashboard.png',
} as const;
type Tela = keyof typeof TELAS;
const SW = 1918, SH = 1077, SC = MON.screen, KX = SC.w / SW, KY = SC.h / SH;
// ponto da captura → coordenadas da foto
const sx = (x: number) => SC.x + x * KX, sy = (y: number) => SC.y + y * KY;
// câmera para enquadrar uma região da captura (centro x/y e largura em px da captura) no quadro (largura útil 1080)
const R = (cx: number, cy: number, w: number, dy = 0): Cam => [sx(cx), sy(cy) - dy / (1080 / (w * KX)), 1080 / (w * KX)];
type Cam = [number, number, number];
const EQUIP: Cam = [MON.W / 2, MON.H - 960 / (1080 / MON.W), 1080 / MON.W];          // equipamento inteiro (largura da foto = 1080)
const FRONT: Cam = [SC.x + SC.w / 2, SC.y + SC.h / 2 + 60, 1010 / SC.w];             // tela quase frontal, moldura parcialmente visível

// ── roteiro da câmera (tempo, câmera) e das telas
const T = {
  cada: wt('v1', 'cada'), gestao: wt('v2', 'gestão'), mat: wt('v3', 'Maternidade'), org: wt('v3', 'organização'), etapas: wt('v3', 'etapas'),
  prep: wt('v4', 'preparação'), desf: wt('v4', 'desfecho'), clar: wt('v4', 'clareza'),
  prev: wt('v5', 'Previdenciário'), adm: wt('v5', 'administrativas'), jud: wt('v5', 'judiciais'),
  apos: wt('v6', 'Aposentadorias'), pens: wt('v6', 'pensão'),
  info: wt('v7', 'Informações'), oper: wt('v7', 'operacionais'), fin: wt('v7', 'financeiras'), conj: wt('v7', 'ajudam'),
  duas: wt('v8', 'Duas'), orgz: wt('v8', 'organizar'), acomp: wt('v8', 'acompanhar'), coord: wt('v8', 'coordenar'),
};
const KEYS: Array<[number, Cam]> = [
  [3.6, [EQUIP[0], EQUIP[1] - 260, EQUIP[2] * .94]], [6.0, EQUIP], [12.6, [EQUIP[0], EQUIP[1] + 200, EQUIP[2] * 1.08]],             // contexto: aproximação curta
  [14.6, FRONT], [16.0, FRONT], [17.0, R(1060, 300, 640)], [22.4, R(1040, 300, 660)],                                                // ML clientes: contexto → região útil
  [23.3, R(820, 280, 640)], [25.2, R(820, 280, 640)], [26.4, R(1430, 280, 640)], [28.6, R(1430, 280, 640)],                          // ML etapas: desliza pelas etapas
  [29.7, FRONT], [30.3, EQUIP], [31.2, EQUIP], [32.6, FRONT], [33.6, FRONT], [34.6, R(1190, 350, 640)], [36.0, R(1190, 350, 640)],   // troca de produto pelo equipamento; PG administrativo
  [36.8, R(690, 410, 800)], [37.9, R(690, 410, 800)], [38.9, FRONT], [43.4, FRONT],                                                   // judicial (painel) → visão da tela
  [44.3, R(690, 190, 820)], [45.3, R(1470, 190, 820)], [45.8, R(1470, 190, 820)], [46.6, R(770, 676, 960)], [47.6, R(770, 676, 960)], // gerencial: operação → financeiro
  [49.0, FRONT], [50.6, EQUIP], [58.0, EQUIP], [61.4, [EQUIP[0], EQUIP[1] + 200, EQUIP[2] * 1.06]],                                   // portfólio; a borda do queixo branco conduz à vinheta
];
const camAt = (t: number): Cam => {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 1; i < KEYS.length; i++) {
    const [ta, a] = KEYS[i - 1], [tb, b] = KEYS[i];
    if (t <= tb) { const p = EIO((t - ta) / (tb - ta)); return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)]; }
  }
  return KEYS[KEYS.length - 1][1];
};
// tela exibida no monitor (passagens limpas: dissolve de 0,35 s)
const SCREENS: Array<[number, Tela]> = [[0, 'mlCli'], [22.85, 'mlProt'], [30.3, 'pgAdm'], [36.35, 'pgDash'], [49.4, 'mlCli'], [55.4, 'pgDash']];
// destaques (uma região real por vez; coordenadas da captura)
type HL = {tela: Tela; x: number; y: number; w: number; h: number; t0: number; t1: number};
const HLS: HL[] = [
  {tela: 'mlCli', x: 766, y: 158, w: 350, h: 290, t0: T.org - .1, t1: 22.6},                 // Setor + Etapa de cada cliente
  {tela: 'mlProt', x: 546, y: 184, w: 422, h: 36, t0: T.prep - .1, t1: 25.7},                 // Preparando protocolo · Protocolado · Em análise
  {tela: 'mlProt', x: 1420, y: 184, w: 296, h: 36, t0: 26.3, t1: 29.4},                        // Em Recurso Ordinário · Concedido
  {tela: 'pgAdm', x: 905, y: 178, w: 580, h: 342, t0: T.adm - .1, t1: 36.25},                  // Benefício · Setor · Etapa (administrativo)
  {tela: 'pgDash', x: 692, y: 316, w: 362, h: 172, t0: T.jud, t1: 38.2},                       // Judicial: protocolados, procedentes…
  {tela: 'pgDash', x: 304, y: 137, w: 1552, h: 106, t0: T.oper - .1, t1: 46.1},                // Operação
  {tela: 'pgDash', x: 304, y: 624, w: 926, h: 104, t0: T.fin, t1: 48.7},                       // Financeiro
];

const Screen: React.FC<{t: number}> = ({t}) => {
  let cur = 0; for (let i = 0; i < SCREENS.length; i++) if (t >= SCREENS[i][0]) cur = i;
  const prev = cur > 0 ? SCREENS[cur - 1][1] : null, k = P(t, SCREENS[cur][0], .35, EIO);
  const tela = SCREENS[cur][1];
  return (
    <div style={{position: 'absolute', left: SC.x, top: SC.y, width: SC.w, height: SC.h, overflow: 'hidden', background: '#f6f1e8'}}>
      {prev && k < 1 ? <Img src={staticFile(TELAS[prev])} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} /> : null}
      <Img src={staticFile(TELAS[tela])} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: k}} />
      {/* destaque: reduz o entorno e contorna a região real (não altera a interface) */}
      {HLS.filter((h) => h.tela === tela && t > h.t0 - .05 && t < h.t1 + .4).map((h, i) => {
        const o = P(t, h.t0, .45) * (1 - P(t, h.t1, .35, EIO)), x = h.x * KX, y = h.y * KY, w = h.w * KX, hh = h.h * KY, pad = 14;
        return <svg key={i} width={SC.w} height={SC.h} style={{position: 'absolute', inset: 0, opacity: o}}>
          <path fillRule="evenodd" fill="rgba(14,27,51,.42)" d={`M0 0H${SC.w}V${SC.h}H0Z M${x - pad} ${y - pad}h${w + 2 * pad}v${hh + 2 * pad}h${-(w + 2 * pad)}Z`} />
          <rect x={x - pad} y={y - pad} width={w + 2 * pad} height={hh + 2 * pad} rx={10} fill="none" stroke={C.gold} strokeWidth={6} vectorEffect="non-scaling-stroke"
            strokeDasharray={2 * (w + hh + 4 * pad)} strokeDashoffset={(1 - P(t, h.t0, .6, EIO)) * 2 * (w + hh + 4 * pad)} />
        </svg>;
      })}
      {/* vidro: brilho muito suave só nas bordas, sem glare sobre a informação */}
      <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,.18)'}} />
    </div>
  );
};

const Title: React.FC<{t: number; t0: number; t1: number; size?: number; top?: number; children: React.ReactNode; label?: string}> = ({t, t0, t1, size = 86, top = 300, children, label}) => {
  const p = P(t, t0, .55), q = P(t, t1, .3, EIO); if (p <= 0 || q >= 1) return null;
  return <div style={{position: 'absolute', left: 90, right: 90, top, opacity: 1 - q}}>
    {label ? <div style={{fontFamily: APOIO, fontWeight: 700, fontSize: 26, letterSpacing: '.18em', color: C.gold, marginBottom: 14, opacity: p}}>{label}</div> : null}
    <div style={{overflow: 'hidden', paddingBottom: 10}}>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: '#fff', transform: `translateY(${((1 - p) * 105).toFixed(1)}%)`,
        filter: p < .98 ? `blur(${((1 - p) * 5).toFixed(1)}px)` : undefined}}>{children}</div>
    </div>
  </div>;
};
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.gold}}>{children}</span>;

/** Etiqueta editorial de benefício (fora da interface, ligada à região destacada por um filete curto). */
const Etiqueta: React.FC<{t: number; t0: number; t1: number; text: string; y: number}> = ({t, t0, t1, text, y}) => {
  const p = P(t, t0, .5), q = P(t, t1, .3, EIO); if (p <= 0 || q >= 1) return null;
  return <div style={{position: 'absolute', left: 90, top: y, display: 'flex', alignItems: 'center', gap: 16, opacity: (1 - q) * Math.min(1, p * 2), transform: `translateX(${((1 - p) * -24).toFixed(1)}px)`}}>
    <div style={{width: 60 * p, height: 3, background: C.gold}} />
    <div style={{padding: '12px 24px', borderRadius: 12, background: 'rgba(14,27,51,.88)', border: `2px solid ${C.gold}`, fontFamily: APOIO, fontWeight: 700, fontSize: 40, color: '#fff'}}>{text}</div>
  </div>;
};

export const Film: React.FC<{audio?: boolean; captions?: boolean}> = ({audio = true, captions = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const [cx, cy, z] = camAt(t);
  const inScene = t > 3.5 && t < 62.6;
  const toCream = P(t, 61.55, .9, EIO);                       // o marfim sobe a partir da borda do queixo branco do monitor
  const chinTop = 960 + (MON.chinY - cy) * z;
  const detail = Math.min(1, Math.max(0, (z - .5) / .4));    // 0 = equipamento/tela, 1 = detalhe
  const demoTag = t > 14.3 && t < 49.2;
  const cap = (TL.captions as any[]).find((c) => t >= c.start && t < c.end);
  return (
    <AbsoluteFill style={{background: C.navy}}>
      {inScene ? <AbsoluteFill>
        <div style={{position: 'absolute', left: 0, top: 0, width: MON.W, height: MON.H, transformOrigin: '0 0',
          transform: `translate(${(540 - cx * z).toFixed(2)}px, ${(960 - cy * z).toFixed(2)}px) scale(${z.toFixed(5)})`}}>
          <Img src={staticFile('assets/computador/monitor.jpg')} style={{position: 'absolute', left: 0, top: 0, width: MON.W, height: MON.H}} />
          <Screen t={t} />
        </div>
        {/* leitura dos títulos sobre a interface (mais forte no detalhe) */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,27,51,.92) 0%, rgba(14,27,51,.75) 18%, rgba(14,27,51,0) 34%)', opacity: .35 + .65 * detail}} />
        {toCream > 0 ? <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 20%, #fffaf0 0%, #f7f1e3 55%, #eadfca 100%)', clipPath: `inset(${(chinTop * (1 - toCream)).toFixed(1)}px 0 0 0)`}} /> : null}
      </AbsoluteFill> : null}

      {/* camada de leitura: uma mensagem por vez */}
      <Title t={t} t0={T.cada - .1} t1={8.0}>Cada caso tem<br />seu <G>caminho</G></Title>
      <Title t={t} t0={T.gestao - .1} t1={14.2} size={76}>Gestão para a advocacia <G>previdenciária</G></Title>
      <Title t={t} t0={T.mat - .1} t1={22.7}>Maternidade<br />Legal</Title>
      <Etiqueta t={t} t0={T.org + .3} t1={22.6} text="Informações organizadas" y={1250} />
      <Title t={t} t0={T.clar - .1} t1={29.6} label="MATERNIDADE LEGAL">Clareza sobre<br /><G>cada etapa</G></Title>
      <Title t={t} t0={T.prev - .1} t1={37.9}>Previdenciário<br />Geral</Title>
      <Title t={t} t0={T.apos - .05} t1={T.pens - .3} size={76} label="PREVIDENCIÁRIO GERAL">Aposentadorias<br />Benefícios por incapacidade</Title>
      <Title t={t} t0={T.pens - .05} t1={43.6} size={76} label="PREVIDENCIÁRIO GERAL">Pensão por morte<br />Auxílio-acidente</Title>
      <Title t={t} t0={T.info - .1} t1={T.fin - .2} size={80}>Visão da <G>operação</G></Title>
      <Title t={t} t0={T.fin} t1={49.1} size={76}>Informação para acompanhar a <G>gestão</G></Title>
      {/* portfólio: os dois produtos com hierarquia equivalente (selos oficiais do manual) */}
      {(() => { const p = P(t, T.duas - .1, .5), q = P(t, T.orgz - .4, .3, EIO); if (p <= 0 || q >= 1) return null;
        return <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateY(${((1 - p) * 20).toFixed(1)}px)`}}>
          <Selo produto="maternidade" nome="Maternidade Legal" u={1.6} /><Selo produto="previdenciario" nome="Previdenciário Geral" u={1.6} /></div>; })()}
      <Title t={t} t0={T.orgz - .1} t1={T.acomp - .3}><G>Organização</G></Title>
      <Title t={t} t0={T.acomp - .05} t1={T.coord - .3}><G>Acompanhamento</G></Title>
      <Title t={t} t0={T.coord - .05} t1={56.5}><G>Clareza</G></Title>

      {demoTag ? <div style={{position: 'absolute', right: 90, top: 256, fontFamily: APOIO, fontWeight: 600, fontSize: 22, letterSpacing: '.08em', color: 'rgba(255,255,255,.78)',
        padding: '6px 14px', borderRadius: 10, background: 'rgba(14,27,51,.7)', opacity: P(t, 14.4, .4) * (1 - P(t, 48.9, .3))}}>Dados demonstrativos</div> : null}
      {captions && cap && t > 4 && t < 62.4 ? <div style={{position: 'absolute', left: 90, right: 90, top: 1370, display: 'flex', justifyContent: 'center', opacity: Math.min(1, (t - cap.start) / .15, (cap.end - t) / .12)}}>
        <div style={{maxWidth: 900, padding: '14px 26px 16px', borderRadius: 14, background: 'rgba(10,18,34,.84)', fontFamily: APOIO, fontWeight: 600, fontSize: 42, lineHeight: 1.22, color: '#fff', textAlign: 'center'}}>{cap.text}</div>
      </div> : null}

      {/* vinheta padrão: abertura (sem título) e encerramento (com o CTA) */}
      {t < 4.2 ? <Sequence durationInFrames={126}><VinIn /></Sequence> : null}
      <Sequence from={Math.round(62.5 * 30)}><VinOut /></Sequence>

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.falas as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};

// abertura: vinheta oficial; a partir de 3,55 s ela cede lugar à cena (o círculo da cena se abre a partir do símbolo)
const VinIn: React.FC = () => { const f = useCurrentFrame(); const t = f / 30; const o = 1 - P(t, 3.55, .55, EIO);
  return <AbsoluteFill style={{clipPath: o < 1 ? `circle(${(o * 140).toFixed(2)}% at 50% 47%)` : undefined}}><Vinheta t0={0} /></AbsoluteFill>; };
// encerramento: vinheta oficial com o CTA no lugar do título
const VinOut: React.FC = () => <AbsoluteFill><Vinheta t0={0} titulo={<>Conheça nossas<br />soluções</>} /></AbsoluteFill>;
