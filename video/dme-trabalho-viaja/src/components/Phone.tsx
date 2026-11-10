import React from 'react';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';

/** Celular (protagonista): corpo de metal escovado grafite, tela de vidro fumê. Estado da tela por props. */
export const Phone: React.FC<{lit: number; notif: number; calm: number; count: number; glow: number}> = ({lit, notif, calm, count, glow}) => (
  <div style={{position: 'absolute', left: -150, top: -310, width: 300, height: 620, borderRadius: 46, padding: 12,
    background: 'linear-gradient(145deg, #4a5158 0%, #23282d 40%, #3a4047 70%, #16191c 100%)',
    boxShadow: `0 40px 80px rgba(0,0,0,.6), 6px 0 0 #1e2226, 0 0 0 1px rgba(192,198,204,.25), 0 0 ${(60 * glow).toFixed(0)}px rgba(58,110,165,${(0.35 * glow).toFixed(3)})`}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden', background: '#07090b'}}>
      {/* tela acesa */}
      <div style={{position: 'absolute', inset: 0, opacity: .38 + .62 * lit, background: 'linear-gradient(170deg, #1d3550 0%, #101b28 55%, #0a0e13 100%)'}}>
        <div style={{position: 'absolute', left: '50%', top: 16, width: 86, height: 24, marginLeft: -43, borderRadius: 12, background: '#050607'}} />
        <div style={{position: 'absolute', top: 92, width: '100%', textAlign: 'center', fontFamily: UI, fontWeight: 600, fontSize: 19, color: 'rgba(242,244,246,.8)'}}>sábado</div>
        <div style={{position: 'absolute', top: 116, width: '100%', textAlign: 'center', fontFamily: HEAD, fontWeight: 600, fontSize: 84, letterSpacing: '-.02em', color: '#F4F6F8'}}>15:42</div>
        {/* notificação (componente próprio, sem imitar app de terceiros) */}
        <div style={{position: 'absolute', left: 12, right: 12, top: 240, height: 104, borderRadius: 22, background: 'rgba(242,244,246,.15)', border: '1px solid rgba(242,244,246,.2)',
          opacity: notif * (1 - calm), transform: `translateY(${((1 - notif) * -30).toFixed(1)}px)`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px'}}>
          <div style={{width: 50, height: 50, flex: 'none', borderRadius: 14, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 26, color: '#fff'}}>{count}</div>
          <div><div style={{fontFamily: UI, fontWeight: 700, fontSize: 22, color: '#F4F6F8'}}>Equipe</div>
            <div style={{fontFamily: UI, fontWeight: 600, fontSize: 19, color: 'rgba(242,244,246,.78)', lineHeight: 1.2}}>{count > 1 ? `${count} pedidos esperando você` : 'Carla: pode aprovar?'}</div></div>
        </div>
        {/* depois: só a decisão que é do dono chega ao celular */}
        <div style={{position: 'absolute', left: 12, right: 12, top: 236, opacity: calm}}>
          <div style={{borderRadius: 22, background: 'rgba(242,244,246,.15)', border: '1px solid rgba(58,110,165,.7)', padding: '14px 14px 16px'}}>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: 18, letterSpacing: '.08em', color: '#a9c6e6'}}>SUA APROVAÇÃO</div>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: 22, color: '#F4F6F8', marginTop: 6, lineHeight: 1.2}}>Pagamento · Pedido 1042</div>
            <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 28, color: '#F4F6F8', marginTop: 4}}>R$ 4.870,00</div>
          </div>
          <div style={{marginTop: 14, textAlign: 'center', fontFamily: UI, fontWeight: 600, fontSize: 17, color: 'rgba(242,244,246,.7)'}}>
            <span style={{display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: C.accent, marginRight: 8, verticalAlign: 'middle'}} />demais etapas seguindo com a equipe</div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,0) 32%)'}} />
    </div>
  </div>
);
