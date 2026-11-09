import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline, FeatureLabel, GoldAccentLine} from '../components/Editorial';
import {ProductScreenshot} from '../components/ProductScreenshot';
import {AnimatedStationLine, linePoint, Seg, Station} from '../components/StationMap';
import {SCREENS} from '../data/assets';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/animation';
import {ProductTitle} from './ProductParts';

const LINE: Seg[] = [[[1980, 780], [1620, 780], [1320, 780], [960, 780]]];
// Composição invertida: esquerda ~60% (tela real), direita ~40% (texto).
const SCR = {x: 150, y: 150, w: 950, h: 594};
const LABELS = ['APOSENTADORIAS', 'BENEFÍCIOS POR INCAPACIDADE', 'PENSÃO POR MORTE', 'AUXÍLIO-ACIDENTE'];
const NAV: Array<keyof typeof SCREENS> = ['pgDashboard', 'pgAdministrativo', 'pgJudicial', 'pgPrazos'];
const NAV_AT = [0, 262, 292, 322];

/** CENA 05 — Produto 02: Previdenciário Geral. */
export const PrevidenciarioGeral: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 0, 50, EASE_IO);
  const intro = 1 - prog(f, 62, 14, EASE_IN);
  const scrIn = prog(f, 72, 24);
  const rise = (1 - prog(f, 72, 30)) * 45;
  const back = prog(f, 352, 50, EASE_IO);
  const scrScale = lerp(1, 1.04, prog(f, 72, 180, EASE_IO)) * lerp(1, 0.94, back);
  const labelsOut = prog(f, 346, 12, EASE_IN);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      {/* linha inferior do mapa conduz à segunda estação */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: intro}}>
        <AnimatedStationLine segs={LINE} draw={draw} />
        <Station p={linePoint(LINE, Math.min(0.999, draw))} scale={1.1} />
      </svg>
      <div style={{opacity: intro}}>
        <EditorialHeadline text="Previdenciário [Geral]" start={18} x={150} y={360} width={1620} size={100} align="center" />
        <div style={{position: 'absolute', left: 150, right: 150, top: 500, textAlign: 'center', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 34,
          color: '#C9D2E0', opacity: prog(f, 34, 16)}}>Gestão para diferentes benefícios previdenciários.</div>
      </div>

      {/* esquerda: capturas com navegação fluida entre módulos */}
      {f >= 70 ? (
        <div style={{position: 'absolute', inset: 0, opacity: scrIn, transform: `translateY(${rise.toFixed(1)}px) scale(${scrScale})`, transformOrigin: `${SCR.x + SCR.w / 2}px ${SCR.y + SCR.h / 2}px`}}>
          {NAV.map((k, i) => {
            const at = NAV_AT[i];
            if (f < at) return null;
            const p = i === 0 ? 1 : prog(f, at, 14, EASE_IO);
            const gone = i < NAV.length - 1 && f >= NAV_AT[i + 1] + 14;
            if (gone) return null;
            return <ProductScreenshot key={k} src={SCREENS[k].src} desc={SCREENS[k].desc} product="Previdenciário Geral" {...SCR}
              style={{opacity: p, transform: `translateX(${((1 - p) * 60).toFixed(1)}px)`}} />;
          })}
        </div>
      ) : null}

      {/* direita: título, linha dourada com ponto e etiquetas dos benefícios */}
      {f >= 72 ? <ProductTitle n="PRODUTO 02" name={<>Previdenciário <span style={{color: C.gold}}>Geral</span></>} sub="Gestão para diferentes benefícios previdenciários." x={1180} y={150} w={590} start={74} /> : null}
      {f >= 166 ? <GoldAccentLine x={1180} y={470} w={560} start={166} dur={18} dotAt={Math.min(1, prog(f, 170, 4 * 8 + 14))} exit={346} /> : null}
      {LABELS.map((t, i) => {
        const e = prog(f, 172 + i * 8, 16);
        return <FeatureLabel key={t} text={t} x={1180 + (1 - e) * 30} y={500 + i * 84} dark opacity={e * (1 - labelsOut)} style={{padding: '12px 20px'}} />;
      })}
      <EditorialHeadline text="Gestão para|diferentes rotinas|previdenciárias." start={356} x={1180} y={520} width={600} size={46} lineStagger={10} />
    </AbsoluteFill>
  );
};
