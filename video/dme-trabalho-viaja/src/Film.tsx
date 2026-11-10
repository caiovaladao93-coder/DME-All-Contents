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
// solicitações → etapas: posição como pergunta (S2), no anel da operação (S3) e na estrutura reorganizada (S4)
const ENT: Array<{id: string; ask?: string; icon: IconKey; label: string; label2: string; role: string; ask0?: V2; ring: V2; chain: V2}> = [
  {id: 'aprova', ask: 'Pode aprovar?', icon: 'check', label: 'Aprovação', label2: 'Revisão', role: 'decisão humana', ask0: [-150, -470], ring: [0, -800], chain: [300, 330]},
  {id: 'arquivo', ask: 'Onde está o arquivo?', icon: 'folder', label: 'Arquivos', label2: 'Arquivos', role: 'organizados', ask0: [170, -140], ring: [470, -430], chain: [-280, -660]},
  {id: 'seguir', ask: 'Como seguimos?', icon: 'user', label: 'Equipe', label2: 'Responsável', role: 'Operações', ask0: [-185, 290], ring: [-470, 400], chain: [300, -330]},
  {id: 'comercial', icon: 'chat', label: 'Comercial', label2: 'Solicitação', role: 'Comercial', ring: [-470, -430], chain: [300, -660]},
  {id: 'financeiro', icon: 'gear', label: 'Financeiro', label2: 'Automação', role: 'tarefa repetitiva', ring: [470, 400], chain: [300, 0]},
];
const DONE: V2 = [300, 660];
const PHONE0: V2 = [0, 0], PHONE1: V2 = [-290, 330];

export const Film: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  // ── tempos-chave (palavras faladas)
  const tLit = wt('interrupcao', 'empresa') - .15;
  const tR = [wt('dependencias', 'aprovação.'), wt('dependencias', 'arquivo.'), wt('dependencias', 'decisão')];
  const tPull = S.viaja.t0 + .15, tTrab = wt('viaja', 'trabalho');
  const tReorg = S.estrutura.t0 + .2;
  const tTok = [wt('estrutura', 'sistemas,') + .1, wt('estrutura', 'automações') + .1, wt('estrutura', 'integrações') + .15];
  const tCard = S.clareza.t0 + .05, tResp = wt('clareza', 'responsáveis'), tMan = wt('clareza', 'menos'), tClar = wt('clareza', 'clareza');
  const tHuman = S.clareza.v1 - .9, tDone = S.clareza.v1 - .3;
  const tCalm = S.presente.t0, tEnd = S.assinatura.t0;

  // ── câmera (centro do mundo e zoom): aproxima, acompanha ou revela
  const [cx, cy, z] = keyed(t, [
    [0, 0, 60, 1.6], [tLit, 0, 40, 1.68], [S.interrupcao.t1, 0, -20, 1.2],
    [tR[2] + .6, 0, -20, 1.08], [tPull, 0, -20, 1.08], [tPull + 1.4, 0, -60, .62], [tReorg + 2.6, 30, -40, .62],
    [tTok[0] - .3, 300, -480, 1.12], [tTok[2] + 1.2, 300, 240, 1.12], [S.estrutura.t1 - .2, 30, -30, .62],
    [tCard + .7, -150, -170, 1.22], [tDone - .5, -120, -120, 1.12], [S.clareza.t1, 20, -20, .66],
    [tCalm + 1.3, -290, 260, 1.0], [tEnd, -290, 120, .94],
  ]);
  const reorg = P(t, tReorg, 2.2, EASE_IO);
  const toRing = P(t, tPull + .1, 1.2, EASE_IO);
  const phonePos = L(PHONE0, PHONE1, reorg), phoneScale = lerp(1, .8, reorg);
  const calm = P(t, tCalm + .2, 1.0);
  const sig = P(t, tEnd - .1, .9, EASE_IO); // fundo assume preto/grafite
  const netDim = P(t, tCalm, 1.4) * (1 - 0);

  // posições atuais dos elementos
  const pos = (e: typeof ENT[number]): V2 => { const a = e.ask0 ?? e.ring; return L(L(a, e.ring, toRing), e.chain, reorg); };
  const entIn = (i: number) => (i < 3 ? P(t, tR[i] - .1, .45) : P(t, tPull + .5, .7));
  const P_ = ENT.map(pos);
  const iA = 0, iArq = 1, iSeg = 2, iCom = 3, iFin = 4;
  const nodeK = Math.min(1.4, Math.max(1, .9 / z)); // etapas legíveis no plano aberto
  const focusAct = P(t, tCard - .1, .5) * (1 - P(t, S.clareza.t1 - .4, .5)); // na cena 5 o foco é a atividade

  // conexões: do celular para tudo (dependência) → redistribuídas entre etapas (estrutura)
  const center: V2 = phonePos;
  const phoneLinks = ENT.map((e, i) => ({from: center, to: P_[i], o: entIn(i) * (i === iA ? 1 : 1 - P(t, tReorg + .2, 1.2)), w: 2.5}));
  const chain: Array<[V2, V2, number]> = [[P_[iArq], P_[iCom], tReorg + 1.0], [P_[iCom], P_[iSeg], tReorg + 1.3], [P_[iSeg], P_[iFin], tReorg + 1.6], [P_[iFin], P_[iA], tReorg + 1.9], [P_[iA], DONE, tReorg + 2.2]];
  // sinal que percorre: celular → Aprovação (espera) na cena 3; atividade na estrutura nas cenas 4–5
  const sigA = P(t, tTrab - .05, .9, EASE_IO);
  const tokSegs: Array<[V2, V2, number, number]> = [[P_[iCom], P_[iSeg], tTok[0], .7], [P_[iSeg], P_[iFin], tTok[1] - .2, .7], [P_[iFin], P_[iA], tTok[2] + .3, .8], [P_[iA], DONE, tDone, .6]];
  let tok: V2 | null = null;
  if (t >= tTok[0] - .3 && t < S.clareza.t1) { tok = P_[iCom]; for (const [a, b, s0, d] of tokSegs) if (t >= s0) tok = L(a, b, P(t, s0, d, EASE_IO)); }
  const humanPulse = t >= tHuman && t < tDone + .2 ? P(t, tHuman, .5, EASE_IO) : -1;

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
      {/* horizonte de descanso (fundo, profundidade de campo) */}
      <Horizon blur={horizon.blur} light={horizon.light} veil={horizon.veil} shift={-cx * .05} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(10,11,12,.75) 100%)'}} />
      {/* luz azul lateral */}
      <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(58,110,165,.20) 0%, rgba(58,110,165,0) 40%)', opacity: 1 - sig}} />

      {/* mundo */}
      <div style={{position: 'absolute', left: 540, top: 960, width: 0, height: 0, transform: `scale(${z.toFixed(4)}) translate(${(-cx).toFixed(2)}px, ${(-cy).toFixed(2)}px)`, opacity: 1 - sig}}>
        <div style={W(-1400, phonePos[1] + 300 * phoneScale)}><div style={{position: 'relative', width: 2800, height: 1}}><Table y={0} opacity={1 - .6 * toRing * (1 - calm)} /></div></div>
        {/* rede (fica discreta ao fundo na cena 6) */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - .78 * netDim, filter: netDim > .05 ? `blur(${(netDim * 5).toFixed(1)}px)` : undefined}}>
          <svg width={3000} height={3000} viewBox="-1500 -1500 3000 3000" style={{position: 'absolute', left: -1500, top: -1500, overflow: 'visible'}}>
            {phoneLinks.map((l, i) => line(l.from, l.to, l.o, l.w, 'p' + i))}
            {chain.map(([a, b, t0], i) => drawn(a, b, t0, 'c' + i))}
            {sigA > 0 && sigA < 1 ? <circle cx={lerp(center[0], P_[iA][0], sigA)} cy={lerp(center[1], P_[iA][1], sigA)} r={12 / z} fill="#9fc0e3" /> : null}
            {humanPulse >= 0 && humanPulse < 1 ? <circle cx={lerp(center[0], P_[iA][0], humanPulse)} cy={lerp(center[1], P_[iA][1], humanPulse)} r={12 / z} fill="#9fc0e3" /> : null}
            {tok ? <circle cx={tok[0]} cy={tok[1]} r={16} fill={C.accent} stroke="#cfe0f2" strokeWidth={3} /> : null}
          </svg>
        </div>
        {/* celular: protagonista, sempre reconhecível */}
        <div style={{position: 'absolute', left: phonePos[0], top: phonePos[1], opacity: 1 - .55 * focusAct, filter: focusAct > .05 ? `blur(${(focusAct * 4).toFixed(1)}px)` : undefined, transform: `scale(${phoneScale}) perspective(1600px) rotateY(${lerp(-20, -10, reorg).toFixed(2)}deg) rotateX(${8}deg)`}}>
          <Phone lit={P(t, tLit, .25)} notif={P(t, tLit + .12, .35)} calm={calm} count={1 + (t > tR[0] ? 1 : 0) + (t > tR[1] ? 1 : 0) + (t > tR[2] ? 1 : 0)} glow={t < tPull ? P(t, tLit, .3) * .6 : .3 * (1 - calm)} />
        </div>
        {/* cartões e etapas, à frente do celular */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: (1 - .78 * netDim) * (1 - .45 * focusAct), filter: netDim + focusAct > .05 ? `blur(${(netDim * 5 + focusAct * 3.5).toFixed(1)}px)` : undefined}}>
          {ENT.map((e, i) => {
            const pin = entIn(i); if (pin <= 0) return null;
            const morph = i < 3 ? P(t, tPull + .1, 1.0, EASE_IO) : 1;
            const waiting = i === iA ? (t > tTrab + .8 && t < tReorg + .5 ? 1 : t > tTok[2] + 1.1 && t < tDone ? 1 : 0) : 0;
            const active = (i === iFin && t > tTok[1] + .3 && t < tTok[2] + .5) || (i === iSeg && t > tTok[0] + .5 && t < tTok[1]) ? 1 : 0;
            const p = P_[i];
            return <OpNode key={e.id} t={t} x={p[0]} y={p[1]} opacity={Math.min(1, pin * 1.4)} scale={lerp(.88, 1, pin) * (i < 3 ? lerp(1.12, nodeK, P(t, tPull + .1, 1.0, EASE_IO)) : nodeK)} morph={morph} ask={e.ask} icon={e.icon}
              label={e.label} label2={e.label2} relabel={P(t, tReorg + .8, .6)} role={e.role} roleIn={P(t, tReorg + 1.4, .5)} waiting={waiting} active={active} />;
          })}
          {/* Concluído (aparece com a estrutura) */}
          {P(t, tReorg + 2.2, .5) > 0 ? <OpNode t={t} x={DONE[0]} y={DONE[1]} scale={nodeK} opacity={P(t, tReorg + 2.2, .5)} morph={1} icon="flag" label="Concluído" role="próxima etapa liberada"
            roleIn={P(t, tReorg + 2.4, .5)} active={t > tDone + .55 ? 1 : 0} /> : null}
        </div>
        {/* atividade (cena 5): o que, quem e próximo passo — em foco */}
        <Activity t={t} tin={tCard} rows={[tCard + .2, tResp + .1, tClar - .2]} done={tDone + .5} />
      </div>

      {/* sombra de leitura do título */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,11,12,.95) 0%, rgba(10,11,12,.88) 19%, rgba(10,11,12,0) 31%)', opacity: P(t, tLit, .4) * (1 - sig)}} />

      {/* títulos (máx. 2 níveis com a legenda) */}
      <Headline t={t} tin={tLit + .05} tout={S.interrupcao.t1 - .3} text="A empresa deixou você descansar?" accent="descansar?" size={72} />
      <Headline t={t} tin={tTrab - .1} tout={S.viaja.t1 - .25} text="O trabalho também viaja" accent="viaja" />
      <Headline t={t} tin={S.estrutura.t0 + .1} tout={wt('estrutura', 'para') - .3} text="Tecnologia sob medida" accent="sob medida" />
      <Headline t={t} tin={wt('estrutura', 'para') - .05} tout={S.estrutura.t1 - .25} text="Processos conectados" accent="conectados" />
      <Headline t={t} tin={tCard + .1} tout={S.clareza.t1 - .25} text="A equipe sabe como seguir" accent="como seguir" />
      <Headline t={t} tin={tCalm + .3} tout={tEnd - .1} text="Tempo para estar presente" accent="presente" />

      {/* assinatura */}
      {t > tEnd - .2 ? <Signature t={t} tEnd={tEnd} /> : null}
      {captions ? <Captions t={t} hideFrom={tEnd} /> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {TL.scenes.map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)} name={'voz ' + s.key}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};

/** Cartão de atividade (ilustrativo): o que fazer, quem é responsável e próximo passo. */
const Activity: React.FC<{t: number; tin: number; rows: number[]; done: number}> = ({t, tin, rows, done}) => {
  const p = P(t, tin, .5); if (p <= 0) return null;
  const out = P(t, done + 1.0, .5, EASE_IN);
  const R = [['O que fazer', 'Enviar proposta revisada', 'doc'], ['Responsável', 'Operações', 'user'], ['Próximo passo', 'Revisão', 'check']] as const;
  return (
    <div style={{position: 'absolute', left: -150 - 230, top: -170 - 190, width: 460, height: 380, opacity: p * (1 - out), transform: `translateY(${((1 - p) * 30).toFixed(1)}px)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: 'linear-gradient(160deg, rgba(36,41,46,.95), rgba(18,21,24,.95))', border: '1.5px solid rgba(58,110,165,.75)', boxShadow: '0 30px 60px rgba(0,0,0,.55)'}} />
      <div style={{position: 'absolute', left: 30, top: 24, fontFamily: UI, fontWeight: 700, fontSize: 18, letterSpacing: '.18em', color: C.soft}}>ATIVIDADE</div>
      {R.map(([k, v, ic], i) => { const e = P(t, rows[i], .4); return (
        <div key={k} style={{position: 'absolute', left: 30, right: 24, top: 70 + i * 96, display: 'flex', alignItems: 'center', gap: 18, opacity: e, transform: `translateX(${((1 - e) * 24).toFixed(1)}px)`}}>
          <div style={{width: 56, height: 56, borderRadius: 16, background: 'rgba(58,110,165,.2)', border: '1.5px solid rgba(58,110,165,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={ic as IconKey} size={30} color="#9fc0e3" /></div>
          <div><div style={{fontFamily: UI, fontWeight: 600, fontSize: 20, color: C.soft}}>{k}</div><div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 32, color: C.ink, whiteSpace: 'nowrap'}}>{v}</div></div>
        </div>); })}
      <div style={{position: 'absolute', right: 0, top: 392, fontFamily: UI, fontWeight: 600, fontSize: 18, letterSpacing: '.06em', color: 'rgba(192,198,204,.8)', padding: '8px 14px', borderRadius: 16, border: '1px solid rgba(192,198,204,.3)'}}>Exemplo ilustrativo</div>
    </div>
  );
};

/** Assinatura: preto/grafite, logo oficial, frases e CTA; a linha azul continua como fio visual. */
const Signature: React.FC<{t: number; tEnd: number}> = ({t, tEnd}) => {
  const ln = P(t, tEnd, .8, EASE_IO);
  const a = P(t, wt('assinatura', 'sua') - .1, .5), b = P(t, wt('assinatura', 'seu') - .1, .5), c = P(t, wt('assinatura', 'fale') - .15, .5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 42%, #1C1F22 0%, #0A0B0C 70%)', opacity: P(t, tEnd - .1, .9, EASE_IO)}} />
      <div style={{position: 'absolute', left: 540 - 320 * ln, top: 1006, width: 640 * ln, height: 3, borderRadius: 2, background: C.accent, opacity: .9}} />
      <Logo t={t} tin={tEnd + .15} width={560} top={500} />
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
