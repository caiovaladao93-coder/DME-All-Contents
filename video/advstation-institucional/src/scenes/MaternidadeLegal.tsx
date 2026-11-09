import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {CinematicImage} from '../components/CinematicImage';
import {EditorialHeadline} from '../components/Editorial';
import {ProductScreenshot, ScreenSpotlight} from '../components/ProductScreenshot';
import {AnimatedStationLine, linePoint, Seg, Station} from '../components/StationMap';
import {PHOTOS, SCREENS} from '../data/assets';
import {EASE_IN, EASE_IO, lerp, prog} from '../theme/animation';
import {FlowTimeline, ProductTitle, ScreenHeadline} from './ProductParts';

const LINE: Seg[] = [[[-60, 300], [300, 300], [600, 300], [960, 300]]];
// Composição: esquerda ~40% (texto), direita ~60% (tela real).
const SCR = {x: 820, y: 150, w: 950, h: 594};

/** CENA 04 — Produto 01: Maternidade Legal. */
export const MaternidadeLegal: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 0, 50, EASE_IO);
  const intro = 1 - prog(f, 62, 14, EASE_IN);
  const scrIn = prog(f, 72, 22);
  const swap = prog(f, 250, 18, EASE_IO);
  const back = prog(f, 352, 50, EASE_IO);
  const scrScale = lerp(0.96, 1.02, prog(f, 72, 100, EASE_IO)) * lerp(1, 0.94, back);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      {/* linha superior do mapa entra e a estação para no centro */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: intro}}>
        <AnimatedStationLine segs={LINE} draw={draw} />
        <Station p={linePoint(LINE, Math.min(0.999, draw))} scale={1.1} />
      </svg>
      <div style={{opacity: intro}}>
        <EditorialHeadline text="Maternidade Legal" start={18} x={150} y={360} width={1620} size={100} align="center" />
        <div style={{position: 'absolute', left: 150, right: 150, top: 500, textAlign: 'center', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 34,
          color: '#C9D2E0', opacity: prog(f, 34, 16)}}>Gestão especializada em salário-maternidade.</div>
      </div>

      {/* coluna esquerda (40%) */}
      {f >= 72 ? <ProductTitle n="PRODUTO 01" name="Maternidade Legal" sub="Gestão especializada em salário-maternidade." x={150} y={150} w={590} start={74} /> : null}
      {f >= 84 && f < 270 ? (
        <div style={{opacity: prog(f, 86, 18) * (1 - prog(f, 244, 18))}}>
          <CinematicImage src={PHOTOS.s04.src} desc={PHOTOS.s04.desc} dur={190} cam={{s0: 1.02, s1: 1.08}} box={{x: 150, y: 470, w: 590, h: 360, r: 16}} tagPos={{right: 14, top: 14, maxWidth: 420}} />
        </div>
      ) : null}
      {f >= 258 ? <FlowTimeline x={150} y={480} start={262} steps={[{t: 'PROTOCOLO'}, {t: 'ACOMPANHAMENTO'}, {t: 'DESFECHO', sub: 'Deferimento ou recurso'}]} /> : null}

      {/* coluna direita (60%): capturas reais */}
      {f >= 70 ? (
        <div style={{position: 'absolute', inset: 0, opacity: scrIn, transform: `scale(${scrScale})`, transformOrigin: `${SCR.x + SCR.w / 2}px ${SCR.y + SCR.h / 2}px`}}>
          <ProductScreenshot src={SCREENS.mlClientes.src} desc={SCREENS.mlClientes.desc} product="Maternidade Legal" {...SCR}
            zoom={{start: 170, dur: 70, s0: 1, s1: 1.08, ox: 55, oy: 45}} style={{opacity: 1 - swap}} />
          {f >= 250 ? <ProductScreenshot src={SCREENS.mlProtocolo.src} desc={SCREENS.mlProtocolo.desc} product="Maternidade Legal" {...SCR}
            style={{opacity: swap, transform: `translateX(${((1 - swap) * 40).toFixed(1)}px)`}} /> : null}
        </div>
      ) : null}
      <ScreenSpotlight x={1010} y={350} w={700} h={210} start={176} end={240} />
      <ScreenHeadline label="MATERNIDADE LEGAL" text="Do protocolo ao deferimento ou recurso." x={860} y={630} w={760} start={284} exit={350} />
      <ScreenHeadline label="MATERNIDADE LEGAL" text="Uma rotina especializada." x={860} y={660} w={640} start={364} />
    </AbsoluteFill>
  );
};
