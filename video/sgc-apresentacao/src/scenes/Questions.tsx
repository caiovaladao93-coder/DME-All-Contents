import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme/colors';
import {HEAD, UI} from '../theme/typography';
import {EASE_IO, EASE_OUT, lerp, prog} from '../theme/animation';
import {InterfaceWindow, Seal, Skel} from '../components/InterfaceWindow';
import {ScreenHighlight} from '../components/ScreenHighlight';
import {AnimatedHeadline} from '../components/AnimatedHeadline';
import {BrandCorner, NavyStage} from './BrandIntroduction';
import {Img, staticFile} from 'remotion';
import {SCENES} from '../data/storyboard';
import {wordAt} from '../data/narration';

export const WIN = {x: 288, y: 190, w: 1344, h: 790};

/** Cabeçalho da página do diagnóstico (gerado; marca SGC). */
export const PageHeader: React.FC = () => (
  <div style={{height: 76, background: C.navy, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 16}}>
    <Img src={staticFile('assets/logo/sgc-logo-512.png')} style={{width: 46, height: 46, borderRadius: '50%'}} />
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 22, color: '#fff'}}>Diagnóstico de gestão</div>
    <div style={{flex: 1}} />
    <Skel w={90} h={10} c="rgba(255,255,255,.25)" /><Skel w={90} h={10} c="rgba(255,255,255,.25)" />
  </div>
);

/** Tela 1: a primeira seção da página (textos do roteiro). */
const Landing: React.FC<{f: number}> = ({f}) => {
  const caret = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.bg}}>
      <PageHeader />
      <div style={{position: 'absolute', left: 90, top: 140, width: 640}}>
        <div style={{display: 'inline-block', padding: '8px 16px', borderRadius: 20, background: 'rgba(248,106,20,.12)', fontFamily: UI, fontWeight: 700, fontSize: 16, letterSpacing: '.12em', color: C.orangeInk}}>DIAGNÓSTICO INICIAL</div>
        <div style={{marginTop: 26, fontFamily: HEAD, fontWeight: 700, fontSize: 50, lineHeight: 1.12, color: C.navy, letterSpacing: '-.01em'}}>Responda 10 perguntas e descubra a saúde da sua empresa.</div>
        <Skel w="86%" style={{marginTop: 34}} /><Skel w="64%" style={{marginTop: 14}} />
      </div>
      <div style={{position: 'absolute', left: 790, top: 130, width: 470, height: 520, borderRadius: 20, background: '#fff', boxShadow: '0 20px 50px rgba(10,32,72,.12)', padding: 36}}>
        <div style={{fontFamily: UI, fontWeight: 700, fontSize: 20, color: C.ink}}>Descreva seu negócio</div>
        <div style={{marginTop: 16, height: 210, borderRadius: 12, border: '1.5px solid #CBD5E1', padding: 18, fontFamily: UI, fontWeight: 500, fontSize: 18, color: '#98A2B3', position: 'relative'}}>
          <span style={{borderLeft: `2px solid ${caret ? C.navy : 'transparent'}`, paddingLeft: 6}}>Conte o que sua empresa faz…</span>
        </div>
        <div style={{marginTop: 26, height: 64, borderRadius: 12, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: UI, fontWeight: 700, fontSize: 21, color: C.navy}}>Quero receber o diagnóstico</div>
        <Skel w="70%" h={10} style={{margin: '26px auto 0'}} />
      </div>
    </div>
  );
};

/** Tela 2: questionário. As perguntas reais não estão no projeto, então o conteúdo é neutro (sem inventar perguntas). */
export const QuestionScreen: React.FC<{f: number; n: number}> = ({f, n}) => (
  <div style={{position: 'absolute', inset: 0, background: C.bg}}>
    <PageHeader />
    <div style={{position: 'absolute', left: 170, right: 170, top: 130}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 700, fontSize: 20, color: C.navy}}>
        <span>Pergunta {n} de 10</span><span style={{color: C.gray}}>{n * 10}%</span></div>
      <div style={{marginTop: 14, height: 10, borderRadius: 5, background: 'rgba(10,32,72,.1)'}}>
        <div style={{width: `${n * 10}%`, height: '100%', borderRadius: 5, background: C.orange}} /></div>
      <div style={{marginTop: 60, background: '#fff', borderRadius: 22, padding: '46px 50px', boxShadow: '0 20px 50px rgba(10,32,72,.10)'}}>
        <Skel w="78%" h={22} c="rgba(10,32,72,.75)" /><Skel w="52%" h={22} c="rgba(10,32,72,.75)" style={{marginTop: 16}} />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 46}}>
          {[0, 1, 2, 3].map((i) => { const sel = i === (n % 4); return (
            <div key={i} style={{height: 74, borderRadius: 14, border: `2px solid ${sel ? C.orange : '#D0D7E2'}`, background: sel ? 'rgba(248,106,20,.06)' : '#fff',
              display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px'}}>
              <i style={{width: 22, height: 22, borderRadius: '50%', border: `2px solid ${sel ? C.orange : '#98A2B3'}`, background: sel ? `radial-gradient(circle, ${C.orange} 45%, transparent 50%)` : 'none'}} />
              <Skel w={[180, 220, 150, 200][i]} h={14} /></div>); })}
        </div>
      </div>
    </div>
  </div>
);

export const Questions: React.FC = () => {
  const f = useCurrentFrame();
  const D = SCENES.questions.dur;
  const enter = prog(f, 0, 22, EASE_OUT);
  const swap = prog(f, 56, 16, EASE_IO); // máscara lateral: landing → perguntas
  const n = Math.max(1, Math.min(10, 1 + Math.floor(prog(f, 66, 44, (t) => t) * 9.999)));
  const zoom = prog(f, 92, D - 92, EASE_IO);
  const shift = prog(f, 92, 26, EASE_IO);
  const t10 = Math.max(96, wordAt('questions', 'dez') - 4);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: prog(f, 0, 10)}}>
      <NavyStage f={f} glowX={1600} glowY={900} />
      <BrandCorner />
      <div style={{position: 'absolute', inset: 0, transformOrigin: '42% 50%', transform: `translate(${lerp(0, -190, shift)}px, ${(1 - enter) * 45}px) scale(${(lerp(0.96, 1, enter) * lerp(1, 1.08, zoom)).toFixed(4)})`}}>
        <InterfaceWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h}>
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${swap * 100}% 0 0)`}}><Landing f={f} /></div>
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${(1 - swap) * 100}%)`}}><QuestionScreen f={f} n={n} /></div>
          {swap > 0 && swap < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - swap) * 100}%`, width: 3, background: C.orange}} /> : null}
          {/* destaque do campo de descrição */}
          <ScreenHighlight f={f} start={18} out={54} x={826} y={210} w={398} h={210} r={12} />
        </InterfaceWindow>
        <Seal style={{left: WIN.x + WIN.w - 250, top: WIN.y + WIN.h + 18}} />
      </div>
      <div style={{position: 'absolute', left: 1478, top: 360, width: 400}}>
        <AnimatedHeadline f={f} start={t10} text="[10]" size={210} style={{lineHeight: .9}} />
        <AnimatedHeadline f={f} start={t10 + 4} text="PERGUNTAS." size={50} tracking="0.02em" />
      </div>
    </div>
  );
};
