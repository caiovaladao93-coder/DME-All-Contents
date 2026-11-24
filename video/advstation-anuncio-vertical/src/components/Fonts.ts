import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: Array<[string, number, string]> = [
  ['Gelasio', 600, 'gelasio-latin-600-normal.woff2'],
  ['Gelasio', 700, 'gelasio-latin-700-normal.woff2'],
  ['Nunito Sans', 600, 'nunito-sans-latin-600-normal.woff2'],
  ['Nunito Sans', 700, 'nunito-sans-latin-700-normal.woff2'],
  ['Nunito Sans', 800, 'nunito-sans-latin-800-normal.woff2'],
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const h = delayRender('fontes');
  Promise.all(FONTS.map(([fam, w, file]) => new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: String(w)}).load()
    .then((ff) => (document as any).fonts.add(ff))))
    .then(() => continueRender(h))
    .catch((e) => { console.error(e); continueRender(h); });
};
