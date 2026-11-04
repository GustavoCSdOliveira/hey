import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Stage3D} from '../components3d/Stage3D';
import {Machine3D, Bucket3D, DRUM} from '../components3d/Machine3D';
import {Hand3D} from '../components3d/Hand3D';
import {SeedInstances, streamSeeds, drumSeeds} from '../components3d/SeedInstances';
import {AppleTitle} from '../components/AppleTitle';
import {StepChip} from '../components/StepChip';
import {path3 as path, path1} from '../lib/path';
import {tween, useMs} from '../lib/motion';

/** 2000–5970 ms · Carga: tampa abre, balde despeja sementes, mão fecha a tampa. */
export const S2Load: React.FC = () => {
  const ms = useMs();
  const lid = tween(ms, 0, 800) * (1 - tween(ms, 2900, 3600));
  const bp = path(ms, [[0, [4.5, 6.6, 1.4]], [800, [0.35, 5.25, 0.85]], [2300, [0.35, 5.25, 0.85]], [3000, [4.5, 6.6, 1.4]]]);
  const bt = path1(ms, [[0, 0], [800, 0], [1300, -1.25], [2200, -1.25], [2600, 0]]);
  const lh = path(ms, [[0, [-5, 5.3, 0.6]], [2600, [-5, 5.3, 0.6]], [3200, [-1.2, 4.9, 0.55]], [3600, [-1.2, 4.9, 0.55]], [4000, [-5, 5.3, 0.6]]]);
  const fall = streamSeeds(ms, [DRUM.x, 5.0, 0.35], [DRUM.x, 3.4, DRUM.z], 1250, 2300, 0, 160, 0.15);
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Stage3D from={{p: [1.5, 4.6, 13], l: [0, 3.3, 0]}} to={{p: [0.8, 5.0, 10.2], l: [-0.1, 3.7, 0]}} endMs={3970}>
        <Machine3D lid={lid} />
        <SeedInstances seeds={[...fall, ...drumSeeds(ms, [DRUM.x, 3.0, DRUM.z], 0.88, 0, 450).map((s, i) => (s && i / 450 < tween(ms, 1500, 2600) ? s : null))]} size={0.055} />
        <group position={bp} rotation={[bt, 0, 0]}><Bucket3D /></group>
        <Hand3D position={[bp[0] + 0.95, bp[1] + 0.7, bp[2]]} rotation={[0, 0, Math.PI / 2]} curl={0.9} />
        <Hand3D position={lh} rotation={[0, 0, -Math.PI / 2]} curl={0.2} mirror />
      </Stage3D>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Carregue." color="#1d1d1f" size={170} startMs={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150}}>
        <StepChip n="01" label="Carga do lote" dark={false} startMs={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
