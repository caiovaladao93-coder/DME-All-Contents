import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {prog, EASE_IO, lerp} from '../theme/animation';
import {SANS} from '../theme/typography';
import {PendingTag} from './Atmosphere';

/**
 * ProductScreenshot — janela de tela real (manual: raio 16, captura em 2880 px).
 * Não recolore nem altera a interface. Sem captura: esqueleto NEUTRO + etiqueta "CAPTURA PENDENTE"
 * (não é uma interface inventada; nenhum nome de módulo, número ou dado aparece no esqueleto).
 */
export const ProductScreenshot: React.FC<{
  src: string | null; desc: string; product: string; x: number; y: number; w: number; h: number;
  style?: React.CSSProperties; zoom?: {start: number; dur: number; s0: number; s1: number; ox?: number; oy?: number};
}> = ({src, desc, product, x, y, w, h, style, zoom}) => {
  const f = useCurrentFrame();
  const z = zoom ? lerp(zoom.s0, zoom.s1, prog(f, zoom.start, zoom.dur, EASE_IO)) : 1;
  const bar = 40;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 16, overflow: 'hidden',
      background: '#F4F6F9', boxShadow: '0 40px 90px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.12)', ...style}}>
      <div style={{height: bar, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: '#E9EDF3', borderBottom: '1px solid #D9DFE8'}}>
        {['#E0E4EA', '#E0E4EA', '#E0E4EA'].map((c, i) => <span key={i} style={{width: 11, height: 11, borderRadius: 6, background: c, border: '1px solid #CBD2DC'}} />)}
        <span style={{marginLeft: 12, fontFamily: SANS, fontWeight: 700, fontSize: 15, color: '#5B6576', letterSpacing: '.02em'}}>{product}</span>
      </div>
      <div style={{position: 'absolute', left: 0, top: bar, right: 0, bottom: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${zoom?.ox ?? 50}% ${zoom?.oy ?? 50}%`}}>
          {src ? <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left'}} /> : (
            <div style={{position: 'absolute', inset: 0, display: 'flex'}}>
              <div style={{width: '18%', background: '#EEF1F6', borderRight: '1px solid #DEE3EA', padding: 18}}>
                {Array.from({length: 8}).map((_, i) => <div key={i} style={{height: 12, width: `${70 - (i % 3) * 12}%`, borderRadius: 6, background: '#D5DBE4', marginTop: i ? 20 : 6}} />)}
              </div>
              <div style={{flex: 1, padding: 26}}>
                <div style={{height: 22, width: '32%', borderRadius: 8, background: '#D3D9E2'}} />
                <div style={{display: 'flex', gap: 16, marginTop: 22}}>
                  {[0, 1, 2, 3].map((i) => <div key={i} style={{flex: 1, height: 70, borderRadius: 15, background: '#FFFFFF', border: '1px solid #E2E7EE'}} />)}
                </div>
                <div style={{marginTop: 22, borderRadius: 15, background: '#FFFFFF', border: '1px solid #E2E7EE', padding: 16}}>
                  {Array.from({length: 7}).map((_, i) => <div key={i} style={{display: 'flex', gap: 14, marginTop: i ? 14 : 0}}>
                    <div style={{width: '26%', height: 12, borderRadius: 6, background: '#DCE1E8'}} />
                    <div style={{width: '18%', height: 12, borderRadius: 6, background: '#E6EAF0'}} />
                    <div style={{width: '22%', height: 12, borderRadius: 6, background: '#E6EAF0'}} />
                  </div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {!src ? <PendingTag kind="CAPTURA" desc={desc} light style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}} /> : null}
    </div>
  );
};

/** ScreenSpotlight — retângulo fino dourado ao redor da área de interesse. */
export const ScreenSpotlight: React.FC<{x: number; y: number; w: number; h: number; start: number; end?: number}> = ({x, y, w, h, start, end}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 16);
  const q = end == null ? 0 : prog(f, end, 10);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 1 - q}}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="none" stroke="#C29B3C" strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};
