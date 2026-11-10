import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IN, EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {CinematicImage} from '../components/CinematicImage';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

/** Mesa vista de cima (~60°, lente 35 mm simulada): notebook, papéis, anotações e caneta, tudo vetorial. */
const Desk: React.FC = () => (
  <div style={{position: 'absolute', left: -300, top: -250, width: 2520, height: 1700, transform: 'perspective(1800px) rotateX(32deg)', transformOrigin: '50% 60%',
    background: 'radial-gradient(ellipse 60% 55% at 50% 45%, #1A2C52 0%, #0F1D3C 55%, #070F22 100%)'}}>
    <div style={{position: 'absolute', inset: 0, opacity: .5, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.015) 0 2px, rgba(0,0,0,0) 2px 9px)'}} />
    {/* notebook */}
    <div style={{position: 'absolute', left: 1050, top: 330, width: 780, height: 500, borderRadius: 26, background: 'linear-gradient(160deg,#2A3346,#151C2B)', transform: 'rotate(-8deg)', boxShadow: '0 40px 80px rgba(0,0,0,.55)'}}>
      <div style={{position: 'absolute', left: 60, top: 40, right: 60, height: 270, borderRadius: 12, background: '#0B1530', overflow: 'hidden'}}>
        <svg width="660" height="270"><path d="M20 220 L120 170 L220 190 L320 120 L420 150 L520 80 L640 110" fill="none" stroke="rgba(130,180,240,.8)" strokeWidth="5"/>
          <path d="M20 240 L640 240" stroke="rgba(255,255,255,.15)" strokeWidth="2"/></svg></div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 340, height: 120, borderRadius: 10, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 38px, rgba(0,0,0,0) 38px 46px)'}} />
    </div>
    {/* papéis */}
    {[[520, 360, 9], [700, 520, -6], [380, 640, 3]].map(([x, y, r], i) => (
      <div key={i} style={{position: 'absolute', left: x, top: y, width: 420, height: 540, borderRadius: 6, background: '#E9EDF3', transform: `rotate(${r}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: 40}}>
        {[90, 70, 84, 60, 76, 50].map((w, j) => <div key={j} style={{width: `${w}%`, height: 12, borderRadius: 6, background: 'rgba(17,24,39,.18)', marginTop: j ? 22 : 0}} />)}
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 40, height: 130}}>
          {[50, 90, 70, 110, 60].map((h, j) => <div key={j} style={{width: 40, height: h, borderRadius: 4, background: j === 3 && i === 0 ? '#F2A06E' : 'rgba(10,32,72,.35)'}} />)}</div>
      </div>
    ))}
    {/* bloco de notas e caneta */}
    <div style={{position: 'absolute', left: 1880, top: 640, width: 300, height: 300, background: '#F6E8C9', transform: 'rotate(6deg)', boxShadow: '0 16px 30px rgba(0,0,0,.4)'}} />
    <div style={{position: 'absolute', left: 1820, top: 980, width: 380, height: 18, borderRadius: 9, background: 'linear-gradient(90deg,#0A2048,#2B3F6A)', transform: 'rotate(-24deg)'}} />
    {/* xícara */}
    <div style={{position: 'absolute', left: 300, top: 300, width: 170, height: 170, borderRadius: '50%', background: '#DDE3EC', boxShadow: '0 16px 30px rgba(0,0,0,.45)'}}>
      <div style={{position: 'absolute', inset: 22, borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%, #6B4226, #3A2213)'}} /></div>
  </div>
);

const CARDS = [
  {k: 'CUSTOS', icon: <path d="M4 7h16v10H4z M8 12h8" />, x: 360, word: 'custos'},
  {k: 'MARGEM', icon: <path d="M4 18l5-6 4 3 7-8" />, x: 790, word: 'margens'},
  {k: 'DECISÕES', icon: <path d="M12 3v6 M12 15v6 M5 12h4 M15 12h4 M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />, x: 1220, word: 'decisões'},
];

export const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.problem.dur;
  // entrada: linha laranja atravessa o quadro e revela a cena (padrão de transição 1)
  const wipe = prog(f, 0, 14, EASE_IO);
  const drift = prog(f, 52, 40, EASE_IO); // os cartões se afastam
  const conv = prog(f, D - 18, 18, EASE_IN); // e no fim se aproximam do centro
  const dark = prog(f, 96, 20) * 0.2;
  const tQ = Math.max(96, Math.min(D - 40, wordAt('problem', 'claros.') - 14));
  return (
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(100 - wipe * 100).toFixed(2)}% 0 0)`}}>
      <CinematicImage f={f} dur={D + 12} s0={1} s1={1.05} x0={30} x1={-40} y0={20} y1={-20}>
        <div style={{position: 'absolute', inset: 0, background: C.navyNight}} />
        <Desk />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(3,10,26,.15) 40%, rgba(3,10,26,.75) 100%)'}} />
      </CinematicImage>
      <div style={{position: 'absolute', inset: 0, background: `rgba(3,10,26,${0.35 + dark})`}} />
      {/* linhas pontilhadas incompletas entre os cartões */}
      <svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1].map((i) => {
          const a = CARDS[i].x + 340 + lerp(0, -60, drift) * (i === 0 ? 1 : -1) * 0, gapP = prog(f, 40 + i * 8, 20);
          const x0 = CARDS[i].x + 340 - drift * 40 * (i === 0 ? 1 : 0), x1 = CARDS[i + 1].x + drift * 40 * (i === 1 ? 1 : 0);
          const mid = (x0 + x1) / 2; void a;
          return <g key={i} opacity={gapP * (1 - conv)} stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeDasharray="6 10" strokeLinecap="round">
            <line x1={x0 + 10} y1={540} x2={mid - 30 - drift * 10} y2={540} /><line x1={mid + 30 + drift * 10} y1={540} x2={x1 - 10} y2={540} />
            <text x={mid} y={552} textAnchor="middle" fill={C.orange} stroke="none" fontFamily={HEAD} fontWeight={700} fontSize={34} opacity={drift}>?</text></g>;
        })}
      </svg>
      {CARDS.map((c, i) => {
        const tin = Math.max(6 + i * 8, Math.min(wordAt('problem', c.word) - 4, 40));
        const p = prog(f, tin, 16, EASE_OUT);
        const dx = (i - 1) * 60 * drift; // afastam
        const cx = lerp(c.x + dx, 790, conv) ; // convergem ao centro
        return (
          <div key={c.k} style={{position: 'absolute', left: cx, top: 450 + (1 - p) * 20, width: 340, height: 180, borderRadius: 22, opacity: p * (1 - conv * 0.6),
            background: 'linear-gradient(160deg, rgba(20,44,96,.92), rgba(10,28,64,.92))', border: '1.5px solid rgba(180,200,240,.25)',
            boxShadow: '0 30px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)', padding: '30px 32px', transform: `scale(${1 - conv * 0.15})`}}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
            <div style={{marginTop: 22, fontFamily: HEAD, fontWeight: 700, fontSize: 40, letterSpacing: '.06em', color: '#fff'}}>{c.k}</div>
            <div style={{marginTop: 12, width: 180, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.18)'}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, opacity: 1 - conv}}>
        <AnimatedHeadline f={f} start={tQ} text="FALTA [CLAREZA?]" size={92} align="center" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: UI, fontWeight: 700, fontSize: 20, letterSpacing: '.24em', color: 'rgba(255,255,255,.5)', opacity: prog(f, 10, 16) * (1 - conv)}}>
        O PROBLEMA INVISÍVEL</div>
      {/* a linha laranja que faz a transição */}
      {wipe > 0 && wipe < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${wipe * 100}%`, width: 3, marginLeft: -2, background: C.orange, boxShadow: '0 0 24px rgba(248,106,20,.5)'}} /> : null}
    </div>
  );
};
