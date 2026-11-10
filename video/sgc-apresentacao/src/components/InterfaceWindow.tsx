import React from 'react';
import {C} from '../theme/colors';
import {UI} from '../theme/typography';

/** Janela de navegador com acabamento refinado (barra, reflexo sutil e sombra). O conteúdo é componente gerado. */
export const InterfaceWindow: React.FC<{x: number; y: number; w: number; h: number; url?: string; children: React.ReactNode; style?: React.CSSProperties}> =
  ({x, y, w, h, url = 'sgc · diagnóstico de gestão', children, style}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, overflow: 'hidden', background: C.bg,
      boxShadow: '0 0 0 1px rgba(255,255,255,.10), 0 40px 90px rgba(0,0,0,.55), 0 12px 30px rgba(0,0,0,.35)', ...style}}>
      <div style={{height: 48, background: '#0D1A33', display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px'}}>
        {['#3A4A68', '#3A4A68', '#3A4A68'].map((c, i) => <i key={i} style={{width: 13, height: 13, borderRadius: '50%', background: c}} />)}
        <div style={{marginLeft: 22, flex: 1, maxWidth: 520, height: 28, borderRadius: 14, background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center',
          padding: '0 16px', fontFamily: UI, fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,.55)'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" style={{marginRight: 10}}><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.2"/></svg>
          {url}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 48, bottom: 0, overflow: 'hidden'}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 28%)'}} />
    </div>
  );

/** Selo obrigatório para telas e dados ilustrativos. */
export const Seal: React.FC<{text?: string; style?: React.CSSProperties}> = ({text = 'Interface ilustrativa', style}) => (
  <div style={{position: 'absolute', fontFamily: UI, fontWeight: 600, fontSize: 18, letterSpacing: '.06em', color: 'rgba(230,236,247,.9)', padding: '10px 18px',
    borderRadius: 20, border: '1px solid rgba(230,236,247,.35)', background: 'rgba(6,20,47,.75)', whiteSpace: 'nowrap', ...style}}>{text}</div>
);

/** Linha de texto neutra (não inventa conteúdo de pergunta ou recomendação). */
export const Skel: React.FC<{w: number | string; h?: number; c?: string; style?: React.CSSProperties}> = ({w, h = 14, c = 'rgba(17,24,39,.12)', style}) =>
  <div style={{width: w, height: h, borderRadius: h / 2, background: c, ...style}} />;
