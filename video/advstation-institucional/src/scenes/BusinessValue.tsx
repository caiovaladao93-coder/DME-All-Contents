import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {CinematicImage} from '../components/CinematicImage';
import {EditorialHeadline} from '../components/Editorial';
import {PHOTOS} from '../data/assets';
import {C} from '../theme/colors';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {SERIF} from '../theme/typography';

const WORDS = ['ORGANIZAÇÃO', 'ACOMPANHAMENTO', 'CLAREZA'];
const TX = 1330; // coluna de texto (espaço negativo à direita da imagem de ~65%)
// cartões abstratos: posição dispersa → grade organizada (não representam métricas)
const CARDS = Array.from({length: 6}, (_, i) => ({sx: TX + ((i * 137) % 380), sy: 640 + ((i * 89) % 160), sr: ((i * 37) % 30) - 15, gx: TX + (i % 3) * 140, gy: 660 + Math.floor(i / 3) * 74}));

/** CENA 07 — O valor para o escritório. */
export const BusinessValue: React.FC = () => {
  const f = useCurrentFrame();
  const org = prog(f, 70, 50, EASE_IO);
  const wordsOut = prog(f, 150, 12, EASE_IN);
  const photoOut = prog(f, 236, 30, EASE_IO);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 14)}}>
      <NavyBackground />
      <div style={{opacity: 1 - photoOut}}>
        <CinematicImage src={PHOTOS.s07.src} desc={PHOTOS.s07.desc} dur={270} cam={{s0: 1, s1: 1.05, x0: 40, x1: -40}} box={{x: 0, y: 0, w: 1248, h: 1080}} tagPos={{left: 24, right: 'auto', top: 24}} />
        <div style={{position: 'absolute', left: 1000, top: 0, width: 260, height: 1080, background: `linear-gradient(90deg, rgba(22,40,74,0), ${C.navy})`}} />
      </div>
      {WORDS.map((w, i) => {
        const s = 14 + i * 12;
        const e = prog(f, s, 18, EASE_OUT);
        const u = prog(f, s + 10, 16);
        return (
          <div key={w} style={{position: 'absolute', left: TX, top: 230 + i * 120, opacity: e * (1 - wordsOut), transform: `translateY(${((1 - e) * 22).toFixed(1)}px)`}}>
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: C.white, letterSpacing: '.02em'}}>{w}</div>
            <div style={{marginTop: 10, width: 90 * u, height: 2, background: C.gold}} />
          </div>
        );
      })}
      {CARDS.map((c, i) => (
        <div key={i} style={{position: 'absolute', left: lerp(c.sx, c.gx, org), top: lerp(c.sy, c.gy, org), width: 120, height: 56, borderRadius: 10,
          transform: `rotate(${lerp(c.sr, 0, org)}deg)`, opacity: prog(f, 30 + i * 4, 14) * (1 - wordsOut),
          background: 'rgba(255,255,255,.08)', border: `1px solid ${org > 0.9 ? 'rgba(194,155,60,.7)' : 'rgba(255,255,255,.18)'}`}}>
          <div style={{margin: '14px 14px 0', height: 8, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,.35)'}} />
          <div style={{margin: '8px 14px 0', height: 6, width: '40%', borderRadius: 3, background: 'rgba(255,255,255,.18)'}} />
        </div>
      ))}
      <EditorialHeadline text="Mais clareza|para a rotina|do [escritório]." start={164} x={TX} y={330} width={480} size={48} lineStagger={9} />
    </AbsoluteFill>
  );
};
