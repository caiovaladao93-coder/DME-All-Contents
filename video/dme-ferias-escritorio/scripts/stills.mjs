// Quadros de conferência: node scripts/stills.mjs out/testes 0,50,100,...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [, , outDir = 'out/testes', framesArg = '0', comp = 'DMEFeriasEscritorio'] = process.argv;
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable, inputProps: {audio: false}});
for (const fr of framesArg.split(',').map(Number)) {
  await renderStill({serveUrl, composition, frame: fr, output: `${outDir}/f${String(fr).padStart(4, '0')}.png`, browserExecutable, inputProps: {audio: false}});
  console.log('quadro', fr);
}
