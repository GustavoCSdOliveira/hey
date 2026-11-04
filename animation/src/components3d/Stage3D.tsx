import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {PMREMGenerator} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {useVideoConfig} from 'remotion';
import {appleInOut, tween, useMs} from '../lib/motion';
import type {V3} from '../lib/path';

const Env: React.FC<{intensity: number}> = ({intensity}) => {
  const {gl, scene} = useThree();
  const tex = useMemo(() => new PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture, [gl]);
  scene.environment = tex;
  scene.environmentIntensity = intensity;
  return null;
};

export type CamKey = {p: V3; l: V3};
const Rig: React.FC<{from: CamKey; to: CamKey; endMs: number}> = ({from, to, endMs}) => {
  const ms = useMs();
  const {camera} = useThree();
  const k = (a: number, b: number) => tween(ms, 0, endMs, a, b, appleInOut);
  useLayoutEffect(() => {
    camera.position.set(k(from.p[0], to.p[0]), k(from.p[1], to.p[1]), k(from.p[2], to.p[2]));
    camera.lookAt(k(from.l[0], to.l[0]), k(from.l[1], to.l[1]), k(from.l[2], to.l[2]));
    camera.updateProjectionMatrix();
  });
  return null;
};

/** Palco 3D transparente: luz de estúdio (key/rim/fill), reflexos de ambiente, sombra de contato e câmera animada. */
export const Stage3D: React.FC<{from: CamKey; to: CamKey; endMs: number; fov?: number; envIntensity?: number; shadow?: number; children: React.ReactNode}> = ({
  from, to, endMs, fov = 42, envIntensity = 0.9, shadow = 0.28, children,
}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{fov, near: 0.1, far: 80, position: from.p}} style={{position: 'absolute', inset: 0}}>
      <Env intensity={envIntensity} />
      <Rig from={from} to={to} endMs={endMs} />
      <hemisphereLight args={['#ffffff', '#8a8a8a', 0.5]} />
      <directionalLight position={[5, 10, 7]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 4, -4]} intensity={1.1} color="#dfe8ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={shadow} />
      </mesh>
      {children}
    </ThreeCanvas>
  );
};
