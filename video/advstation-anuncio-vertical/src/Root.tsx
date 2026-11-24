import React from 'react';
import {Composition} from 'remotion';
import {Film, DUR} from './Film';

export const RemotionRoot: React.FC = () => (
  <Composition id="ADVAnuncio" component={Film} durationInFrames={Math.round(DUR * 30)} fps={30} width={1080} height={1920} defaultProps={{audio: true}} />
);
