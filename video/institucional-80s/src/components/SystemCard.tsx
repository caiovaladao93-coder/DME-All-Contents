import React from 'react';
import {C} from '../theme/colors';
import {FONT_UI} from '../theme/typography';

/** SystemCard — janela de sistema corporativo conceitual (sem dados reais nem números). */
export const SystemCard: React.FC<{
  x: number; y: number; w: number; h: number; title?: string; style?: React.CSSProperties; lit?: number; rows?: number; variant?: 'list' | 'chart' | 'kanban' | 'blank';
  children?: React.ReactNode;
}> = ({x, y, w, h, title, style, lit = 0, rows = 3, variant = 'list', children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, overflow: 'hidden',
    background: 'linear-gradient(160deg, rgba(40,45,51,.96), rgba(24,27,30,.96))',
    border: `1.5px solid rgba(${Math.round(192 - 134 * lit)},${Math.round(198 - 88 * lit)},${Math.round(204 - 39 * lit)},${(0.18 + 0.6 * lit).toFixed(3)})`,
    boxShadow: `0 1px 0 rgba(255,255,255,.06) inset, 0 30px 60px rgba(0,0,0,.55)${lit > 0.05 ? `, 0 0 ${Math.round(30 * lit)}px rgba(58,110,165,${(0.25 * lit).toFixed(3)})` : ''}`,
    ...style}}>
    <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid rgba(192,198,204,.12)'}}>
      <span style={{width: 10, height: 10, borderRadius: 5, background: 'rgba(192,198,204,.35)'}} />
      <span style={{width: 10, height: 10, borderRadius: 5, background: 'rgba(192,198,204,.2)'}} />
      {title ? <span style={{marginLeft: 8, fontFamily: FONT_UI, fontWeight: 700, fontSize: 24, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(230,234,238,.85)'}}>{title}</span> : null}
    </div>
    <div style={{padding: 20}}>
      {children ?? (variant === 'list' ? Array.from({length: rows}).map((_, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: i ? 16 : 4}}>
          <span style={{width: 34, height: 34, borderRadius: 9, background: i === 0 ? 'rgba(58,110,165,.55)' : 'rgba(192,198,204,.12)'}} />
          <span style={{flex: 1}}>
            <span style={{display: 'block', height: 12, width: `${78 - i * 12}%`, borderRadius: 6, background: 'rgba(192,198,204,.28)'}} />
            <span style={{display: 'block', height: 10, width: `${52 - i * 8}%`, borderRadius: 5, marginTop: 8, background: 'rgba(192,198,204,.14)'}} />
          </span>
        </div>
      )) : variant === 'chart' ? (
        <svg width={w - 40} height={h - 94}>
          {Array.from({length: 7}).map((_, i) => {
            const bh = [0.35, 0.5, 0.42, 0.62, 0.55, 0.72, 0.66][i] * (h - 120);
            return <rect key={i} x={i * ((w - 40) / 7) + 6} y={h - 104 - bh} width={(w - 40) / 7 - 12} height={bh} rx={6} fill={i === 5 ? C.accent : 'rgba(192,198,204,.22)'} />;
          })}
        </svg>
      ) : null)}
    </div>
  </div>
);
