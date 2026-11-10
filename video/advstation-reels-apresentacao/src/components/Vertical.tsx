import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {SANS, SERIF} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';

/** Área segura vertical do manual: topo 250, base 350, laterais 90 (conteúdo entre y=250 e y=1570). */
export const SAFE_V = {top: 250, bottom: 1570, side: 90};

/** Atmosfera editorial vertical: marinho profundo, luz âmbar, vinheta radial escura e grão 0,05. */
export const Atmos: React.FC<{amber?: number; ax?: number; ay?: number}> = ({amber = 1, ax = 78, ay = 76}) => {
  const f = useCurrentFrame();
  const seed = f % 12;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at ${30 + Math.sin(f / 90) * 5}% 22%, rgba(40,66,112,.9), rgba(22,40,74,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 40% at ${ax}% ${ay}%, rgba(194,155,60,${0.16 * amber}), rgba(194,155,60,0) 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 48%, rgba(0,0,0,0) 50%, rgba(4,8,18,.8) 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay'}}>
        <filter id={`gv${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#gv${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Clarão nas viradas (manual: clarão nas viradas definidas no roteiro). */
export const Flash: React.FC<{f: number; at: number}> = ({f, at}) => {
  const p = prog(f, at, 3, (t) => t), q = prog(f, at + 3, 10, EASE_OUT);
  const o = p * (1 - q) * 0.55;
  return o > 0 ? <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(255,236,200,1), rgba(255,236,200,.2))', opacity: o, pointerEvents: 'none'}} /> : null;
};

/** Rótulo dourado (manual: 22 px, tracking 0,26em; ampliado para o quadro vertical). */
export const GoldLabel: React.FC<{f: number; start: number; text: string; y: number; out?: number}> = ({f, start, text, y, out}) => {
  const p = prog(f, start, 14, EASE_OUT), q = out != null ? prog(f, out, 10, EASE_IN) : 0;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: y, display: 'flex', alignItems: 'center', gap: 18, opacity: p * (1 - q)}}>
      <span style={{display: 'block', width: 56 * p, height: 3, borderRadius: 2, background: C.gold}} />
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '.26em', color: C.gold, whiteSpace: 'nowrap'}}>{text}</span>
    </div>
  );
};

/** Manchete serifada, palavra a palavra por máscara. [palavras] em dourado; "|" quebra linha. */
export const Headline: React.FC<{f: number; start: number; text: string; y: number; size?: number; out?: number; stagger?: number; align?: 'left' | 'center'}> =
  ({f, start, text, y, size = 96, out, stagger = 3, align = 'left'}) => {
    let i = 0; let acc = false;
    const q = out != null ? prog(f, out, 10, EASE_IN) : 0;
    return (
      <div style={{position: 'absolute', left: 90, right: 90, top: y, fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.04, color: '#fff', textAlign: align}}>
        {text.split('|').map((line, li) => (
          <div key={li} style={{whiteSpace: 'nowrap'}}>
            {line.split(' ').filter(Boolean).map((raw, wi) => {
              let w = raw; if (w.startsWith('[')) { acc = true; w = w.slice(1); }
              let end = false; if (w.includes(']')) { end = true; w = w.replace(']', ''); }
              const gold = acc; if (end) acc = false;
              const p = prog(f, start + (i++) * stagger, 15, EASE_OUT);
              return <span key={wi} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginRight: '0.22em'}}>
                <span style={{display: 'inline-block', color: gold ? C.gold : '#fff', opacity: Math.min(1, p * 5) * (1 - q), transform: `translateY(${((1 - p) * 120 - q * 30).toFixed(1)}%)`}}>{w}</span></span>;
            })}
          </div>
        ))}
      </div>
    );
  };

export type Rect = [number, number, number]; // x, y, largura (em pixels da imagem); a altura sai da proporção do cartão
export type Key = {at: number; dur?: number; r: Rect};
export type Mark = {x: number; y: number; w: number; h: number; start: number; end?: number; ring?: boolean};

/**
 * Captura REAL recortada num cartão (raio 16, sem recolorir). A câmera percorre retângulos da imagem (keys);
 * marcas douradas (manual: o destaque dourado serve ao alvo citado) ficam no espaço da imagem e acompanham o zoom.
 */
export const ScreenCrop: React.FC<{f: number; src: string; iw: number; ih: number; x: number; y: number; w: number; h: number; keys: Key[]; marks?: Mark[];
  enter?: number; out?: number; tilt?: number; tag?: string; style?: React.CSSProperties}> =
  ({f, src, iw, ih, x, y, w, h, keys, marks = [], enter = 0, out, tilt = 0, tag, style}) => {
    let [cx, cy, cw] = keys[0].r;
    for (const k of keys.slice(1)) {
      const p = prog(f, k.at, k.dur ?? 18, EASE_IO);
      cx = lerp(cx, k.r[0], p); cy = lerp(cy, k.r[1], p); cw = lerp(cw, k.r[2], p);
    }
    const s = w / cw;
    const pe = prog(f, enter, 16, EASE_OUT), q = out != null ? prog(f, out, 10, EASE_IN) : 0;
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: pe * (1 - q),
        transform: `translateY(${((1 - pe) * 60 - q * 30).toFixed(1)}px) perspective(1800px) rotateX(${tilt}deg) scale(${(0.96 + 0.04 * pe).toFixed(4)})`, ...style}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', background: '#F7F3EA', boxShadow: '0 40px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.16)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: iw, height: ih, transformOrigin: '0 0', transform: `translate(${(-cx * s).toFixed(2)}px, ${(-cy * s).toFixed(2)}px) scale(${s.toFixed(4)})`}}>
            <Img src={staticFile(src)} style={{width: iw, height: ih, display: 'block'}} />
            <svg width={iw} height={ih} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              {marks.map((m, i) => {
                const p = prog(f, m.start, 14, EASE_OUT), qq = m.end != null ? prog(f, m.end, 10, EASE_IN) : 0;
                if (p <= 0 || qq >= 1) return null;
                return <rect key={i} x={m.x - 6} y={m.y - 5} width={m.w + 12} height={m.h + 10} rx={m.ring ? (m.h + 10) / 2 : 10}
                  fill="rgba(194,155,60,.10)" stroke={C.gold} strokeWidth={3.2 / s * 1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={1 - qq} />;
              })}
            </svg>
          </div>
        </div>
        {tag ? <div style={{position: 'absolute', right: 0, top: h + 14, fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: '.06em', color: 'rgba(230,234,240,.7)', whiteSpace: 'nowrap'}}>{tag}</div> : null}
      </div>
    );
  };

/** Saída comum das cenas: desliza para cima e esmaece (cortes rápidos de Reels). */
export const sceneOut = (f: number, dur: number) => {
  const q = prog(f, dur - 6, 6, EASE_IN);
  return {opacity: 1 - q, transform: `translateY(${(-40 * q).toFixed(1)}px)`};
};
export const sceneIn = (f: number) => prog(f, 0, 8, EASE_OUT);
export {EASE_IO, lerp};
