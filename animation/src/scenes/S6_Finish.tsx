import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Stage3D} from '../components3d/Stage3D';
import {Discharge3D} from './Discharge3D';
import {AppleTitle} from '../components/AppleTitle';
import {useMs} from '../lib/motion';

/** 17000–22350 ms · Enchimento; o balde é erguido e inclinado para mostrar as sementes tratadas. */
export const S6Finish: React.FC = () => {
  const ms = useMs();
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Stage3D from={{p: [3.0, 3.2, 10.5], l: [0, 2.0, 0.8]}} to={{p: [0.6, 3.9, 8.6], l: [0.2, 2.5, 3.2]}} endMs={5350}>
        <Discharge3D ms={ms} flowOn={0} flowOff={3300} fill={[[0, 0.35], [3400, 0.9]]}
          bucket={[[0, [-0.3, 1.1, 1.75]], [3500, [-0.3, 1.1, 1.75]], [4600, [0.2, 2.3, 3.9]]]} tilt={[[0, 0], [3500, 0], [4600, 1.05]]} />
      </Stage3D>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Pronto." color="#1d1d1f" size={190} startMs={3700} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
