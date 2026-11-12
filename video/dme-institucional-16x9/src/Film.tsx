import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C, STEEL, STEEL_DARK} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · apresentação institucional 16:9 para o site (~60 s), mesma locução e trilha da versão vertical. Linguagem de apresentação corporativa: capítulos numerados
 * (01 Quem somos · 02 Premissa · 03 Abordagem · 04 Método · 05 Soluções · 06 Propósito), um objeto de aço por capítulo,
 * marca discreta no topo e trilho de progresso. Tudo é função do quadro (t = frame / 30); tempos ancorados nas palavras reais.
 */
const T = {
  dme: wt('abertura', 'Dê-Eme-É'), tec: wt('abertura', 'Tecnologia'),
  estr: wt('quem', 'estratégia'), ia: wt('quem', 'inteligência'), auto: wt('quem', 'automação'), sist: wt('quem', 'sistemas'), enc: wt('quem', 'encontram'),
  prem: wt('premissa', 'premissa'),
  nao: wt('abordagem', 'não'), come2: wt('abordagem', 'Começamos', 1), proc: wt('abordagem', 'processos'), desaf: wt('abordagem', 'desafios'), oport: wt('abordagem', 'oportunidades'),
  metodo: wt('metodo', 'método'), ent: wt('metodo', 'entender'), plan: wt('metodo', 'planejar'), desenv: wt('metodo', 'desenvolver'),
  diag: wt('solucoes', 'Diagnóstico'), mapa: wt('solucoes', 'mapeamento'), padr: wt('solucoes', 'padronização'), autom: wt('solucoes', 'automação'), ia2: wt('solucoes', 'inteligência'), integ: wt('solucoes', 'integração'),
  sol: wt('proposito', 'Soluções'), pess: wt('proposito', 'pessoas'), info: wt('proposito', 'informações'), sis3: wt('proposito', 'sistemas'), para: wt('proposito', 'Para'), operar: wt('proposito', 'operar'),
  sig: S.assinatura.t0, slogan: wt('assinatura', 'Automatizamos'), cta: wt('assinatura', 'Converse'),
};
const CH: Array<[SceneKey, string, string]> = [['quem', '01', 'QUEM SOMOS'], ['premissa', '02', 'PREMISSA'], ['abordagem', '03', 'ABORDAGEM'], ['metodo', '04', 'MÉTODO'], ['solucoes', '05', 'SOLUÇÕES'], ['proposito', '06', 'PROPÓSITO']];
/** visibilidade de um capítulo: entra no início da cena, sai 0,4 s antes da próxima */
const vis = (t: number, k: SceneKey) => P(t, S[k].t0 - .05, .5) * (1 - P(t, S[k].t1 - .45, .35, EASE_IN));

type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size: number; top: number; align?: 'left' | 'center'; weight?: number; color?: string; left?: number; width?: number}> = ({t, tin, tout, segs, size, top, align = 'left', weight = 800, color = C.ink, left = 120, width = 760}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight: 1.06, letterSpacing: '-.025em', color,
    opacity: 1 - q, transform: `translateY(${(-36 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, acc], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: acc ? C.accent : undefined, opacity: p, transform: `translateY(${((1 - p) * 34).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 10).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};
const Label: React.FC<{t: number; k: SceneKey; n: string; name: string}> = ({t, k, n, name}) => {
  const v = vis(t, k); if (v <= 0) return null;
  return <div style={{position: 'absolute', left: 120, top: 300, display: 'flex', alignItems: 'center', gap: 18, opacity: v, transform: `translateX(${((1 - v) * -20).toFixed(1)}px)`}}>
    <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: C.accent}}>{n}</span><span style={{width: 60 * v, height: 2, background: C.silver, opacity: .6}} />
    <span style={{fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: '.24em', color: C.silver}}>{name}</span></div>;
};
const Ico: React.FC<{k: string; s?: number; c?: string}> = ({k, s = 52, c = C.ink}) => {
  const d: Record<string, React.ReactNode> = {
    gear: <><circle cx="24" cy="24" r="6" /><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4" /></>, chip: <><rect x="12" y="12" width="24" height="24" rx="4" /><path d="M18 6v6M30 6v6M18 36v6M30 36v6M6 18h6M6 30h6M36 18h6M36 30h6" /></>,
    code: <path d="M17 14L7 24l10 10M31 14l10 10-10 10" />, cloud: <path d="M14 36h22a8 8 0 000-16 12 12 0 00-23-2 9 9 0 001 18z" />,
    flow: <><circle cx="10" cy="24" r="4" /><circle cx="38" cy="12" r="4" /><circle cx="38" cy="36" r="4" /><path d="M14 24h8l12-10M22 24l12 10" /></>, alert: <><path d="M24 6l19 34H5z" /><path d="M24 19v10M24 34v1" /></>,
    star: <path d="M24 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z" />, search: <><circle cx="21" cy="21" r="12" /><path d="M30 30l11 11" /></>, map: <path d="M6 12l12-5 12 5 12-5v29l-12 5-12-5-12 5z M18 7v29 M30 12v29" />,
    ruler: <><rect x="6" y="16" width="36" height="16" rx="3" /><path d="M14 16v7M22 16v5M30 16v7M38 16v5" /></>, bolt: <path d="M27 4L11 27h11l-3 17 17-24H25z" />,
  };
  return <svg viewBox="0 0 48 48" width={s} height={s} fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{d[k]}</svg>;
};
const Card: React.FC<{x: number; y: number; w: number; h: number; o: number; on?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, o, on = 0, children, style}) => o <= 0 ? null : (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, boxSizing: 'border-box', opacity: o, transform: `translateY(${((1 - o) * 30).toFixed(1)}px)`,
    background: `linear-gradient(180deg, #24282D, ${C.graphite})`, border: `2px solid ${on > .5 ? C.accent : 'rgba(192,198,204,.25)'}`, boxShadow: '0 28px 46px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)', ...style}}>{children}</div>
);
const IconTile: React.FC<{k: string; on?: number}> = ({k, on = 0}) => <div style={{width: 92, height: 92, borderRadius: 22, background: on > .5 ? C.accent : STEEL, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
  boxShadow: '0 10px 18px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.4)'}}><Ico k={k} s={50} c={on > .5 ? '#fff' : '#1C1F22'} /></div>;

// ── logo DME (4 peças que se montam)
const LOGO = [
  'M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z',
  'M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z',
  'M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z',
  'M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z',
];
const FROM = [[-260, 40], [0, -240], [260, -120], [180, 240]];
const Logo: React.FC<{t: number; t0: number; w: number; x: number; y: number; word?: boolean; id: string}> = ({t, t0, w, x, y, word = true, id}) => {
  const h = w * 610 / 750;
  return <svg viewBox="0 0 750 610" width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" /></linearGradient></defs>
    {LOGO.map((d, i) => { const p = P(t, t0 + i * .1, .55, BACK); return <path key={i} d={d} fill={`url(#${id})`} stroke="#F2F4F6" strokeOpacity=".35" strokeWidth="1.5"
      opacity={clamp(p * 2)} transform={`translate(${((1 - p) * FROM[i][0]).toFixed(1)} ${((1 - p) * FROM[i][1]).toFixed(1)})`} />; })}
    {word ? <text x="14" y="592" fontFamily="Manrope, sans-serif" fontWeight={600} fontSize="64" textLength="722" lengthAdjust="spacing" fill="#C0C6CC" opacity={P(t, t0 + .55, .4)}>TECHNOLOGY</text> : null}
  </svg>;
};


const RX = 1380, RY = 560;   // centro da área de objetos (direita)
export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const open = 1 - P(t, S.abertura.t1 - .5, .5, EASE_IN), sig = P(t, T.sig - .15, .7, EASE_IO);
  const chrome = P(t, S.quem.t0 - .2, .5) * (1 - sig);
  const chIdx = CH.reduce((m, c, i) => (t >= S[c[0]].t0 - .1 ? i : m), -1);
  const rings: Array<[string, number, number, number]> = [['Estratégia', T.estr, -105, -105], ['Inteligência artificial', T.ia, 105, -105], ['Automação', T.auto, -105, 105], ['Sistemas digitais', T.sist, 105, 105]];
  const qWords = (TL.words as any).premissa as Array<[string, number, number]>; const qStart = qWords.findIndex((w) => w[0] === 'a');
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 90% at 0% 40%, rgba(38,75,113,.45) 0%, rgba(38,75,113,0) 60%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(45% 60% at 72% 55%, rgba(192,198,204,.05) 0%, rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 990, height: 2, background: 'linear-gradient(90deg, rgba(192,198,204,0), rgba(192,198,204,.3), rgba(192,198,204,0))', opacity: 1 - sig}} />
      {/* divisória vertical entre texto e objeto */}
      <div style={{position: 'absolute', left: 940, top: 220, width: 2, height: 680 * chrome, background: 'linear-gradient(180deg, rgba(192,198,204,0), rgba(192,198,204,.18), rgba(192,198,204,0))'}} />

      {/* ── abertura */}
      {open > 0 ? <div style={{position: 'absolute', inset: 0, opacity: open}}>
        <Logo t={t} t0={-.4} w={560} x={680} y={220} id="g0" />
        {(() => { const b = P(t, .9, 1.1, EASE_IO); return <div style={{position: 'absolute', left: 960 - 330, top: 735, width: 660, height: 3, background: `linear-gradient(90deg, rgba(192,198,204,0), ${C.silver}, rgba(192,198,204,0))`, transform: `scaleX(${b.toFixed(3)})`}} />; })()}
        <Phrase t={t} tin={T.tec - .1} tout={99} segs={['Tecnologia aplicada aos ', ['negócios.']]} size={64} top={780} align="center" left={160} width={1600} />
      </div> : null}

      {/* ── marca no topo e progresso */}
      {chrome > 0 ? <>
        <div style={{position: 'absolute', left: 120, top: 80, opacity: chrome}}><Logo t={99} t0={0} w={120} x={0} y={0} word={false} id="g1" /></div>
        <div style={{position: 'absolute', right: 120, top: 104, display: 'flex', gap: 10, opacity: chrome}}>{CH.map((c, i) => <div key={c[1]} style={{width: i === chIdx ? 54 : 18, height: 6, borderRadius: 3, background: i === chIdx ? C.accent : i < chIdx ? 'rgba(192,198,204,.6)' : 'rgba(192,198,204,.2)'}} />)}</div>
      </> : null}
      {CH.map(([k, n, name]) => <Label key={k} t={t} k={k} n={n} name={name} />)}

      {/* ── 01 quem somos */}
      {(() => { const v = vis(t, 'quem'); if (v <= 0) return null; const core = P(t, T.enc - .1, .5, BACK);
        return <div style={{position: 'absolute', inset: 0, opacity: v}}>
          <Phrase t={t} tin={S.quem.v0 - .05} tout={S.quem.t1 - .45} segs={['Onde negócio e tecnologia ', ['se encontram.']]} size={70} top={370} />
          {rings.map(([n, ta], i) => { const a = P(t, ta - .1, .45); return <div key={n} style={{position: 'absolute', left: 120, top: 640 + i * 62, display: 'flex', alignItems: 'center', gap: 18, opacity: a,
            transform: `translateX(${((1 - a) * -20).toFixed(1)}px)`, fontFamily: HEAD, fontWeight: 700, fontSize: 38, color: C.ink}}>
            <span style={{width: 26, height: 26, borderRadius: 13, border: `4px solid ${C.silver}`}} />{n}</div>; })}
          <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
            <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E959C" /><stop offset=".4" stopColor="#E3E7EA" /><stop offset=".7" stopColor="#8A9198" /><stop offset="1" stopColor="#C9CED3" /></linearGradient></defs>
            {rings.map(([n, ta, dx, dy]) => { const a = P(t, ta - .15, .6, EASE_OUT); const conv = P(t, T.enc - .2, .8, EASE_IO);
              return <circle key={n} cx={RX + dx * lerp(1.6, 1, a) * lerp(1, .82, conv)} cy={RY + dy * lerp(1.6, 1, a) * lerp(1, .82, conv)} r={170} fill="none" stroke="url(#ring)" strokeWidth="9" opacity={a} />; })}
          </svg>
          {core > 0 ? <div style={{position: 'absolute', left: RX - 85, top: RY - 85, width: 170, height: 170, borderRadius: 85, background: '#121417', border: `3px solid ${C.accent}`, transform: `scale(${core.toFixed(3)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,.6)'}}><div style={{position: 'relative', width: 110, height: 90}}><Logo t={99} t0={0} w={110} x={0} y={0} word={false} id="g2" /></div></div> : null}
        </div>; })()}

      {/* ── 02 premissa */}
      {(() => { const v = vis(t, 'premissa'); if (v <= 0) return null;
        return <div style={{position: 'absolute', inset: 0, opacity: v}}>
          <Phrase t={t} tin={S.premissa.v0 - .05} tout={S.premissa.t1 - .45} segs={['Partimos de uma ', ['premissa.']]} size={70} top={370} />
          <div style={{position: 'absolute', left: 1010, top: 210, fontFamily: HEAD, fontWeight: 800, fontSize: 220, lineHeight: .8, color: C.accent, opacity: P(t, T.prem, .5)}}>“</div>
          <div style={{position: 'absolute', left: 1010, width: 790, top: 360, fontFamily: HEAD, fontWeight: 700, fontSize: 70, lineHeight: 1.12, letterSpacing: '-.025em', color: C.ink}}>
            {qWords.slice(qStart).map(([w, ws], i) => { const a = P(t, ws - .08, .3); const acc = /problema|real/.test(w);
              return <span key={i} style={{display: 'inline-block', marginRight: '.24em', opacity: .12 + .88 * a, color: acc && a > .5 ? C.accent : undefined, filter: a < 1 ? `blur(${((1 - a) * 4).toFixed(1)}px)` : undefined}}>{w}</span>; })}
          </div>
          <div style={{position: 'absolute', left: 1010, top: 860, width: 200 * P(t, T.prem + .5, 3, EASE_IO), height: 4, background: C.accent}} />
        </div>; })()}

      {/* ── 03 abordagem */}
      {(() => { const v = vis(t, 'abordagem'); if (v <= 0) return null; const out = P(t, T.come2 - .3, .5, EASE_IN);
        return <div style={{position: 'absolute', inset: 0, opacity: v}}>
          <Phrase t={t} tin={T.nao - .05} tout={T.come2 - .35} segs={['Não começamos pelas ', ['ferramentas.']]} size={70} top={370} />
          <Phrase t={t} tin={T.come2 - .05} tout={S.abordagem.t1 - .45} segs={['Começamos pelo ', ['negócio.']]} size={70} top={370} />
          {['gear', 'chip', 'code', 'cloud'].map((k, i) => { const a = P(t, T.nao + .3 + i * .1, .4, BACK); if (a <= 0 || out >= 1) return null;
            return <div key={k} style={{position: 'absolute', left: 1020 + i * 200, top: 470 + out * 100, width: 160, height: 160, borderRadius: 36, border: '2px dashed rgba(192,198,204,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: a * (1 - out) * .8, transform: `scale(${(a * (1 - .3 * out)).toFixed(3)})`}}><Ico k={k} s={76} c={C.silver} /></div>; })}
          {([['Processos', 'flow', T.proc], ['Desafios', 'alert', T.desaf], ['Oportunidades', 'star', T.oport]] as const).map(([n, k, ta], i) => { const a = P(t, ta - .12, .5, EASE_OUT);
            return <Card key={n} x={1020} y={300 + i * 180} w={780} h={150} o={a} on={a}><div style={{display: 'flex', alignItems: 'center', gap: 30, height: '100%', padding: '0 36px'}}>
              <IconTile k={k} on={i === 2 ? P(t, ta + .2, .2) : 0} /><div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: C.ink, letterSpacing: '-.02em'}}>{n}</div></div></Card>; })}
        </div>; })()}

      {/* ── 04 método: linha horizontal com três nós */}
      {(() => { const v = vis(t, 'metodo'); if (v <= 0) return null; const steps: Array<[string, string, number]> = [['Entender', 'o negócio e seus desafios', T.ent], ['Planejar', 'gargalos e prioridades', T.plan], ['Desenvolver', 'soluções sob medida', T.desenv]];
        const X = [1090, 1380, 1670];
        return <div style={{position: 'absolute', inset: 0, opacity: v}}>
          <Phrase t={t} tin={S.metodo.v0 - .05} tout={S.metodo.t1 - .45} segs={['Nosso ', ['método.']]} size={80} top={370} />
          <div style={{position: 'absolute', left: X[0], top: 457, width: X[2] - X[0], height: 6, background: 'rgba(192,198,204,.18)', borderRadius: 3}} />
          <div style={{position: 'absolute', left: X[0], top: 457, width: (X[2] - X[0]) * P(t, T.ent, T.desenv - T.ent + .3, EASE_IO), height: 6, background: C.accent, borderRadius: 3}} />
          {steps.map(([n, d, ta], i) => { const a = P(t, ta - .12, .45, BACK), on = P(t, ta - .05, .2);
            return <div key={n} style={{position: 'absolute', left: X[i] - 150, top: 405, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: Math.min(1, a * 1.4)}}>
              <div style={{width: 110, height: 110, borderRadius: 55, background: on > .5 ? C.accent : STEEL, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${a.toFixed(3)})`,
                fontFamily: HEAD, fontWeight: 800, fontSize: 44, color: on > .5 ? '#fff' : '#1C1F22', boxShadow: '0 14px 26px rgba(0,0,0,.5)'}}>{i + 1}</div>
              <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 46, color: C.ink, letterSpacing: '-.02em', marginTop: 28}}>{n}</div>
              <div style={{fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.soft, marginTop: 8}}>{d}</div></div>; })}
        </div>; })()}

      {/* ── 05 soluções */}
      {(() => { const v = vis(t, 'solucoes'); if (v <= 0) return null; const sv: Array<[string, string, number]> = [['Diagnóstico', 'search', T.diag], ['Mapeamento', 'map', T.mapa], ['Padronização', 'ruler', T.padr], ['Automação', 'bolt', T.autom]];
        return <div style={{position: 'absolute', inset: 0, opacity: v}}>
          <Phrase t={t} tin={S.solucoes.v0 - .1} tout={S.solucoes.t1 - .45} segs={['O que ', ['fazemos.']]} size={80} top={370} />
          {sv.map(([n, k, ta], i) => { const a = P(t, ta - .12, .45), on = P(t, ta - .05, .2) * (i < 3 ? 1 - P(t, sv[i + 1][2] - .05, .2) : 1 - P(t, T.ia2 - .1, .3));
            return <Card key={n} x={1020 + (i % 2) * 400} y={250 + Math.floor(i / 2) * 230} w={380} h={210} o={a} on={on}>
              <div style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 22}}><IconTile k={k} on={on} /><div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: C.ink, letterSpacing: '-.02em'}}>{n}</div></div></Card>; })}
          <div style={{position: 'absolute', left: 1020, width: 780, top: 740, display: 'flex', flexWrap: 'wrap', gap: 16}}>
            {([['Inteligência artificial', T.ia2], ['Integração de sistemas', T.integ]] as const).map(([n, ta]) => { const a = P(t, ta - .12, .45, BACK); return <div key={n} style={{padding: '16px 26px', borderRadius: 50, background: 'rgba(58,110,165,.16)',
              border: `2px solid ${C.accent}`, fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.ink, opacity: a, transform: `scale(${a.toFixed(3)})`, transformOrigin: 'left center'}}>{n}</div>; })}
          </div>
        </div>; })()}

      {/* ── 06 propósito */}
      {(() => { const v = vis(t, 'proposito'); if (v <= 0) return null; const al = P(t, T.para, 1.2, EASE_IO);
        const nodes: Array<[string, number, number, number, number]> = [['Pessoas', RX, 330, 1080, 560], ['Informações', RX - 260, 760, RX, 560], ['Sistemas', RX + 260, 760, 1680, 560]];
        const pos = nodes.map(([, x0, y0, x1, y1]) => [lerp(x0, x1, al), lerp(y0, y1, al)]);
        return <div style={{position: 'absolute', inset: 0, opacity: v}}>
          <Phrase t={t} tin={S.proposito.v0 - .05} tout={T.para - .35} segs={['Pessoas, informações e ', ['sistemas.']]} size={70} top={370} />
          <Phrase t={t} tin={T.para - .05} tout={S.proposito.t1 - .45} segs={['Uma forma melhor de ', ['operar.']]} size={70} top={370} />
          <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
            {[[0, 1], [1, 2], [2, 0]].map(([a, b], i) => { const k = P(t, [T.info, T.sis3, T.sis3 + .3][i] - .1, .5, EASE_IO) * (i === 2 ? 1 - al : 1);
              return <line key={i} x1={pos[a][0]} y1={pos[a][1]} x2={lerp(pos[a][0], pos[b][0], k)} y2={lerp(pos[a][1], pos[b][1], k)} stroke={al > .9 ? C.accent : 'rgba(192,198,204,.55)'} strokeWidth="6" strokeLinecap="round" />; })}
            {al > .95 ? [0, 1, 2].map((i) => { const u = ((t - T.para) * .55 + i / 3) % 1; return <circle key={i} cx={lerp(1080, 1680, u)} cy={560} r="12" fill={C.accent} />; }) : null}
          </svg>
          {nodes.map(([n], i) => { const a = P(t, [T.pess, T.info, T.sis3][i] - .12, .5, BACK); const [x, y] = pos[i];
            return <div key={n} style={{position: 'absolute', left: x - 120, top: y - 60, width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, a * 1.3)}}>
              <div style={{width: 110, height: 110, borderRadius: 55, background: STEEL, transform: `scale(${a.toFixed(3)})`, boxShadow: '0 16px 28px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.5)', border: al > .9 ? `4px solid ${C.accent}` : undefined}} />
              <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: C.ink, marginTop: 16, whiteSpace: 'nowrap'}}>{n}</div></div>; })}
        </div>; })()}

      {/* ── assinatura */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(50% 60% at 50% 40%, rgba(38,75,113,.45) 0%, rgba(10,11,12,0) 70%)'}} />
        <Logo t={t} t0={T.sig + .05} w={500} x={710} y={150} id="g3" />
        <Phrase t={t} tin={T.slogan - .1} tout={99} segs={['Automatizamos processos. ', ['Devolvemos tempo.']]} size={60} top={650} align="center" left={160} width={1600} />
        {(() => { const a = P(t, T.cta - .1, .5, BACK); if (a <= 0) return null;
          return <div style={{position: 'absolute', left: 960 - 330, width: 660, top: 790, padding: '28px 30px', borderRadius: 34, textAlign: 'center', transform: `scale(${a.toFixed(3)})`, boxSizing: 'border-box',
            background: `linear-gradient(180deg, #23272C, ${C.graphite})`, border: '2px solid rgba(192,198,204,.32)', boxShadow: '0 30px 50px rgba(0,0,0,.5)'}}>
            <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: C.ink, letterSpacing: '-.02em'}}>Converse com a <span style={{color: C.accent}}>DME</span></div>
          </div>; })()}
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
