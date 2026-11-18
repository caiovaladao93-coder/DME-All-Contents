import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TL from './data/timeline.json';
import {C} from './theme/colors';
import {BACK, EASE_IN, EASE_IO, EASE_OUT, P, S, SceneKey, clamp, hash, lerp, wt} from './theme/motion';
import {HEAD, UI, loadFonts} from './theme/typography';

loadFonts();
/*
 * DME · "Tudo passa por você" (9:16, 60 s). Gancho de identificação do dono: "Você abriu a empresa pra ter liberdade. Hoje, nada
 * anda sem você." Fio condutor: o círculo VOCÊ no centro de um mapa de ligações (CLIENTES, LIGAÇÕES, EQUIPE, SISTEMAS).
 * As mensagens do dia chegam e o sobrecarregam ("Você virou o gargalo da própria empresa."). No "Agora", cada linha é
 * redesenhada para passar por um bloco de aço (CRM, AGENTE DE VOZ · IA, PROCESSO PADRONIZADO, INTEGRAÇÃO; só fatos
 * confirmados) e o VOCÊ volta ao tamanho normal. Método, fecho com o processo segurando a rotina, loop ("liberdade") e assinatura.
 */
const W = 1080, H = 1920, A = C.accent;
const E = (k: SceneKey) => S[k];
const T = {
  hoje: wt('sem', 'Hoje,'),
  msg: [wt('msgs', 'Aprova'), wt('msgs', 'Atende'), wt('msgs', 'Passa'), wt('msgs', 'Acha'), wt('msgs', 'Lembra')],
  almoco: wt('montagem', 'No'), janta: wt('montagem', 'Na'), sabado: wt('montagem', 'No', 1),
  gargalo: wt('gargalo', 'gargalo'), agora: wt('agora', 'Agora.'),
  crmQ: wt('crm', 'retorno'), crm: wt('crm', 'Cê-Erre-Eme'),
  agQ: wt('agente', 'ligação'), ag: wt('agente', 'agente'), v: [wt('agente', 'atende,'), wt('agente', 'qualifica,'), wt('agente', 'registra'), wt('agente', 'passa')],
  proc: wt('processo', 'O'), vira: wt('processo', 'vira'), mapeado: wt('processo', 'mapeado'),
  sis: wt('integra', 'sistemas'), conversam: wt('integra', 'conversam'),
  dme: wt('metodo', 'Dê-Eme-É'), ent: wt('metodo', 'entende,'), plan: wt('metodo', 'planeja'), des: wt('metodo', 'desenvolve'), sob: wt('metodo', 'sob'),
  entao: wt('fecho', 'Então,'), cresc: wt('fecho', 'crescimento,'), segura: wt('fecho', 'o', 0),
  sig: E('assinatura').t0, auto: wt('assinatura', 'Automatizamos'), dev: wt('assinatura', 'Devolvemos'),
};
const STEEL = 'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, rgba(0,0,0,.05) 1px 3px), linear-gradient(135deg, #2A2E33 0%, #4A5057 38%, #2B3035 64%, #3B4147 100%)';
const BLUE_PLATE = 'linear-gradient(135deg, #2D5584 0%, #3A6EA5 45%, #264B71 100%)';

// ── mapa de ligações
const CX = 540, CY = 1110;
const SRC = [{l: 'CLIENTES', x: 205, y: 790}, {l: 'LIGAÇÕES', x: 875, y: 790}, {l: 'EQUIPE', x: 205, y: 1430}, {l: 'SISTEMAS', x: 875, y: 1430}];
const SOL = [{l: ['CRM', 'RETORNO AUTOMÁTICO'], t: () => T.crm}, {l: ['AGENTE DE VOZ', 'COM IA'], t: () => T.ag}, {l: ['PROCESSO', 'PADRONIZADO'], t: () => T.vira}, {l: ['INTEGRAÇÃO', 'DE SISTEMAS'], t: () => T.conversam}];
const MSGS: Array<{src: number; quem: string; hora: string; txt: string}> = [
  {src: 2, quem: 'Equipe', hora: '07:02', txt: 'Chefe, aprova o orçamento?'},
  {src: 1, quem: 'Recepção', hora: '09:15', txt: 'Cliente ligou, quer falar com você'},
  {src: 3, quem: 'Financeiro', hora: '10:40', txt: 'Qual a senha do sistema?'},
  {src: 2, quem: 'Equipe', hora: '12:31', txt: 'Onde tá aquela planilha?'},
  {src: 0, quem: 'Comercial', hora: '15:20', txt: 'Mandou a proposta pro João?'},
];
// contador de mensagens (rola rápido na montagem)
const countAt = (t: number) => {
  let n = T.msg.filter((x) => t >= x).length;
  const roll = (a: number, b: number, t0: number) => (t >= t0 ? lerp(a, b, P(t, t0, .7, EASE_OUT)) : null);
  const r = [roll(5, 23, T.almoco), roll(23, 41, T.janta), roll(41, 58, T.sabado)].filter((x) => x !== null) as number[];
  if (r.length) n = r[r.length - 1];
  return Math.round(n);
};
const solvedAt = (t: number, i: number) => P(t, SOL[i].t() - .15, .6, EASE_IO);

const Graph: React.FC<{t: number; o: number}> = ({t, o}) => {
  if (o <= 0) return null;
  const n = t < T.agora ? countAt(t) : countAt(T.agora - .01);
  const solvedAll = SOL.map((_, i) => solvedAt(t, i)); const calm = solvedAll.reduce((a, b) => a + b, 0) / 4;
  const load = clamp(n / 58) * (1 - calm);
  const r = 96 + 70 * load;
  const sh = load > .35 && t < T.agora ? Math.sin(t * 47) * 8 * (load - .35) + Math.cos(t * 31) * 4 * (load - .35) : 0;
  const cx = CX + sh, cy = CY + sh * .6;
  const hatch = P(t, T.gargalo - .1, .4) * (1 - P(t, T.agora - .1, .3));
  const draw = P(t, -1, .01);
  const cresc = P(t, T.cresc - .2, .6, EASE_IO);
  const els: React.ReactNode[] = [];
  SRC.forEach((s, i) => {
    const sv = solvedAll[i]; const mx = lerp(s.x, CX, .5), my = lerp(s.y, CY, .5);
    const w = 3 + 12 * load * (1 - sv);
    // linha fonte → VOCÊ (some do meio para o centro quando resolvida)
    els.push(<line key={'a' + i} x1={s.x} y1={s.y} x2={mx} y2={my} stroke={sv > .5 ? A : 'rgba(192,198,204,.75)'} strokeWidth={sv > .5 ? 6 : w} strokeLinecap="round" opacity={draw} />);
    els.push(<line key={'b' + i} x1={mx} y1={my} x2={CX} y2={CY} stroke="rgba(192,198,204,.75)" strokeWidth={w} strokeLinecap="round" opacity={draw * (1 - sv)} />);
    // pulsos: chegada das mensagens (problema) e circulação no bloco (solução)
    if (sv < .5) {
      MSGS.forEach((m, k) => { if (m.src !== i) return; const p = P(t, T.msg[k] - .05, .55, EASE_IN); if (p > 0 && p < 1) els.push(<circle key={`p${i}${k}`} cx={lerp(s.x, CX, p)} cy={lerp(s.y, CY, p)} r="13" fill="#fff" />); });
      if (t >= T.almoco - .2 && t < T.agora) for (let k = 0; k < 4; k++) { const u = ((t - T.almoco) * (1.2 + .4 * k) + hash(i * 7 + k)) % 1; els.push(<circle key={`q${i}${k}`} cx={lerp(s.x, CX, u)} cy={lerp(s.y, CY, u)} r="8" fill="#C0C6CC" opacity={.9} />); }
    } else {
      for (let k = 0; k < 2; k++) { const u = ((t - SOL[i].t()) * .8 + k / 2) % 1; els.push(<circle key={`s${i}${k}`} cx={lerp(s.x, mx, u)} cy={lerp(s.y, my, u)} r="9" fill="#fff" stroke={A} strokeWidth="3" />); }
    }
  });
  // linha VOCÊ → CRESCIMENTO
  if (cresc > 0) { const ty = 790; els.push(<line key="cr" x1={CX} y1={CY - r} x2={CX} y2={lerp(CY - r, ty + 40, cresc)} stroke={A} strokeWidth="6" strokeLinecap="round" />);
    for (let k = 0; k < 2; k++) { const u = ((t - T.cresc) * .9 + k / 2) % 1; if (cresc >= 1) els.push(<circle key={'cp' + k} cx={CX} cy={lerp(CY - r, ty + 40, u)} r="9" fill="#fff" stroke={A} strokeWidth="3" />); } }
  return <AbsoluteFill style={{opacity: o}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#1B1E22" /><line x1="0" y1="0" x2="0" y2="14" stroke="#C0C6CC" strokeWidth="4" /></pattern>
        <radialGradient id="vg" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#4A5057" /><stop offset=".6" stopColor="#262A2F" /><stop offset="1" stopColor="#15181B" /></radialGradient></defs>
      {els}
      <circle cx={cx} cy={cy} r={r} fill={hatch > 0 ? 'url(#hatch)' : 'url(#vg)'} stroke={calm > .9 ? A : C.silver} strokeWidth="4" />
      {hatch > 0 ? <circle cx={cx} cy={cy} r={r} fill="url(#vg)" opacity={1 - hatch} /> : null}
      <text x={cx} y={cy + 18} textAnchor="middle" fontFamily="Sora" fontWeight={800} fontSize={52 + 14 * load} letterSpacing="2" fill={C.ink}>VOCÊ</text>
    </svg>
    {/* fontes */}
    {SRC.map((s, i) => <div key={s.l} style={{position: 'absolute', left: s.x - 120, top: s.y - 42, width: 240, height: 84, borderRadius: 14, background: STEEL, border: `1.5px solid ${solvedAll[i] > .5 ? A : 'rgba(192,198,204,.5)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 24, letterSpacing: '.16em', color: C.ink, boxShadow: '0 14px 28px rgba(0,0,0,.45)'}}>{s.l}</div>)}
    {/* blocos da solução, no meio de cada linha */}
    {SOL.map((b, i) => { const p = P(t, b.t() - .25, .55, BACK); if (p <= 0) return null; const s = SRC[i]; const mx = lerp(s.x, CX, .5), my = lerp(s.y, CY, .5);
      return <div key={b.l[0]} style={{position: 'absolute', left: mx - 135, top: my - 54, width: 270, height: 108, borderRadius: 14, background: BLUE_PLATE, border: '1.5px solid rgba(220,232,245,.7)',
        boxShadow: '0 18px 34px rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: clamp(p * 2), transform: `scale(${(.6 + .4 * p).toFixed(3)})`}}>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '.02em'}}>{b.l[0]}</span>
        <span style={{fontFamily: UI, fontWeight: 800, fontSize: 16, color: '#DCE8F5', letterSpacing: '.16em'}}>{b.l[1]}</span></div>; })}
    {/* contador */}
    {(() => { const a = (t < T.agora ? 1 : 1 - P(t, T.agora, .3)) * P(t, T.hoje, .4); if (a <= 0) return null;
      return <div style={{position: 'absolute', left: CX - 230, width: 460, top: CY + r + 22, textAlign: 'center', opacity: a, background: 'rgba(10,11,12,.92)', borderRadius: 30, padding: '6px 0', border: '1px solid rgba(192,198,204,.25)', fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: '.2em', color: 'rgba(192,198,204,.75)'}}>
        MENSAGENS PARA VOCÊ <span style={{fontFamily: HEAD, fontSize: 40, color: C.ink, marginLeft: 10, letterSpacing: 0}}>{n}</span></div>; })()}
    {/* CRESCIMENTO */}
    {cresc > 0 ? <div style={{position: 'absolute', left: CX - 170, top: 760, width: 340, height: 70, borderRadius: 35, border: `2px solid ${A}`, background: 'rgba(58,110,165,.25)', opacity: cresc,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 26, letterSpacing: '.2em', color: '#fff'}}>CRESCIMENTO</div> : null}
  </AbsoluteFill>;
};

// ── notificações (pilha no topo)
const Notifs: React.FC<{t: number}> = ({t}) => {
  const out = P(t, E('msgs').t1 - .3, .35, EASE_IN); if (t < T.msg[0] - .2 || out >= 1) return null;
  const cur = T.msg.filter((x) => t >= x - .12).length;
  return <AbsoluteFill style={{opacity: 1 - out}}>
    <div style={{position: 'absolute', left: 90, top: 270, fontFamily: UI, fontWeight: 700, fontSize: 19, letterSpacing: '.24em', color: 'rgba(192,198,204,.6)'}}>EXEMPLO ILUSTRATIVO</div>
    {MSGS.map((m, k) => { const a = P(t, T.msg[k] - .12, .35, BACK); if (a <= 0) return null; const depth = cur - 1 - k; if (depth > 2) return null;
      const y = 315 + depth * 112; const fade = depth === 0 ? 1 : depth === 1 ? .75 : .45;
      return <div key={k} style={{position: 'absolute', left: 90, top: y, width: 900, height: 96, borderRadius: 18, background: 'rgba(36,40,45,.96)', border: '1.5px solid rgba(192,198,204,.25)',
        boxShadow: '0 14px 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', opacity: clamp(a * 2) * fade, transform: `translateY(${((1 - a) * -40).toFixed(1)}px) scale(${(1 - .03 * depth).toFixed(3)})`,
        transition: 'none'}}>
        <div style={{width: 56, height: 56, borderRadius: 14, background: STEEL, border: '1px solid rgba(192,198,204,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 24, color: C.ink}}>{m.quem[0]}</div>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 700, fontSize: 20, color: 'rgba(192,198,204,.75)'}}><span>{m.quem.toUpperCase()}</span><span>{m.hora}</span></div>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 4}}>{m.txt}</div></div></div>; })}
  </AbsoluteFill>;
};

// ── tipografia
type Seg = string | [string];
const Phrase: React.FC<{t: number; tin: number; tout: number; segs: Seg[]; size?: number; top?: number; left?: number; width?: number; align?: 'left' | 'center'; color?: string; acc?: string}> = ({t, tin, tout, segs, size = 76, top = 300, left = 90, width = 900, align = 'left', color = C.ink, acc = A}) => {
  if (t < tin - .01 || t > tout + .32) return null;
  const words: Array<[string, boolean]> = [];
  segs.forEach((s) => (typeof s === 'string' ? s : s[0]).split(' ').filter(Boolean).forEach((w) => words.push([w, typeof s !== 'string'])));
  const q = P(t, tout, .3, EASE_IN);
  return <div style={{position: 'absolute', left, width, top, textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: '-.025em', color,
    opacity: 1 - q, transform: `translateY(${(-26 * q).toFixed(1)}px)`, filter: q > 0 ? `blur(${(8 * q).toFixed(1)}px)` : undefined}}>
    {words.map(([w, ac], i) => { if (w === '|') return <br key={i} />; const p = tin < 0 ? 1 : P(t, tin + i * .05, .34);
      return <span key={i} style={{display: 'inline-block', marginRight: '.24em', color: ac ? acc : undefined, opacity: p, transform: `translateY(${((1 - p) * 28).toFixed(1)}px)`, filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(1)}px)` : undefined}}>{w}</span>; })}
  </div>;
};
const Verbs: React.FC<{t: number; tout: number; top: number}> = ({t, tout, top}) => {
  const o = P(t, T.v[0] - .3, .3) * (1 - P(t, tout, .3)); if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 90, width: 900, top, display: 'flex', flexWrap: 'wrap', gap: 12, opacity: o}}>
    {['atende', 'qualifica', 'registra', 'passa para a equipe'].map((w, i) => { const on = P(t, T.v[i] - .05, .25);
      return <span key={w} style={{fontFamily: UI, fontWeight: 700, fontSize: 30, padding: '10px 20px', borderRadius: 8, border: `2px solid ${on > .5 ? A : 'rgba(192,198,204,.35)'}`,
        background: on > .5 ? 'rgba(58,110,165,.25)' : 'transparent', color: on > .5 ? C.ink : 'rgba(192,198,204,.5)'}}>{w}</span>; })}
  </div>;
};

// ── relógio da montagem
const Hora: React.FC<{t: number}> = ({t}) => {
  const m = E('montagem'); const o = P(t, m.t0 - .1, .25) * (1 - P(t, m.t1 - .25, .25)); if (o <= 0) return null;
  const items: Array<[string, number]> = [['12:40', T.almoco], ['21:48', T.janta], ['SÁB 10:12', T.sabado]];
  const cur = items.reduce((a, it, i) => (t >= it[1] - .15 ? i : a), 0);
  return <div style={{position: 'absolute', left: 90, top: 450, fontFamily: HEAD, fontWeight: 800, fontSize: 120, letterSpacing: '-.02em', color: 'rgba(242,244,246,.22)', opacity: o, fontVariantNumeric: 'tabular-nums'}}>{items[cur][0]}</div>;
};

// ── método
const Metodo: React.FC<{t: number}> = ({t}) => {
  const m = E('metodo'); const a = P(t, m.t0 - .1, .4) * (1 - P(t, m.t1 - .3, .3)); if (a <= 0) return null;
  const plates: Array<[string, string, number]> = [['01', 'ENTENDER', T.ent], ['02', 'PLANEJAR', T.plan], ['03', 'DESENVOLVER', T.des]];
  return <AbsoluteFill style={{opacity: a}}>
    {plates.map(([n, w, ta], i) => { const p = P(t, ta - .25, .5, BACK), on = P(t, ta - .05, .25);
      return <div key={w} style={{position: 'absolute', left: 120, top: 760 + i * 220, width: 840, height: 170, borderRadius: 14, opacity: clamp(p * 2),
        transform: `perspective(1200px) rotateX(${((1 - p) * 40).toFixed(1)}deg) translateY(${((1 - p) * 40).toFixed(1)}px)`, background: on > .5 ? BLUE_PLATE : STEEL,
        border: '1.5px solid rgba(192,198,204,.5)', boxShadow: '0 24px 40px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', gap: 34, paddingLeft: 48}}>
        <span style={{fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: '.1em', color: 'rgba(242,244,246,.7)'}}>{n}</span>
        <span style={{fontFamily: HEAD, fontWeight: 800, fontSize: 68, color: C.ink}}>{w}</span></div>; })}
    {(() => { const s = P(t, T.sob - .1, .4, BACK); return s > 0 ? <div style={{position: 'absolute', left: 120, top: 1440, fontFamily: UI, fontWeight: 800, fontSize: 32, letterSpacing: '.22em', color: A, opacity: s}}>SOB MEDIDA</div> : null; })()}
  </AbsoluteFill>;
};

// ── logo DME (montagem das 4 peças)
const LOGO = [
  'M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z',
  'M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z',
  'M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z',
  'M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z',
];
const FROM = [[-260, 40], [0, -240], [260, -120], [180, 240]];
const Logo: React.FC<{t: number; t0: number; w: number; x: number; y: number}> = ({t, t0, w, x, y}) => (
  <svg viewBox="0 0 750 610" width={w} height={w * 610 / 750} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9AA1A8" /><stop offset=".35" stopColor="#E4E8EB" /><stop offset=".6" stopColor="#8A9198" /><stop offset="1" stopColor="#C0C6CC" /></linearGradient></defs>
    {LOGO.map((d, i) => { const p = P(t, t0 + i * .1, .55, BACK); return <path key={i} d={d} fill="url(#lg)" stroke="#F2F4F6" strokeOpacity=".35" strokeWidth="1.5"
      opacity={clamp(p * 2)} transform={`translate(${((1 - p) * FROM[i][0]).toFixed(1)} ${((1 - p) * FROM[i][1]).toFixed(1)})`} />; })}
    <text x="14" y="592" fontFamily="Manrope, sans-serif" fontWeight={600} fontSize="64" textLength="722" lengthAdjust="spacing" fill="#C0C6CC" opacity={P(t, t0 + .55, .4)}>TECHNOLOGY</text>
  </svg>
);

export const Film: React.FC<{audio?: boolean; still?: number}> = ({audio = true, still}) => {
  const f = useCurrentFrame(); const t = still !== undefined ? still : f / 30;
  const ag = E('agora'), met = E('metodo'), fe = E('fecho');
  const inv = P(t, ag.t0 - .05, .25) * (1 - P(t, ag.t1 - .25, .3, EASE_IN));          // virada: aço claro
  const graphO = (1 - .9 * P(t, met.t0 - .2, .4) * (1 - P(t, fe.t0 - .2, .4))) * (1 - P(t, T.cresc + 2.2, .5)) * (1 - inv);
  const dark = P(t, T.almoco - .2, 2.5) * (1 - P(t, ag.t0, .3));
  const sig = P(t, T.sig - .15, .6, EASE_IO);
  const loopT = T.cresc + 2.5;
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(192,198,204,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(192,198,204,.035) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 58%, rgba(38,75,113,.30) 0%, rgba(10,11,12,0) 70%)', opacity: 1 - .8 * dark}} />
      <Graph t={t} o={graphO} />
      <Notifs t={t} />
      <Hora t={t} />
      <Metodo t={t} />

      {/* ── textos */}
      <Phrase t={t} tin={-1} tout={E('sem').t1 - .25} segs={['Você abriu', '|', 'a empresa pra', '|', 'ter ', ['liberdade.']]} size={80} top={300} />
      <Phrase t={t} tin={T.hoje - .05} tout={E('sem').t1 - .25} segs={['Hoje, nada anda ', ['sem você.']]} size={56} top={590} />
      <Phrase t={t} tin={T.almoco - .05} tout={T.janta - .35} segs={['No almoço.']} size={90} top={320} />
      <Phrase t={t} tin={T.janta - .05} tout={T.sabado - .35} segs={['Na janta.']} size={90} top={320} />
      <Phrase t={t} tin={T.sabado - .05} tout={E('montagem').t1 - .25} segs={[['No sábado.']]} size={90} top={320} />
      <Phrase t={t} tin={E('gargalo').t0} tout={E('gargalo').t1 - .1} segs={['Você virou', '|', 'o ', ['gargalo'], ' da', '|', 'própria empresa.']} size={80} top={300} />
      <Phrase t={t} tin={T.crmQ - .3} tout={E('crm').t1 - .25} segs={['O retorno prometido?']} size={66} top={310} />
      <Phrase t={t} tin={T.crm - .1} tout={E('crm').t1 - .25} segs={['O CRM faz ', ['automático.']]} size={66} top={400} />
      <Phrase t={t} tin={T.agQ - .3} tout={E('agente').t1 - .25} segs={['Ligação fora', '|', 'do horário?']} size={66} top={290} />
      <Verbs t={t} tout={E('agente').t1 - .25} top={460} />
      <Phrase t={t} tin={T.proc - .2} tout={E('processo').t1 - .25} segs={['O que só você sabe', '|', 'vira ', ['processo.']]} size={66} top={310} />
      <Phrase t={t} tin={T.sis - .3} tout={E('integra').t1 - .25} segs={['Os sistemas', '|', ['conversam.']]} size={72} top={310} />
      <Phrase t={t} tin={T.dme - .2} tout={met.t1 - .3} segs={['A ', ['DME'], ' entende,', '|', 'planeja e desenvolve.']} size={66} top={330} />
      <Phrase t={t} tin={T.entao - .1} tout={loopT - .3} segs={['Enquanto você cuida', '|', 'do ', ['crescimento,']]} size={62} top={300} />
      <Phrase t={t} tin={T.segura - .1} tout={loopT - .3} segs={['o processo ', ['segura'], '|', 'a rotina.']} size={62} top={450} />
      <Phrase t={t} tin={loopT} tout={T.sig - .2} segs={['Você abriu', '|', 'a empresa pra', '|', 'ter ', ['liberdade.']]} size={80} top={700} />

      {/* virada */}
      {inv > 0 ? <AbsoluteFill style={{opacity: inv, background: 'linear-gradient(160deg, #D5DADF 0%, #C0C6CC 55%, #A9B0B7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 250, letterSpacing: '-.04em', color: '#0A0B0C', transform: `scale(${(1.08 - .08 * P(t, ag.t0, .6)).toFixed(3)})`}}>Agora</div></AbsoluteFill> : null}

      {/* ── assinatura (sem CTA) */}
      {sig > 0 ? <AbsoluteFill style={{opacity: sig}}>
        <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 45%, rgba(38,75,113,.55) 0%, rgba(10,11,12,.97) 80%)'}} />
        <Logo t={t} t0={T.sig + .05} w={600} x={540 - 300} y={560} />
        <Phrase t={t} tin={T.auto - .1} tout={99} segs={['Automatizamos processos.']} size={58} top={1140} align="center" color={C.silver} />
        <Phrase t={t} tin={T.dev - .1} tout={99} segs={[['Devolvemos tempo.']]} size={58} top={1214} align="center" color={C.silver} />
      </AbsoluteFill> : null}

      {audio ? <>
        <Audio src={staticFile('assets/audio/trilha.wav')} />
        {(TL.scenes as any[]).map((s) => <Sequence key={s.fala} from={Math.round(s.v0 * 30)}><Audio src={staticFile(`assets/audio/falas/${s.fala}.mp3`)} /></Sequence>)}
      </> : null}
    </AbsoluteFill>
  );
};
