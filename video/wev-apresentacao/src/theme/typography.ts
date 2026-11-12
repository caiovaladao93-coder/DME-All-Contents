import {continueRender, delayRender, staticFile} from 'remotion';
// Fontes da marca W-EV (OFL, copiadas do repositório do cliente): Manrope (títulos e marca) e DM Sans (interface).
export const HEAD = "Manrope, sans-serif";
export const UI = "'DM Sans', sans-serif";
let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fontes');
  Promise.all([new FontFace('Manrope', `url(${staticFile('assets/fonts/manrope.ttf')})`, {weight: '200 800'}), new FontFace('DM Sans', `url(${staticFile('assets/fonts/dm-sans.ttf')})`, {weight: '100 1000'})]
    .map((ff) => ff.load().then((f) => document.fonts.add(f)))).then(() => continueRender(h)).catch((e) => { console.error('fonte', e); continueRender(h); });
};
