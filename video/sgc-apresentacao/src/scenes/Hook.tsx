import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_OUT, prog} from '../theme/animation';
import {CinematicImage, Layer} from '../components/CinematicImage';
import {OrangeAccentLine} from '../components/OrangeAccentLine';
import {MaskedText} from '../components/TextReveal';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

/** Monitor em ~40° (lente de 50 mm simulada por perspectiva), com um painel de gestão desfocado na tela. */
const Monitor: React.FC<{f: number}> = ({f}) => {
  const bars = [0.42, 0.66, 0.5, 0.82, 0.58, 0.74, 0.9];
  return (
    <div style={{position: 'absolute', left: 1020, top: 250, width: 760, height: 470, transform: 'perspective(1500px) rotateY(-38deg) rotateX(2deg)', transformOrigin: '0% 50%'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: '#0B1426', boxShadow: '0 0 0 3px #1B2638, 0 50px 120px rgba(0,0,0,.6)'}} />
      <div style={{position: 'absolute', inset: 14, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(160deg,#11285A 0%,#0A1C42 60%,#081633 100%)', filter: 'blur(1.6px)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 110, background: C.navy}} />
        <div style={{position: 'absolute', left: 140, top: 34, width: 260, height: 18, borderRadius: 9, background: 'rgba(255,255,255,.55)'}} />
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 140 + i * 190, top: 80, width: 170, height: 96, borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)'}}>
          <div style={{margin: '18px 0 0 18px', width: 70, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.35)'}} />
          <div style={{margin: '16px 0 0 18px', width: 96, height: 24, borderRadius: 6, background: i === 1 ? C.orange : 'rgba(255,255,255,.7)'}} /></div>)}
        <div style={{position: 'absolute', left: 140, top: 200, width: 550, height: 220, borderRadius: 12, background: 'rgba(255,255,255,.06)'}}>
          {bars.map((b, i) => { const g = prog(f, 4 + i * 3, 30, EASE_OUT); return <div key={i} style={{position: 'absolute', bottom: 20, left: 30 + i * 72, width: 40, height: 170 * b * g, borderRadius: 6,
            background: i === 5 ? C.orange : 'rgba(120,170,230,.65)'}} />; })}
        </div>
      </div>
      {/* reflexo no vidro */}
      <div style={{position: 'absolute', inset: 14, borderRadius: 8, background: 'linear-gradient(120deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,0) 35%)'}} />
      {/* haste */}
      <div style={{position: 'absolute', left: 340, top: 470, width: 80, height: 120, background: 'linear-gradient(180deg,#141E30,#0B1220)'}} />
    </div>
  );
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.hook.dur;
  const tSaude = wordAt('hook', 'saúde');
  return (
    <div style={{position: 'absolute', inset: 0, background: C.navyNight}}>
      <CinematicImage f={f} dur={D + 12} s0={1} s1={1.07} x0={0} x1={-40} origin="65% 50%" style={{opacity: prog(f, 0, 30)}}>
        {/* fundo: escritório escuro com janelas desfocadas */}
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 72% 40%, #12306A 0%, #0A1F4A 35%, #050F26 70%, #030A1A 100%)'}} />
        <Layer f={f} dur={D} depth={0.3} blur={14}>
          {Array.from({length: 7}).map((_, i) => <div key={i} style={{position: 'absolute', left: 860 + i * 150, top: 40, width: 110, height: 520,
            background: 'linear-gradient(180deg, rgba(70,120,200,.20), rgba(40,80,160,.05))', borderRadius: 6}} />)}
          {[[1500, 180, 'rgba(248,106,20,.35)'], [1180, 120, 'rgba(120,170,255,.25)'], [1720, 300, 'rgba(120,170,255,.2)']].map(([x, y, c], i) =>
            <div key={i} style={{position: 'absolute', left: x as number, top: y as number, width: 70, height: 70, borderRadius: '50%', background: c as string}} />)}
        </Layer>
        {/* mesa com reflexo */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, bottom: 0, background: 'linear-gradient(180deg,#0E1F44 0%,#071330 40%,#030A1A 100%)'}} />
        <div style={{position: 'absolute', left: 900, top: 760, width: 900, height: 200, background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(90,140,220,.22), rgba(0,0,0,0))'}} />
        <Layer f={f} dur={D} depth={0.6}><Monitor f={f} /></Layer>
        {/* luz do monitor derramando na mesa */}
        <div style={{position: 'absolute', left: 1000, top: 770, width: 800, height: 120, filter: 'blur(30px)', background: 'rgba(70,130,220,.18)'}} />
        {/* primeiro plano desfocado (profundidade de campo) */}
        <Layer f={f} dur={D} depth={1.4} blur={22}>
          <div style={{position: 'absolute', left: -120, top: 860, width: 760, height: 360, borderRadius: 60, background: 'linear-gradient(180deg,#0B1A38,#050C1C)'}} />
        </Layer>
        {/* escurece à esquerda para o texto (espaço negativo) */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,10,26,.92) 0%, rgba(3,10,26,.55) 38%, rgba(3,10,26,0) 60%)'}} />
      </CinematicImage>

      <div style={{position: 'absolute', left: 150, top: 330, width: 900}}>
        <OrangeAccentLine f={f} start={0} dur={20} width={180} x={0} y={0} />
        <MaskedText f={f} start={10} dur={16} style={{marginTop: 34}}>
          <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 50, letterSpacing: '.06em', color: 'rgba(255,255,255,.82)'}}>VOCÊ SABE COMO ESTÁ</div>
        </MaskedText>
        <AnimatedHeadline f={f} start={Math.max(30, tSaude - 8)} text="A [SAÚDE] DA|SUA EMPRESA?" size={104} stagger={3} sheenAt={tSaude + 22} style={{marginTop: 18}} />
      </div>
      <div style={{position: 'absolute', left: 150, top: 940, fontFamily: UI, fontWeight: 600, fontSize: 18, letterSpacing: '.24em', color: 'rgba(255,255,255,.4)', opacity: prog(f, 40, 20)}}>
        DIAGNÓSTICO DE GESTÃO</div>
    </div>
  );
};
