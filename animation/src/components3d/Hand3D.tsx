import React, {useMemo} from 'react';
import {roundedBoxGeo} from './geo';

const Glove = () => <meshStandardMaterial color="#0c0c0e" roughness={0.38} metalness={0.05} />;

const Finger: React.FC<{x: number; len: number; curl: number}> = ({x, len, curl}) => (
  <group position={[x, 0.56, 0]} rotation={[-curl * 1.15, 0, 0]}>
    <mesh position={[0, len * 0.5, 0]} castShadow><capsuleGeometry args={[0.052, len, 6, 12]} /><Glove /></mesh>
    <group position={[0, len + 0.05, 0]} rotation={[-curl * 1.3, 0, 0]}>
      <mesh position={[0, len * 0.4, 0]} castShadow><capsuleGeometry args={[0.048, len * 0.8, 6, 12]} /><Glove /></mesh>
    </group>
  </group>
);

/** Mão enluvada (nitrilo preto) + manga branca canelada. Dedos apontam +Y; antebraço estende em −Y. `curl` 0–1, `pinch` 0–1. */
export const Hand3D: React.FC<{position: [number, number, number]; rotation?: [number, number, number]; curl?: number; pinch?: number; mirror?: boolean}> = ({
  position, rotation = [0, 0, 0], curl = 0.25, pinch = 0, mirror = false,
}) => {
  const palm = useMemo(() => roundedBoxGeo(0.5, 0.6, 0.17, 0.06), []);
  return (
    <group position={position} rotation={rotation} scale={[mirror ? -1 : 1, 1, 1]}>
      <mesh geometry={palm} position={[0, 0.3, 0]} castShadow><Glove /></mesh>
      {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
        <Finger key={i} x={x} len={[0.2, 0.25, 0.23, 0.18][i]} curl={i === 0 ? Math.max(curl, pinch * 0.75) : curl} />
      ))}
      <group position={[0.3, 0.2, 0.02]} rotation={[0, 0, -0.7 + pinch * 0.45]}>
        <mesh position={[0, 0.2, 0]} castShadow><capsuleGeometry args={[0.06, 0.3, 6, 12]} /><Glove /></mesh>
      </group>
      <mesh position={[0, -0.1, 0]} castShadow><cylinderGeometry args={[0.23, 0.25, 0.4, 28]} /><Glove /></mesh>
      <mesh position={[0, -1.75, 0]} castShadow><cylinderGeometry args={[0.27, 0.3, 3.0, 36]} /><meshStandardMaterial color="#f1f0f2" roughness={0.85} /></mesh>
    </group>
  );
};
