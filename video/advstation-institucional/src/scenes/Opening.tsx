import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NavyBackground} from '../components/Atmosphere';
import {EditorialHeadline} from '../components/Editorial';
import {AnimatedStationLine, linePoint, Seg, Station} from '../components/StationMap';
import {wordAt} from '../data/narration';
import {C} from '../theme/colors';
import {EASE_IO, EASE_OUT, prog} from '../theme/animation';
import {SANS} from '../theme/typography';

/*
 * CENA 01 — Cada benefício, um caminho (com contexto):
 * um tronco dourado se divide em CINCO caminhos, um por benefício previdenciário. Pelos caminhos
 * surgem, na palavra falada, o que cada caso exige: etapas, documentos, pessoas, decisões.
 */
const NODE: [number, number] = [560, 600];
const TRUNK: Seg[] = [[[-30, 600], [200, 600], [400, 600], NODE]];
const YS = [290, 435, 580, 725, 870];
const END_X = 1180;
const BRANCH = (y: number): Seg[] => [[NODE, [760, 600], [920, y], [END_X, y]]];
const BENEFITS = ['SALÁRIO-MATERNIDADE', 'APOSENTADORIAS', 'BENEFÍCIOS POR INCAPACIDADE', 'PENSÃO POR MORTE', 'AUXÍLIO-ACIDENTE'];
const NEEDS = [{t: 'ETAPAS', w: 'etapas,', b: 0}, {t: 'DOCUMENTOS', w: 'documentos,', b: 1}, {t: 'PESSOAS', w: 'pessoas', b: 3}, {t: 'DECISÕES', w: 'decisões', b: 4}];

export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const trunk = prog(f, 4, 36, EASE_IO);
  const out = prog(f, 246, 24, EASE_IO);
  return (
    <AbsoluteFill style={{opacity: prog(f, 0, 12)}}>
      <NavyBackground />
      {/* grade editorial sutil */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.06}}>
        {Array.from({length: 13}).map((_, i) => <line key={i} x1={150 + i * 135} y1={0} x2={150 + i * 135} y2={1080} stroke="#fff" />)}
      </svg>
      <AbsoluteFill style={{transform: `translateX(${(-120 * out).toFixed(1)}px)`, opacity: 1 - out * 0.85}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <AnimatedStationLine segs={TRUNK} draw={trunk} />
          {YS.map((y, i) => {
            const d = prog(f, 36 + i * 6, 44, EASE_IO);
            const segs = BRANCH(y);
            return (
              <g key={i}>
                <AnimatedStationLine segs={segs} draw={d} width={i === 0 ? 3 : 2.2} dotT={d > 0.98 ? ((f - 90 + i * 17) % 90) / 90 : null} />
                {d > 0.97 ? <Station p={linePoint(segs, 0.999)} scale={0.8} opacity={prog(f, 84 + i * 6, 10)} /> : null}
              </g>
            );
          })}
          <circle cx={NODE[0]} cy={NODE[1]} r={8 * prog(f, 34, 10)} fill={C.gold} />
        </svg>
        {BENEFITS.map((b, i) => {
          const e = prog(f, 88 + i * 6, 16, EASE_OUT);
          return <div key={b} style={{position: 'absolute', left: END_X + 40, top: YS[i] - 16, opacity: e, transform: `translateX(${((1 - e) * 20).toFixed(1)}px)`,
            fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '.18em', color: C.white, whiteSpace: 'nowrap'}}>{b}</div>;
        })}
        {/* o que cada caminho exige — entra na palavra dita */}
        {NEEDS.map((n) => {
          const at = wordAt('opening', n.w);
          const e = prog(f, at, 14, EASE_OUT);
          const p = linePoint(BRANCH(YS[n.b]), 0.62);
          return (
            <div key={n.t} style={{position: 'absolute', left: p[0] - 8, top: p[1] - 50, opacity: e, transform: `translateY(${((1 - e) * 12).toFixed(1)}px)`,
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(194,155,60,.16)',
              border: '1px solid rgba(194,155,60,.7)', fontFamily: SANS, fontWeight: 800, fontSize: 16, letterSpacing: '.2em', color: '#F1DCA6'}}>{n.t}</div>
          );
        })}
      </AbsoluteFill>
      <EditorialHeadline text="Cada benefício|tem seu [caminho]." start={wordAt('opening', 'caminho') - 34} x={150} y={110} width={1000} size={84} modes={['fade', 'mask']} lineStagger={14} exit={250} />
      <div style={{position: 'absolute', left: 150, top: 330, width: 330, fontFamily: SANS, fontWeight: 600, fontSize: 26, lineHeight: 1.4, color: '#B9C4D6',
        opacity: prog(f, 150, 18) * (1 - prog(f, 250, 12))}}>
        Na advocacia previdenciária, cada benefício segue etapas, prazos e decisões próprias.
      </div>
    </AbsoluteFill>
  );
};
