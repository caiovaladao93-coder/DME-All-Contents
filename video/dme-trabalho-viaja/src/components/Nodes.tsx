import React from 'react';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';

export type IconKey = 'check' | 'doc' | 'question' | 'gear' | 'user' | 'folder' | 'coin' | 'flag' | 'chat';
const PATHS: Record<IconKey, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5', doc: 'M7 3h7l4 4v14H7z M14 3v4h4 M9.5 12h6 M9.5 16h6', question: 'M9 9a3 3 0 1 1 4 2.8c-.7.3-1 1-1 1.7V15 M12 18.5v.2',
  gear: 'M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20.5c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5', folder: 'M3 7h6l2 2h10v10H3z', coin: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v8 M9.5 10h4 M9.5 14h5',
  flag: 'M6 21V4 M6 4h11l-2 4 2 4H6', chat: 'M4 5h16v11H9l-5 4z',
};
export const Icon: React.FC<{k: IconKey; size: number; color: string; rot?: number}> = ({k, size, color, rot = 0}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${rot}deg)`}}><path d={PATHS[k]} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/**
 * Elemento da operação. morph = 0: cartão de solicitação (pergunta); morph = 1: etapa (rótulo + papel).
 * waiting: anel azul pulsante (aguardando decisão). active: destaque azul (ação acontecendo).
 */
export const OpNode: React.FC<{x: number; y: number; scale?: number; opacity?: number; morph: number; ask?: string; icon: IconKey; label: string; label2?: string; relabel?: number; role?: string; roleIn?: number;
  waiting?: number; active?: number; t: number; blur?: number}> =
  ({x, y, scale = 1, opacity = 1, morph, ask, icon, label, label2, relabel = 0, role, roleIn = 0, waiting = 0, active = 0, t, blur = 0}) => {
    const w = 400, h = 118 + 6 * roleIn;
    const pulse = waiting > 0 ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
    return (
      <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity, transform: `scale(${scale.toFixed(4)})`, filter: blur > .05 ? `blur(${blur.toFixed(1)}px)` : undefined}}>
        {waiting > 0 ? <div style={{position: 'absolute', inset: -10 - 8 * pulse, borderRadius: 30 + 8 * pulse, border: `2px solid rgba(58,110,165,${(waiting * (0.9 - 0.6 * pulse)).toFixed(3)})`}} /> : null}
        <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: `linear-gradient(160deg, rgba(36,41,46,.92), rgba(20,23,26,.92))`,
          border: `1.5px solid ${active > .5 ? 'rgba(58,110,165,.95)' : 'rgba(192,198,204,.22)'}`, boxShadow: `0 24px 48px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07)${active > 0 ? `, inset 0 0 0 999px rgba(38,75,113,${(0.35 * active).toFixed(3)})` : ''}`,
          backdropFilter: 'blur(6px)'}} />
        <div style={{position: 'absolute', left: 22, top: '50%', marginTop: -32, width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: morph < .5 ? 'rgba(58,110,165,.22)' : 'rgba(192,198,204,.08)', border: `1.5px solid ${morph < .5 ? 'rgba(58,110,165,.8)' : 'rgba(192,198,204,.28)'}`}}>
          <Icon k={morph < .5 ? 'chat' : (relabel > .5 && (PATHS as any)[icon] ? icon : icon)} size={34} color={morph < .5 ? '#9fc0e3' : C.silver} rot={icon === 'gear' && morph >= .5 ? t * 90 * active : 0} />
        </div>
        {/* pergunta (solicitação) */}
        {ask ? <div style={{position: 'absolute', left: 104, right: 18, top: '50%', transform: `translateY(-50%) translateY(${(morph * -16).toFixed(1)}px)`, opacity: 1 - morph}}>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.ink, whiteSpace: 'nowrap'}}>{ask}</div>
          <div style={{fontFamily: UI, fontWeight: 500, fontSize: 22, color: C.soft, marginTop: 4}}>agora · precisa de você</div></div> : null}
        {/* etapa */}
        <div style={{position: 'absolute', left: 104, right: 14, top: '50%', transform: `translateY(-50%) translateY(${((1 - morph) * 16).toFixed(1)}px)`, opacity: morph}}>
          <div style={{position: 'relative', height: 44}}>
            <div style={{position: 'absolute', fontFamily: HEAD, fontWeight: 600, fontSize: 36, color: C.ink, whiteSpace: 'nowrap', letterSpacing: '-.01em', opacity: 1 - relabel, transform: `translateY(${(-relabel * 14).toFixed(1)}px)`}}>{label}</div>
            {label2 ? <div style={{position: 'absolute', fontFamily: HEAD, fontWeight: 600, fontSize: 36, color: C.ink, whiteSpace: 'nowrap', letterSpacing: '-.01em', opacity: relabel, transform: `translateY(${((1 - relabel) * 14).toFixed(1)}px)`}}>{label2}</div> : null}
          </div>
          {role ? <div style={{fontFamily: UI, fontWeight: 600, fontSize: 22, color: '#9fc0e3', marginTop: 4, opacity: roleIn, whiteSpace: 'nowrap'}}>{role}</div> : null}
        </div>
      </div>
    );
  };
