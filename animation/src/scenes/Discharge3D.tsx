import React from 'react';
import {Machine3D} from '../components3d/Machine3D';
import {Bucket3D} from '../components3d/Machine3D';
import {Hand3D} from '../components3d/Hand3D';
import {SeedInstances, heapSeeds, streamSeeds} from '../components3d/SeedInstances';
import {path3 as path, path1} from '../lib/path';
import type {V3} from '../lib/path';

/** Conjunto compartilhado das cenas 4–6: máquina + mão na alavanca + mão segurando o balde + fluxo de sementes. */
export const Discharge3D: React.FC<{ms: number; flowOn: number; flowOff: number; fill: [number, number][]; bucket: [number, V3][]; tilt: [number, number][]}> = ({
  ms, flowOn, flowOff, fill, bucket, tilt,
}) => {
  const lever = path1(ms, [[0, 0], [500, 0], [1100, -0.55], [flowOff, -0.55], [flowOff + 500, 0]]);
  const bp = path(ms, bucket);
  const bt = path1(ms, tilt);
  const f = path1(ms, fill);
  return (
    <group>
      <Machine3D led={1} lever={lever} />
      {/* mão esquerda na alavanca */}
      <Hand3D position={[-1.75, 2.75 + lever * -0.15, 1.1]} rotation={[0, 0, -Math.PI / 2 + 0.2]} curl={0.85} mirror />
      {/* balde + mão direita */}
      <group position={bp} rotation={[bt, 0, 0]}>
        <Bucket3D>
          <SeedInstances seeds={heapSeeds(f, 1)} size={0.05} />
        </Bucket3D>
      </group>
      <Hand3D position={[bp[0] + 0.95, bp[1] + 0.75, bp[2] + 0.05]} rotation={[0, 0, Math.PI / 2 + 0.1]} curl={0.9} />
      <Hand3D position={[bp[0] + 0.4, bp[1] + 0.1, bp[2] + 0.95]} rotation={[0.9, 0, 0.6]} curl={0.7} mirror />
      <SeedInstances seeds={streamSeeds(ms, [-0.3, 2.0, 1.5], [-0.3, bp[1] + 0.2 + f * 0.7, bp[2]], flowOn, flowOff, 1, 150, 0.1)} size={0.05} />
    </group>
  );
};
