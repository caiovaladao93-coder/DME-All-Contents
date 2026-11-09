import {continueRender, delayRender, staticFile} from 'remotion';

// Carrega as fontes locais (OFL) antes do primeiro frame — nada de URL remota.
const FONTS: Array<[string, number, string]> = [
  ['Sora', 600, 'sora-latin-600-normal.woff2'],
  ['Sora', 700, 'sora-latin-700-normal.woff2'],
  ['Sora', 800, 'sora-latin-800-normal.woff2'],
  ['Manrope', 500, 'manrope-latin-500-normal.woff2'],
  ['Manrope', 600, 'manrope-latin-600-normal.woff2'],
  ['Manrope', 700, 'manrope-latin-700-normal.woff2'],
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Carregando fontes da marca');
  Promise.all(
    FONTS.map(([family, weight, file]) =>
      new FontFace(family, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: String(weight)})
        .load()
        .then((f) => {
          (document as any).fonts.add(f);
        }),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error('Falha ao carregar fontes', e);
      continueRender(handle);
    });
};
