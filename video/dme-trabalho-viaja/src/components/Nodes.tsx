import React from 'react';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';

export type IconKey = 'check' | 'doc' | 'gear' | 'user' | 'folder' | 'coin' | 'flag' | 'chat' | 'box' | 'cart' | 'headset';
const PATHS: Record<IconKey, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5', doc: 'M7 3h7l4 4v14H7z M14 3v4h4 M9.5 12h6 M9.5 16h6',
  gear: 'M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20.5c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5', folder: 'M3 7h6l2 2h10v10H3z',
  coin: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v8 M9.5 10h4 M9.5 14h5', flag: 'M6 21V4 M6 4h11l-2 4 2 4H6', chat: 'M4 5h16v11H9l-5 4z',
  box: 'M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z M3 7.5l9 4.5 9-4.5 M12 12v9', cart: 'M3 4h3l2 11h10l2-8H7 M9 19.5a1 1 0 1 0 0 .1 M17 19.5a1 1 0 1 0 0 .1',
  headset: 'M4 14v-2a8 8 0 0 1 16 0v2 M4 14h3v5H5a1 1 0 0 1-1-1z M20 14h-3v5h2a1 1 0 0 0 1-1z',
};
export const Icon: React.FC<{k: IconKey; size: number; color: string; rot?: number}> = ({k, size, color, rot = 0}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${rot}deg)`}}><path d={PATHS[k]} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

type Face = {icon: IconKey; title: string; sub?: string; accent?: boolean};
/**
 * Elemento da operação com 3 faces que se substituem (sem sobrepor textos):
 *  a = solicitação (quem pede + pergunta) · b = área no anel (nome + o que está parado) · c = etapa do processo (etapa + detalhe).
 * ab: 0→1 troca a→b · bc: 0→1 troca b→c. waiting: anel pulsante (aguarda decisão). active: realce azul.
 */
export const OpNode: React.FC<{x: number; y: number; w: number; scale?: number; opacity?: number; a?: Face; b: Face; c?: Face; ab: number; bc: number;
  waiting?: number; active?: number; t: number}> = ({x, y, w, scale = 1, opacity = 1, a, b, c, ab, bc, waiting = 0, active = 0, t}) => {
  const h = 128;
  const pulse = waiting > 0 ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
  const faces: Array<[Face | undefined, number]> = [[a, a ? 1 - ab : 0], [b, (a ? ab : 1) * (c ? 1 - bc : 1)], [c, c ? bc : 0]];
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity, transform: `scale(${scale.toFixed(4)})`}}>
      {waiting > 0 ? <div style={{position: 'absolute', inset: -10 - 8 * pulse, borderRadius: 30 + 8 * pulse, border: `2.5px solid rgba(58,110,165,${(waiting * (0.95 - 0.6 * pulse)).toFixed(3)})`}} /> : null}
      <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: 'linear-gradient(160deg, rgba(38,43,48,.95), rgba(20,23,26,.95))',
        border: `1.5px solid ${active > .5 ? 'rgba(58,110,165,.95)' : 'rgba(192,198,204,.22)'}`,
        boxShadow: `0 24px 48px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07)${active > 0 ? `, inset 0 0 0 999px rgba(38,75,113,${(0.32 * active).toFixed(3)})` : ''}`}} />
      {faces.map(([fc, o], i) => !fc || o <= 0.01 ? null : (
        <div key={i} style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${((1 - o) * (i === 0 ? -10 : 10)).toFixed(1)}px)`}}>
          <div style={{position: 'absolute', left: 20, top: 30, width: 68, height: 68, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: fc.accent ? 'rgba(58,110,165,.25)' : 'rgba(192,198,204,.08)', border: `1.5px solid ${fc.accent ? 'rgba(58,110,165,.85)' : 'rgba(192,198,204,.28)'}`}}>
            <Icon k={fc.icon} size={36} color={fc.accent ? '#a9c6e6' : C.silver} rot={fc.icon === 'gear' ? t * 90 * active : 0} />
          </div>
          <div style={{position: 'absolute', left: 106, right: 16, top: 24}}>
            {i === 0 ? <div style={{fontFamily: UI, fontWeight: 700, fontSize: 26, color: '#a9c6e6', whiteSpace: 'nowrap'}}>{fc.sub}</div> : null}
            <div style={{fontFamily: i === 0 ? UI : HEAD, fontWeight: i === 0 ? 700 : 600, fontSize: i === 0 ? 34 : i === 1 ? 40 : 36, color: C.ink, whiteSpace: 'nowrap', letterSpacing: i === 0 ? 0 : '-.01em', marginTop: i === 0 ? 4 : 0}}>{fc.title}</div>
            {i > 0 && fc.sub ? <div style={{fontFamily: UI, fontWeight: 600, fontSize: i === 1 ? 30 : 25, color: i === 1 ? C.silver : '#a9c6e6', marginTop: 4, whiteSpace: 'nowrap'}}>{fc.sub}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
};
