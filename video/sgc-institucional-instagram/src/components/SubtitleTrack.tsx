import React from 'react';
import {useCurrentFrame} from 'remotion';
import {UI} from '../theme/typography';
import {NARRATION, voiceDur, voiceStart} from '../data/narration';
import {ORDER} from '../data/storyboard';

/** Legendas queimadas (composição "Legendado"); a versão principal sai limpa e a SRT vai à parte. */
export const SubtitleTrack: React.FC = () => {
  const f = useCurrentFrame();
  const k = ORDER.find((s) => f >= voiceStart(s) - 2 && f < voiceStart(s) + Math.ceil(voiceDur(s) * 30) + 6);
  if (!k) return null;
  return <div style={{position: 'absolute', left: 90, right: 90, top: 1460, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '14px 24px', borderRadius: 14, background: 'rgba(3,10,26,.78)', fontFamily: UI, fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: '#fff', textAlign: 'center'}}>
      {NARRATION[k]}</div></div>;
};
