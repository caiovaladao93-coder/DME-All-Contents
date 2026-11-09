import React from 'react';
import {useCurrentFrame} from 'remotion';
import {buildCues, GOLD_WORDS} from '../data/narration';
import {C} from '../theme/colors';
import {EASE_IN, EASE_OUT, prog} from '../theme/animation';
import {SANS} from '../theme/typography';

export const CUES = buildCues();

/** Legendas (manual: 42 px / 1,18, peso 700). Destaque dourado na palavra citada, aceso quando é falada. */
export const SubtitleTrack: React.FC = () => {
  const f = useCurrentFrame();
  const c = CUES.find((k) => k.caption && f >= k.start && f < k.end);
  if (!c) return null;
  const e = prog(f, c.start, 5, EASE_OUT);
  const q = prog(f, c.end - 4, 4, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 150, right: 150, bottom: 96, display: 'flex', justifyContent: 'center', opacity: e * (1 - q)}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.18, color: C.white, padding: '10px 26px', borderRadius: 12,
        background: 'rgba(14,27,51,.72)', textAlign: 'center', maxWidth: 1500}}>
        {c.words.map((w, i) => {
          const gold = GOLD_WORDS.has(w.w) || GOLD_WORDS.has(w.w.replace(/[.,:;]$/, ''));
          const said = f >= w.start - 1;
          return <span key={i} style={{color: gold && said ? C.gold : undefined, opacity: said ? 1 : 0.7}}>{w.w}{i < c.words.length - 1 ? ' ' : ''}</span>;
        })}
      </div>
    </div>
  );
};
