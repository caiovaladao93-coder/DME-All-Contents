import {continueRender, delayRender, staticFile} from 'remotion';
// Fontes da marca Flávia Valadão: Cormorant (títulos) e Manrope (interface), ambas OFL, em public/assets/fonts.
export const SERIF = 'Cormorant, serif';
export const SANS = 'Manrope, sans-serif';
const FACES: Array<[string, number, string]> = [
  ['Cormorant', 400, 'cormorant-latin-400-normal.woff2'], ['Cormorant', 500, 'cormorant-latin-500-normal.woff2'],
  ['Manrope', 400, 'manrope-latin-400-normal.woff2'], ['Manrope', 500, 'manrope-latin-500-normal.woff2'],
];
let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fontes');
  Promise.all(FACES.map(([fam, w, file]) => new FontFace(fam, `url(${staticFile('assets/fonts/' + file)}) format('woff2')`, {weight: String(w)}).load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(h)).catch((e) => { console.error('fonte ausente', e); continueRender(h); });
};
