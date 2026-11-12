import {continueRender, delayRender, staticFile} from 'remotion';
// Títulos: Sora (OFL). Interface: Manrope (OFL). Arquivos em public/assets/fonts.
export const HEAD = "Sora, sans-serif";
export const UI = "Manrope, sans-serif";
const FACES: Array<[string, number, string]> = [
  ['Sora', 600, 'sora-latin-600-normal.woff2'], ['Sora', 700, 'sora-latin-700-normal.woff2'], ['Sora', 800, 'sora-latin-800-normal.woff2'],
  ['Manrope', 500, 'manrope-latin-500-normal.woff2'], ['Manrope', 600, 'manrope-latin-600-normal.woff2'], ['Manrope', 700, 'manrope-latin-700-normal.woff2'],
];
let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fontes');
  Promise.all(FACES.map(([fam, w, file]) => new FontFace(fam, `url(${staticFile('assets/fonts/' + file)}) format('woff2')`, {weight: String(w)}).load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(h)).catch((e) => { console.error('fonte ausente', e); continueRender(h); });
};
