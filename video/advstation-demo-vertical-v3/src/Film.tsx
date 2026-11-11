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
 * ADV Station · institucional vertical v2 (revisão). Lógica:
 *   A FRASE PREPARA (plano aberto, título fora do monitor, legenda oculta) → O TÍTULO SAI →
 *   A CÂMERA CHEGA (zoom contínuo sobre a MESMA captura, sem trocar imagem) → A INTERFACE DEMONSTRA (≥ 2,5 s, câmera parada) →
 *   A LEGENDA ACOMPANHA (só no estado de zoom, posição fixa, longe do alvo).
 * Trocas de tela acontecem apenas com a câmera parada (equipamento ou tela frontal) ou entre telas de layout idêntico.
 * Tudo é função do quadro (t = frame / 30).
 */
const EIO = Easing.bezier(0.65, 0, 0.35, 1), EOUT = Easing.bezier(0.22, 1, 0.36, 1);
const P = (t: number, a: number, d: number, e = EOUT) => interpolate(t, [a, a + Math.max(1e-3, d)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const norm = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/gi, '').toLowerCase();
const wt = (fid: string, w: string) => { const h = (TL.words as any)[fid].find((x: any) => norm(x[0]) === norm(w)); if (!h) throw new Error(`${fid}:${w}`); return h[1] as number; };

// ── telas reais (dimensões originais; escala UNIFORME na área útil do monitor — nada é esticado)
const TELAS = {
  mlCli: {src: 'assets/telas/ml-clientes.png', w: 1915, h: 1075},
  mlProt: {src: 'assets/telas/ml-protocolo.png', w: 2000, h: 1121},
  pgAdm: {src: 'assets/telas/pg-administrativo.png', w: 2000, h: 1123},
  pgJud: {src: 'assets/telas/pg-judicial.png', w: 2000, h: 1124},
  pgPrazos: {src: 'assets/telas/pg-prazos.png', w: 2000, h: 1124},
  pgDash: {src: 'assets/telas/pg-dashboard.png', w: 2000, h: 1124},
} as const;
type Tela = keyof typeof TELAS;
const SC = MON.screen;
const K = (tela: Tela) => SC.w / TELAS[tela].w;                                         // px da captura → px da foto
type Cam = [number, number, number];
/** câmera que coloca a região (centro cx/cy, largura w em px da captura) com largura útil de 1000 px e centro vertical em y = alvoY */
const R = (tela: Tela, cx: number, cy: number, w: number, alvoY = 800): Cam => {
  const k = K(tela), z = 1000 / (w * k);
  return [SC.x + cx * k, SC.y + cy * k + (960 - alvoY) / z, z];
};
const EQUIP: Cam = [MON.W / 2, MON.H - 960 / (1080 / MON.W), 1080 / MON.W];
const EQUIP2: Cam = [MON.W / 2 + 90, EQUIP[1] - 60, EQUIP[2] * .97];                    // enquadramento renovado na troca de produto
const FRONT: Cam = [SC.x + SC.w / 2, SC.y + SC.h / 2 + 60, 1010 / SC.w];                // tela frontal, moldura parcialmente visível

// ── tempos (palavras reais)
const T = {
  cada: wt('r1', 'Cada'), sua: wt('r1', 'Sua'), familia: wt('r2', 'família'), mat: wt('r3', 'Maternidade'), orgd: wt('r3', 'organizados'),
  onde: wt('r4', 'onde'), exige: wt('r4', 'exige'), prev: wt('r5', 'Previdenciário'), apos: wt('r6', 'Aposentadorias'),
  aprox: wt('r7', 'Aproxime'), amplie: wt('r7', 'Amplie'), info: wt('r8', 'Informações'), fin: wt('r8', 'financeiras'),
  duas: wt('r9', 'Duas'), org: wt('r9', 'organizar'), acomp: wt('r9', 'acompanhar'), coord: wt('r9', 'coordenar'),
};
// ── câmera: [tempo, câmera]. Cada aproximação tem destino definido e chega PARADA para a observação.
const KEYS: Array<[number, Cam]> = [
  [2.0, [EQUIP[0], EQUIP[1] - 160, EQUIP[2] * .96]], [12.9, [EQUIP[0], EQUIP[1] + 120, EQUIP[2] * 1.05]],   // abertura (aproximação lenta desde o 1º segundo)
  [16.75, [EQUIP[0], EQUIP[1] + 160, EQUIP[2] * 1.06]], [17.85, R('mlCli', 941, 303, 620)], [20.45, R('mlCli', 941, 303, 620)],   // ML · organização
  [21.2, FRONT], [22.45, FRONT], [23.4, R('mlProt', 720, 236, 760, 760)], [25.15, R('mlProt', 720, 236, 760, 760)],              // pergunta na parede → etapas
  [25.85, R('mlProt', 1310, 356, 620)], [28.0, R('mlProt', 1310, 356, 620)],                                                         // → o que exige atenção (tags)
  [28.7, EQUIP2], [30.75, EQUIP2], [31.75, R('pgAdm', 1210, 365, 640)], [34.5, R('pgAdm', 1210, 365, 640)],                         // troca de produto → administrativo
  [35.15, R('pgJud', 1222, 262, 640)], [39.7, R('pgJud', 1222, 262, 640)],                                                           // corte no mesmo layout → judicial
  [40.45, EQUIP], [41.65, EQUIP], [42.45, R('pgPrazos', 1505, 425, 640)], [44.6, R('pgPrazos', 1505, 425, 640)],                   // "do detalhe…" → prazos
  [45.3, FRONT], [45.65, FRONT], [46.5, R('pgDash', 720, 560, 860, 940)], [51.0, R('pgDash', 720, 560, 860, 940)],                // "…ao conjunto" → painel (operação + financeiro)
  [51.85, EQUIP], [61.6, [EQUIP[0], EQUIP[1] + 200, EQUIP[2] * 1.06]],                                                              // síntese no equipamento
];
const camAt = (t: number): Cam => {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 1; i < KEYS.length; i++) {
    const [ta, a] = KEYS[i - 1], [tb, b] = KEYS[i];
    if (t <= tb) { const p = EIO((t - ta) / (tb - ta)); return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)]; }
  }
  return KEYS[KEYS.length - 1][1];
};
// ── estados explícitos de montagem: a legenda só existe no zoom/demonstração
const ZOOM: Array<[number, number]> = [[17.3, 20.6], [22.9, 28.15], [31.3, 39.85], [42.0, 44.9], [46.3, 51.15]];
const zoomVis = (t: number) => ZOOM.reduce((m, [a, b]) => Math.max(m, Math.min(P(t, a, .25), 1 - P(t, b - .2, .2))), 0);
// ── telas: troca só com câmera parada (EQUIP/FRONT) ou entre layouts idênticos (administrativo → judicial)
const SCREENS: Array<[number, Tela, number]> = [[0, 'mlCli', 0], [21.3, 'mlProt', .3], [28.95, 'pgAdm', .3], [34.55, 'pgJud', .3], [40.6, 'pgPrazos', .3], [45.35, 'pgDash', .25], [51.9, 'mlCli', .4], [56.0, 'pgDash', .4]];
// ── destaques: uma região por vez, só durante a observação; escurecimento leve
type HL = {tela: Tela; x: number; y: number; w: number; h: number; t0: number; t1: number};
const HLS: HL[] = [
  {tela: 'mlCli', x: 766, y: 158, w: 350, h: 290, t0: 18.0, t1: 20.3},           // Setor + Etapa
  {tela: 'mlProt', x: 342, y: 194, w: 666, h: 34, t0: 23.6, t1: 25.05},          // etapas reais do setor de protocolo
  {tela: 'mlProt', x: 1164, y: 320, w: 294, h: 76, t0: 26.0, t1: 27.9},          // tags: sem contato há mais de 10 dias · inadimplente
  {tela: 'pgAdm', x: 950, y: 186, w: 520, h: 358, t0: 32.0, t1: 34.45},          // Benefício · Setor · Etapa (administrativo)
  {tela: 'pgJud', x: 968, y: 186, w: 520, h: 156, t0: 35.4, t1: 39.6},           // Benefício · Etapa (judicial)
  {tela: 'pgPrazos', x: 1206, y: 318, w: 610, h: 214, t0: 42.6, t1: 44.5},       // Vencimento · Dias restantes · Status
  {tela: 'pgDash', x: 318, y: 140, w: 800, h: 112, t0: 46.7, t1: 48.5},          // Operação
  {tela: 'pgDash', x: 318, y: 650, w: 960, h: 106, t0: 48.7, t1: 50.9},          // Financeiro
];

const Shot: React.FC<{tela: Tela; o: number; t: number}> = ({tela, o, t}) => {
  const k = K(tela), h = TELAS[tela].h * k;
  return <div style={{position: 'absolute', left: 0, top: (SC.h - h) / 2, width: SC.w, height: h, opacity: o}}>
    <Img src={staticFile(TELAS[tela].src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    {HLS.filter((x) => x.tela === tela && t > x.t0 - .05 && t < x.t1 + .4).map((x, i) => {
      const v = P(t, x.t0, .4) * (1 - P(t, x.t1, .35, EIO)), X = x.x * k, Y = x.y * k, W = x.w * k, H = x.h * k, pad = 12;
      return <svg key={i} width={SC.w} height={h} style={{position: 'absolute', inset: 0, opacity: v}}>
        <path fillRule="evenodd" fill="rgba(14,27,51,.16)" d={`M0 0H${SC.w}V${h}H0Z M${X - pad} ${Y - pad}h${W + 2 * pad}v${H + 2 * pad}h${-(W + 2 * pad)}Z`} />
        <rect x={X - pad} y={Y - pad} width={W + 2 * pad} height={H + 2 * pad} rx={10} fill="none" stroke={C.gold} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />
      </svg>;
    })}
  </div>;
};
const Screen: React.FC<{t: number}> = ({t}) => {
  let cur = 0; for (let i = 0; i < SCREENS.length; i++) if (t >= SCREENS[i][0]) cur = i;
  const k = cur > 0 ? P(t, SCREENS[cur][0], SCREENS[cur][2], EIO) : 1;
  return <div style={{position: 'absolute', left: SC.x, top: SC.y, width: SC.w, height: SC.h, overflow: 'hidden', background: '#f6f1e8'}}>
    {cur > 0 && k < 1 ? <Shot tela={SCREENS[cur - 1][1]} o={1} t={t} /> : null}
    <Shot tela={SCREENS[cur][1]} o={k} t={t} />
  </div>;
};

/** Título editorial: só em plano aberto, fora da área do monitor. Máscara com deslocamento curto; saída rápida. */
const Title: React.FC<{t: number; t0: number; t1: number; size?: number; top?: number; align?: 'left' | 'right'; children: React.ReactNode}> = ({t, t0, t1, size = 104, top = 330, align = 'left', children}) => {
  const p = P(t, t0, .6), q = P(t, t1, .3, EIO); if (p <= 0 || q >= 1) return null;
  return <div style={{position: 'absolute', left: 90, right: 90, top, textAlign: align, opacity: 1 - q, overflow: 'hidden', paddingBottom: 14}}>
    <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: '-.01em', color: '#fff', transform: `translateY(${((1 - p) * 60).toFixed(1)}%)`, opacity: Math.min(1, p * 1.6)}}>{children}</div>
  </div>;
};
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.gold}}>{children}</span>;

export const Film: React.FC<{audio?: boolean; captions?: boolean}> = ({audio = true, captions = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const [cx, cy, z] = camAt(t);
  const toCream = P(t, 61.95, .8, EIO);
  const chinTop = 960 + (MON.chinY - cy) * z;
  const zv = zoomVis(t);
  const cap = (TL.captions as any[]).find((c) => t >= c.start && t < c.end);
  const synth = (w: string, a: number) => <div style={{opacity: P(t, a, .45), transform: `translateY(${((1 - P(t, a, .5)) * 26).toFixed(1)}px)`}}>{w}</div>;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      {t > 1.85 && t < 62.85 ? <AbsoluteFill>
        <div style={{position: 'absolute', left: 0, top: 0, width: MON.W, height: MON.H, transformOrigin: '0 0',
          transform: `translate(${(540 - cx * z).toFixed(2)}px, ${(960 - cy * z).toFixed(2)}px) scale(${z.toFixed(5)})`}}>
          <Img src={staticFile('assets/computador/monitor.jpg')} style={{position: 'absolute', left: 0, top: 0, width: MON.W, height: MON.H}} />
          <Screen t={t} />
        </div>
        {toCream > 0 ? <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 20%, #fffaf0 0%, #f7f1e3 55%, #eadfca 100%)', clipPath: `inset(${(chinTop * (1 - toCream)).toFixed(1)}px 0 0 0)`}} /> : null}
      </AbsoluteFill> : null}

      {/* ── PLANO ABERTO: títulos fora do monitor (nunca sobre a interface) */}
      <Title t={t} t0={T.cada - .05} t1={4.15} size={112}>Cada caso tem<br />seu <G>caminho</G></Title>
      <Title t={t} t0={T.sua - .05} t1={6.75} size={100} align="right" top={360}>Sua gestão<br />precisa <G>acompanhar</G></Title>
      {(() => { const p = P(t, T.familia - .15, .5), q = P(t, 12.75, .3, EIO); if (p <= 0 || q >= 1) return null;
        return <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateY(${((1 - p) * 20).toFixed(1)}px)`}}>
          <Selo produto="maternidade" nome="Maternidade Legal" u={1.7} /><Selo produto="previdenciario" nome="Previdenciário Geral" u={1.7} /></div>; })()}
      <Title t={t} t0={T.mat - .1} t1={15.2} size={108}>Maternidade<br />Legal</Title>
      <Title t={t} t0={15.3} t1={16.35} size={96} top={360}>Informações<br /><G>reunidas</G></Title>
      <Title t={t} t0={21.25} t1={22.35} size={100} top={300}>Onde está<br />cada <G>caso</G>?</Title>
      <Title t={t} t0={T.prev - .1} t1={30.6} size={104} top={340}>Previdenciário<br />Geral</Title>
      <Title t={t} t0={40.45} t1={41.55} size={100} top={340}>Do detalhe<br />ao <G>conjunto</G></Title>
      {/* síntese: os dois produtos com o mesmo peso → composição progressiva de verbos, no mesmo alinhamento */}
      {(() => { const p = P(t, Math.max(T.duas, 51.9), .45), q = P(t, T.org - .45, .3, EIO); if (p <= 0 || q >= 1) return null;
        return <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, p * 1.5) * (1 - q)}}>
          <Selo produto="maternidade" nome="Maternidade Legal" u={1.7} /><Selo produto="previdenciario" nome="Previdenciário Geral" u={1.7} /></div>; })()}
      {t > T.org - .2 && t < 58.6 ? <div style={{position: 'absolute', left: 90, top: 300, fontFamily: SERIF, fontWeight: 700, fontSize: 104, lineHeight: 1.08, color: '#fff', opacity: 1 - P(t, 58.25, .3, EIO)}}>
        {synth('Organizar.', T.org - .1)}{synth('Acompanhar.', T.acomp - .1)}<div style={{color: C.gold}}>{synth('Coordenar.', T.coord - .1)}</div></div> : null}

      {/* ── ZOOM/DEMONSTRAÇÃO: só a legenda (posição fixa, longe do alvo) e a identificação externa dos dados */}
      {zv > 0 ? <div style={{position: 'absolute', right: 90, top: 256, opacity: zv, fontFamily: APOIO, fontWeight: 600, fontSize: 22, letterSpacing: '.06em', color: 'rgba(255,255,255,.85)',
        padding: '6px 14px', borderRadius: 10, background: 'rgba(14,27,51,.78)'}}>Dados demonstrativos</div> : null}
      {captions && cap && zv > 0 ? <div style={{position: 'absolute', left: 120, right: 120, top: 1330, display: 'flex', justifyContent: 'center', opacity: zv * Math.min(1, (t - cap.start) / .15, (cap.end - t) / .12)}}>
        <div style={{maxWidth: 840, padding: '14px 26px 16px', borderRadius: 14, background: 'rgba(14,27,51,.86)', fontFamily: APOIO, fontWeight: 600, fontSize: 44, lineHeight: 1.22, color: '#fff', textAlign: 'center'}}>{cap.text}</div>
      </div> : null}

      {/* ── vinheta padrão: abertura curta e encerramento com o CTA */}
      {t < 2.5 ? <Sequence durationInFrames={76}><VinIn /></Sequence> : null}
      <Sequence from={Math.round(62.8 * 30)}><VinOut /></Sequence>

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.falas as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};

const VinIn: React.FC = () => { const f = useCurrentFrame(); const t = f / 30; const o = 1 - P(t, 1.95, .5, EIO);
  return <AbsoluteFill style={{clipPath: o < 1 ? `circle(${(o * 140).toFixed(2)}% at 50% 47%)` : undefined}}><Vinheta t0={0} /></AbsoluteFill>; };
const VinOut: React.FC = () => <AbsoluteFill><Vinheta t0={0} titulo={<>Conheça nossas<br />soluções</>} /></AbsoluteFill>;
