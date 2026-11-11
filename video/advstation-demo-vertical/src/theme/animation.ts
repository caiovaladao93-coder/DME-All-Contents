import {Easing, interpolate} from 'remotion';

export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
export const FPS = 30;

/** Progresso 0..1 (com clamp) entre start e start+dur, em frames. */
export const prog = (f: number, start: number, dur: number, ease: (t: number) => number = EASE_OUT) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Mesmo cálculo em segundos (para replicar animações CSS da vinheta). */
export const progS = (t: number, delay: number, dur: number, ease: (t: number) => number) => {
  if (t <= delay) return 0;
  if (t >= delay + dur) return ease(1);
  return ease((t - delay) / dur);
};

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Câmera virtual: escala + translação ao longo de [0, dur]. */
export const camera = (f: number, dur: number, o: {s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number} = {}) => {
  const p = prog(f, 0, dur, EASE_IO);
  return `translate(${lerp(o.x0 ?? 0, o.x1 ?? 0, p).toFixed(2)}px, ${lerp(o.y0 ?? 0, o.y1 ?? 0, p).toFixed(2)}px) scale(${lerp(o.s0 ?? 1, o.s1 ?? 1.04, p).toFixed(4)})`;
};
