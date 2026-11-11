import React from 'react';
import {Composition, Still} from 'remotion';
import {Film} from './Film';
import TL from './data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DMEProcessosFluem" component={Film} durationInFrames={TL.frames} fps={30} width={1080} height={1920} defaultProps={{audio: true}} />
    <Still id="DMECapa" component={Film} width={1080} height={1920} defaultProps={{audio: false, still: 0}} />
  </>
);
