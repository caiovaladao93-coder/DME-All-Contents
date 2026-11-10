import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {HEAD, UI, loadFonts} from './theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, P, S, keyed, lerp, wt} from './theme/motion';
import {Horizon} from './components/Horizon';
import {Phone3D, Pose, screenPoint} from './components/Phone3D';
import {CARD_W, CallBanner, LockClock, ReqCard, Req, Wallpaper, cardHeight} from './components/Cards';
import {Captions, Headline, Logo} from './components/Type';

loadFonts();
type V2 = [number, number];

/*
 * "Suas férias não precisam virar escritório". Um só objeto conduz o filme: o celular.
 * As mesmas três notificações se desprendem da tela e viram atividades de um fluxo (continuidade de objetos, Bang Motion).
 * Tudo é função do frame (t = frame / 30). Nomes, empresas e dados são fictícios (selo "Exemplo ilustrativo").
 */
const SLOT0 = 470, SLOT = 214;              // pilha de notificações na tela do celular (coords da tela)
const FLOW_X = 150, FLOW_Y = [0, 470, 940]; // fluxo (coords de mundo) e câmera do fluxo: tela = 760 + (y - camY) * z
const SPINE_X = 104, DME_Y = 1470;

export const Film: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  // ── tempos-chave (palavras reais da locução)
  const tN0 = wt('ferias', 'chamando.') - .05;
  const tN = [wt('areas', 'financeiro'), wt('areas', 'comercial'), wt('areas', 'operação')];
  const tCall = wt('areas', 'próximo') + .2, tH = S.viaja.t0;
  const tTrab = wt('viaja', 'trabalho');
  const mF = wt('estrutura', 'organiza') - .1, mC = wt('estrutura', 'conecta') - .15, mO = wt('estrutura', 'automatiza') - .15;
  const tE = wt('beneficios', 'encaminhadas.'), tI = wt('beneficios', 'informações'), tRp = wt('beneficios', 'responsáveis');
  const tCalm = S.tranquilidade.t0, tFocus = wt('tranquilidade', 'mais') - .1, tEnd = S.assinatura.t0;

  const REQ: Req[] = [
    {id: 'fin', initial: 'M', color: '#3A6EA5', name: 'Mariana', area: 'Financeiro', msg: 'Pode aprovar este pagamento?', title: 'Pagamento de fornecedor',
      rows: [{icon: 'flow', label: 'Etapa', value: 'aprovação do pagamento', at: mF + .45}, {icon: 'shield', label: 'Validação', value: 'gestor · decisão humana', at: mF + .85, tone: 'human'},
        {icon: 'arrow', label: 'Encaminhada', value: 'Mariana → gestor', at: tE - .1, tone: 'go'}], status: {text: 'Encaminhada', at: tE}},
    {id: 'com', initial: 'R', color: '#5b6f86', name: 'Rafael', area: 'Comercial', msg: 'Consegue validar a proposta?', title: 'Proposta · Cliente Horizonte',
      rows: [{icon: 'user', label: 'Responsável', value: 'Rafael · Comercial', at: mC + .45}, {icon: 'history', label: 'Histórico', value: 'vinculado à proposta', at: mC + .85},
        {icon: 'file', label: 'Arquivo', value: 'proposta-horizonte-v3.pdf', at: tI - .05, tone: 'file'}], status: {text: 'Disponível', at: tI + .1}},
    {id: 'op', initial: 'C', color: '#264B71', name: 'Camila', area: 'Operação', msg: 'Quem assume a próxima etapa?', title: 'Pedido 2381 · próxima etapa',
      rows: [{icon: 'bolt', label: 'Status', value: 'atualizado automaticamente', at: mO + .5, tone: 'auto'}, {icon: 'user', label: 'Responsável', value: 'Camila · Operação', at: tRp - .05},
        {icon: 'flow', label: 'Próximo passo', value: 'separação do pedido', at: tRp + .45}, {icon: 'bolt', label: 'Automático', value: 'cliente avisado', at: tRp + .85, tone: 'auto'}], status: {text: 'Definido', at: tRp}},
  ];
  const GROUP: Req = {id: 'grp', initial: 'E', color: '#4b5560', name: 'Equipe', area: 'grupo da empresa', msg: 'Bom dia! Uma dúvida rápida…', title: '', rows: []};
  const morph = [P(t, mF, .7, EASE_IO), P(t, mC, .7, EASE_IO), P(t, mO, .7, EASE_IO)];

  // ── celular: pose motivada (aproxima, lê, recua, recua mais, deita na mesa)
  const [px, py, ps, prx, pry, prz] = keyed(t, [
    [0, 610, 990, .5, 10, -32, 4], [tN0 + .1, 575, 950, .62, 6, -20, 2], [S.areas.t0 + .45, 540, 905, 1.06, 1, -5, 0], [tN[2] + .4, 540, 895, 1.1, 0, 3, 0],
    [tCall - .15, 540, 900, 1.1, 0, 0, 0], [tCall + .35, 540, 1130, 1.1, 0, 0, 0], [tH, 540, 1130, 1.1, 0, 0, 0], [tH + 1.1, 540, 1205, .22, 0, 0, 0], [S.viaja.t1, 540, 1205, .22, 0, 0, 0],
    [S.estrutura.t0 + 1.0, 540, 980, .3, 0, 0, 0], [tCalm + .3, 540, 980, .3, 0, 0, 0], [tCalm + 1.9, 590, 1215, .36, 60, 0, -16], [S.assinatura.t0, 590, 1215, .36, 60, 0, -16],
  ]);
  // vibração discreta: cada notificação e a ligação
  const buzz = [tN0, ...tN].reduce((a, tb) => a + (t > tb && t < tb + .32 ? Math.sin((t - tb) * 110) * (1 - (t - tb) / .32) : 0), 0)
    + (t > tCall && t < tH ? Math.sin(t * 95) * .45 * (Math.floor((t - tCall) * 2.2) % 2 ? 0 : 1) : 0);
  const pose: Pose = {x: px, y: py, s: ps, rx: prx, ry: pry, rz: prz + buzz * .9};
  const phoneBack = P(t, S.estrutura.t0 + .2, .8) * (1 - P(t, tCalm + .45, 1.0));            // atrás do fluxo
  const phoneBlur = 7 * phoneBack + 5.5 * P(t, tFocus, 1.3, EASE_IO);
  const sig = P(t, tEnd - .3, .9, EASE_IO);
  const lit = .5 + .5 * P(t, tN0, .3);

  // ── pilha de notificações dentro da tela (antes de se desprenderem)
  const arr = [GROUP, ...REQ], atN = [tN0, ...tN];
  const push = (i: number) => atN.reduce((a, tb, j) => a + (j > i ? P(t, tb, .35, EASE_OUT) : 0), 0);
  const stackY = (i: number, pu = push(i)) => SLOT0 + Math.min(pu, 2) * SLOT + Math.max(0, pu - 2) * 26;
  const stackK = (pu: number) => 1 - .035 * Math.min(pu, 3);
  const callP = P(t, tCall, .35, EASE_OUT) * (1 - P(t, tH - .15, .3, EASE_IN));

  // ── depois de se desprenderem: tela do quadro (handoff com o celular de frente)
  const hp: Pose = {x: 540, y: 1130, s: 1.1, rx: 0, ry: 0, rz: 0};
  const VIAJA: Array<[number, number]> = [[100, 410], [356, 585], [100, 760]], KV = .78;
  const [camY, z] = keyed(t, [
    [S.estrutura.t0, 706, .56], [mF - .3, 706, .56], [mF + .45, 200, 1.0], [mC, 200, 1.0], [mC + .5, 670, 1.0], [mO, 670, 1.0], [mO + .5, 1170, 1.0], [S.estrutura.t1 - .1, 1170, 1.0],
    [tE - .75, 200, 1.0], [tI - .55, 200, 1.0], [tI - .05, 670, 1.0], [tRp - .55, 670, 1.0], [tRp - .05, 1170, 1.0], [tCalm - .2, 1170, 1.0], [tCalm + 1.4, 760, .46],
  ]);
  const toFlow = P(t, S.estrutura.t0 - .1, 1.1, EASE_IO);
  const detach = P(t, tH, 1.1, EASE_IO);
  const flowFade = P(t, tCalm - .1, 1.1, EASE_IO);
  const W2S = (wx: number, wy: number): V2 => [540 + (wx - 540) * z, 760 + (wy - camY) * z];
  const focusIdx = t < mC + .3 ? 0 : t < mO + .3 ? 1 : t < tE - .5 ? 2 : t < tI - .3 ? 0 : t < tRp - .3 ? 1 : 2;

  const cardsFree = REQ.map((r, i) => {
    const slot = 3 - (i + 1) /* op = 0, com = 1, fin = 2 */, [hx, hy] = screenPoint(hp, 35 + (1 - stackK(slot)) * 400, SLOT0 + slot * SLOT), hk = hp.s * stackK(slot);
    const [fx, fy] = W2S(FLOW_X, FLOW_Y[i]);
    const x = lerp(lerp(hx, VIAJA[i][0], detach), fx, toFlow), y = lerp(lerp(hy, VIAJA[i][1], detach), fy, toFlow), k = lerp(lerp(hk, KV, detach), z, toFlow);
    const dim = lerp(.12 * slot * (1 - detach), (focusIdx === i ? 0 : .32) * P(t, mF + .5, .5), toFlow);
    return {r, x, y, k, dim, m: morph[i]};
  });

  // ── cena de descanso
  const hz = P(t, tCalm + .2, 2.2, EASE_IO);
  const horizon = {blur: lerp(10, 1.6, P(t, tFocus, 1.3, EASE_IO)), light: lerp(.35, 1, hz), veil: lerp(.85, .12, hz)};

  const shade = Math.max(P(t, .2, .4) * (1 - P(t, S.areas.t0, .4)), P(t, tTrab - .4, .4)) * (1 - sig);
  const PhoneLayer = (
    <Phone3D pose={pose} blur={phoneBlur} opacity={(1 - .82 * P(t, S.estrutura.t0 + .2, .8)) * (1 - P(t, tCalm - .1, 1.0)) * (1 - sig)}>
      <Wallpaper lit={lit * (t > tCalm ? lerp(1, .7, hz) : 1)} />
      <LockClock o={1 - .6 * P(t, S.areas.t0, .5) + .6 * P(t, tCalm, 1)} />
      {t < tH + .02 ? arr.map((r, i) => {
        if (t < atN[i]) return null;
        const pu = push(i), enter = P(t, atN[i], .35, EASE_OUT), deep = Math.max(0, pu - 2);
        return <ReqCard key={r.id} r={r} t={t} m={0} x={35 + (1 - stackK(pu)) * 400} y={stackY(i, pu) - (1 - enter) * 70} k={stackK(pu) * lerp(.94, 1, enter)}
          o={enter * Math.max(0, 1 - deep * .55)} dim={Math.min(.5, .12 * pu)} />;
      }) : null}
      <CallBanner p={callP} t={t} />
    </Phone3D>
  );

  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      {/* descanso: horizonte gerado (varanda com mar ao fundo) — surge por luz e profundidade */}
      {hz > 0 ? <AbsoluteFill style={{opacity: hz * (1 - sig)}}><div style={{position: 'absolute', inset: 0, transform: 'translateY(-300px)'}}><Horizon blur={horizon.blur} light={horizon.light} veil={horizon.veil} shift={0} /></div></AbsoluteFill> : null}
      {/* estúdio escuro: luz azul lateral e profundidade */}
      <AbsoluteFill style={{opacity: 1 - hz}}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at -6% 42%, rgba(58,110,165,.42) 0%, rgba(38,75,113,.16) 45%, rgba(10,11,12,0) 75%)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 108% 70%, rgba(38,75,113,.18) 0%, rgba(10,11,12,0) 70%)'}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,11,12,0) 70%, rgba(28,31,34,.45) 100%)'}} />
      </AbsoluteFill>
      {/* praia: areia em primeiro plano e a espuma das ondas indo e voltando (gerado, sem foto) */}
      {hz > 0 ? <div style={{position: 'absolute', left: -80, right: -80, top: 1230, bottom: -40, opacity: hz * (1 - sig), filter: `blur(${(2.5 * P(t, tFocus, 1.3, EASE_IO)).toFixed(2)}px)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50% 50% 0 0 / 26px 26px 0 0', background: 'linear-gradient(180deg, #8a7563 0%, #6b5a4b 10%, #4a3e34 45%, #2a231e 100%)'}} />
        <div style={{position: 'absolute', inset: 0, opacity: .25, background: 'radial-gradient(ellipse 30% 4% at 30% 30%, rgba(255,235,210,.25), rgba(0,0,0,0)), radial-gradient(ellipse 25% 3% at 70% 55%, rgba(255,235,210,.18), rgba(0,0,0,0))'}} />
        {[0, 1].map((k) => { const ph = ((t - tCalm) / 3.2 + k * .5) % 1, w = Math.sin(ph * Math.PI);
          return <div key={k} style={{position: 'absolute', left: 0, right: 0, top: -14 + 46 * w, height: 18, borderRadius: '50%', background: 'rgba(240,232,220,.55)', filter: 'blur(5px)', opacity: .25 + .5 * w}} />; })}
      </div> : null}

      {t < tCalm ? PhoneLayer : null}

      {/* fluxo: conexões, marca discreta e atividades */}
      {t >= tH ? <AbsoluteFill style={{opacity: 1 - flowFade, filter: flowFade > .02 ? `blur(${(flowFade * 6).toFixed(1)}px)` : undefined}}>
        <Connections t={t} cards={cardsFree} detach={detach} toFlow={toFlow} pose={pose} W2S={W2S} z={z} tE={tE} tI={tI} tRp={tRp} tStart={S.estrutura.t0 + .4} />
        {toFlow > 0 ? (() => { const [lx, ly] = W2S(FLOW_X, DME_Y); return (
          <div style={{position: 'absolute', left: lx, top: ly, transform: `scale(${z.toFixed(3)})`, transformOrigin: '0 0', opacity: P(t, S.estrutura.t0 + .6, .6), display: 'flex', alignItems: 'center', gap: 22}}>
            <Img src={staticFile('assets/logo/dme-logo.svg')} style={{width: 150, height: 150 * 610 / 750}} />
            <span style={{fontFamily: UI, fontWeight: 600, fontSize: 30, color: 'rgba(192,198,204,.75)'}}>processos organizados pela DME</span>
          </div>); })() : null}
        {cardsFree.map((c, i) => <ReqCard key={c.r.id} r={c.r} t={t} m={c.m} x={c.x} y={c.y} k={c.k} dim={c.dim} focus={focusIdx === i ? 1 : 0}
          o={1} />)}
      </AbsoluteFill> : null}
      {t >= tH && t < tH + .7 ? <ReqCard r={GROUP} t={t} m={0} x={screenPoint(hp, 35, stackY(0, 3))[0]} y={screenPoint(hp, 35, stackY(0, 3))[1]} k={hp.s * stackK(3)}
        o={(1 - P(t, tH, .5)) * .45} dim={.4} /> : null}

      {t >= tCalm ? PhoneLayer : null}

      {/* leitura dos títulos */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,11,12,.92) 0%, rgba(10,11,12,.8) 15%, rgba(10,11,12,0) 27%)', opacity: Math.max(shade, P(t, S.estrutura.t0, .4) * (1 - P(t, tCalm + .3, .6)))}} />
      <Seal t={t} tin={tN[0]} tout={tCalm - .3} />

      <Headline t={t} tin={-.6} tout={S.areas.t0 - .2} text="Você saiu de férias…" accent="férias" size={72} />
      <Headline t={t} tin={tTrab - .1} tout={S.viaja.t1 - .2} text="O trabalho também viaja" accent="viaja" size={72} />
      <Headline t={t} tin={mF - .05} tout={mC - .45} text="Processos organizados" accent="organizados" size={64} />
      <Headline t={t} tin={mC - .1} tout={mO - .45} text="Sistemas conectados" accent="conectados" size={64} />
      <Headline t={t} tin={mO - .1} tout={S.estrutura.t1 - .15} text="Automação sob medida" accent="sob medida" size={64} />
      <Headline t={t} tin={S.beneficios.t0 + .05} tout={S.beneficios.t1 - .15} text="A equipe sabe como seguir" accent="como seguir" size={64} />
      <Headline t={t} tin={tFocus} tout={tEnd - .2} text="Férias para aproveitar" accent="aproveitar" size={72} />

      {t > tEnd - .4 ? <Signature t={t} tEnd={tEnd} /> : null}
      {captions ? <Captions t={t} hideFrom={tEnd} /> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {TL.scenes.map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)} name={'voz ' + s.key}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};

/** Conexões: na dependência, finas e convergindo para "você"; no fluxo, espinha azul de encaminhamento com um token que acompanha a atividade. */
const Connections: React.FC<{t: number; cards: Array<{x: number; y: number; k: number}>; detach: number; toFlow: number; pose: Pose; W2S: (x: number, y: number) => V2; z: number;
  tE: number; tI: number; tRp: number; tStart: number}> = ({t, cards, detach, toFlow, pose, W2S, z, tE, tI, tRp, tStart}) => {
  const you = screenPoint(pose, 435, 640);
  const dep = detach * (1 - toFlow);
  const spine = P(t, tStart, 1.4, EASE_IO);
  const [sx, sy0] = W2S(SPINE_X, FLOW_Y[0] + 98), [, sy1] = W2S(SPINE_X, DME_Y + 60);
  // token: acompanha a atividade em foco (desce pela espinha)
  const ty = keyed(t, [[tStart + .9, FLOW_Y[0] + 98], [wt('estrutura', 'conecta') - .15, FLOW_Y[0] + 98], [wt('estrutura', 'conecta') + .35, FLOW_Y[1] + 98], [wt('estrutura', 'automatiza') - .15, FLOW_Y[1] + 98],
    [wt('estrutura', 'automatiza') + .35, FLOW_Y[2] + 98], [tE - .75, FLOW_Y[2] + 98], [tE - .2, FLOW_Y[0] + 98], [tI - .5, FLOW_Y[0] + 98], [tI, FLOW_Y[1] + 98], [tRp - .5, FLOW_Y[1] + 98], [tRp, FLOW_Y[2] + 98]])[0];
  const tok = W2S(SPINE_X, ty);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {dep > .01 ? cards.map((c, i) => {
        const ax = c.x + CARD_W * c.k / 2, ay = c.y + 196 * c.k;
        return <g key={i} opacity={dep}><line x1={ax} y1={ay} x2={you[0]} y2={you[1]} stroke={C.silver} strokeOpacity={.4} strokeWidth={1.6} />
          <circle cx={ax} cy={ay} r={4} fill={C.silver} fillOpacity={.6} /></g>;
      }) : null}
      {dep > .01 ? <g opacity={dep}>
        <circle cx={you[0]} cy={you[1]} r={30} fill={C.accent} />
        <circle cx={you[0]} cy={you[1]} r={30 + 14 * (.5 + .5 * Math.sin(t * 5))} fill="none" stroke={C.accent} strokeOpacity={.5} strokeWidth={2} />
        <text x={you[0]} y={you[1] + 11} textAnchor="middle" fontFamily={UI} fontWeight={700} fontSize={30} fill="#fff">você</text>
      </g> : null}
      {toFlow > .01 && spine > 0 ? <g opacity={toFlow}>
        <line x1={sx} y1={sy0} x2={sx} y2={lerp(sy0, sy1, spine)} stroke={C.accent} strokeWidth={3 * Math.max(.6, z)} strokeLinecap="round" />
        {[0, 1, 2].map((i) => { const [nx, ny] = W2S(SPINE_X, FLOW_Y[i] + 98), [cx] = W2S(FLOW_X, 0); const on = P(t, tStart + .3 + i * .35, .4);
          return <g key={i} opacity={on}><line x1={nx} y1={ny} x2={cx} y2={ny} stroke={C.accent} strokeWidth={2.5 * z} /><circle cx={nx} cy={ny} r={11 * z} fill={C.black} stroke={C.accent} strokeWidth={3 * z} /></g>; })}
        {t > tStart + .9 && t < S.tranquilidade.t0 + .5 ? <circle cx={tok[0]} cy={tok[1]} r={16 * z} fill={C.accent} stroke="#cfe0f2" strokeWidth={3 * z} /> : null}
      </g> : null}
    </svg>
  );
};

const Seal: React.FC<{t: number; tin: number; tout: number}> = ({t, tin, tout}) => {
  const o = P(t, tin, .4) * (1 - P(t, tout, .3, EASE_IN)); if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 100, top: 1336, opacity: o * .9, fontFamily: UI, fontWeight: 600, fontSize: 20, letterSpacing: '.06em', color: 'rgba(192,198,204,.85)',
    padding: '8px 16px', borderRadius: 16, border: '1px solid rgba(192,198,204,.3)', background: 'rgba(10,11,12,.6)'}}>Exemplo ilustrativo</div>;
};

/** Assinatura: fundo institucional escuro, luz azul discreta, logo oficial, assinatura falada e CTA estável (≈ 3,5 s). */
const Signature: React.FC<{t: number; tEnd: number}> = ({t, tEnd}) => {
  const bg = P(t, tEnd - .4, .8, EASE_IO);
  const l1 = P(t, wt('assinatura', 'tecnologia') - .05, .5), l2 = P(t, wt('assinatura', 'descansar') - .5, .5), cta = P(t, wt('assinatura', 'descansar') - .1, .55);
  const line = (p: number): React.CSSProperties => ({opacity: p, transform: `translateY(${((1 - p) * 18).toFixed(1)}px)`, filter: p < .98 ? `blur(${((1 - p) * 6).toFixed(1)}px)` : undefined});
  return (
    <AbsoluteFill style={{opacity: bg}}>
      <AbsoluteFill style={{background: C.black}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 45% at 50% 40%, rgba(38,75,113,.38) 0%, rgba(10,11,12,0) 70%)', opacity: .7 + .3 * P(t, tEnd, 6)}} />
      <Logo t={t} tin={tEnd + .02} width={440} top={470} />
      <div style={{position: 'absolute', left: 100, right: 100, top: 900, textAlign: 'center', fontFamily: UI, fontWeight: 600, fontSize: 44, lineHeight: 1.3, color: C.silver}}>
        <div style={line(l1)}>Tecnologia para a empresa seguir.</div>
        <div style={line(l2)}>E para você descansar.</div>
      </div>
      <div style={{position: 'absolute', left: 100, right: 100, top: 1100, textAlign: 'center', ...line(cta)}}>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 44, color: C.ink}}>Comente</div>
        <div style={{display: 'inline-block', margin: '10px 0', padding: '10px 40px', borderRadius: 22, background: C.accent, fontFamily: HEAD, fontWeight: 700, fontSize: 96, letterSpacing: '.02em', color: '#fff'}}>COMERCIAL</div>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 44, color: C.ink}}>e receba um diagnóstico</div>
      </div>
    </AbsoluteFill>
  );
};
export const _e = cardHeight;
