import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Camera} from '../components/Camera';
import {Machine, Bucket} from '../components/Machine';
import {SeedStream} from '../components/Seeds';
import {AppleTitle} from '../components/AppleTitle';
import {tween, useMs} from '../lib/motion';

/** 17000–22350 ms · Enchimento: plano aberto, balde sobe (0,6–3,6 s); câmera inclina para o topo (3,7 s). */
export const S6Finish: React.FC = () => {
  const ms = useMs();
  return (
    <AbsoluteFill>
      <MeshBackground tone="light" />
      <Camera from={{s: 1.0, x: 0, y: 140, rx: 0, ry: 5}} to={{s: 1.5, x: 0, y: 380, rx: 38, ry: 0}} startMs={0} endMs={5350}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'relative'}}>
            <Machine led={1} chute={1} />
            <div style={{position: 'absolute', left: 190, top: 560}}>
              <Bucket width={380} fill={tween(ms, 0, 3600, 0.4, 0.95)} />
            </div>
            <div style={{position: 'absolute', inset: 0}}>
              <SeedStream x0={300} y0={300} x1={380} y1={560} ms={ms} on={0} off={3400} coat={1} n={120} size={8} spread={20} />
            </div>
          </div>
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Pronto." color="#1d1d1f" size={190} startMs={3700} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
