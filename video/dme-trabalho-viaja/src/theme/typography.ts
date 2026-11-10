import {continueRender, delayRender, staticFile} from 'remotion';
// Títulos: Space Grotesk (OFL, obtida do pacote Fontsource). Texto e legendas: Manrope (OFL). Arquivos em public/assets/fonts.
export const HEAD = "'Space Grotesk', sans-serif";
export const UI = "Manrope, sans-serif";
const FACES: Array<[string, number, string]> = [
  ['Space Grotesk', 500, 'space-grotesk-latin-500-normal.woff2'], ['Space Grotesk', 600, 'space-grotesk-latin-600-normal.woff2'], ['Space Grotesk', 700, 'space-grotesk-latin-700-normal.woff2'],
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
