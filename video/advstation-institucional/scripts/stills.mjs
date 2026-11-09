// Renderiza quadros-chave para revisão: node scripts/stills.mjs <pasta> <frame1,frame2,...> [composição]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [,, outDir = 'out/testes', framesArg = '0', compId = 'ADVStationFilm'] = process.argv;
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: compId, browserExecutable});
fs.mkdirSync(outDir, {recursive: true});
for (const fr of framesArg.split(',').map(Number)) {
  const output = path.join(outDir, `f${String(fr).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: fr, output, browserExecutable, imageFormat: 'png'});
  console.log('ok', output);
}
