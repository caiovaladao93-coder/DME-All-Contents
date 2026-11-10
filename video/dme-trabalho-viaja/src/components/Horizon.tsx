import React from 'react';
import {C} from '../theme/colors';

/** Horizonte de descanso (gerado, sem foto): céu de fim de tarde, mar e sol baixo, com tratamento DME (dessaturado, grafite). */
export const Horizon: React.FC<{blur: number; light: number; veil: number; shift: number}> = ({blur, light, veil, shift}) => (
  <div style={{position: 'absolute', inset: -80, filter: `blur(${blur.toFixed(1)}px) brightness(${(0.55 + 0.45 * light).toFixed(3)}) saturate(${(0.55 + 0.25 * light).toFixed(3)})`,
    transform: `translateX(${shift.toFixed(1)}px)`}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #121a26 0%, #26374d 28%, #5b6c82 46%, #c9a483 58%, #e4c3a0 61%, #2a3646 62.5%, #1b2532 72%, #0d1218 100%)'}} />
    <div style={{position: 'absolute', left: '58%', top: '55%', width: 260, height: 260, borderRadius: '50%', transform: 'translate(-50%,-50%)',
      background: 'radial-gradient(circle, rgba(255,232,200,.95) 0%, rgba(255,214,170,.55) 35%, rgba(255,200,150,0) 70%)'}} />
    {/* reflexos suaves na água */}
    {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: `${52 + (i % 3) * 3}%`, top: `${64 + i * 2.2}%`, width: 120 - i * 12, height: 4, borderRadius: 2,
      background: 'rgba(255,220,180,.35)', transform: `translateX(${(i % 2 ? 1 : -1) * 20}px)`}} />)}
    <div style={{position: 'absolute', inset: 0, background: C.graphite, opacity: veil}} />
  </div>
);

/** Mesa escura onde o celular está apoiado, com reflexo controlado. */
export const Table: React.FC<{y: number; opacity: number}> = ({y, opacity}) => (
  <div style={{position: 'absolute', left: -200, right: -200, top: y, bottom: -400, opacity,
    background: 'linear-gradient(180deg, rgba(44,50,56,.95) 0%, #15181b 18%, #0b0d0f 60%)', transform: 'perspective(1200px) rotateX(58deg)', transformOrigin: '50% 0%',
    boxShadow: 'inset 0 2px 0 rgba(192,198,204,.18)'}}>
    <div style={{position: 'absolute', inset: 0, opacity: .35, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.02) 0 2px, rgba(0,0,0,0) 2px 7px)'}} />
  </div>
);
