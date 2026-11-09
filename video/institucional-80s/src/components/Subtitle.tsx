import React from 'react';
import {useCurrentFrame} from 'remotion';
import narration from '../data/narration.json';
import {EASE_IN, EASE_OUT, prog} from '../theme/motion';
import {FONT_UI, T} from '../theme/typography';

type Chunk = {start: number; end: number; text: string; caption?: boolean};
export const CHUNKS: Chunk[] = (narration as any).chunks;

/** KineticCaption — legenda sincronizada à locução (blocos curtos, área segura inferior). */
export const Subtitle: React.FC<{yFor: (frame: number) => number}> = ({yFor}) => {
  const f = useCurrentFrame();
  const c = CHUNKS.find((k) => k.caption !== false && f >= k.start && f < k.end + 4);
  if (!c) return null;
  const e = prog(f, c.start, 6, EASE_OUT);
  const q = prog(f, c.end - 2, 6, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: yFor(f), textAlign: 'center', opacity: e * (1 - q),
      transform: `translateY(${((1 - e) * 10).toFixed(2)}px)`}}>
      <span style={{display: 'inline-block', fontFamily: FONT_UI, fontWeight: 600, fontSize: T.caption, lineHeight: 1.25, color: '#FFFFFF',
        padding: '10px 22px', borderRadius: 14, background: 'rgba(8,9,10,.55)',
        textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{c.text}</span>
    </div>
  );
};
