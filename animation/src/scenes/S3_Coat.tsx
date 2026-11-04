import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MeshBackground} from '../components/MeshBackground';
import {Camera, Focus} from '../components/Camera';
import {SeedField} from '../components/Seeds';
import {AppleTitle} from '../components/AppleTitle';
import {StepChip} from '../components/StepChip';
import {C} from '../lib/theme';
import {tween, useMs} from '../lib/motion';

/** 5970–9480 ms · Tratamento: macro top-down no tambor, gota vermelha cai, sementes tingem. Rack focus. */
export const S3Coat: React.FC = () => {
  const ms = useMs();
  const coat = tween(ms, 700, 3200);
  const drop = tween(ms, 300, 800);
  const blurBG = tween(ms, 0, 900, 22, 0);
  return (
    <AbsoluteFill>
      <MeshBackground tone="dark" />
      <Camera from={{s: 0.9, x: 0, y: 40, rx: 22, ry: 0}} to={{s: 1.25, x: 0, y: 40, rx: 0, ry: 0}} endMs={3510}>
        <Focus blur={blurBG}>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{position: 'relative', width: 820, height: 820, borderRadius: '50%', overflow: 'hidden',
              background: 'radial-gradient(circle at 35% 30%, #3a3a3c, #0b0b0d 70%)',
              boxShadow: 'inset 0 0 0 10px #8e8e93, inset 0 0 0 14px rgba(255,255,255,0.25), 0 60px 140px rgba(0,0,0,0.6)'}}>
              <div style={{position: 'absolute', left: 20, top: 20}}>
                <SeedField size={780} ms={ms} coat={coat} n={420} />
              </div>
              <div style={{position: 'absolute', left: '50%', top: `${tween(ms, 300, 800, -10, 50)}%`, width: 26, height: 40, marginLeft: -13,
                borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%', background: C.coated, opacity: drop * (1 - tween(ms, 780, 820)), boxShadow: `0 0 30px ${C.coated}`}} />
            </div>
          </AbsoluteFill>
        </Focus>
      </Camera>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <AppleTitle text="Cubra." size={170} startMs={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150}}>
        <StepChip n="02" label="Tratamento uniforme" startMs={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
