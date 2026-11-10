import React from 'react';
import {Img, staticFile} from 'remotion';

/*
 * Celular físico em CSS 3D.
 * - Frente: aro e ilha da câmera vindos de foto de estúdio (Pexels 26109750, Arpit Brandings), com fundo e tela removidos.
 * - Espessura: 24 lâminas da mesma silhueta empilhadas em Z (estrutura metálica), com luz azul lateral vinda da esquerda.
 * - Vidro: reflexo diagonal que se desloca conforme a rotação (os reflexos mudam com o movimento da câmera).
 * Coordenadas de desenho: 900 × 1834; a tela começa em (15, 15) e mede 870 × 1804.
 */
export const PW = 900, PH = 1834, PR = 137, DEPTH = 92, SX = 15, SY = 15, SW = 870, SH = 1804;
const N = 24;

export type Pose = {x: number; y: number; s: number; rx: number; ry: number; rz: number};

/** posição na tela (px do quadro) de um ponto da TELA do celular (coords da tela), válida com rx = ry = 0 */
export const screenPoint = (p: Pose, sx: number, sy: number): [number, number] => {
  const dx = (SX + sx - PW / 2) * p.s, dy = (SY + sy - PH / 2) * p.s;
  const c = Math.cos(p.rz * Math.PI / 180), s = Math.sin(p.rz * Math.PI / 180);
  return [p.x + dx * c - dy * s, p.y + dx * s + dy * c];
};

export const Phone3D: React.FC<{pose: Pose; blur?: number; opacity?: number; children?: React.ReactNode}> = ({pose, blur = 0, opacity = 1, children}) => {
  const {x, y, s, rx, ry, rz} = pose;
  // luz: a lateral esquerda recebe a luz azul do estúdio; a intensidade acompanha quanto a lateral está voltada para a câmera
  const sideL = Math.max(0, Math.sin(-ry * Math.PI / 180)), sideB = Math.max(0, Math.sin(rx * Math.PI / 180));
  const refl = 46 + ry * 1.6 - rx * .8; // posição do reflexo no vidro (%)
  if (opacity <= 0.001) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity, filter: blur > .15 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
      <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transformStyle: 'preserve-3d',
        transform: `perspective(2800px) rotateZ(${rz.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`}}>
        {/* estrutura metálica (espessura) */}
        {Array.from({length: N}, (_, i) => {
          const k = (i + 1) / N, mid = 1 - Math.abs(k - .45) * 1.6; // perfil arredondado: meio mais claro
          const lum = 30 + 34 * Math.max(0, mid);
          return <div key={i} style={{position: 'absolute', left: -PW / 2, top: -PH / 2, width: PW, height: PH, borderRadius: PR,
            transform: `translateZ(${(-k * DEPTH).toFixed(1)}px)`,
            background: `linear-gradient(90deg, rgb(${lum + 40 * sideL},${lum + 62 * sideL},${lum + 92 * sideL}) 0%, rgb(${lum},${lum + 3},${lum + 7}) 4%, rgb(${lum * .7},${lum * .72},${lum * .76}) 96%, rgb(${lum * .55},${lum * .57},${lum * .6}) 100%)`,
            boxShadow: `inset 0 ${(-10 - 26 * sideB).toFixed(0)}px 0 rgba(150,175,205,${(.25 * sideB).toFixed(3)})`}} />;
        })}
        {/* sombra projetada atrás do aparelho (profundidade no estúdio) */}
        <div style={{position: 'absolute', left: -PW / 2, top: -PH / 2, width: PW, height: PH, borderRadius: PR, transform: `translateZ(${-DEPTH - 2}px)`,
          boxShadow: '0 60px 140px rgba(0,0,0,.75)', background: '#0d0f11'}} />
        {/* tela */}
        <div style={{position: 'absolute', left: -PW / 2 + SX, top: -PH / 2 + SY, width: SW, height: SH, borderRadius: PR - 14, overflow: 'hidden', background: '#050607',
          transform: 'translateZ(.6px)'}}>
          {children}
          {/* vidro: reflexo que se move com a rotação + leve brilho de borda */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(118deg, rgba(255,255,255,0) ${(refl - 16).toFixed(1)}%, rgba(255,255,255,.075) ${refl.toFixed(1)}%, rgba(255,255,255,0) ${(refl + 12).toFixed(1)}%)`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 22%)'}} />
        </div>
        {/* aro e ilha da câmera (foto) */}
        <Img src={staticFile('assets/photography/celular-aro.png')} style={{position: 'absolute', left: -PW / 2, top: -PH / 2, width: PW, height: PH, transform: 'translateZ(1.2px)'}} />
      </div>
    </div>
  );
};
