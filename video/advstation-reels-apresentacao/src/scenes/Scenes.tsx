import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {SANS, SERIF} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, prog, progS} from '../theme/animation';
import {Atmos, Flash, GoldLabel, Headline, Mark, ScreenCrop, sceneOut} from '../components/Vertical';
import {A_PATH, Selo, Vinheta} from '../components/Brand';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';
import {Easing} from 'remotion';

// Capturas REAIS enviadas pelo cliente (Escritório Demonstração, dados fictícios).
const ML_CLI = {src: 'assets/maternidade-legal/clientes.png', iw: 1915, ih: 1075};
const ML_DASH = {src: 'assets/maternidade-legal/dashboard.png', iw: 1918, ih: 1078};
const ML_PROT = {src: 'assets/maternidade-legal/protocolo.png', iw: 1918, ih: 1075};
const PG_DASH = {src: 'assets/previdenciario-geral/dashboard.png', iw: 1918, ih: 1078};
const PG_ADM = {src: 'assets/previdenciario-geral/administrativo.png', iw: 1918, ih: 1077};
const DEMO = 'Escritório Demonstração · dados fictícios';

const Shell: React.FC<{f: number; dur: number; children: React.ReactNode; amber?: number; flash?: boolean; enter?: 'fade' | 'circle'}> = ({f, dur, children, amber, flash, enter = 'fade'}) => {
  const o = sceneOut(f, dur);
  const pin = prog(f, 0, enter === 'circle' ? 16 : 7, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: enter === 'fade' ? pin : 1, clipPath: enter === 'circle' ? `circle(${(pin * 1200).toFixed(1)}px at 540px 960px)` : undefined}}>
      <Atmos amber={amber} />
      <AbsoluteFill style={o}>{children}</AbsoluteFill>
      {flash ? <Flash f={f} at={0} /> : null}
    </AbsoluteFill>
  );
};

/** Vinheta padrão (réplica de .asvv, em 9:16) com título e selos dos dois sistemas. Jingle oficial no início. */
export const SVinheta: React.FC = () => (
  <AbsoluteFill>
    <Vinheta t0={0} titulo={<>Conheça a<br />ADV Station</>} subtitulo="Gestão para a advocacia previdenciária"
      selos={<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}><Selo produto="maternidade" nome="Maternidade Legal" /><Selo produto="previdenciario" nome="Previdenciário Geral" /></div>} />
  </AbsoluteFill>
);

/** 1 · Gancho: cada cliente, uma etapa (tela Clientes: Setor e Etapa). */
export const S1: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v1.dur;
  const tEt = wordAt('v1', 'etapa'), tCl = wordAt('v1', 'cliente');
  const marks: Mark[] = [
    {x: 777, y: 204, w: 106, h: 22, start: tCl}, {x: 777, y: 290, w: 70, h: 22, start: tCl + 3},
    {x: 921, y: 204, w: 96, h: 22, start: tEt, ring: true}, {x: 921, y: 290, w: 177, h: 22, start: tEt + 3, ring: true},
  ];
  return (
    <Shell f={f} dur={D} enter="circle">
      <GoldLabel f={f} start={4} text="ADV STATION" y={280} />
      <Headline f={f} start={8} text="Cada cliente,|uma [etapa.]" y={340} size={110} />
      <ScreenCrop f={f} {...ML_CLI} x={90} y={640} w={900} h={760} enter={10} tag={DEMO}
        keys={[{at: 0, r: [330, 140, 820]}, {at: tCl - 8, dur: 22, r: [740, 150, 420]}]} marks={marks} />
    </Shell>
  );
};

/** 2 · Dois sistemas: Maternidade Legal e Previdenciário Geral (dashboards reais). */
export const S2: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v2.dur;
  const tM = wordAt('v2', 'Maternidade') - 6, tP = wordAt('v2', 'Previdenciário') - 6;
  const selo = (t: number) => ({opacity: prog(f, t + 6, 12), transform: `translateY(${(1 - prog(f, t + 6, 12, EASE_OUT)) * 20}px)`});
  return (
    <Shell f={f} dur={D} flash>
      <GoldLabel f={f} start={2} text="UMA FAMÍLIA DE SISTEMAS" y={280} />
      <Headline f={f} start={6} text="Dois sistemas.|Um só [caminho.]" y={340} size={96} />
      <ScreenCrop f={f} {...ML_DASH} x={90} y={620} w={900} h={380} enter={12} keys={[{at: 0, r: [290, 0, 1600]}, {at: tM, dur: 60, r: [290, 90, 1560]}]} />
      <div style={{position: 'absolute', left: 90, top: 1018, ...selo(tM)}}><Selo produto="maternidade" nome="Maternidade Legal" u={1.25} /></div>
      <ScreenCrop f={f} {...PG_DASH} x={90} y={1110} w={900} h={380} enter={22} keys={[{at: 0, r: [290, 0, 1600]}, {at: tP, dur: 60, r: [290, 90, 1560]}]} />
      <div style={{position: 'absolute', left: 90, top: 1508, ...selo(tP)}}><Selo produto="previdenciario" nome="Previdenciário Geral" u={1.25} /></div>
    </Shell>
  );
};

/** 3 · Maternidade Legal: Comercial → Relacionamento → Protocolo (menu real + trilho dourado). */
export const S3: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v3.dur;
  const items: Array<[string, string, number]> = [['comercial', 'COMERCIAL', 204], ['relacionamento', 'RELACIONAMENTO', 248], ['protocolo', 'PROTOCOLO', 292]];
  const s = 430 / 225, Y0 = 150, cardY = 620;
  const t = items.map(([w]) => wordAt('v3', w));
  return (
    <Shell f={f} dur={D}>
      <GoldLabel f={f} start={2} text="MATERNIDADE LEGAL" y={280} />
      <Headline f={f} start={6} text="A jornada|da [cliente.]" y={340} size={104} />
      <ScreenCrop f={f} {...ML_CLI} x={90} y={cardY} w={430} h={900} enter={8} keys={[{at: 0, r: [12, Y0, 225]}]}
        marks={items.map(([, , y], i) => ({x: 22, y: y - 14, w: 200, h: 28, start: t[i] - 2}))} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {items.map(([, , y], i) => {
          const cy = cardY + (y - Y0) * s;
          const next = i < 2 ? cardY + (items[i + 1][2] - Y0) * s : cy;
          const p = prog(f, t[i] - 2, 12, EASE_OUT), pl = i < 2 ? prog(f, t[i] + 6, (t[i + 1] - t[i]) - 6, EASE_IO) : 0;
          return <g key={i}>
            {i < 2 ? <line x1={565} y1={cy} x2={565} y2={cy + (next - cy) * pl} stroke={C.gold} strokeWidth={4} strokeLinecap="round" /> : null}
            <circle cx={565} cy={cy} r={12 * p} fill={C.gold} />
            <line x1={520} y1={cy} x2={520 + 45 * p} y2={cy} stroke={C.gold} strokeWidth={3} />
          </g>;
        })}
      </svg>
      {items.map(([, label, y], i) => {
        const p = prog(f, t[i] - 2, 14, EASE_OUT);
        return <div key={label} style={{position: 'absolute', left: 600, top: cardY + (y - Y0) * s - 22, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '.08em',
          color: '#fff', opacity: p, transform: `translateX(${(1 - p) * 30}px)`, whiteSpace: 'nowrap'}}>{label}</div>;
      })}
    </Shell>
  );
};

/** 4 · Etapas reais do Setor de Protocolo: a câmera percorre os chips e o trilho acende etapa a etapa. */
export const S4: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v4.dur;
  const st: Array<[string, string, number, number, number]> = [
    ['protocolado,', 'Protocolado', 728, 846, 187], ['análise,', 'Em análise', 857, 965, 187], ['exigência,', 'Exigência INSS', 976, 1108, 187],
    ['concedido,', 'Concedido', 1603, 1713, 187], ['implantação', 'Implantação', 328, 445, 225], ['recebendo', 'Recebendo benefício', 456, 623, 225]];
  const t = st.map(([w]) => wordAt('v4', w));
  const CW = 620; // largura do recorte (px da imagem)
  const keys = [{at: 0, r: [320, 60, 1420] as [number, number, number]}, ...st.map(([, , x0, x1, y], i) => ({at: t[i] - 8, dur: 12, r: [Math.max(320, Math.min(1918 - CW, (x0 + x1) / 2 - CW / 2)), y - 100, CW] as [number, number, number]}))];
  const marks: Mark[] = st.map(([, , x0, x1, y], i) => ({x: x0, y, w: x1 - x0, h: y === 187 ? 28 : 30, start: t[i] - 4, ring: true}));
  return (
    <Shell f={f} dur={D}>
      <GoldLabel f={f} start={2} text="SETOR DE PROTOCOLO" y={280} />
      <Headline f={f} start={6} text="Etapa por [etapa.]" y={340} size={104} />
      <ScreenCrop f={f} {...ML_PROT} x={90} y={520} w={900} h={360} enter={6} keys={keys} marks={marks} />
      <div style={{position: 'absolute', left: 90, top: 940, width: 900}}>
        {st.map(([, label], i) => {
          const on = prog(f, t[i] - 4, 10, EASE_OUT), cur = f >= t[i] - 4 && (i === st.length - 1 || f < t[i + 1] - 4);
          return <div key={label} style={{display: 'flex', alignItems: 'center', gap: 26, height: 100, opacity: 0.35 + 0.65 * on}}>
            <div style={{width: 34, height: 34, borderRadius: 17, border: `3px solid ${on > .5 ? C.gold : 'rgba(255,255,255,.4)'}`, background: on > .5 ? C.gold : 'transparent',
              transform: `scale(${cur ? 1.15 : 1})`}} />
            <div style={{fontFamily: cur ? SERIF : SANS, fontWeight: cur ? 700 : 800, fontSize: cur ? 62 : 38, letterSpacing: cur ? 0 : '.04em', color: cur ? '#fff' : 'rgba(255,255,255,.9)',
              whiteSpace: 'nowrap'}}>{cur ? label : label.toUpperCase()}</div>
          </div>;
        })}
        <div style={{position: 'absolute', left: 15, top: 50, width: 4, height: 500 * Math.min(1, prog(f, t[0], t[5] - t[0], (x) => x)), background: C.gold, borderRadius: 2, zIndex: -1}} />
      </div>
    </Shell>
  );
};

/** 5 · Painel da Maternidade: distribuição por setor, partos próximos e sem contato. */
export const S5: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v5.dur;
  const tD = wordAt('v5', 'distribuição'), tP = wordAt('v5', 'partos'), tS = wordAt('v5', 'contato');
  return (
    <Shell f={f} dur={D}>
      <GoldLabel f={f} start={2} text="PAINEL DA MATERNIDADE" y={280} />
      <Headline f={f} start={6} text="Tudo à vista|no [painel.]" y={340} size={104} />
      <ScreenCrop f={f} {...ML_DASH} x={90} y={640} w={900} h={820} enter={6} tag={DEMO}
        keys={[{at: 0, r: [290, 20, 1000]}, {at: tD - 10, dur: 20, r: [1340, 262, 525]}]}
        marks={[{x: 1362, y: 338, w: 478, h: 108, start: tD}, {x: 1362, y: 472, w: 478, h: 52, start: tP}, {x: 1362, y: 537, w: 478, h: 22, start: tS}]} />
    </Shell>
  );
};

/** 6 · Previdenciário Geral: o administrativo organiza cada pedido (etapas reais do Pipeline INSS). */
export const S6: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v6.dur;
  const tA = wordAt('v6', 'administrativo'), tC = wordAt('v6', 'coleta'), tK = wordAt('v6', 'concedido.');
  const order = [0, 4, 1, 3, 5]; // Coletando documentos → Preparando protocolo → Protocolado INSS → Exigência INSS → Benefício concedido
  const marks: Mark[] = order.map((r, i) => ({x: 1252, y: 222 + 39 * r, w: 140, h: 22, start: Math.round(tC + (tK - tC) * i / (order.length - 1)), ring: true}));
  return (
    <Shell f={f} dur={D} flash amber={0.8}>
      <GoldLabel f={f} start={2} text="PREVIDENCIÁRIO GERAL" y={280} />
      <Headline f={f} start={6} text="Do documento|à [concessão.]" y={340} size={104} />
      <ScreenCrop f={f} {...PG_ADM} x={90} y={640} w={900} h={760} enter={6} tag={DEMO}
        keys={[{at: 0, r: [296, 20, 1570]}, {at: tA - 6, dur: 22, r: [880, 165, 640]}]} marks={marks} />
    </Shell>
  );
};

/** 7 · Judicial: publicações, perícias, audiências e prazos processuais (menu e painel reais). */
export const S7: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v7.dur;
  const it: Array<[string, string, number]> = [['judicial,', 'Judicial', 292], ['publicações,', 'Publicações', 336], ['perícias,', 'Perícias', 380], ['audiências', 'Audiências', 424], ['prazos', 'Prazos processuais', 468]];
  const t = it.map(([w]) => wordAt('v7', w));
  return (
    <Shell f={f} dur={D} amber={0.8}>
      <GoldLabel f={f} start={2} text="JUDICIAL E PRAZOS" y={280} />
      <Headline f={f} start={6} text="Tudo no|mesmo [lugar.]" y={340} size={104} />
      <ScreenCrop f={f} {...PG_DASH} x={90} y={620} w={430} h={560} enter={6} keys={[{at: 0, r: [12, 262, 225]}]}
        marks={it.map(([, , y], i) => ({x: 22, y: y - 14, w: 205, h: 28, start: t[i] - 2}))} />
      {it.map(([, label], i) => {
        const p = prog(f, t[i] - 2, 12, EASE_OUT);
        return <div key={label} style={{position: 'absolute', left: 570, top: 650 + i * 100, display: 'flex', alignItems: 'center', gap: 16, opacity: 0.3 + 0.7 * p}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: p > .5 ? C.gold : 'rgba(255,255,255,.4)'}} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: '.03em', color: '#fff', whiteSpace: 'nowrap'}}>{label}</span></div>;
      })}
      <ScreenCrop f={f} {...PG_DASH} x={90} y={1240} w={900} h={250} enter={t[4] - 8} keys={[{at: 0, r: [1098, 412, 760]}]}
        marks={[{x: 1118, y: 452, w: 712, h: 80, start: t[4] + 2}]} tag={DEMO} />
    </Shell>
  );
};

/** 8 · Financeiro: previsão de faturamento, valores a receber e fluxo de caixa (painel real). */
export const S8: React.FC = () => {
  const f = useCurrentFrame(); const D = SCENES.v8.dur;
  const tP = wordAt('v8', 'previsão'), tR = wordAt('v8', 'receber'), tF = wordAt('v8', 'fluxo');
  return (
    <Shell f={f} dur={D}>
      <GoldLabel f={f} start={2} text="FINANCEIRO" y={280} />
      <Headline f={f} start={6} text="Os números|do [escritório.]" y={340} size={104} />
      <ScreenCrop f={f} {...PG_DASH} x={90} y={660} w={900} h={640} enter={6} tag={DEMO}
        keys={[{at: 0, r: [300, 596, 720]}, {at: tR - 6, dur: 18, r: [300, 640, 660]}, {at: tF - 8, dur: 20, r: [300, 640, 660]}]}
        marks={[{x: 305, y: 627, w: 300, h: 98, start: tP}, {x: 305, y: 752, w: 1550, h: 132, start: tR}, {x: 305, y: 958, w: 1030, h: 100, start: tF}]} />
    </Shell>
  );
};

/** 9 · Cartão final editorial: assinatura animada da marca (tempos do manual) + CTA serifado + selos. */
const E_PLAT = Easing.bezier(0.2, 0.9, 0.2, 1), E_A = Easing.bezier(0.3, 1.6, 0.5, 1), E_L = Easing.bezier(0.3, 1.4, 0.5, 1);
export const S9: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const plat = progS(t, 0.05, 0.4, E_PLAT), a = progS(t, 0.22, 0.6, E_A);
  const tC = wordAt('v9', 'cada');
  const cta = prog(f, tC - 2, 16, EASE_OUT), end = prog(f, tC + 26, 16, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 8)}}>
      <Atmos amber={1.2} ay={60} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <svg viewBox="0 0 100 100" width={300} height={300} style={{overflow: 'visible'}}>
          <path d={A_PATH} fill="#fff" transform={`translate(0 87) scale(1 ${a}) translate(0 -87)`} />
          <rect x={9} y={79} width={82} height={8} rx={4} fill={C.gold} transform={`translate(50 83) scale(${plat} 1) translate(-50 -83)`} />
        </svg>
        <div style={{marginTop: 26, display: 'flex', fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: '.32em', paddingLeft: '.32em', color: '#fff'}}>
          {'ADV STATION'.split('').map((l, i) => { const p = progS(t, 0.42 + i * 0.03, 0.45, E_L);
            return <span key={i} style={{display: 'inline-block', opacity: Math.min(1, Math.max(0, p)), transform: `translateY(${20 * (1 - p)}px)`}}>{l === ' ' ? ' ' : l}</span>; })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 880, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 84, lineHeight: 1.06, color: '#fff',
        opacity: cta, transform: `translateY(${(1 - cta) * 24}px)`}}>Cada cliente no<br /><span style={{color: C.gold}}>trilho certo.</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: end, transform: `translateY(${(1 - end) * 20}px)`}}>
        <div style={{display: 'flex', gap: 14}}><Selo produto="maternidade" nome="Maternidade Legal" /><Selo produto="previdenciario" nome="Previdenciário Geral" /></div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: '.06em', color: C.gold}}>advstation.io</div>
      </div>
    </AbsoluteFill>
  );
};
export const _unused = {EASE_IN};
