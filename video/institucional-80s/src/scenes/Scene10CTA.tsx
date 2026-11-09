import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MaskedHeadline} from '../components/AnimatedText';
import {BrandLogo} from '../components/BrandLogo';
import {C} from '../theme/colors';
import {EASE_IO, lerp, prog} from '../theme/motion';
import {FONT_UI} from '../theme/typography';
import {SIG_LOGO, SignatureBg, Slogan} from './Scene09Signature';

export const Scene10CTA: React.FC = () => {
  const f = useCurrentFrame();
  const m = prog(f, 0, 18, EASE_IO);
  const w = lerp(SIG_LOGO.w, 360, m);
  const top = lerp(SIG_LOGO.top, 380, m);
  const ce = prog(f, 26, 16);
  const pass = prog(f, 46, 26, EASE_IO);
  return (
    <AbsoluteFill>
      <SignatureBg />
      <BrandLogo id="s10" width={w} revealStart={-100} style={{left: 540 - w / 2, top}} />
      <Slogan f={100} s1={0} s2={0} opacity={1 - prog(f, 0, 10)} />
      <MaskedHeadline text="VAMOS TRANSFORMAR|SUA OPERAÇÃO?" start={12} dur={18} lineStagger={6} direction="y" size={70} style={{top: 820}} />
      {/* CTA com contorno azul aço e uma única passagem de luz (sem botão falso, sem pulsação) */}
      <div style={{position: 'absolute', left: 540 - 330, top: 1060, width: 660, height: 116, borderRadius: 58, opacity: ce,
        transform: `translateY(${((1 - ce) * 12).toFixed(1)}px)`, border: `2px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_UI, fontWeight: 600, fontSize: 46, color: '#F4F6F8', overflow: 'hidden'}}>
        Converse com a DME.
        {pass > 0 && pass < 1 ? <div style={{position: 'absolute', top: -20, left: -160 + pass * 980, width: 120, height: 160, transform: 'skewX(-20deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(214,228,242,.28), rgba(255,255,255,0))'}} /> : null}
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.6) 100%)', opacity: prog(f, 76, 14)}} />
    </AbsoluteFill>
  );
};
