import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Film} from './Film';
import {BrandMark} from './components/Brand';

/** Capa vertical: quadro real do filme (equipamento com a tela de clientes e o título) + marca oficial na versão escura do manual. */
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={-Math.round(11.6 * 30)}><Film audio={false} /></Sequence>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,27,51,0) 60%, rgba(14,27,51,.0) 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1580, display: 'flex', justifyContent: 'center'}}><BrandMark size={110} variant="dark" nameSize={34} /></div>
  </AbsoluteFill>
);
