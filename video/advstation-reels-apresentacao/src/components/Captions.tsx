import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SANS} from '../theme/typography';
import {VOICED} from '../data/storyboard';
import {text, voiceDur, voiceStart} from '../data/narration';

/** Legenda queimada opcional (composição "Legendado"); 42 px / 1,18, peso 700 (manual), acima da base segura. */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const k = VOICED.find((v) => f >= voiceStart(v) - 2 && f < voiceStart(v) + Math.ceil(voiceDur(v) * 30) + 6);
  if (!k) return null;
  return <div style={{position: 'absolute', left: 90, right: 90, top: 1600, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '12px 22px', borderRadius: 12, background: 'rgba(10,18,34,.82)', fontFamily: SANS, fontWeight: 700, fontSize: 34, lineHeight: 1.18, color: '#fff', textAlign: 'center'}}>{text(k)}</div></div>;
};
