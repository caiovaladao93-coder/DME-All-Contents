import {continueRender, delayRender, staticFile} from 'remotion';

// O SGC usa a pilha de sistema (Segoe UI/Aptos), que não tem licença para vídeo.
// Títulos em Sora e interface em Manrope (OFL), as mesmas fontes do vídeo vertical do SGC.
export const HEAD = "Sora, 'Segoe UI', sans-serif";
export const UI = "Manrope, 'Segoe UI', sans-serif";

const FACES: Array<[string, number, string]> = [
  ['Sora', 600, 'sora-latin-600-normal.woff2'], ['Sora', 700, 'sora-latin-700-normal.woff2'], ['Sora', 800, 'sora-latin-800-normal.woff2'],
  ['Manrope', 500, 'manrope-latin-500-normal.woff2'], ['Manrope', 600, 'manrope-latin-600-normal.woff2'], ['Manrope', 700, 'manrope-latin-700-normal.woff2'],
];
let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fontes');
  Promise.all(FACES.map(([fam, w, file]) => {
    const f = new FontFace(fam, `url(${staticFile('assets/fonts/' + file)}) format('woff2')`, {weight: String(w)});
    return f.load().then((ff) => document.fonts.add(ff));
  })).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
