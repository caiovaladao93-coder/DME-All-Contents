import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline, FeatureLabel, GoldAccentLine} from '../components/Editorial';
import {ProductScreenshot, ScreenSpotlight} from '../components/ProductScreenshot';
import {AnimatedStationLine, linePoint, Seg, Station} from '../components/StationMap';
import {SCREENS} from '../data/assets';
import {wordAt} from '../data/narration';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/animation';
import {SANS} from '../theme/typography';
import {ProductTitle} from './ProductParts';

const LINE: Seg[] = [[[1980, 780], [1620, 780], [1320, 780], [960, 780]]];
// Composição invertida: esquerda ~60% (tela real), direita ~40% (texto)
const WIN = {x: 150, y: 120, w: 1010, h: 600};
const LABELS: Array<{t: string; w: string}> = [
  {t: 'APOSENTADORIAS', w: 'aposentadorias,'}, {t: 'BENEFÍCIOS POR INCAPACIDADE', w: 'incapacidade,'},
  {t: 'PENSÃO POR MORTE', w: 'pensão'}, {t: 'AUXÍLIO-ACIDENTE', w: 'auxílio-acidente,'},
];

/** CENA 05 — Produto 02: Previdenciário Geral (telas reais: Dashboard Executivo e Administrativo). */
export const PrevidenciarioGeral: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 0, 44, EASE_IO);
  const intro = 1 - prog(f, 52, 12, EASE_IN);
  const winIn = prog(f, 58, 26);
  const wPG = wordAt('previdenciario', 'previdenciário');
  const wEstr = wordAt('previdenciario', 'estrutura');
  const navAt = wordAt('previdenciario', 'rotinas.') - 30;
  const nav = prog(f, navAt, 16, EASE_IO);
  const labelsOut = prog(f, 346, 12, EASE_IN);
  const firstLabel = wordAt('previdenciario', LABELS[0].w);
  const lastLabel = wordAt('previdenciario', LABELS[3].w);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: intro}}>
        <AnimatedStationLine segs={LINE} draw={draw} />
        <Station p={linePoint(LINE, Math.min(0.999, draw))} scale={1.1} />
      </svg>
      <div style={{opacity: intro}}>
        <EditorialHeadline text="Previdenciário [Geral]" start={14} x={150} y={360} width={1620} size={100} align="center" />
        <div style={{position: 'absolute', left: 150, right: 150, top: 500, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: '#C9D2E0', opacity: prog(f, 28, 16)}}>
          Gestão para diferentes benefícios previdenciários.</div>
      </div>

      {/* esquerda: Dashboard Executivo → Administrativo (navegação), câmera nas áreas citadas */}
      {f >= 56 ? (
        <div style={{position: 'absolute', inset: 0, opacity: winIn, transform: `translateY(${((1 - winIn) * 45).toFixed(1)}px)`}}>
          {f < navAt + 16 ? (
            <ProductScreenshot screen={SCREENS.pgDashboard} product="Previdenciário Geral · Dashboard Executivo" {...WIN} style={{opacity: 1 - nav}}
              focus={[{at: wPG - 16, dur: 30, s: 1.55, cx: 690, cy: 410}, {at: wEstr - 4, dur: 30, s: 1.7, cx: 1470, cy: 475}]}
              overlay={<>
                <ScreenSpotlight x={305} y={255} w={768} h={315} start={wPG} end={wEstr - 6} />
                <ScreenSpotlight x={1105} y={412} w={738} h={142} start={wEstr + 18} />
              </>} />
          ) : null}
          {f >= navAt ? (
            <ProductScreenshot screen={SCREENS.pgAdministrativo} product="Previdenciário Geral · Administrativo" {...WIN}
              style={{opacity: nav, transform: `translateX(${((1 - nav) * 60).toFixed(1)}px)`}}
              focus={[{at: navAt + 10, dur: 28, s: 1.6, cx: 1200, cy: 355}, {at: 356, dur: 40, s: 1, cx: 959, cy: 300}]}
              overlay={<ScreenSpotlight x={905} y={178} w={592} h={350} start={navAt + 30} end={354} />} />
          ) : null}
        </div>
      ) : null}

      {/* direita: título, linha dourada com ponto e benefícios — cada etiqueta na palavra dita */}
      {f >= 58 ? <ProductTitle n="PRODUTO 02" name={<>Previdenciário <span style={{color: C.gold}}>Geral</span></>} sub="Gestão para diferentes benefícios previdenciários." x={1230} y={120} w={560} start={60} size={48} /> : null}
      {f >= firstLabel - 10 ? <GoldAccentLine x={1230} y={455} w={540} start={firstLabel - 10} dur={16} dotAt={lerp(0, 1, prog(f, firstLabel, lastLabel - firstLabel + 10))} exit={346} /> : null}
      {LABELS.map((l, i) => {
        const at = wordAt('previdenciario', l.w);
        const e = prog(f, at, 14);
        return <FeatureLabel key={l.t} text={l.t} x={1230 + (1 - e) * 30} y={490 + i * 80} dark opacity={e * (1 - labelsOut)} style={{padding: '12px 18px', transform: 'scale(.92)', transformOrigin: 'left center'}} />;
      })}
      <EditorialHeadline text="Gestão para|diferentes rotinas|previdenciárias." start={356} x={1230} y={500} width={560} size={46} lineStagger={10} />
    </AbsoluteFill>
  );
};
