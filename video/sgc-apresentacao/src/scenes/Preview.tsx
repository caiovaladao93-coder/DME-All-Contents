import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IO, lerp, prog} from '../theme/animation';
import {InterfaceWindow, Seal} from '../components/InterfaceWindow';
import {LightSweep, ScreenHighlight} from '../components/ScreenHighlight';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {BrandCorner, NavyStage} from './BrandIntroduction';
import {WIN} from './Questions';
import {AREA, ResultScreen} from './ResultScreen';
import {SCENES} from '../data/storyboard';

export const Preview: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.preview.dur;
  const mask = prog(f, 0, 16, EASE_IO); // máscara lateral (padrão de transição 2)
  const zin = prog(f, 4, 56, EASE_IO), zout = prog(f, 74, D - 74, EASE_IO);
  const s = lerp(1, 1.06, zin) * lerp(1, 0.955, zout);
  return (
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${((1 - mask) * 100).toFixed(2)}%)`}}>
      <NavyStage f={f} glowX={960} glowY={600} />
      <BrandCorner />
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 52%', transform: `scale(${s.toFixed(4)})`}}>
        <InterfaceWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h}>
          <ResultScreen blur={12} />
          <ScreenHighlight f={f} start={30} x={AREA.index.x} y={AREA.index.y} w={AREA.recs.x + AREA.recs.w - AREA.index.x} h={AREA.index.h} r={20} pad={12} />
          <div style={{position: 'absolute', left: AREA.button.x, top: AREA.button.y, width: AREA.button.w, height: AREA.button.h}}><LightSweep f={f} start={84} dur={22} r={14} /></div>
          <ScreenHighlight f={f} start={80} x={AREA.button.x} y={AREA.button.y} w={AREA.button.w} h={AREA.button.h} r={14} pad={6} />
        </InterfaceWindow>
        <Seal style={{left: WIN.x + WIN.w - 250, top: WIN.y + WIN.h + 18}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 78}}>
        <AnimatedHeadline f={f} start={34} text="SEU DIAGNÓSTICO ESTÁ [PRONTO.]" size={58} align="center" />
      </div>
      {mask > 0 && mask < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - mask) * 100}%`, width: 3, background: C.orange}} /> : null}
    </div>
  );
};
