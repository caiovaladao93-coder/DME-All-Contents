import React from 'react';
import {Composition} from 'remotion';
import {Cover} from './Cover';
import {DMEInstitutional} from './DMEInstitutional';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './data/scenes';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DMEInstitutional" component={DMEInstitutional} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Capa" component={Cover} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
