import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import TL from './data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DMETrabalhoViaja" component={Film} durationInFrames={TL.frames} fps={30} width={1080} height={1920} defaultProps={{captions: true, audio: true}} />
    <Composition id="DMETrabalhoViajaSemLegenda" component={Film} durationInFrames={TL.frames} fps={30} width={1080} height={1920} defaultProps={{captions: false, audio: true}} />
  </>
);
