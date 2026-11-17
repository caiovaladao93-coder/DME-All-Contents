// Portal da Flávia Valadão · vídeo explicativo 16:9 para a seção "Portal" do site.
// Usa as TELAS REAIS do protótipo do portal (dados de exemplo), capturadas por scripts/capturar.js, com câmera, cursor e destaques.
// Todos os tempos vêm de src/data/timeline.json (fala real, voz Pri). Funções citadas = as do portal e do texto do site.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import TELAS from './data/telas.json';
import {C} from './theme/colors';
import {SANS, SERIF, loadFonts} from './theme/typography';

type Word = [string, number, number];
type Cap = {start: number; end: number; words: Word[]; text: string};
type Rect = [number, number, number, number];
const SC: Record<string, {t0: number; t1: number; v0: number; v1: number}> = Object.fromEntries(TL.scenes.map((s) => [s.key, s]));
const WORDS = TL.words as unknown as Record<string, Word[]>;
const CAPS = TL.captions as unknown as Cap[];
const T = TELAS as unknown as Record<string, {w: number; h: number; boxes: Record<string, Rect | null>}>;
const B = (tela: string, k: string): Rect => (T[tela].boxes[k] || [0, 0, 100, 100]) as Rect;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t: number, a: number, d: number) => clamp((t - a) / d);
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const norm = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const W = (k: string, w: string, nth = 0) => { const h = (WORDS[k] || []).filter((x) => norm(x[0]) === norm(w)); return (h[nth] || h[0] || [w, SC[k].v0, SC[k].v0])[1]; };
const grow = (r: Rect, g: number): Rect => [r[0] - g, r[1] - g, r[2] + 2 * g, r[3] + 2 * g];
const col = (r: Rect, i: number, n: number): Rect => [r[0] + (r[2] / n) * i, r[1], r[2] / n, r[3]];

// ── janela do navegador (lado direito)
const WX = 700, WY = 110, WW = 1110, BAR = 46, VW = WW, VH = 720;

// ── roteiro visual: câmera (tela + enquadramento), destaques e cursor, ancorados nas palavras da fala
type Cam = [number, string, Rect];
const S = SC;
const tClickLogin = W('login', 'senha.') + .35, tClickCoz = W('planta', 'entrar.') + .05, tClickImg = W('imagens', 'tela') - .25, tClickJa = W('compras', 'marcar,') - .05;
const CAM: Cam[] = [
  [0, 'login', [0, 0, 1920, 1080]],
  [tClickLogin + .35, 'home', [0, 0, 1920, 1080]],
  [S.painel.t0 + .1, 'home', [330, 50, 1260, 420]],
  [W('painel', 'etapa') - .35, 'home', [1090, 160, 520, 120]],
  [W('painel', 'números:') - .35, 'home', [330, 220, 1260, 180]],
  [S.planta.t0 + .05, 'home', [340, 430, 1240, 860]],
  [W('planta', 'tocar') - .5, 'home', [700, 560, 820, 560]],
  [tClickCoz + .35, 'cozinha-imagens', [340, 1270, 1240, 560]],
  [tClickImg + .35, 'cozinha-tela-cheia', [0, 0, 1920, 1080]],
  [S.compras.t0, 'cozinha-compras', [340, 1270, 1240, 560]],
  [W('compras', 'foto,') - .5, 'cozinha-compras', [340, 1800, 1240, 600]],
  [W('compras', 'Comprou?') - .5, 'cozinha-compras', [330, 1780, 860, 600]],
  [tClickJa + .3, 'cozinha-compras-ok', [330, 1780, 860, 600]],
  [S.obra.t0, 'cozinha-obra', [340, 1360, 1240, 860]],
  [W('obra', 'aprova') - .4, 'cozinha-obra', [760, 1460, 860, 560]],
  [S.plantas.t0, 'cozinha-plantas', [340, 1360, 1240, 620]],
  [W('plantas', 'baixar') - .5, 'cozinha-plantas', [340, 1480, 760, 480]],
  [S.retorno.t0, 'sala-retorno', [340, 1270, 1240, 540]],
  [W('retorno', 'conversa') - .4, 'sala-retorno', [880, 1400, 720, 380]],
];
type Hi = [number, number, string, Rect];
const resumo = B('home', 'resumo');
const HI: Hi[] = [
  [W('login', 'acesso') - .1, tClickLogin, 'login', grow(B('login', 'form'), -40)],
  [W('painel', 'etapa') - .1, W('painel', 'números:') - .4, 'home', grow(B('home', 'etapas'), 26)],
  [W('painel', 'cômodos,'), W('painel', 'investimento'), 'home', grow(col(resumo, 0, 4), -4)],
  [W('painel', 'investimento'), W('painel', 'comprado'), 'home', grow(col(resumo, 1, 4), -4)],
  [W('painel', 'comprado'), W('painel', 'aprovou.'), 'home', grow(col(resumo, 2, 4), -4)],
  [W('painel', 'aprovou.'), S.painel.t1, 'home', grow(col(resumo, 3, 4), -4)],
  [W('planta', 'tocar') - .3, tClickCoz + .3, 'home', grow(B('home', 'cozinhaPlanta'), 10)],
  [W('imagens', 'imagens') - .1, tClickImg + .3, 'cozinha-imagens', grow(B('cozinha-imagens', 'img1'), 8)],
  [S.compras.t0 + .3, S.compras.t0 + 2.2, 'cozinha-compras', grow(B('cozinha-compras', 'aba'), 4)],
  [W('compras', 'foto,') - .2, W('compras', 'Comprou?') - .2, 'cozinha-compras', grow(B('cozinha-compras', 'card1'), 8)],
  [tClickJa + .35, S.compras.t1, 'cozinha-compras-ok', grow(B('cozinha-compras', 'card1'), 8)],
  [S.obra.t0 + .3, S.obra.t0 + 2.4, 'cozinha-obra', grow(B('cozinha-obra', 'aba'), 4)],
  [W('obra', 'aprova'), S.obra.t1, 'cozinha-obra', grow(B('cozinha-obra', 'aprovar'), 8)],
  [S.plantas.t0 + .3, S.plantas.t0 + 2.2, 'cozinha-plantas', grow(B('cozinha-plantas', 'aba'), 4)],
  [W('plantas', 'abrir,') - .2, S.plantas.t1, 'cozinha-plantas', grow(B('cozinha-plantas', 'card1'), 8)],
  [S.retorno.t0 + .3, S.retorno.t0 + 2.0, 'sala-retorno', grow(B('sala-retorno', 'aba'), 4)],
  [W('retorno', 'aprova'), W('retorno', 'ajuste.') - .1, 'sala-retorno', grow(B('sala-retorno', 'aprovar'), 8)],
  [W('retorno', 'ajuste.') - .1, W('retorno', 'conversa') - .2, 'sala-retorno', grow(B('sala-retorno', 'ajuste'), 8)],
  [W('retorno', 'conversa'), S.retorno.t1, 'sala-retorno', [927, 1440, 625, 330]],
];
// cursor: [tempo, x, y] em coordenadas da página da tela ativa; cliques
const ctr = (r: Rect): [number, number] => [r[0] + r[2] / 2, r[1] + r[3] / 2];
const CUR: Array<[number, number, number]> = [
  [S.login.t0 + .4, 1560, 900], [tClickLogin - .1, ...ctr(B('login', 'botao'))],
  [tClickLogin + .6, 1500, 700], [W('planta', 'tocar') - .2, 1300, 1000], [tClickCoz - .1, ...ctr(B('home', 'cozinhaPlanta'))],
  [tClickCoz + .6, 900, 1600], [tClickImg - .15, ...ctr(B('cozinha-imagens', 'img1'))],
  [S.compras.t0 + .2, 900, 2000], [tClickJa - .15, ...ctr(B('cozinha-compras', 'jacomprei'))],
  [S.obra.t0 + .3, 900, 1700], [W('obra', 'aprova') + .2, ...ctr(B('cozinha-obra', 'aprovar'))],
  [S.plantas.t0 + .3, 900, 1700], [W('plantas', 'baixar') - .1, B('cozinha-plantas', 'card1')[0] + 92, B('cozinha-plantas', 'card1')[1] + 335],
  [S.retorno.t0 + .3, 900, 1600], [W('retorno', 'aprova') + .1, ...ctr(B('sala-retorno', 'aprovar'))], [W('retorno', 'ajuste.') + .1, ...ctr(B('sala-retorno', 'ajuste'))],
];
const CLICKS = [tClickLogin, tClickCoz, tClickImg, tClickJa];
const CUR_ON: Array<[number, number]> = [[S.login.t0 + .3, S.painel.t0], [W('planta', 'tocar') - .4, tClickCoz + .7], [W('imagens', 'imagens') - .2, tClickImg + .5], [W('compras', 'Comprou?') - .4, tClickJa + .8],
  [W('obra', 'aprova') - .3, S.obra.t1 - .2], [W('plantas', 'abrir,') - .2, S.plantas.t1 - .2], [W('retorno', 'aprova') - .3, W('retorno', 'conversa') - .2]];

// capítulos (textos do site e do tutorial do portal)
const CAPS_UI: Array<[string, string, string]> = [
  ['login', 'Acesso exclusivo', 'Cada cliente entra com o próprio e-mail e senha.'],
  ['painel', 'O projeto em números', 'A etapa atual, os cômodos, o investimento, as compras e as aprovações.'],
  ['planta', 'A planta do seu imóvel', 'Os cômodos do projeto ficam em destaque. Toque para entrar.'],
  ['imagens', 'As imagens de cada cômodo', 'As propostas em alta resolução, com legenda e tela cheia.'],
  ['compras', 'Lista de compras', 'Foto, especificação, onde comprar e quanto custa.'],
  ['obra', 'Obra e orçamentos', 'Serviços, fornecedores e aprovação dos orçamentos.'],
  ['plantas', 'Plantas técnicas', 'Abra ou baixe os desenhos para levar à obra.'],
  ['retorno', 'Seu retorno', 'Aprove ou peça um ajuste, tudo registrado num só lugar.'],
];

// ── câmera
const camAt = (t: number) => {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++;
  const [t0, tela, r] = CAM[i]; const prev = CAM[i - 1];
  if (prev && prev[1] === tela) { const k = eio(p(t, t0, .9)); return {tela, r: r.map((v, j) => mix(prev[2][j], v, k)) as Rect, fade: 1, prevTela: null as string | null, prevR: prev[2]}; }
  return {tela, r, fade: prev ? eo(p(t, t0, .35)) : 1, prevTela: prev ? prev[1] : null, prevR: prev ? prev[2] : r};
};
const xf = (tela: string, r: Rect) => {
  const s = Math.min(VW / r[2], VH / r[3]); const H = T[tela].h;
  let tx = VW / 2 - (r[0] + r[2] / 2) * s, ty = VH / 2 - (r[1] + r[3] / 2) * s;
  tx = clamp(tx, Math.min(0, VW - 1920 * s), 0); ty = clamp(ty, Math.min(0, VH - H * s), 0);
  return {s, tx, ty};
};
const Tela: React.FC<{tela: string; r: Rect; o?: number}> = ({tela, r, o = 1}) => {
  const {s, tx, ty} = xf(tela, r);
  return <Img src={staticFile(`assets/telas/${tela}.jpg`)} style={{position: 'absolute', left: tx, top: ty, width: 1920 * s, height: T[tela].h * s, opacity: o}} />;
};

// ── Janela do navegador com a tela real, destaques e cursor
const Janela: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t); const {s, tx, ty} = xf(cam.tela, cam.r);
  const toV = (x: number, y: number): [number, number] => [tx + x * s, ty + y * s];
  // cursor
  let ci = 0; while (ci < CUR.length - 1 && CUR[ci + 1][0] <= t) ci++;
  const a = CUR[ci], b2 = CUR[Math.min(ci + 1, CUR.length - 1)];
  const k = b2[0] > a[0] ? eio(clamp((t - a[0]) / Math.min(1.1, b2[0] - a[0]))) : 1;
  const on = CUR_ON.some(([x0, x1]) => t >= x0 && t <= x1);
  const [cx, cy] = toV(mix(a[1], b2[1], t >= a[0] ? k : 0), mix(a[2], b2[2], t >= a[0] ? k : 0));
  const clk = CLICKS.find((c) => t >= c && t < c + .5);
  return (
    <div style={{position: 'absolute', left: WX, top: WY, width: WW, height: BAR + VH, borderRadius: 14, overflow: 'hidden', background: C.papel, boxShadow: '0 40px 80px -30px rgba(0,0,0,.7)', border: `1px solid ${C.linha}`}}>
      <div style={{height: BAR, background: C.cartao, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px'}}>
        {[0, 1, 2].map((i) => <i key={i} style={{width: 12, height: 12, borderRadius: 6, background: C.linha, display: 'inline-block'}} />)}
        <div style={{marginLeft: 22, flex: 1, height: 28, borderRadius: 14, background: C.noite, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', fontFamily: SANS, fontSize: 16, color: C.tinta2}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.caramelo} strokeWidth="2.4"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          portal.fvinteriores.com.br
        </div>
      </div>
      <div style={{position: 'relative', width: VW, height: VH, overflow: 'hidden', background: C.papel}}>
        {cam.prevTela && cam.fade < 1 && <Tela tela={cam.prevTela} r={cam.prevR} />}
        <Tela tela={cam.tela} r={cam.r} o={cam.fade} />
        <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
          {HI.filter(([h0, h1, tela]) => tela === cam.tela && t >= h0 - .05 && t < h1 + .3).map(([h0, h1, , r], i) => {
            const o = eo(p(t, h0, .3)) * (1 - p(t, h1, .3)); const [x, y] = toV(r[0], r[1]);
            return <rect key={i} x={x} y={y} width={r[2] * s} height={r[3] * s} rx={8} fill="rgba(228,179,127,.10)" stroke={C.carameloEscuro} strokeWidth={3.5} opacity={o} />;
          })}
          {clk !== undefined && <circle cx={cx} cy={cy} r={10 + (t - clk) * 70} fill="none" stroke={C.carameloEscuro} strokeWidth={4} opacity={1 - (t - clk) / .5} />}
          {on && <g transform={`translate(${cx} ${cy}) scale(${clk !== undefined && t - clk < .15 ? .9 : 1})`}>
            <path d="M0 0 L0 30 L8 23 L14 36 L20 33 L14 21 L25 21 Z" fill="#fff" stroke={C.tintaEscura} strokeWidth={2.4} strokeLinejoin="round" />
          </g>}
        </svg>
      </div>
    </div>
  );
};

// ── coluna dos capítulos (lado esquerdo)
const Capitulos: React.FC<{t: number}> = ({t}) => {
  const atual = CAPS_UI.findIndex(([k]) => t >= SC[k].t0 && t < SC[k].t1);
  return (
    <div style={{position: 'absolute', left: 110, top: 110, width: 520}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 16, letterSpacing: '.16em', textTransform: 'uppercase', color: C.caramelo}}>
        <i style={{width: 9, height: 9, borderRadius: 5, background: C.led, display: 'inline-block'}} />Portal do cliente
      </div>
      <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 64, lineHeight: 1.02, color: C.tinta, marginTop: 14}}>Seu projeto, <span style={{fontStyle: 'italic', color: C.caramelo}}>sempre à&nbsp;mão.</span></div>
      <div style={{marginTop: 34, borderTop: `1px solid ${C.linha}`}}>
        {CAPS_UI.map(([k, tit, desc], i) => {
          const on = i === atual; const kOn = on ? eo(p(t, SC[k].t0, .4)) : 0;
          return (
            <div key={k} style={{borderBottom: `1px solid ${C.linha}`, padding: '12px 0', display: 'grid', gridTemplateColumns: '46px 1fr', opacity: on ? 1 : .45}}>
              <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: on ? C.caramelo : C.tinta2, lineHeight: 1.1}}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 21, color: C.tinta, lineHeight: 1.3}}>{tit}</div>
                {on && <div style={{fontFamily: SANS, fontSize: 17, color: C.tinta2, lineHeight: 1.4, marginTop: 4, opacity: kOn, transform: `translateY(${(1 - kOn) * 6}px)`}}>{desc}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── legendas (Manrope, uma linha, sob a janela)
const Legenda: React.FC<{t: number}> = ({t}) => {
  const cap = CAPS.find((c) => t >= c.start - .05 && t < c.end + .25);
  if (!cap) return null;
  const o = eo(p(t, cap.start - .05, .2)) * (1 - p(t, cap.end + .05, .2));
  return <div style={{position: 'absolute', left: 160, right: 160, top: 930, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.tinta, opacity: o}}>{cap.text}</div>;
};

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  loadFonts();
  const frame = useCurrentFrame(); const t = still ?? frame / TL.fps;
  const ab = SC.abertura, as = SC.assinatura;
  const kLay = eo(p(t, ab.t1 - .9, 1.0)) * (1 - eo(p(t, as.t0 - .2, .8)));
  const kTitulo = eo(p(t, .3, .9)) * (1 - eo(p(t, ab.t1 - 1.1, .6)));
  const led = eo(p(t, .1, 1.6));
  const kAss = eo(p(t, as.t0 + .1, .9));
  return (
    <AbsoluteFill style={{backgroundColor: C.noite}}>
      {/* linha de LED no topo, como na seção do site */}
      <div style={{position: 'absolute', left: 0, top: 0, height: 3, width: `${led * 100}%`, background: C.led, boxShadow: '0 0 18px 4px rgba(255,190,110,.4)'}} />
      {/* abertura */}
      {kTitulo > 0 && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: kTitulo, transform: `translateY(${(1 - kTitulo) * 14}px)`}}>
          <div style={{fontFamily: SANS, fontSize: 20, letterSpacing: '.18em', textTransform: 'uppercase', color: C.caramelo}}>Flávia Valadão Interiores · Portal do cliente</div>
          <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 120, lineHeight: 1, color: C.tinta, marginTop: 24, textAlign: 'center'}}>Seu projeto,<br /><span style={{fontStyle: 'italic', color: C.caramelo}}>num lugar só seu.</span></div>
        </div>
      )}
      {/* demonstração */}
      {kLay > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: kLay}}>
          <Capitulos t={t} />
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - kLay) * 80}px)`}}><Janela t={t} /></div>
          <div style={{position: 'absolute', left: WX + WW - 300, width: 300, top: WY + BAR + VH + 14, textAlign: 'right', fontFamily: SANS, fontSize: 16, color: C.tinta2}}>Telas reais do portal · dados de exemplo</div>
        </div>
      )}
      {/* assinatura em marfim, com o logo oficial */}
      {kAss > 0 && (
        <div style={{position: 'absolute', inset: 0, background: C.marfim, opacity: kAss, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={staticFile('assets/img/logo-flavia.png')} style={{width: 420, opacity: eo(p(t, as.t0 + .4, .8))}} />
          <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 76, color: C.tintaEscura, marginTop: 40, opacity: eo(p(t, W('assinatura', 'Seu') - .2, .7))}}>Seu projeto, <span style={{fontStyle: 'italic', color: C.carameloEscuro}}>sempre à mão.</span></div>
          <div style={{fontFamily: SANS, fontSize: 22, letterSpacing: '.12em', color: C.tintaEscura2, marginTop: 26, opacity: eo(p(t, W('assinatura', 'Seu') + .6, .7))}}>portal.fvinteriores.com.br</div>
        </div>
      )}
      {t < as.t0 && <Legenda t={t} />}
      {audio && !still && (
        <>
          <Audio src={staticFile('assets/audio/trilha.wav')} />
          {TL.scenes.map((s) => (
            <Sequence key={s.key} from={Math.round(s.v0 * TL.fps)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
