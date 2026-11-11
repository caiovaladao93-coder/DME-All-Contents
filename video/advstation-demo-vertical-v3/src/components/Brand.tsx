import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {Easing} from 'remotion';
import {progS} from '../theme/animation';
import {SANS, SERIF} from '../theme/typography';

// SVG ORIGINAL (manual, tools/tutoriais/vinheta.mjs). Não redesenhar.
export const A_PATH = 'M50 12 L81 79 H69 L50 34 L31 79 H19 Z';
export const ICON = {
  previdenciario: '<path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  maternidade: '<circle cx="12" cy="7" r="3"/><path d="M7 21v-4a5 5 0 0 1 10 0v4"/><path d="M9 14c1.5 1 4.5 1 6 0"/>',
};

/** Marca estática. variant 'dark' = A branco sobre marinho; 'light' = A marinho. Plataforma sempre dourada. */
export const BrandMark: React.FC<{size: number; variant?: 'dark' | 'light'; name?: boolean; nameSize?: number; style?: React.CSSProperties}> = ({size, variant = 'dark', name = true, nameSize = 52, style}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...style}}>
    <svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible', display: 'block'}}>
      <path d={A_PATH} fill={variant === 'dark' ? C.white : C.navy} />
      <rect x={9} y={79} width={82} height={8} rx={4} fill={C.gold} />
    </svg>
    {name ? <div style={{marginTop: nameSize * 0.45, fontFamily: SANS, fontWeight: 800, fontSize: nameSize, letterSpacing: '.32em', paddingLeft: '.32em',
      color: variant === 'dark' ? C.white : C.navy, whiteSpace: 'nowrap'}}>ADV STATION</div> : null}
  </div>
);

export const Selo: React.FC<{produto: 'maternidade' | 'previdenciario'; nome: string; u?: number}> = ({produto, nome, u = 1}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12 * u, padding: `${10 * u}px ${22 * u}px ${10 * u}px ${12 * u}px`, borderRadius: 999,
    background: C.vNavy, color: '#fff', fontFamily: SANS, fontSize: 24 * u, fontWeight: 600}}>
    <i style={{display: 'flex', width: 40 * u, height: 40 * u, borderRadius: 10 * u, background: C.vGold, alignItems: 'center', justifyContent: 'center'}}>
      <svg viewBox="0 0 24 24" width={24 * u} height={24 * u} style={{stroke: C.vNavy, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}}
        dangerouslySetInnerHTML={{__html: ICON[produto]}} />
    </i>
    {nome}
  </div>
);

/*
 * Vinheta — réplica quadro a quadro de .asvv (vinheta-marca.css) com os MESMOS tempos, easings e formas
 * (u = 1 px no 1080p). Fundo creme radial, plataforma desliza, A sobe com mola, bolha e 14 faíscas,
 * "ADV STATION" letra a letra (1,15 s + i×0,05 s) e, com título, a marca sobe e o título Georgia entra com selo.
 */
const bz = (a: number, b: number, c: number, d: number) => Easing.bezier(a, b, c, d);
const E_EASEOUT = bz(0, 0, 0.58, 1);
const E_FAISCA = bz(0.2, 0.8, 0.3, 1);
const E_SOBE = bz(0.6, 0, 0.2, 1);
const E_PLAT = bz(0.2, 0.9, 0.2, 1);
const E_A = bz(0.3, 1.6, 0.5, 1);
const E_LETRA = bz(0.3, 1.4, 0.5, 1);
const E_TIT = bz(0.3, 1.3, 0.5, 1);

export const Vinheta: React.FC<{t0: number; titulo?: React.ReactNode; subtitulo?: React.ReactNode; selos?: React.ReactNode; extra?: React.ReactNode}> = ({t0, titulo, subtitulo, selos, extra}) => {
  const f = useCurrentFrame();
  const t = (f - t0) / 30;
  const comTitulo = !!titulo;
  const bolha = progS(t, 1.05, 1.6, E_EASEOUT);
  const plat = progS(t, 0.15, 0.55, E_PLAT);
  const a = progS(t, 0.55, 0.75, E_A);
  const sobe = comTitulo ? progS(t, 2.55, 0.7, E_SOBE) : 0;
  const tit = progS(t, 2.85, 0.6, E_TIT);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 30% 20%, #fffaf0 0%, #f7f1e3 55%, #eadfca 100%)', color: C.vNavy}}>
      {t > 1.05 && t < 2.65 ? <div style={{position: 'absolute', borderRadius: '50%', background: C.vGold, width: 900, height: 900, left: 540 - 450, top: 960 - 510,
        transform: `scale(${bolha})`, opacity: 0.55 * (1 - bolha)}} /> : null}
      {Array.from({length: 14}).map((_, i) => {
        const ang = (i / 14) * Math.PI * 2;
        const r = 220 + (i % 3) * 60;
        const dx = Math.round(Math.cos(ang) * r), dy = Math.round(Math.sin(ang) * r);
        const delay = 1.1 + (i % 4) * 0.03;
        if (t < delay || t > delay + 0.9) return null;
        const p = progS(t, delay, 0.9, E_FAISCA);
        return <div key={i} style={{position: 'absolute', width: 14, height: 14, borderRadius: 3, left: 540 - 7, top: 960 - 60, background: C.vGold,
          opacity: 1 - p, transform: `translate(${dx * p}px, ${dy * p}px) rotate(${220 * p}deg) scale(${0.4 + 0.6 * p})`}} />;
      })}
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${-215 * sobe}px) scale(${1 - 0.5 * sobe})`}}>
        <svg viewBox="0 0 100 100" width={380} height={380} style={{overflow: 'visible', display: 'block'}}>
          <path d={A_PATH} fill={C.vNavy} style={{transformOrigin: '50% 87%', transformBox: 'view-box' as any, transform: `scaleY(${a})`}} />
          <rect x={9} y={79} width={82} height={8} rx={4} fill={C.vGold} style={{transformOrigin: '50% 50%', transformBox: 'view-box' as any, transform: `scaleX(${plat})`}} />
        </svg>
        <div style={{marginTop: 30, fontSize: 64, fontWeight: 800, letterSpacing: '.32em', lineHeight: 1.2, display: 'flex', whiteSpace: 'nowrap', fontFamily: SANS}}>
          {'ADV STATION'.split('').map((l, i) => {
            const p = progS(t, 1.15 + i * 0.05, 0.45, E_LETRA);
            return <span key={i} style={{display: 'inline-block', opacity: Math.min(1, Math.max(0, p)), transform: `translateY(${24 * (1 - p)}px)`}}>{l === ' ' ? '\u00A0' : l}</span>;
          })}
        </div>
      </div>
      {comTitulo ? (
        <div style={{position: 'absolute', top: '58%', left: 0, right: 0, padding: '0 20px', textAlign: 'center', opacity: Math.min(1, Math.max(0, tit)), transform: `translateY(${40 * (1 - tit)}px)`}}>
          {selos ? <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 22}}>{selos}</div> : null}
          <div style={{fontFamily: SERIF, fontSize: 96, fontWeight: 600, lineHeight: 1.05, color: C.vNavy}}>{titulo}</div>
          {subtitulo ? <div style={{marginTop: 16, fontSize: 30, color: C.gray, fontFamily: SANS}}>{subtitulo}</div> : null}
        </div>
      ) : null}
      {extra}
    </div>
  );
};
