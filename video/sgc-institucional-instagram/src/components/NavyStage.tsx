import React from 'react';

/** Fundo institucional: marinho profundo com gradiente muito discreto e luz laranja pontual. */
export const NavyStage: React.FC<{f: number; glowX?: number; glowY?: number; glow?: number}> = ({f, glowX = 540, glowY = 1300, glow = 1}) => (
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 70% at 50% 42%, #0F2A5E 0%, #0A2048 42%, #06142F 78%, #030A1A 100%)'}}>
    <div style={{position: 'absolute', left: glowX - 500 + Math.sin(f / 50) * 20, top: glowY - 500, width: 1000, height: 1000, borderRadius: '50%', opacity: glow,
      background: 'radial-gradient(closest-side, rgba(248,106,20,.13), rgba(248,106,20,0))'}} />
  </div>
);

/** Escurecimento inferior/superior para legibilidade do texto sobre os planos. */
export const Scrim: React.FC<{top?: number; bottom?: number}> = ({top = 0.55, bottom = 0.7}) => (
  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(3,10,26,${top}) 0%, rgba(3,10,26,0) 30%, rgba(3,10,26,0) 58%, rgba(3,10,26,${bottom}) 100%)`}} />
);
