import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover} from './Cover';
import {Film} from './Film';
import TL from './data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="ADVDemo" component={Film} durationInFrames={TL.frames} fps={30} width={1080} height={1920} defaultProps={{audio: true}} />
  <Still id="ADVCapa" component={Cover} width={1080} height={1920} />
  </>
);
