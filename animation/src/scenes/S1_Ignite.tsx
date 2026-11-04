import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Stage3D} from '../components3d/Stage3D';
import {Machine3D} from '../components3d/Machine3D';
import {Hand3D} from '../components3d/Hand3D';
import {AppleTitle, Eyebrow} from '../components/AppleTitle';
import {path3 as path} from '../lib/path';
import {tween, useMs} from '../lib/motion';

/** 0–2000 ms · Ignição: mão enluvada aperta o botão (≈0,7 s), anel verde acende. */
export const S1Ignite: React.FC = () => {
  const ms = useMs();
  const h = path(ms, [[0, [7.5, 1.3, 1.9]], [650, [2.75, 1.05, 1.9]], [900, [2.62, 1.05, 1.9]], [1500, [7.5, 1.3, 1.9]]]);
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Stage3D from={{p: [1.5, 3.4, 15], l: [0, 2.3, 0]}} to={{p: [0.5, 3.1, 11.5], l: [0, 2.3, 0]}} endMs={2000}>
        <Machine3D led={tween(ms, 750, 1050)} />
        <Hand3D position={h} rotation={[0, 0, Math.PI / 2]} curl={0.55} />
      </Stage3D>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170, gap: 26}}>
        <Eyebrow text="Tratador de sementes" startMs={200} color="rgba(0,0,0,0.5)" />
        <AppleTitle text="DICALAB" startMs={350} size={190} color="#1d1d1f" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
