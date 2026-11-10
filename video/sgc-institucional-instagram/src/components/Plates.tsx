import React from 'react';
import {Img, staticFile} from 'remotion';
import {C} from '../theme/colors';
import {PHOTOS, PlateKey} from '../data/photos';

/*
 * "Fotografias" geradas em código para o quadro vertical (1080×1920): luz azul suave à direita, luz quente discreta
 * ao fundo, profundidade de campo por desfoque. Não há pessoas nem imagens reais (nenhuma foto foi fornecida).
 * Se uma foto licenciada for colocada em public/assets/photography e registrada em data/photos.ts, ela substitui o plano.
 */

const Bokeh: React.FC<{items: Array<[number, number, number, string]>; blur?: number}> = ({items, blur = 18}) => (
  <div style={{position: 'absolute', inset: 0, filter: `blur(${blur}px)`}}>
    {items.map(([x, y, r, c], i) => <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: c}} />)}
  </div>
);
const WARM = 'rgba(255,170,90,.32)', COOL = 'rgba(110,160,240,.28)', WHITE = 'rgba(220,230,255,.18)';

const Room: React.FC<{tone?: 'night' | 'dawn'}> = ({tone = 'night'}) => (
  <div style={{position: 'absolute', inset: 0, background: tone === 'night'
    ? 'radial-gradient(ellipse 90% 60% at 70% 30%, #15336E 0%, #0B1F48 40%, #06132E 70%, #030A1A 100%)'
    : 'linear-gradient(180deg, #0E2A5C 0%, #1E3F78 38%, #5A5F86 58%, #B98463 72%, #2A2440 86%, #0A1226 100%)'}} />
);

/** Luz azul vinda da direita (key light) e vinheta. */
const Light: React.FC = () => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(255deg, rgba(90,150,255,.22) 0%, rgba(90,150,255,0) 45%)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(0,0,0,0) 45%, rgba(2,6,16,.7) 100%)'}} />
  </>
);

const Paper: React.FC<{x: number; y: number; w: number; h: number; r: number; chart?: boolean}> = ({x, y, w, h, r, chart}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 6, background: '#E6EAF1', transform: `rotate(${r}deg)`, boxShadow: '0 18px 36px rgba(0,0,0,.45)', padding: w * .1}}>
    {[88, 66, 80, 54, 72].map((v, j) => <div key={j} style={{width: `${v}%`, height: h * .022, borderRadius: 4, background: 'rgba(17,24,39,.2)', marginTop: j ? h * .045 : 0}} />)}
    {chart ? <svg width={w * .8} height={h * .3} style={{marginTop: h * .08}}><path d={`M0 ${h * .25} L${w * .2} ${h * .18} L${w * .4} ${h * .2} L${w * .6} ${h * .1} L${w * .8} ${h * .05}`} fill="none" stroke="rgba(10,32,72,.55)" strokeWidth="4" /></svg> : null}
  </div>
);

/** Tela com conteúdo abstrato (sem números). */
const Screen: React.FC<{w: number; h: number; blur?: number}> = ({w, h, blur = 1.4}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(160deg,#143070,#0B1F48 60%,#081634)', filter: `blur(${blur}px)`}}>
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w * .16, background: C.navy}} />
    <div style={{position: 'absolute', left: w * .22, top: h * .08, width: w * .36, height: h * .05, borderRadius: 8, background: 'rgba(255,255,255,.55)'}} />
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: w * (.22 + i * .25), top: h * .2, width: w * .22, height: h * .2, borderRadius: 10, background: 'rgba(255,255,255,.09)'}}>
      <div style={{margin: '14% 0 0 12%', width: '58%', height: h * .035, borderRadius: 6, background: i === 1 ? C.orange : 'rgba(255,255,255,.65)'}} /></div>)}
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M${w * .24} ${h * .86} L${w * .38} ${h * .72} L${w * .52} ${h * .78} L${w * .66} ${h * .6} L${w * .8} ${h * .64} L${w * .94} ${h * .5}`} fill="none" stroke="rgba(130,180,245,.85)" strokeWidth={Math.max(3, w * .006)} />
    </svg>
  </div>
);

const Laptop: React.FC<{x: number; y: number; w: number; rot?: number; tilt?: number}> = ({x, y, w, rot = -30, tilt = 8}) => {
  const h = w * .62;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `perspective(1600px) rotateY(${rot}deg) rotateX(${tilt}deg)`, transformOrigin: '50% 100%'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: '#0B1220', boxShadow: '0 0 0 3px #2A3448, 0 40px 90px rgba(0,0,0,.6)'}} />
      <div style={{position: 'absolute', inset: 12, borderRadius: 8, overflow: 'hidden'}}><Screen w={w - 24} h={h - 24} /></div>
      <div style={{position: 'absolute', inset: 12, borderRadius: 8, background: 'linear-gradient(115deg, rgba(255,255,255,.14), rgba(255,255,255,0) 35%)'}} />
      <div style={{position: 'absolute', left: -w * .06, right: -w * .06, top: h, height: w * .06, borderRadius: '0 0 18px 18px', background: 'linear-gradient(180deg,#3A4558,#1A2232)'}} />
    </div>
  );
};

const Desk: React.FC<{y: number}> = ({y}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: 'linear-gradient(180deg,#1A2A4A 0%,#0C1830 35%,#050C1C 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 4, background: 'rgba(160,190,240,.25)'}} />
    <div style={{position: 'absolute', left: 300, right: 0, top: y, height: 260, background: 'radial-gradient(ellipse 50% 70% at 60% 0%, rgba(110,160,240,.22), rgba(0,0,0,0))'}} />
  </>
);

const Chair: React.FC<{x: number; y: number; s?: number; flip?: boolean}> = ({x, y, s = 1, flip}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 260 * s, height: 420 * s, transform: flip ? 'scaleX(-1)' : undefined, filter: 'blur(1px)'}}>
    <div style={{position: 'absolute', left: 30 * s, top: 0, width: 200 * s, height: 250 * s, borderRadius: `${60 * s}px ${60 * s}px ${20 * s}px ${20 * s}px`, background: 'linear-gradient(160deg,#1C2A46,#0B1428)'}} />
    <div style={{position: 'absolute', left: 0, top: 230 * s, width: 260 * s, height: 70 * s, borderRadius: 22 * s, background: 'linear-gradient(180deg,#22314F,#0E182E)'}} />
    <div style={{position: 'absolute', left: 120 * s, top: 300 * s, width: 20 * s, height: 120 * s, background: '#0A1222'}} />
  </div>
);

const WindowWall: React.FC<{dawn?: boolean}> = ({dawn}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1250}}>
    {Array.from({length: 6}).map((_, i) => <div key={i} style={{position: 'absolute', left: 20 + i * 180, top: 90, width: 160, height: 1100,
      background: dawn ? 'linear-gradient(180deg, rgba(150,180,240,.55), rgba(240,170,120,.45) 70%, rgba(40,40,70,.4))' : 'linear-gradient(180deg, rgba(60,110,200,.25), rgba(30,70,150,.08))'}} />)}
    {dawn ? <svg width="1080" height="1250" style={{position: 'absolute', left: 0, top: 0}}>
      {[[40, 860, 90, 330], [150, 920, 70, 270], [240, 800, 110, 390], [370, 900, 80, 290], [470, 760, 120, 430], [610, 880, 90, 310], [720, 820, 100, 370], [840, 900, 70, 290], [930, 780, 120, 410]].map(([x, y, w, h], i) =>
        <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(25,30,60,.85)" />)}
    </svg> : null}
    {Array.from({length: 7}).map((_, i) => <div key={'m' + i} style={{position: 'absolute', left: 4 + i * 180, top: 70, width: 16, height: 1140, background: '#060D1E'}} />)}
  </div>
);

export const PLATES: Record<PlateKey, React.FC> = {
  /** Cena 01: escritório, notebook a ~35°, luz azul à direita e calor discreto ao fundo. */
  office: () => (
    <>
      <Room />
      <Bokeh items={[[180, 520, 60, WARM], [330, 400, 40, WARM], [880, 360, 70, COOL], [700, 600, 50, WHITE], [120, 820, 50, WARM]]} />
      <Desk y={1260} />
      <Paper x={110} y={1330} w={300} h={380} r={-8} />
      <Laptop x={330} y={830} w={680} rot={-30} />
      <div style={{position: 'absolute', left: 300, top: 1250, width: 760, height: 160, filter: 'blur(36px)', background: 'rgba(90,150,240,.22)'}} />
      <div style={{position: 'absolute', left: 700, top: 1400, width: 220, height: 220, borderRadius: '50%', background: '#1A2540', boxShadow: 'inset 0 0 0 26px #24334F', filter: 'blur(6px)'}} />
      <Light />
    </>
  ),
  /** Cena 02: sala de reunião, mesa em perspectiva, tela na parede, duas cadeiras frente a frente. */
  meeting: () => (
    <>
      <Room />
      <WindowWall />
      <div style={{position: 'absolute', left: 200, top: 360, width: 680, height: 400, borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 0 6px #0B1324, 0 40px 80px rgba(0,0,0,.55)'}}><Screen w={680} h={400} blur={2.2} /></div>
      <Chair x={40} y={980} s={1.1} />
      <Chair x={760} y={980} s={1.1} flip />
      <div style={{position: 'absolute', left: -120, right: -120, top: 1240, height: 360, background: 'linear-gradient(180deg,#24365C,#101D38)', transform: 'perspective(900px) rotateX(48deg)', transformOrigin: '50% 0%', borderRadius: 30}} />
      <Paper x={170} y={1600} w={220} h={280} r={-12} chart />
      <Laptop x={620} y={1560} w={340} rot={22} tilt={14} />
      <Bokeh items={[[900, 250, 50, WARM], [150, 240, 40, WARM]]} />
      <Light />
    </>
  ),
  /** Cena 03: sobre o ombro, monitor a ~45° com documentos. */
  analysis: () => (
    <>
      <Room />
      <Bokeh items={[[200, 300, 60, WARM], [880, 260, 50, COOL], [520, 180, 40, WHITE]]} />
      <div style={{position: 'absolute', left: 120, top: 470, width: 880, height: 560, transform: 'perspective(1800px) rotateY(-24deg)', transformOrigin: '0 50%'}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 14, background: '#0A1222', boxShadow: '0 0 0 4px #1C2638, 0 50px 110px rgba(0,0,0,.6)'}} />
        <div style={{position: 'absolute', inset: 14, borderRadius: 8, overflow: 'hidden'}}><Screen w={852} h={532} blur={3} /></div>
      </div>
      <Desk y={1240} />
      <Paper x={520} y={1300} w={330} h={420} r={7} chart />
      <Paper x={260} y={1340} w={300} h={380} r={-5} />
      {/* ombro desfocado em primeiro plano (silhueta, sem rosto) */}
      <div style={{position: 'absolute', left: -260, top: 1180, width: 720, height: 900, borderRadius: '50% 50% 0 0', background: 'linear-gradient(180deg,#0C1426,#04080F)', filter: 'blur(26px)'}} />
      <Light />
    </>
  ),
  /** Cena 04: mesa vista a ~45°, anotações e notebook. */
  table: () => (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 45%, #1C2F58 0%, #0F1D3C 60%, #050B1C 100%)'}} />
      <div style={{position: 'absolute', left: -400, top: -200, width: 1880, height: 2400, transform: 'perspective(1800px) rotateX(36deg)', transformOrigin: '50% 60%'}}>
        <div style={{position: 'absolute', inset: 0, opacity: .5, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.015) 0 2px, rgba(0,0,0,0) 2px 9px)'}} />
        <Paper x={420} y={600} w={420} h={540} r={8} chart />
        <Paper x={980} y={760} w={400} h={520} r={-6} />
        <Paper x={560} y={1380} w={380} h={500} r={4} />
        <div style={{position: 'absolute', left: 1060, top: 1420, width: 520, height: 340, borderRadius: 20, background: 'linear-gradient(160deg,#2A3346,#151C2B)', transform: 'rotate(-10deg)', boxShadow: '0 30px 60px rgba(0,0,0,.5)'}}>
          <div style={{position: 'absolute', left: 30, top: 24, right: 30, height: 180, borderRadius: 10, overflow: 'hidden'}}><Screen w={460} h={180} /></div></div>
        <div style={{position: 'absolute', left: 300, top: 1240, width: 300, height: 16, borderRadius: 8, background: 'linear-gradient(90deg,#0A2048,#2B3F6A)', transform: 'rotate(-28deg)'}} />
        <div style={{position: 'absolute', left: 1180, top: 420, width: 180, height: 180, borderRadius: '50%', background: '#DDE3EC'}}>
          <div style={{position: 'absolute', inset: 24, borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%, #6B4226, #3A2213)'}} /></div>
      </div>
      <Light />
    </>
  ),
  /** Cena 05: estação de trabalho com monitor grande e duas cadeiras lado a lado (parceria). */
  workstation: () => (
    <>
      <Room />
      <Bokeh items={[[160, 380, 60, WARM], [940, 520, 60, COOL], [600, 260, 40, WHITE]]} />
      <div style={{position: 'absolute', left: 110, top: 520, width: 860, height: 520, borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 0 6px #0B1324, 0 50px 110px rgba(0,0,0,.6)'}}><Screen w={860} h={520} blur={2.6} /></div>
      <div style={{position: 'absolute', left: 500, top: 1040, width: 80, height: 160, background: 'linear-gradient(180deg,#141E30,#0B1220)'}} />
      <Desk y={1190} />
      <Chair x={80} y={1180} s={1.05} />
      <Chair x={700} y={1190} s={1.0} />
      <Light />
    </>
  ),
  /** Cena 06: plano aberto com grande janela ao amanhecer (visão de futuro). */
  window: () => (
    <>
      <Room tone="dawn" />
      <WindowWall dawn />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, bottom: 0, background: 'linear-gradient(180deg,#141A30,#070B16)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, height: 300, background: 'linear-gradient(180deg, rgba(240,170,120,.18), rgba(0,0,0,0))'}} />
      <Chair x={420} y={1000} s={1.15} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 40%, rgba(0,0,0,0) 50%, rgba(2,6,16,.75) 100%)'}} />
    </>
  ),
};

/** Plano cinematográfico: foto licenciada (se houver) ou plano gerado. */
export const Plate: React.FC<{k: PlateKey}> = ({k}) => {
  const photo = PHOTOS[k];
  if (photo) return <Img src={staticFile(`assets/photography/${photo}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />;
  const P = PLATES[k];
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}><P /></div>;
};
