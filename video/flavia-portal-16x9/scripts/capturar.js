// Captura as TELAS REAIS do protótipo do portal (landing-sites/flavia-portal/index.html, dados de exemplo) em 2x,
// esconde só a faixa "Protótipo com dados de exemplo" e as contas de demonstração do login, e grava as caixas
// (coordenadas da página) dos elementos que a câmera do vídeo enquadra. Saída: public/assets/telas/*.jpg e src/data/telas.json.
// Uso: node scripts/capturar.js [/caminho/para/landing-sites/flavia-portal/index.html]
const {chromium} = require('playwright');
const fs = require('fs');
const SRC = process.argv[2] || '/home/user/landing-sites/flavia-portal/index.html';
const OUT = __dirname + '/../public/assets/telas', DATA = __dirname + '/../src/data/telas.json';
const CSS = '.proto{display:none!important} .demos,.entrar .dica-demo{display:none!important} *{scroll-behavior:auto!important}';
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 2});
  const T = {};
  const box = (sel, fn) => pg.evaluate(([sel, fn]) => {
    let el = typeof sel === 'string' ? document.querySelector(sel) : null;
    if (fn) el = (new Function('return ' + fn))()();
    if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)];
  }, [sel, fn]);
  const shot = async (nome, full, boxes) => {
    await pg.addStyleTag({content: CSS}); await pg.waitForTimeout(500);
    const h = await pg.evaluate(() => document.documentElement.scrollHeight);
    await pg.screenshot({path: `${OUT}/${nome}.jpg`, type: 'jpeg', quality: 90, fullPage: full});
    T[nome] = {w: 1920, h: full ? h : 1080, boxes: {}};
    for (const [k, [sel, fn]] of Object.entries(boxes)) T[nome].boxes[k] = await box(sel, fn);
    console.log(nome, T[nome].h, JSON.stringify(T[nome].boxes));
  };
  const byText = (sel, txt) => `() => [...document.querySelectorAll('${sel}')].find(e => e.innerText && e.innerText.includes('${txt}'))`;
  await pg.goto('file://' + SRC); await pg.waitForTimeout(1200); await pg.addStyleTag({content: CSS});
  // 1) login
  await pg.fill('input[type=email]', 'marina.duarte@email.com').catch(() => {}); await pg.fill('input[type=password]', 'portal-flavia').catch(() => {});
  await shot('login', false, {form: ['.lado-form'], marca: ['.lado-marca'], botao: ['.lado-form .btn.solid']});
  // 2) home da cliente
  await pg.evaluate(() => { const i = document.querySelector('input[type=email]'); if (i) i.value = ''; });
  await pg.evaluate(() => document.querySelector('button.demo').click()); await pg.waitForTimeout(1200);
  const pular = pg.getByText('Pular tutorial'); if (await pular.count()) { await pular.first().click(); await pg.waitForTimeout(400); }
  await shot('home', true, {ola: ['.ola'], etapas: ['ol.etapas'], resumo: ['.resumo'], aviso: ['a.aviso-obra'], mapa: ['section.mapa'], planta: ['.svgbox'],
    cozinhaPlanta: [null, `() => { const t = [...document.querySelectorAll('.svgbox title')].find(t => t.textContent.trim() === 'Cozinha'); return t && (t.parentElement); }`],
    cozinhaLista: [null, byText('button.amb', 'Cozinha')], lista: [null, `() => document.querySelector('button.amb').parentElement`]});
  // 3) cozinha · imagens
  await pg.getByRole('button', {name: /Cozinha/}).first().click(); await pg.waitForTimeout(1200);
  await shot('cozinha-imagens', true, {ambiente: ['section.ambiente'], abas: [null, `() => document.querySelector('[data-aba]').parentElement`], img1: [null, `() => document.querySelector('section.ambiente img')`],
    card1: [null, `() => document.querySelector('section.ambiente img').closest('figure,article,button,div')`]});
  // 4) imagem em tela cheia
  await pg.locator('section.ambiente img').first().click(); await pg.waitForTimeout(1000);
  await shot('cozinha-tela-cheia', false, {});
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(600);
  // 5) lista de compras
  await pg.locator('[data-aba="compras"]').first().click(); await pg.waitForTimeout(1000);
  const jc = `() => [...document.querySelectorAll('section.ambiente button')].find(b => b.innerText.includes('Já comprei'))`;
  await shot('cozinha-compras', true, {ambiente: ['section.ambiente'], aba: ['[data-aba="compras"]'], card1: [null, `() => (${jc})().closest('article,li,div.card,div')?.parentElement?.closest('article,li') || (${jc})().parentElement.parentElement`], jacomprei: [null, jc],
    resumo: [null, `() => document.querySelector('section.ambiente .tabs, section.ambiente [role=tablist]')?.nextElementSibling`]});
  await pg.evaluate((f) => (new Function('return ' + f))()().click(), jc); await pg.waitForTimeout(800);
  await shot('cozinha-compras-ok', true, {jacomprei: [null, `() => [...document.querySelectorAll('section.ambiente button')].find(b => b.innerText.includes('Comprado'))`]});
  // 6) detalhe de uma peça (onde comprar)
  await pg.locator('section.ambiente article').first().click({position: {x: 120, y: 120}}).catch(() => {}); await pg.waitForTimeout(900);
  await shot('cozinha-peca', false, {modal: [null, `() => document.querySelector('dialog[open], .modal, .folha, [role=dialog]')`]});
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(600);
  // 7) obra
  await pg.locator('[data-aba="obra"]').first().click(); await pg.waitForTimeout(1000);
  await shot('cozinha-obra', true, {aba: ['[data-aba="obra"]'], pacs: ['.pacs'], aprovar: [null, byText('section.ambiente button', 'Aprovar orçamento')], orcamento: [null, byText('section.ambiente h2, section.ambiente h3', 'Orçamento da')]});
  // 8) plantas
  await pg.locator('[data-aba="plantas"]').first().click(); await pg.waitForTimeout(1000);
  await shot('cozinha-plantas', true, {aba: ['[data-aba="plantas"]'], plantas: ['.plantas'], card1: ['.pl-card']});
  // 9) sala de estar · seu retorno (com conversa)
  await pg.getByRole('button', {name: /Sala de estar/}).first().click(); await pg.waitForTimeout(1000);
  await pg.locator('[data-aba="retorno"]').first().click(); await pg.waitForTimeout(1000);
  await shot('sala-retorno', true, {ambiente: ['section.ambiente'], aba: ['[data-aba="retorno"]'], aprovar: [null, byText('section.ambiente button', 'Aprovar este')], ajuste: [null, byText('section.ambiente button', 'Pedir um ajuste')],
    conversa: [null, byText('section.ambiente h3, section.ambiente h4, section.ambiente p.k', 'CONVERSA')]});
  console.log(await pg.evaluate(() => document.querySelector('section.ambiente').innerText.slice(0, 900)));
  fs.writeFileSync(DATA, JSON.stringify(T, null, 1));
  await b.close();
})();
