import {Easing, interpolate} from 'remotion';

// Easing cinematográfico (sem bounce): entradas suaves de 12 a 18 quadros.
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
export const FPS = 30;

export const prog = (f: number, start: number, dur: number, ease: (t: number) => number = EASE_OUT) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
