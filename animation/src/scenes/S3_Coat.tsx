import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Stage3D} from '../components3d/Stage3D';
import {Machine3D, DRUM} from '../components3d/Machine3D';
import {Hand3D} from '../components3d/Hand3D';
import {SeedInstances, drumSeeds} from '../components3d/SeedInstances';
import {AppleTitle} from '../components/AppleTitle';
import {StepChip} from '../components/StepChip';
import {path3 as path} from '../lib/path';
import {tween, useMs} from '../lib/motion';

/** 5970–9480 ms · Tratamento: câmera desce para vista de topo; gota vermelha do frasco tinge as sementes. Rack focus. */
export const S3Coat: React.FC = () => {
  const ms = useMs();
  const coat = tween(ms, 800, 3200);
  const drop = tween(ms, 350, 800);
  const h = path(ms, [[0, [3.2, 4.9, 0.3]], [500, [1.55, 4.75, 0.3]], [2200, [1.55, 4.75, 0.3]], [3000, [3.6, 5.2, 0.3]]]);
  const blur = tween(ms, 0, 900, 18, 0);
  return (
    <AbsoluteFill>
      <MeshBackground tone="dark" />
      <AbsoluteFill style={{filter: `blur(${blur}px)`}}>
        <Stage3D from={{p: [3.5, 7.5, 8.5], l: [DRUM.x, 3.4, 0]}} to={{p: [-0.3, 10.5, 1.4], l: [DRUM.x, 3.4, -0.1]}} endMs={3510} envIntensity={1.1} shadow={0}>
          <Machine3D led={1} />
          <SeedInstances seeds={drumSeeds(ms, [DRUM.x, 3.3, DRUM.z], 0.9, coat, 800)} size={0.06} />
          <Hand3D position={h} rotation={[0, 0, Math.PI / 2]} curl={0.7} pinch={0.9} />
          <mesh position={[1.0, 5.0, 0.3]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.08, 0.08, 0.4, 16]} /><meshPhysicalMaterial color="#d33" transparent opacity={0.7} roughness={0.1} /></mesh>
          {drop < 1 && drop > 0 && <mesh position={[DRUM.x + 0.1, 4.6 - drop * 1.3, 0.1]}><sphereGeometry args={[0.07, 16, 12]} /><meshStandardMaterial color="#e11" emissive="#a00" emissiveIntensity={0.8} /></mesh>}
        </Stage3D>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Cubra." size={170} startMs={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150}}>
        <StepChip n="02" label="Tratamento uniforme" startMs={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
