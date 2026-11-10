import React from 'react';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {Skel} from '../components/InterfaceWindow';
import {PageHeader} from './Questions';

/** Ícones do farol do SGC (forma + cor, design system): atenção = triângulo, crítico = losango. */
export const Farol: React.FC<{k: 'at' | 'cr'; s?: number}> = ({k, s = 26}) => k === 'at'
  ? <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2.5L22.5 21h-21z" fill={C.warm} /><path d="M12 9v5.5 M12 17.6v.4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
  : <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 1.5L22.5 12 12 22.5 1.5 12z" fill={C.danger} /><path d="M9 9l6 6 M15 9l-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>;
const Check: React.FC = () => <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill={C.navy} /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/**
 * Tela de resultado (gerada). blur > 0 = prévia protegida. O índice é um valor DEMONSTRATIVO (selo na cena);
 * os pontos de atenção e as recomendações aparecem como linhas neutras, sem inventar conteúdo.
 * Áreas (coordenadas dentro da janela, abaixo da barra do navegador): índice {x:60,y:150,w:400,h:440}, pontos {x:500,...}.
 */
export const AREA = {
  index: {x: 60, y: 150, w: 400, h: 440}, points: {x: 500, y: 150, w: 380, h: 440}, recs: {x: 910, y: 150, w: 380, h: 440},
  button: {x: 472, y: 620, w: 400, h: 72}, pdf: {x: 1104, y: 96, w: 190, h: 50},
};
export const ResultScreen: React.FC<{blur: number; value?: number; ring?: number; showButton?: boolean; showPdf?: boolean; title?: string}> =
  ({blur, value = 72, ring = 0.72, showButton = true, showPdf = false, title = 'Prévia do seu diagnóstico'}) => {
    const box: React.CSSProperties = {position: 'absolute', background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(10,32,72,.10)', padding: 32};
    const bl = blur > 0.05 ? `blur(${blur}px)` : undefined;
    return (
      <div style={{position: 'absolute', inset: 0, background: C.bg}}>
        <PageHeader />
        <div style={{position: 'absolute', left: 60, top: 100, fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.navy}}>{title}</div>
        {showPdf ? <div style={{position: 'absolute', left: AREA.pdf.x, top: AREA.pdf.y, width: AREA.pdf.w, height: AREA.pdf.h, borderRadius: 12, border: `2px solid ${C.orange}`, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: UI, fontWeight: 700, fontSize: 19, color: C.navy}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11 M7 10l5 5 5-5 M5 20h14" /></svg>Baixar PDF</div> : null}
        <div style={{...box, left: AREA.index.x, top: AREA.index.y, width: AREA.index.w, height: AREA.index.h}}>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 16, letterSpacing: '.14em', color: C.gray}}>ÍNDICE DE SAÚDE</div>
          <div style={{position: 'relative', width: 260, height: 260, margin: '34px auto 0', filter: bl}}>
            <svg width="260" height="260" viewBox="0 0 260 260"><circle cx="130" cy="130" r="108" fill="none" stroke="rgba(10,32,72,.08)" strokeWidth="22" />
              <circle cx="130" cy="130" r="108" fill="none" stroke={C.orange} strokeWidth="22" strokeLinecap="round" pathLength={1} strokeDasharray={`${ring} 1`} transform="rotate(-90 130 130)" /></svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: C.navy}}>
              {value}<span style={{fontSize: 38, marginTop: 20}}>%</span></div>
          </div>
          <div style={{filter: bl}}><Skel w="70%" h={12} style={{margin: '26px auto 0'}} /></div>
        </div>
        {[['PONTOS DE ATENÇÃO', AREA.points, 'p'], ['RECOMENDAÇÕES INICIAIS', AREA.recs, 'r']].map(([t, a, k]: any) => (
          <div key={k} style={{...box, left: a.x, top: a.y, width: a.w, height: a.h}}>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: 16, letterSpacing: '.14em', color: C.gray}}>{t}</div>
            <div style={{filter: bl}}>
              {[0, 1, 2].map((i) => <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: i ? 34 : 36}}>
                {k === 'p' ? <Farol k={i === 1 ? 'cr' : 'at'} /> : <Check />}
                <div style={{flex: 1}}><Skel w="92%" h={14} c="rgba(10,32,72,.55)" /><Skel w="70%" h={11} style={{marginTop: 12}} /><Skel w="52%" h={11} style={{marginTop: 10}} /></div></div>)}
            </div>
          </div>
        ))}
        {blur > 0.05 ? <div style={{position: 'absolute', left: 60, top: 150, width: 1230, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
          <div style={{width: 84, height: 84, borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px rgba(10,32,72,.35)', opacity: Math.min(1, blur / 6)}}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></div></div> : null}
        {showButton ? <div style={{position: 'absolute', left: AREA.button.x, top: AREA.button.y, width: AREA.button.w, height: AREA.button.h, borderRadius: 14, background: C.orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 23, color: C.navy, overflow: 'hidden'}} id="btn">Descobrir minha saúde</div> : null}
      </div>
    );
  };
