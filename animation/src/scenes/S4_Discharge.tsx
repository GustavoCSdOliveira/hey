import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Stage3D} from '../components3d/Stage3D';
import {Discharge3D} from './Discharge3D';
import {AppleTitle} from '../components/AppleTitle';
import {StepChip} from '../components/StepChip';
import {useMs} from '../lib/motion';

/** 9480–13500 ms · Descarga: alavanca abre a calha (≈0,5 s), fluxo vermelho enche o balde. */
export const S4Discharge: React.FC = () => {
  const ms = useMs();
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Stage3D from={{p: [4.5, 3.6, 12], l: [0, 2.2, 0.5]}} to={{p: [2.0, 3.0, 9.0], l: [-0.2, 2.0, 0.8]}} endMs={4020}>
        <Discharge3D ms={ms} flowOn={1000} flowOff={3800} fill={[[0, 0.05], [4000, 0.4]]}
          bucket={[[0, [3.2, 0.9, 3.2]], [700, [-0.3, 1.1, 1.75]], [4020, [-0.3, 1.1, 1.75]]]} tilt={[[0, 0], [4020, 0]]} />
      </Stage3D>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Descarregue." color="#1d1d1f" size={150} startMs={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150}}>
        <StepChip n="03" label="Saída controlada" dark={false} startMs={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
