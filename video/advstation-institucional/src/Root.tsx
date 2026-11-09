import React from 'react';
import {Composition} from 'remotion';
import {ADVStationFilm} from './ADVStationFilm';
import {Cover} from './Cover';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './data/storyboard';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ADVStationFilm" component={ADVStationFilm} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Capa" component={Cover} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
