import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Camera, Focus} from '../components/Camera';
import {SeedStream} from '../components/Seeds';
import {AppleTitle} from '../components/AppleTitle';
import {tween, useMs} from '../lib/motion';

/** 13500–17000 ms · Macro extremo (close do vídeo, 13,5 s): calha inox + fluxo. Rack focus: calha → sementes. */
export const S5Macro: React.FC = () => {
  const ms = useMs();
  const chuteBlur = tween(ms, 600, 1500, 0, 14);
  const streamBlur = tween(ms, 0, 1000, 14, 0);
  return (
    <AbsoluteFill>
      <MeshBackground tone="dark" />
      <Camera from={{s: 1.5, x: -60, y: -60, rx: 10, ry: -14}} to={{s: 1.9, x: -120, y: 0, rx: 4, ry: -6}} endMs={3500}>
        <Focus blur={chuteBlur}>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 760, height: 520, transform: 'skewY(-14deg)', borderRadius: 24,
              background: 'linear-gradient(135deg,#f2f2f7 0%,#8e8e93 40%,#3a3a3c 60%,#c7c7cc 100%)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.8), 0 60px 120px rgba(0,0,0,0.6)'}} />
          </AbsoluteFill>
        </Focus>
        <Focus blur={streamBlur}>
          <SeedStream x0={440} y0={700} x1={560} y1={1250} ms={ms} on={0} off={3200} coat={1} n={160} size={14} spread={50} />
        </Focus>
      </Camera>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 220}}>
        <AppleTitle text="Cada semente. Uniforme." size={110} startMs={900} fromWeight={100} toWeight={600} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
