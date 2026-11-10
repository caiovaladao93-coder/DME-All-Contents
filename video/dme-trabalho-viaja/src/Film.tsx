import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {HEAD, UI, loadFonts} from './theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, P, S, keyed, lerp, wt} from './theme/motion';
import {Horizon, Table} from './components/Horizon';
import {Phone} from './components/Phone';
import {Icon, IconKey, OpNode} from './components/Nodes';
import {Captions, Headline, Logo} from './components/Type';

loadFonts();
type V2 = [number, number];
const L = (a: V2, b: V2, p: number): V2 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];

/*
 * Um único mundo contínuo (sem "slides"): o celular, as solicitações, as etapas e as conexões existem no mesmo espaço.
 * As "cenas" são movimentos de câmera e transformações desses mesmos elementos (Bang Motion: continuidade de objetos).
 * Tudo é função do frame: t = frame / 30.
 */
// Um caso concreto atravessa o filme: Pedido 1042 do Cliente Alfa (dados fictícios, selo "Exemplo ilustrativo").
// Cada elemento tem 3 faces: a = pedido que chega ao dono (S2) · b = área com algo parado (S3) · c = etapa do processo organizado (S4–S5).
type Face = {icon: IconKey; title: string; sub?: string; accent?: boolean};
const ENT: Array<{id: string; a?: Face; b: Face; c: Face; ask0?: V2; ring: V2; chain: V2}> = [
  {id: 'aprova', a: {icon: 'chat', sub: 'Carla · Financeiro', title: 'Pode aprovar o pagamento?', accent: true}, b: {icon: 'coin', title: 'Financeiro', sub: '3 aprovações paradas'},
    c: {icon: 'check', title: 'Aprovação', sub: 'sua · acima de R$ 3.000'}, ask0: [0, -480], ring: [0, -760], chain: [260, 100]},
  {id: 'contrato', a: {icon: 'chat', sub: 'Rafael · Comercial', title: 'Onde está o contrato do Alfa?', accent: true}, b: {icon: 'doc', title: 'Comercial', sub: 'contrato sem pasta'},
    c: {icon: 'folder', title: 'Contratos', sub: 'pasta do cliente Alfa'}, ask0: [40, 150], ring: [-430, -420], chain: [260, -900]},
  {id: 'pedido', a: {icon: 'chat', sub: 'Marina · Operações', title: 'Como seguimos com o 1042?', accent: true}, b: {icon: 'box', title: 'Operações', sub: 'pedido 1042 parado'},
    c: {icon: 'user', title: 'Responsável', sub: 'Marina · Operações'}, ask0: [-30, 380], ring: [-430, 420], chain: [260, -400]},
  {id: 'compras', b: {icon: 'cart', title: 'Compras', sub: 'cotação sem resposta'}, c: {icon: 'box', title: 'Pedido 1042', sub: 'Cliente Alfa · recebido'}, ring: [430, -420], chain: [260, -650]},
  {id: 'atend', b: {icon: 'headset', title: 'Atendimento', sub: 'cliente sem retorno'}, c: {icon: 'gear', title: 'Automação', sub: 'nota emitida · cliente avisado'}, ring: [430, 420], chain: [260, -150]},
];
const DONE: V2 = [260, 350];
const PHONE0: V2 = [0, 0], PHONE1: V2 = [-300, 20];

export const Film: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  // ── tempos-chave (palavras faladas)
  const tLit = wt('interrupcao', 'empresa') - .15;
  const tR = [wt('dependencias', 'aprovação.'), wt('dependencias', 'arquivo.'), wt('dependencias', 'decisão')];
  const tPull = S.viaja.t0 + .15, tTrab = wt('viaja', 'trabalho');
  const tReorg = S.estrutura.t0 + .2;
  const tTok = [wt('estrutura', 'sistemas,') + .1, wt('estrutura', 'automações') + .1, wt('estrutura', 'integrações') + .15];
  const tCard = S.clareza.t0 + .05, tResp = wt('clareza', 'responsáveis'), tMan = wt('clareza', 'menos'), tClar = wt('clareza', 'clareza');
  const tHuman = S.clareza.v1 - .6;
  const tCalm = S.presente.t0, tEnd = S.assinatura.t0;

  // ── câmera: aproxima, acompanha ou revela
  const [cx, cy, z] = keyed(t, [
    [0, 0, 40, 1.55], [tLit, 0, 20, 1.62], [S.interrupcao.t1, 0, -30, .98],
    [tR[2] + .6, 0, -30, .92], [tPull, 0, -30, .92], [tPull + 1.4, 0, -40, .62], [tReorg + .2, 0, -40, .62], [tReorg + 2.4, 60, -285, .6],
    [tTok[0] - .3, 60, -600, .85], [tTok[2] + 1.0, 60, 60, .85], [S.estrutura.t1 - .2, 60, -285, .6],
    [S.clareza.t1, 60, -285, .6], [tCalm + 1.0, -300, 20, 1.65], [tCalm + 2.2, -300, 20, 1.6], [tEnd - .3, -300, -60, 1.05],
  ]);
  const reorg = P(t, tReorg, 2.2, EASE_IO);
  const toRing = P(t, tPull + .1, 1.2, EASE_IO);
  const ab = P(t, tPull + .1, 1.0, EASE_IO), bc = P(t, tReorg + .8, .7, EASE_IO);
  const phonePos = L(PHONE0, PHONE1, reorg), phoneScale = lerp(1, .8, reorg);
  const calm = P(t, tCalm + .2, 1.0);
  const sig = P(t, tEnd - .78, .42, EASE_IO); // o mundo apaga antes da marca entrar
  const netDim = P(t, tCalm, 1.4);
  const focusAct = P(t, tCard - .1, .5) * (1 - P(t, S.clareza.t1 - .45, .45));
  const nodeK = Math.min(1.2, Math.max(1, .74 / z)); // etapas legíveis no plano aberto
  const W0 = (i: number) => (ENT[i].a ? lerp(620, 440, ab) : 440);

  const pos = (e: typeof ENT[number]): V2 => { const a = e.ask0 ?? e.ring; return L(L(a, e.ring, toRing), e.chain, reorg); };
  const entIn = (i: number) => (i < 3 ? P(t, tR[i] - .1, .45) : P(t, tPull + .5, .7));
  const P_ = ENT.map(pos);
  const iA = 0, iCt = 1, iPd = 2, iCp = 3, iAt = 4;

  const center: V2 = phonePos;
  const phoneLinks = ENT.map((e, i) => ({to: P_[i], o: entIn(i) * (i === iA ? 1 : 1 - P(t, tReorg + .2, 1.2))}));
  const chain: Array<[V2, V2, number]> = [[P_[iCt], P_[iCp], tReorg + 1.0], [P_[iCp], P_[iPd], tReorg + 1.3], [P_[iPd], P_[iAt], tReorg + 1.6], [P_[iAt], P_[iA], tReorg + 1.9], [P_[iA], DONE, tReorg + 2.2]];
  const sigA = P(t, tTrab - .05, .9, EASE_IO);
  const tokSegs: Array<[V2, V2, number, number]> = [[P_[iCp], P_[iPd], tTok[0], .7], [P_[iPd], P_[iAt], tTok[1] - .2, .7], [P_[iAt], P_[iA], tTok[2] + .3, .8]];
  let tok: V2 | null = null;
  if (t >= tTok[0] - .3 && t < tCalm + 1.5) { tok = P_[iCp]; for (const [a, b, s0, d] of tokSegs) if (t >= s0) tok = L(a, b, P(t, s0, d, EASE_IO)); }
  const humanPulse = t >= tHuman ? P(t, tHuman, .6, EASE_IO) : -1; // a única decisão que vai para o celular

  const horizon = {
    blur: keyed(t, [[0, 3], [tLit, 3], [tLit + .5, 12], [tCalm, 12], [tCalm + 1.8, 2]])[0],
    light: keyed(t, [[0, 1], [tLit + .5, .7], [tPull + 1, .4], [tCalm, .4], [tCalm + 1.8, 1]])[0],
    veil: keyed(t, [[0, .22], [tLit + .5, .45], [tPull + 1.2, .82], [tCalm, .82], [tCalm + 1.8, .14]])[0],
  };
  const W = (x: number, y: number): React.CSSProperties => ({position: 'absolute', left: x, top: y});
  const line = (a: V2, b: V2, o: number, w = 2.5, key?: string) => o <= 0.01 ? null :
    <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.accent} strokeOpacity={o * .85} strokeWidth={w / z} strokeLinecap="round" />;
  const drawn = (a: V2, b: V2, t0: number, key: string) => { const p = P(t, t0, .45, EASE_IO); return p <= 0 ? null : line(a, L(a, b, p), 1, 3, key); };

  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <Horizon blur={horizon.blur} light={horizon.light} veil={horizon.veil} shift={-cx * .05} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(10,11,12,.75) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(58,110,165,.20) 0%, rgba(58,110,165,0) 40%)', opacity: 1 - sig}} />

      {/* mundo */}
      <div style={{position: 'absolute', left: 540, top: 960, width: 0, height: 0, transform: `scale(${z.toFixed(4)}) translate(${(-cx).toFixed(2)}px, ${(-cy).toFixed(2)}px)`, opacity: 1 - sig}}>
        <div style={W(-1400, phonePos[1] + 300 * phoneScale)}><div style={{position: 'relative', width: 2800, height: 1}}><Table y={0} opacity={1 - .6 * toRing * (1 - calm)} /></div></div>
        {/* conexões */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: (1 - .78 * netDim) * (1 - .5 * focusAct)}}>
          <svg width={3000} height={3000} viewBox="-1500 -1500 3000 3000" style={{position: 'absolute', left: -1500, top: -1500, overflow: 'visible'}}>
            {phoneLinks.map((l, i) => line(center, l.to, l.o, 2.5, 'p' + i))}
            {chain.map(([a, b, t0], i) => drawn(a, b, t0, 'c' + i))}
            {sigA > 0 && sigA < 1 ? <circle cx={lerp(center[0], P_[iA][0], sigA)} cy={lerp(center[1], P_[iA][1], sigA)} r={12 / z} fill="#9fc0e3" /> : null}
            {humanPulse >= 0 && humanPulse < 1 ? <circle cx={lerp(P_[iA][0], center[0], humanPulse)} cy={lerp(P_[iA][1], center[1], humanPulse)} r={14 / z} fill="#9fc0e3" /> : null}
            {tok ? <circle cx={tok[0]} cy={tok[1]} r={18} fill={C.accent} stroke="#cfe0f2" strokeWidth={3} /> : null}
          </svg>
        </div>
        {/* celular: protagonista */}
        <div style={{position: 'absolute', left: phonePos[0], top: phonePos[1], opacity: 1 - .6 * focusAct,
          transform: `scale(${phoneScale}) perspective(1600px) rotateY(${lerp(-20, -10, reorg).toFixed(2)}deg) rotateX(${8}deg)`}}>
          <Phone lit={P(t, tLit, .25)} notif={P(t, tLit + .12, .35)} calm={calm} count={1 + (t > tR[1] ? 1 : 0) + (t > tR[2] ? 1 : 0)} glow={t < tPull ? P(t, tLit, .3) * .6 : .3 * (1 - calm) + .3 * calm} />
        </div>
        {/* pedidos → áreas → etapas (à frente do celular) */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: (1 - .78 * netDim) * (1 - .55 * focusAct), filter: netDim + focusAct > .05 ? `blur(${(netDim * 5 + focusAct * 3).toFixed(1)}px)` : undefined}}>
          {ENT.map((e, i) => {
            const pin = entIn(i); if (pin <= 0) return null;
            const waiting = i === iA ? (t > tTrab + .8 && t < tReorg + .5 ? 1 : t > tTok[2] + 1.1 ? 1 : 0) : 0;
            const active = (i === iAt && t > tTok[1] + .3 && t < tTok[2] + .5) || (i === iPd && t > tTok[0] + .5 && t < tTok[1]) ? 1 : 0;
            const w = lerp(W0(i), 520, reorg);
            return <OpNode key={e.id} t={t} x={P_[i][0]} y={P_[i][1]} w={w} opacity={Math.min(1, pin * 1.4)} scale={lerp(.9, 1, pin) * (ENT[i].a ? lerp(1, nodeK, ab) : nodeK)}
              a={e.a} b={e.b} c={e.c} ab={e.a ? ab : 1} bc={bc} waiting={waiting} active={active} />;
          })}
          {P(t, tReorg + 2.2, .5) > 0 ? <OpNode t={t} x={DONE[0]} y={DONE[1]} w={520} scale={nodeK} opacity={P(t, tReorg + 2.2, .5)} b={{icon: 'flag', title: 'Concluído', sub: 'pedido entregue e pago'}} ab={1} bc={0} /> : null}
        </div>
      </div>

      {/* sombra de leitura do título */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,11,12,.95) 0%, rgba(10,11,12,.88) 19%, rgba(10,11,12,0) 31%)', opacity: P(t, tLit, .4) * (1 - sig)}} />
      {/* atividade em foco (cena 5) */}
      <Activity t={t} tin={tCard} rows={[tResp - .05, tMan - .05, tClar - .1]} out={S.clareza.t1 - .45} />
      {/* selo dos dados fictícios */}
      <Seal t={t} tin={tR[0]} tout={tEnd - .7} top={t < tPull ? 236 : 1338} side={t < tPull ? 'right' : 'left'} />

      <Headline t={t} tin={tLit + .05} tout={S.interrupcao.t1 - .3} text="A empresa deixou você descansar?" accent="descansar?" size={72} />
      <Headline t={t} tin={tTrab - .1} tout={S.viaja.t1 - .25} text="O trabalho também viaja" accent="viaja" />
      <Headline t={t} tin={S.estrutura.t0 + .1} tout={wt('estrutura', 'para') - .3} text="Tecnologia sob medida" accent="sob medida" />
      <Headline t={t} tin={wt('estrutura', 'para') - .05} tout={S.estrutura.t1 - .25} text="Processos conectados" accent="conectados" />
      <Headline t={t} tin={tCard + .1} tout={S.clareza.t1 - .25} text="A equipe sabe como seguir" accent="como seguir" />
      <Headline t={t} tin={tCalm + .3} tout={tEnd - .8} text="Tempo para estar presente" accent="presente" />

      {t > tEnd - .8 ? <Signature t={t} tEnd={tEnd} /> : null}
      {captions ? <Captions t={t} hideFrom={tEnd} /> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {TL.scenes.map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)} name={'voz ' + s.key}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};

const Seal: React.FC<{t: number; tin: number; tout: number; top: number; side: 'left' | 'right'}> = ({t, tin, tout, top, side}) => {
  const o = P(t, tin, .4) * (1 - P(t, tout, .3, EASE_IN)); if (o <= 0) return null;
  return <div style={{position: 'absolute', [side]: 100, top, opacity: o * .9, fontFamily: UI, fontWeight: 600, fontSize: 20, letterSpacing: '.06em', color: 'rgba(192,198,204,.85)',
    padding: '8px 16px', borderRadius: 16, border: '1px solid rgba(192,198,204,.3)', background: 'rgba(10,11,12,.55)'}}>Exemplo ilustrativo</div>;
};

/** Cartão de atividade em foco (camada de tela): pedido real de exemplo, quem faz, o que já é automático e o próximo passo. */
const Activity: React.FC<{t: number; tin: number; rows: number[]; out: number}> = ({t, tin, rows, out}) => {
  const p = P(t, tin, .5); const q = P(t, out, .45, EASE_IN); if (p <= 0 || q >= 1) return null;
  const R: Array<[string, string, IconKey]> = [['Responsável', 'Marina · Operações', 'user'], ['Automático', 'Nota emitida e cliente avisado', 'gear'], ['Próximo passo', 'Sua aprovação · R$ 4.870,00', 'check']];
  return (
    <div style={{position: 'absolute', left: 100, top: 470, width: 880, height: 560, opacity: p * (1 - q), transform: `translateY(${((1 - p) * 40).toFixed(1)}px) scale(${lerp(1.04, 1, p) * lerp(1, .9, q)})`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 34, background: 'linear-gradient(160deg, rgba(38,43,48,.97), rgba(18,21,24,.97))', border: '1.5px solid rgba(58,110,165,.8)', boxShadow: '0 40px 80px rgba(0,0,0,.6)'}} />
      <div style={{position: 'absolute', left: 44, top: 40, fontFamily: UI, fontWeight: 700, fontSize: 24, letterSpacing: '.16em', color: '#a9c6e6'}}>PEDIDO 1042 · CLIENTE ALFA</div>
      {R.map(([k, v, ic], i) => { const e = P(t, rows[i], .4); return (
        <div key={k} style={{position: 'absolute', left: 44, right: 40, top: 110 + i * 140, display: 'flex', alignItems: 'center', gap: 26, opacity: .25 + .75 * e, transform: `translateX(${((1 - e) * 20).toFixed(1)}px)`}}>
          <div style={{width: 84, height: 84, flex: 'none', borderRadius: 22, background: e > .5 ? 'rgba(58,110,165,.25)' : 'rgba(192,198,204,.06)', border: `1.5px solid ${e > .5 ? 'rgba(58,110,165,.85)' : 'rgba(192,198,204,.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={ic} size={44} color="#a9c6e6" rot={ic === 'gear' ? t * 60 * e : 0} /></div>
          <div><div style={{fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.soft}}>{k}</div><div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 44, color: C.ink, whiteSpace: 'nowrap', letterSpacing: '-.01em'}}>{v}</div></div>
        </div>); })}
    </div>
  );
};

/** Assinatura: preto/grafite, logo oficial, frases e CTA; a linha azul continua como fio visual. */
const Signature: React.FC<{t: number; tEnd: number}> = ({t, tEnd}) => {
  const ln = P(t, tEnd - .4, .8, EASE_IO);
  const a = P(t, wt('assinatura', 'sua') - .1, .5), b = P(t, wt('assinatura', 'seu') - .1, .5), c = P(t, wt('assinatura', 'fale') - .15, .5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 42%, #1C1F22 0%, #0A0B0C 70%)', opacity: P(t, tEnd - .78, .42, EASE_IO)}} />
      <div style={{position: 'absolute', left: 540 - 320 * ln, top: 1006, width: 640 * ln, height: 3, borderRadius: 2, background: C.accent, opacity: .9}} />
      <Logo t={t} tin={tEnd - .3} width={560} top={500} />
      <div style={{position: 'absolute', left: 100, right: 100, top: 1060, textAlign: 'center', fontFamily: HEAD, fontWeight: 600, fontSize: 64, letterSpacing: '-.02em', color: C.ink, lineHeight: 1.12}}>
        <div style={{opacity: a, transform: `translateY(${((1 - a) * 20).toFixed(1)}px)`}}>Sua operação conectada</div>
        <div style={{opacity: b, transform: `translateY(${((1 - b) * 20).toFixed(1)}px)`, color: C.accent}}>Seu tempo de volta</div>
      </div>
      <div style={{position: 'absolute', left: 540 - 260, top: 1300, width: 520, height: 112, borderRadius: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #2F5A86, #1D3A58)', border: '1.5px solid rgba(120,160,205,.6)', boxShadow: '0 6px 0 #142a40, 0 24px 50px rgba(0,0,0,.5)',
        fontFamily: UI, fontWeight: 700, fontSize: 46, color: '#F4F6F8', opacity: c, transform: `translateY(${((1 - c) * 24).toFixed(1)}px) scale(${lerp(.94, 1, c)})`}}>Fale com a DME</div>
    </AbsoluteFill>
  );
};
export const _e = EASE_OUT;
