import React from 'react';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_OUT, P, lerp} from '../theme/motion';

/* Ícones de linha próprios (24 px de grade). */
export type IconKey = 'user' | 'flow' | 'shield' | 'history' | 'file' | 'bolt' | 'arrow' | 'check' | 'phone' | 'x';
const PATHS: Record<IconKey, string> = {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
  flow: 'M5 6h6M5 12h14M5 18h9M15 3l3 3-3 3',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5',
  history: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4l3 2',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  bolt: 'M13 2L5 14h6l-1 8 8-12h-6l1-8z',
  arrow: 'M4 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  phone: 'M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a3 3 0 0 1-3 3A16 16 0 0 1 3 6a3 3 0 0 1 3-3z',
  x: 'M6 6l12 12M18 6L6 18',
};
export const Icon: React.FC<{k: IconKey; size?: number; color?: string; w?: number}> = ({k, size = 28, color = C.silver, w = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={PATHS[k]} /></svg>
);

export type Row = {icon: IconKey; label: string; value: string; at: number; tone?: 'human' | 'auto' | 'file' | 'go'};
export type Req = {id: string; initial: string; color: string; name: string; area: string; msg: string; title: string; rows: Row[]; status?: {text: string; at: number}};

export const CARD_W = 800;
export const NOTIF_H = 196;
const ROW_H = 66, HEAD_H = 186;
export const cardHeight = (r: Req, t: number, m: number) => lerp(NOTIF_H, HEAD_H + 22 + r.rows.reduce((a, row) => a + ROW_H * P(t, row.at, .45), 0), m);

/**
 * O MESMO cartão é notificação (m = 0, linguagem de notificação de celular: vidro translúcido, remetente · área, mensagem)
 * e atividade do fluxo (m = 1: responsável, etapa, regras e status). O cabeçalho (avatar + remetente) permanece igual
 * nas duas faces para o espectador reconhecer a transformação.
 */
export const ReqCard: React.FC<{r: Req; t: number; m: number; x: number; y: number; k: number; o?: number; dim?: number; focus?: number}> = ({r, t, m, x, y, k, o = 1, dim = 0, focus = 0}) => {
  const h = cardHeight(r, t, m);
  if (o <= .003) return null;
  const st = r.status ? P(t, r.status.at, .4) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: CARD_W, height: h, transform: `scale(${k.toFixed(4)})`, transformOrigin: '0 0', opacity: o}}>
      {/* corpo: vidro claro translúcido → grafite do fluxo */}
      <div style={{position: 'absolute', inset: 0, borderRadius: lerp(42, 30, m), background: `rgba(${lerp(58, 28, m)},${lerp(66, 31, m)},${lerp(78, 34, m)},${lerp(.9, .96, m)})`,
        border: `1.5px solid rgba(${lerp(236, 58, m)},${lerp(240, 110, m)},${lerp(246, 165, m)},${lerp(.2, .35 + .4 * focus, m)})`,
        boxShadow: `0 ${lerp(14, 24, m)}px ${lerp(34, 60, m)}px rgba(0,0,0,.45)`}} />
      <div style={{position: 'absolute', left: 0, top: 26, bottom: 26, width: 6, borderRadius: 3, background: C.accent, opacity: m}} />
      {/* cabeçalho persistente */}
      <div style={{position: 'absolute', left: 28, top: lerp(56, 30, m), width: 84, height: 84, borderRadius: 42, background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: '#fff'}}>{r.initial}</div>
      <div style={{position: 'absolute', left: 134, right: 28, top: lerp(38, 34, m), display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <span style={{fontFamily: UI, fontWeight: 700, fontSize: 33, color: '#F4F6F8'}}>{r.name}<span style={{fontWeight: 600, color: 'rgba(244,246,248,.62)'}}> · {r.area}</span></span>
        <span style={{fontFamily: UI, fontWeight: 600, fontSize: 26, color: 'rgba(244,246,248,.55)', opacity: 1 - m}}>agora</span>
      </div>
      {/* mensagem (notificação) ↔ título da atividade */}
      <div style={{position: 'absolute', left: 134, right: 28, top: 88, fontFamily: UI, fontWeight: 600, fontSize: 33, lineHeight: 1.2, color: 'rgba(244,246,248,.9)', opacity: 1 - P(m, .1, .4)}}>{r.msg}</div>
      <div style={{position: 'absolute', left: 134, right: 28, top: 88, fontFamily: HEAD, fontWeight: 600, fontSize: 38, letterSpacing: '-.01em', color: '#F4F6F8', opacity: P(m, .45, .5),
        transform: `translateY(${((1 - P(m, .45, .5)) * 10).toFixed(1)}px)`}}>{r.title}</div>
      {/* status (benefício: encaminhada / disponível / definida) */}
      {r.status ? <div style={{position: 'absolute', right: 26, top: 30, padding: '6px 16px', borderRadius: 18, background: C.accent, fontFamily: UI, fontWeight: 700, fontSize: 22, color: '#fff',
        opacity: st, transform: `translateX(${((1 - st) * 30).toFixed(1)}px)`}}>{r.status.text}</div> : null}
      {/* linhas do fluxo */}
      {m > .02 ? <div style={{position: 'absolute', left: 28, right: 28, top: HEAD_H, opacity: m}}>
        {r.rows.map((row, i) => {
          const p = P(t, row.at, .45), q = P(t, row.at + .15, .5);
          if (p <= 0) return null;
          const hi = row.tone === 'human' ? '#d9c7a3' : row.tone === 'auto' || row.tone === 'go' ? '#9fc0e3' : row.tone === 'file' ? '#cfe0f2' : C.silver;
          return (
            <div key={i} style={{height: ROW_H * p, overflow: 'hidden'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, height: ROW_H, borderTop: '1px solid rgba(192,198,204,.12)', opacity: q, transform: `translateX(${((1 - q) * 24).toFixed(1)}px)`}}>
                <div style={{width: 46, height: 46, flex: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: row.tone === 'file' ? 'rgba(58,110,165,.35)' : 'rgba(192,198,204,.08)', border: row.tone === 'file' ? '1px solid rgba(159,192,227,.6)' : 'none'}}>
                  <Icon k={row.icon} size={26} color={hi} />
                </div>
                <span style={{fontFamily: UI, fontWeight: 600, fontSize: 25, color: 'rgba(192,198,204,.7)', width: 196, flex: 'none'}}>{row.label}</span>
                <span style={{fontFamily: UI, fontWeight: 700, fontSize: 28, color: row.tone === 'human' ? '#e9dcc0' : '#F4F6F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{row.value}</span>
                {row.tone === 'auto' ? <span style={{marginLeft: 'auto', flex: 'none', width: 38, height: 38, borderRadius: 19, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${P(t, row.at + .35, .35, EASE_OUT).toFixed(3)})`}}><Icon k="check" size={24} color="#fff" w={3} /></span> : null}
              </div>
            </div>
          );
        })}
      </div> : null}
      {dim > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: lerp(42, 30, m), background: '#0A0B0C', opacity: dim}} /> : null}
    </div>
  );
};

/** Papel de parede discreto (gerado): mar ao entardecer, tratado em grafite e azul DME. */
export const Wallpaper: React.FC<{lit: number}> = ({lit}) => (
  <div style={{position: 'absolute', inset: 0, filter: `brightness(${(.28 + .72 * lit).toFixed(3)})`}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0f1824 0%, #1f3249 34%, #4c5f78 52%, #b99a7c 60%, #2a3a4d 62%, #172331 78%, #0b1118 100%)'}} />
    <div style={{position: 'absolute', left: '62%', top: '58.6%', width: 300, height: 300, transform: 'translate(-50%,-50%)', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,226,190,.7) 0%, rgba(255,210,160,.25) 40%, rgba(255,200,150,0) 70%)'}} />
    {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: `${54 + (i % 3) * 4}%`, top: `${64 + i * 2.6}%`, width: 150 - i * 18, height: 5, borderRadius: 3, background: 'rgba(255,220,180,.25)'}} />)}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,12,.15) 0%, rgba(10,11,12,0) 30%, rgba(10,11,12,.35) 100%)'}} />
  </div>
);

/** Relógio da tela bloqueada. */
export const LockClock: React.FC<{o?: number}> = ({o = 1}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', color: '#F4F6F8', opacity: o}}>
    <div style={{fontFamily: UI, fontWeight: 600, fontSize: 38, color: 'rgba(244,246,248,.82)'}}>sábado, 12 de julho</div>
    <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 250, lineHeight: 1, letterSpacing: '-.035em', marginTop: 4}}>15:42</div>
  </div>
);

/** Ligação recebida (componente próprio, sem reproduzir a interface de um aplicativo específico). */
export const CallBanner: React.FC<{p: number; t: number}> = ({p, t}) => {
  if (p <= 0) return null;
  const ring = .5 + .5 * Math.sin(t * Math.PI * 4);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 118, height: 176, borderRadius: 60, background: 'rgba(22,25,29,.96)', border: '1.5px solid rgba(236,240,246,.16)',
      opacity: Math.min(1, p * 2), transform: `translateY(${((1 - p) * -60).toFixed(1)}px) scale(${lerp(.92, 1, p).toFixed(3)})`, boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
      <div style={{position: 'absolute', left: 26, top: 38, width: 100, height: 100, borderRadius: 50, background: '#3c4652', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 0 ${(6 + 8 * ring).toFixed(1)}px rgba(58,110,165,${(.18 + .2 * ring).toFixed(3)})`}}><Icon k="phone" size={46} color="#F4F6F8" /></div>
      <div style={{position: 'absolute', left: 150, top: 40}}>
        <div style={{fontFamily: UI, fontWeight: 700, fontSize: 38, color: '#F4F6F8'}}>Empresa</div>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 28, color: 'rgba(244,246,248,.6)', marginTop: 2}}>ligação</div>
      </div>
      <div style={{position: 'absolute', right: 150, top: 43, width: 90, height: 90, borderRadius: 45, background: '#8a3b3b', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="x" size={40} color="#fff" w={3} /></div>
      <div style={{position: 'absolute', right: 34, top: 43, width: 90, height: 90, borderRadius: 45, background: '#3d7a55', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="phone" size={40} color="#fff" /></div>
    </div>
  );
};
