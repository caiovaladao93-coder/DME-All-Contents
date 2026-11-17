import React from 'react';
import {Composition, Still} from 'remotion';
import {Film} from './Film';
import TL from './data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DezSegundosEp1" component={Film} durationInFrames={TL.frames} fps={30} width={1080} height={1920} defaultProps={{audio: true}} />
    <Still id="DezSegundosCapa" component={Film} width={1080} height={1920} defaultProps={{audio: false, still: 6.6}} />
  </>
);
