import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {EASE_IO, lerp, prog} from '../theme/animation';
import {SANS} from '../theme/typography';
import {PendingTag} from './Atmosphere';

/** Foco de câmera dentro da captura, em pixels da IMAGEM original. */
export type Focus = {at: number; dur: number; s: number; cx: number; cy: number};
export type Screen = {src: string | null; desc: string; w: number; h: number};

const BAR = 36;

/**
 * ProductScreenshot — janela com a captura REAL (manual: raio 16; não recolorir nem alterar a interface).
 * A câmera aproxima áreas da tela (focus) para manter legibilidade; `overlay` desenha marcações
 * (ScreenSpotlight) no espaço de pixels da imagem e acompanha o zoom.
 * Sem captura: esqueleto neutro + etiqueta "CAPTURA PENDENTE".
 */
export const ProductScreenshot: React.FC<{
  screen: Screen; product: string; x: number; y: number; w: number; h: number;
  focus?: Focus[]; overlay?: React.ReactNode; style?: React.CSSProperties; dim?: number;
}> = ({screen, product, x, y, w, h, focus = [], overlay, style, dim = 0}) => {
  const f = useCurrentFrame();
  const ih = h - BAR;
  const k = w / screen.w; // escala de exibição (imagem → janela)
  // estado inicial: escala 1, topo da tela
  let s = 1, cx = screen.w / 2, cy = (ih / k) / 2;
  for (const fc of focus) {
    const p = prog(f, fc.at, fc.dur, EASE_IO);
    s = lerp(s, fc.s, p); cx = lerp(cx, fc.cx, p); cy = lerp(cy, fc.cy, p);
  }
  const dispW = screen.w * k * s, dispH = screen.h * k * s;
  const tx = Math.min(0, Math.max(w - dispW, w / 2 - cx * k * s));
  const ty = Math.min(0, Math.max(ih - dispH, ih / 2 - cy * k * s));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 16, overflow: 'hidden', background: '#F7F3EA',
      boxShadow: '0 40px 90px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.14)', ...style}}>
      <div style={{height: BAR, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: '#ECE7DC', borderBottom: '1px solid #DCD5C6'}}>
        {[0, 1, 2].map((i) => <span key={i} style={{width: 11, height: 11, borderRadius: 6, background: '#DED8CC', border: '1px solid #CFC7B8'}} />)}
        <span style={{marginLeft: 12, fontFamily: SANS, fontWeight: 700, fontSize: 15, color: '#5B6576', letterSpacing: '.02em'}}>{product}</span>
      </div>
      <div style={{position: 'absolute', left: 0, top: BAR, width: w, height: ih, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: screen.w * k, height: screen.h * k, transformOrigin: '0 0',
          transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`}}>
          {screen.src ? <Img src={staticFile(screen.src)} style={{width: '100%', height: '100%', display: 'block'}} /> : (
            <div style={{position: 'absolute', inset: 0, background: '#EEF1F6'}} />
          )}
          {overlay ? (
            <svg viewBox={`0 0 ${screen.w} ${screen.h}`} width={screen.w * k} height={screen.h * k} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{overlay}</svg>
          ) : null}
        </div>
        {dim > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(14,27,51,${dim})`}} /> : null}
      </div>
      {!screen.src ? <PendingTag kind="CAPTURA" desc={screen.desc} light style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} /> : null}
    </div>
  );
};

/** ScreenSpotlight — retângulo fino dourado (em pixels da imagem) ao redor da área citada na fala. */
export const ScreenSpotlight: React.FC<{x: number; y: number; w: number; h: number; start: number; end?: number}> = ({x, y, w, h, start, end}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 16);
  const q = end == null ? 0 : prog(f, end, 10);
  if (p <= 0 || q >= 1) return null;
  return (
    <g opacity={1 - q}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="rgba(194,155,60,.06)" stroke="#C29B3C" strokeWidth={3} vectorEffect="non-scaling-stroke"
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </g>
  );
};
