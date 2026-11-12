import {Easing, interpolate} from 'remotion';
import TL from '../data/timeline.json';

export const FPS = 30;
export const BEAT = 0.5; // 120 BPM
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
export const BACK = Easing.bezier(0.34, 1.45, 0.64, 1); // overshoot ~3% (cartões, chips, peças do logo; nunca texto)
/** progresso 0..1 entre os segundos a e a+d (t é sempre derivado do frame: t = frame / 30) */
export const P = (t: number, a: number, d: number, ease: (x: number) => number = EASE_OUT) =>
  interpolate(t, [a, a + Math.max(1e-3, d)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export type SceneKey = 'abertura' | 'conecta' | 'motorista' | 'parceiros' | 'operacao' | 'jornadas' | 'assinatura';
export const S = Object.fromEntries(TL.scenes.map((s) => [s.key, s])) as unknown as Record<SceneKey, {t0: number; t1: number; v0: number; v1: number}>;
const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/** instante (s) em que a palavra começa a ser dita (alinhamento real da ElevenLabs) */
export const wt = (k: SceneKey, w: string, nth = 0): number => {
  const hits = (TL.words as any)[k].filter((x: [string, number, number]) => norm(x[0]) === norm(w));
  const h = hits[nth] ?? hits[0]; if (!h) throw new Error(`palavra "${w}" não encontrada em ${k}`); return h[1];
};
/** estado com chaves de tempo: interpola com easing entre a chave anterior e a seguinte */
export const keyed = (t: number, keys: Array<number[]>) => {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    const [ta, ...a] = keys[i - 1], [tb, ...b] = keys[i];
    if (t <= tb) { const p = EASE_IO(clamp((t - ta) / (tb - ta))); return a.map((v, j) => lerp(v, b[j], p)); }
  }
  return keys[keys.length - 1].slice(1);
};
/** ruído determinístico (sem Math.random) */
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
