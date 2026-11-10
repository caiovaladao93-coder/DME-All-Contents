import React from 'react';
import {useCurrentFrame} from 'remotion';
import {UI} from '../theme/typography';
import {NARRATION, voiceDur, voiceStart} from '../data/narration';
import {ORDER} from '../data/storyboard';

/** Legendas queimadas (opcional; o filme principal sai sem elas e a SRT vai à parte). */
export const SubtitleTrack: React.FC = () => {
  const f = useCurrentFrame();
  const k = ORDER.find((s) => f >= voiceStart(s) - 2 && f < voiceStart(s) + Math.ceil(voiceDur(s) * 30) + 8);
  if (!k) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: 1400, padding: '12px 26px', borderRadius: 12, background: 'rgba(3,10,26,.72)', fontFamily: UI, fontWeight: 600, fontSize: 34, color: '#fff', textAlign: 'center'}}>
      {NARRATION[k]}</div></div>;
};
