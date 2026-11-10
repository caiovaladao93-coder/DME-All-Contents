import React from 'react';
import {Img, staticFile} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, P, keyed, lerp} from '../theme/motion';

/*
 * Abertura com celular REAL: foto Pexels 36538967 (Jakub Zerdzicki, licença Pexels), tela verde substituída pela nossa
 * (máscara com bordas suaves → mantém a ilha da câmera e os cantos). Coordenadas em pixels da foto (3100×1744).
 * A mão é de uma pessoa anônima segurando o aparelho; não representa equipe nem cliente da DME.
 */
const PW = 3100, PH = 1744, BASE = 1920 / PH;         // altura preenchida
const SX = 1252, SY = 314, SW = 582, SH = 1218;        // caixa da tela (máscara)

export type Notif = {at: number; from: string; text: string; color: string; initial: string};

const NotifCard: React.FC<{n: Notif; y: number; o: number; s: number; c: number}> = ({n, y, o, s, c}) => (
  <div style={{position: 'absolute', left: 30, width: 522, top: y, height: 132, opacity: o, transform: `scale(${s.toFixed(3)})`, transformOrigin: '50% 0%'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'rgb(48,58,71)', border: '1px solid rgba(236,240,246,.22)', boxShadow: '0 10px 24px rgba(0,0,0,.35)'}} />
    <div style={{opacity: c}}>
    <div style={{position: 'absolute', left: 18, top: 30, width: 72, height: 72, borderRadius: 36, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: '#fff'}}>{n.initial}</div>
    <div style={{position: 'absolute', left: 108, right: 18, top: 20}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 700, fontSize: 27, color: '#F4F6F8'}}><span>{n.from}</span><span style={{fontWeight: 600, fontSize: 22, color: 'rgba(244,246,248,.6)'}}>agora</span></div>
      <div style={{fontFamily: UI, fontWeight: 600, fontSize: 27, lineHeight: 1.18, color: 'rgba(244,246,248,.86)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden'}}>{n.text}</div>
    </div>
    </div>
  </div>
);

export const RealPhone: React.FC<{t: number; tLit: number; tFull: number; tOut: number; notifs: Notif[]}> = ({t, tLit, tFull, tOut, notifs}) => {
  const out = P(t, tOut, .85, EASE_IO);
  if (out >= 1) return null;
  // câmera: plano médio → aproxima a tela → recua e dissolve na operação
  const [Z, fx, fy] = keyed(t, [[0, 1.0, 1545, 930], [tLit, 1.02, 1545, 920], [tLit + 1.7, 1.31, 1542, 862], [tFull, 1.37, 1542, 850]]);
  const S = BASE * Z * lerp(1, .62, out);
  const lit = P(t, tLit - .05, .3);
  const arrived = notifs.filter((n) => t >= n.at);
  const count = arrived.length;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: 1 - out, filter: out > .02 ? `blur(${(out * 10).toFixed(1)}px)` : undefined}}>
      <div style={{position: 'absolute', left: 540 - fx * S, top: 960 - fy * S, width: PW, height: PH, transform: `scale(${S.toFixed(5)})`, transformOrigin: '0 0'}}>
        <Img src={staticFile('assets/photography/celular-limpo.jpg')} style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH}} />
        {/* tela */}
        <div style={{position: 'absolute', left: SX, top: SY, width: SW, height: SH, WebkitMaskImage: `url(${staticFile('assets/photography/tela-mascara.png')})`, WebkitMaskSize: '100% 100%',
          maskImage: `url(${staticFile('assets/photography/tela-mascara.png')})`, maskSize: '100% 100%', overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #1e3a5a 0%, #12223a 45%, #0a1120 100%)', opacity: .25 + .75 * lit}} />
          <div style={{position: 'absolute', inset: 0, opacity: .45 + .55 * lit}}>
            <div style={{position: 'absolute', top: 128, width: '100%', textAlign: 'center', fontFamily: UI, fontWeight: 600, fontSize: 30, color: 'rgba(244,246,248,.82)'}}>sábado, de férias</div>
            <div style={{position: 'absolute', top: 160, width: '100%', textAlign: 'center', fontFamily: HEAD, fontWeight: 600, fontSize: 150, letterSpacing: '-.03em', color: '#F4F6F8'}}>15:42</div>
            {count > 1 ? <div style={{position: 'absolute', top: 352, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: P(t, notifs[1].at, .3)}}>
              <div style={{padding: '8px 20px', borderRadius: 22, background: C.accent, fontFamily: UI, fontWeight: 700, fontSize: 24, color: '#fff'}}>{count} pedidos da equipe</div></div> : null}
            {/* pilha: a mais nova entra em cima e empurra as outras; o excesso transborda para baixo */}
            {arrived.map((n, i) => {
              const order = count - 1 - i;                        // 0 = mais nova
              const enter = P(t, n.at, .32, EASE_OUT);
              // posição: considera as que chegaram depois desta, cada uma empurrando 146 px com mola suave
              let push = 0; for (let j = i + 1; j < count; j++) push += P(t, notifs[j].at, .3, EASE_OUT);
              // 3 cartões abertos; os mais antigos se recolhem num maço atrás do terceiro (não invadem a legenda)
              const deep = Math.max(0, push - 2);
              const y = 410 + Math.min(push, 2) * 146 + Math.min(deep, 3) * 20 - (1 - enter) * 60;
              const o = enter * Math.max(0, 1 - deep * .28);
              const s = deep > 0 ? 1 - Math.min(deep, 3) * .05 : lerp(.94, 1, enter);
              return y > SH ? null : <NotifCard key={i} n={n} y={y} o={o} s={s} c={Math.max(0, 1 - deep * 1.6)} />;
            })}
          </div>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(118deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 30%)'}} />
        </div>
      </div>
      {/* leve escurecimento das bordas, mantendo o tratamento DME */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(10,11,12,0) 50%, rgba(10,11,12,.55) 100%)'}} />
    </div>
  );
};
export const _ease = EASE_IN;
