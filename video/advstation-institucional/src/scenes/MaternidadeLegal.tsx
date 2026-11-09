import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline} from '../components/Editorial';
import {ProductScreenshot, ScreenSpotlight} from '../components/ProductScreenshot';
import {AnimatedStationLine, linePoint, Seg, Station} from '../components/StationMap';
import {SCREENS} from '../data/assets';
import {wordAt} from '../data/narration';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {SANS} from '../theme/typography';
import {ProductTitle, ScreenHeadline} from './ProductParts';

const LINE: Seg[] = [[[-60, 300], [300, 300], [600, 300], [960, 300]]];
// Composição: esquerda ~40% (texto), direita ~60% (tela real)
const WIN = {x: 760, y: 120, w: 1010, h: 600};
// Etapas REAIS do Setor de Protocolo (capturadas na tela enviada)
const STAGES = [
  {t: 'Recebido do relacionamento', key: ''}, {t: 'Preparando protocolo', key: ''}, {t: 'Protocolado', key: 'protocolo'},
  {t: 'Em análise', key: ''}, {t: 'Concedido', key: 'deferimento'}, {t: 'Em Recurso Ordinário', key: 'recurso,'},
];

/** CENA 04 — Produto 01: Maternidade Legal (telas reais: Clientes e Setor de Protocolo). */
export const MaternidadeLegal: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 0, 44, EASE_IO);
  const intro = 1 - prog(f, 52, 12, EASE_IN);
  const winIn = prog(f, 58, 22);
  const wClientes = wordAt('maternidade', 'clientes,');
  const wProt = wordAt('maternidade', 'protocolo');
  const swapAt = wProt - 22;
  const swap = prog(f, swapAt, 16, EASE_IO);
  const listAt = wProt - 8;
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      {/* a linha superior do mapa conduz à estação do produto */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: intro}}>
        <AnimatedStationLine segs={LINE} draw={draw} />
        <Station p={linePoint(LINE, Math.min(0.999, draw))} scale={1.1} />
      </svg>
      <div style={{opacity: intro}}>
        <EditorialHeadline text="Maternidade Legal" start={14} x={150} y={360} width={1620} size={100} align="center" />
        <div style={{position: 'absolute', left: 150, right: 150, top: 500, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: '#C9D2E0', opacity: prog(f, 28, 16)}}>
          Gestão especializada em salário-maternidade.</div>
      </div>

      {f >= 58 ? <ProductTitle n="PRODUTO 01" name="Maternidade Legal" sub="Gestão especializada em salário-maternidade." x={150} y={120} w={560} start={60} /> : null}

      {/* etapas reais do sistema, acesas na palavra dita */}
      {f >= listAt ? (
        <div style={{position: 'absolute', left: 150, top: 430}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 16, letterSpacing: '.22em', color: '#8FA0BC', opacity: prog(f, listAt, 12)}}>ETAPAS DO SETOR DE PROTOCOLO</div>
          {STAGES.map((s, i) => {
            const e = prog(f, listAt + 4 + i * 5, 14, EASE_OUT);
            const lit = s.key ? prog(f, wordAt('maternidade', s.key), 10) : 0;
            return (
              <div key={s.t} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, opacity: e, transform: `translateX(${((1 - e) * -16).toFixed(1)}px)`}}>
                <span style={{width: 10, height: 10, borderRadius: 5, background: lit > 0.5 ? C.gold : 'rgba(255,255,255,.35)'}} />
                <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, padding: '6px 14px', borderRadius: 999,
                  color: lit > 0.5 ? C.navy : '#E3E8F0', background: `rgba(194,155,60,${(lit * 0.95).toFixed(2)})`, border: `1px solid rgba(255,255,255,${(0.22 * (1 - lit)).toFixed(2)})`}}>{s.t}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* direita: capturas reais com câmera dirigida */}
      {f >= 56 ? (
        <div style={{position: 'absolute', inset: 0, opacity: winIn, transform: `translateY(${((1 - winIn) * 30).toFixed(1)}px)`}}>
          {f < swapAt + 16 ? (
            <ProductScreenshot screen={SCREENS.mlClientes} product="Maternidade Legal · Clientes" {...WIN} style={{opacity: 1 - swap}}
              focus={[{at: wClientes - 14, dur: 30, s: 1.85, cx: 935, cy: 320}]}
              overlay={<ScreenSpotlight x={762} y={190} w={350} h={258} start={wClientes} />} />
          ) : null}
          {f >= swapAt ? (
            <ProductScreenshot screen={SCREENS.mlProtocolo} product="Maternidade Legal · Setor de Protocolo" {...WIN}
              style={{opacity: swap, transform: `translateX(${((1 - swap) * 50).toFixed(1)}px)`}}
              focus={[{at: swapAt + 8, dur: 30, s: 1.3, cx: 1020, cy: 250}, {at: 352, dur: 40, s: 1, cx: 959, cy: 300}]}
              overlay={<ScreenSpotlight x={322} y={182} w={1398} h={76} start={wProt} end={350} />} />
          ) : null}
        </div>
      ) : null}
      <ScreenHeadline label="MATERNIDADE LEGAL" text="Do protocolo ao deferimento ou recurso." x={800} y={640} w={780} start={wordAt('maternidade', 'recurso,') + 4} exit={356} />
      <ScreenHeadline label="MATERNIDADE LEGAL" text="Uma rotina especializada." x={800} y={660} w={640} start={366} />
    </AbsoluteFill>
  );
};
