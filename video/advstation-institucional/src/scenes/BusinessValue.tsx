import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline} from '../components/Editorial';
import {SCREENS} from '../data/assets';
import {Img, staticFile} from 'remotion';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {SERIF} from '../theme/typography';

const WORDS = ['ORGANIZAÇÃO', 'ACOMPANHAMENTO', 'CLAREZA'];
const TX = 1330;
const SHOT = SCREENS.pgAdministrativo;
// linhas da tabela real (pixels da imagem) que o destaque percorre — "acompanhamento"
const ROWS = [232, 271, 310, 349, 388, 427, 466, 505];

/**
 * CENA 07 — O valor para o escritório. Sem pessoas: a tela real do Administrativo em perspectiva
 * ocupa ~65% do quadro; um destaque dourado percorre os casos linha a linha.
 */
export const BusinessValue: React.FC = () => {
  const f = useCurrentFrame();
  const wordsOut = prog(f, 150, 12, EASE_IN);
  const out = prog(f, 236, 30, EASE_IO);
  const pan = prog(f, 0, 270, EASE_IO);
  const scale = 1240 / SHOT.w;
  const rowT = Math.min(ROWS.length - 1, Math.max(0, (f - 40) / 18));
  const ri = Math.floor(rowT), rf = rowT - ri;
  const rowY = lerp(ROWS[ri], ROWS[Math.min(ROWS.length - 1, ri + 1)], EASE_IO(rf));
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      <div style={{position: 'absolute', left: -60, top: 120, width: 1300, height: 840, opacity: 1 - out, perspective: 1800}}>
        <div style={{position: 'absolute', left: 60, top: 0, width: SHOT.w * scale, height: SHOT.h * scale, borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 50px 100px rgba(0,0,0,.55)', transformOrigin: '30% 50%',
          transform: `rotateY(${lerp(14, 8, pan)}deg) rotateX(${lerp(4, 2, pan)}deg) translateX(${lerp(40, -40, pan)}px) scale(${lerp(1, 1.05, pan)})`}}>
          <Img src={staticFile(SHOT.src!)} style={{width: '100%', height: '100%'}} />
          <div style={{position: 'absolute', left: 300 * scale, width: 1560 * scale, top: (rowY - 20) * scale, height: 40 * scale, background: 'rgba(194,155,60,.16)',
            borderLeft: `4px solid ${C.gold}`, opacity: prog(f, 36, 10) * (1 - wordsOut)}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(14,27,51,.05), rgba(14,27,51,.35) 80%)'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 0, width: 200, height: 1080, background: `linear-gradient(90deg, rgba(22,40,74,0), ${C.navy})`, opacity: 1 - out}} />
      {WORDS.map((w, i) => {
        const s = 14 + i * 12;
        const e = prog(f, s, 18, EASE_OUT);
        const u = prog(f, s + 10, 16);
        return (
          <div key={w} style={{position: 'absolute', left: TX, top: 260 + i * 120, opacity: e * (1 - wordsOut), transform: `translateY(${((1 - e) * 22).toFixed(1)}px)`}}>
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: C.white, letterSpacing: '.02em'}}>{w}</div>
            <div style={{marginTop: 10, width: 90 * u, height: 2, background: C.gold}} />
          </div>
        );
      })}
      <EditorialHeadline text="Mais clareza|para a rotina|do [escritório]." start={164} x={TX} y={360} width={480} size={48} lineStagger={9} />
    </AbsoluteFill>
  );
};
