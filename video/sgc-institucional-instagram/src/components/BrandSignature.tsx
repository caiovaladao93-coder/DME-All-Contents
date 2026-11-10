import React from 'react';
import {Img, staticFile} from 'remotion';

/**
 * Logo oficial do SGC: camadas separadas do PNG oficial pelo próprio projeto do SGC (static/brand/simbolo-*.png,
 * mesma caixa de 532×700, feitas para o fundo marinho). Não é redesenhada nem recolorida.
 * part: 'full' (símbolo + SGC + subtítulo) ou 'mark' (símbolo + SGC, sem subtítulo).
 */
const LAYERS = ['crescente', 'pessoa', 'arco', 'ponto', 'palavra', 'subtitulo'];
export const BrandSignature: React.FC<{height: number; part?: 'full' | 'mark'; style?: React.CSSProperties}> = ({height, part = 'full', style}) => {
  const w = height * 532 / 700;
  return (
    <div style={{position: 'relative', width: w, height, ...style}}>
      {LAYERS.filter((l) => part === 'full' || l !== 'subtitulo').map((l) => (
        <Img key={l} src={staticFile(`assets/logo/simbolo-${l}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      ))}
    </div>
  );
};
