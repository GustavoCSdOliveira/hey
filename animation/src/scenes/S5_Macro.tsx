import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Stage3D} from '../components3d/Stage3D';
import {Discharge3D} from './Discharge3D';
import {AppleTitle} from '../components/AppleTitle';
import {tween, useMs} from '../lib/motion';

/** 13500–17000 ms · Macro extremo da calha e do fluxo. Rack focus: início desfocado → nítido nas sementes. */
export const S5Macro: React.FC = () => {
  const ms = useMs();
  return (
    <AbsoluteFill>
      <MeshBackground tone="dark" />
      <AbsoluteFill style={{filter: `blur(${tween(ms, 0, 900, 16, 0)}px)`}}>
        <Stage3D from={{p: [-3.2, 3.0, 8.2], l: [-0.5, 2.0, 1.5]}} to={{p: [-1.8, 2.5, 6.4], l: [-0.4, 1.8, 1.6]}} endMs={3500} fov={34} envIntensity={1.1}>
          <Discharge3D ms={ms + 2400} flowOn={0} flowOff={9000} fill={[[0, 0.3], [3500, 0.55]]}
            bucket={[[0, [-0.3, 1.1, 1.75]], [3500, [-0.3, 1.1, 1.75]]]} tilt={[[0, 0], [3500, 0]]} />
        </Stage3D>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 220}}>
        <AppleTitle text="Cada semente. Uniforme." size={110} startMs={900} fromWeight={100} toWeight={600} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
