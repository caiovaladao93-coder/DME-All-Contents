const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  // uso: node render.js video.html out/video.mp4 [W H FPS DUR] ; capturas: node render.js video.html out/testes 1080 1920 30 28 0.6,12.5,27.9
  const [,, html, out, W = '1080', H = '1920', FPS = '30', DUR = '34', STILLS = ''] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
  await page.goto(pathToFileURL(path.resolve(html)).href + '?frame=1');
  await page.waitForFunction(() => window.__ready === true);
  if (STILLS) {
    fs.mkdirSync(out, { recursive: true });
    for (const s of STILLS.split(',')) {
      await page.evaluate(t => window.renderAt(t), +s);
      await page.screenshot({ path: path.join(out, 't' + s + '.png') });
    }
    await browser.close();
    return;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y','-loglevel','error','-f','image2pipe','-framerate',FPS,'-i','-',
    '-vf', `scale=${W}:${H}`,
    '-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p',
    '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-movflags','+faststart', out], { stdio: ['pipe','inherit','inherit'] });
  const n = Math.round(+DUR * +FPS);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.renderAt(t), i / +FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`quadro ${i}/${n} · ${((Date.now()-t0)/1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
})();
