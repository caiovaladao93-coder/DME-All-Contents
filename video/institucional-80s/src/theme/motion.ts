import {Easing, interpolate} from 'remotion';

export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1); // entradas
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1); // câmera e reorganizações
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45); // saídas

export const ENTER = 16; // 12–20 frames
export const EXIT = 10; // 8–12 frames
export const STAGGER = 4; // 3–6 frames

/** Progresso 0..1 entre start e start+dur, com easing e clamp. */
export const prog = (f: number, start: number, dur: number, ease = EASE_OUT) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Câmera virtual determinística: escala + translação ao longo da cena. */
export const camera = (
  f: number,
  dur: number,
  o: {s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number} = {},
) => {
  const p = prog(f, 0, dur, EASE_IO);
  const s = lerp(o.s0 ?? 1, o.s1 ?? 1.04, p);
  const x = lerp(o.x0 ?? 0, o.x1 ?? 0, p);
  const y = lerp(o.y0 ?? 0, o.y1 ?? 0, p);
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
};
