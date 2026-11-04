import React, {useMemo} from 'react';
import {DoubleSide, LatheGeometry, Vector2} from 'three';
import {roundedBoxGeo} from './geo';

const DX = -0.3; // eixo do tambor
const DZ = -0.2;

const Steel: React.FC = () => <meshStandardMaterial color="#cfd2d6" metalness={1} roughness={0.22} />;

/** Tratador de sementes DICALAB — modelo 3D procedural nas cores originais (corpo cinza, tambor verde, calha inox). */
export const Machine3D: React.FC<{lid?: number; led?: number; lever?: number}> = ({lid = 0, led = 1, lever = 0}) => {
  const body = useMemo(() => roundedBoxGeo(4.4, 1.9, 2.6, 0.12), []);
  const chute = useMemo(() => roundedBoxGeo(1.5, 1.25, 0.95, 0.05), []);
  const disp = useMemo(() => roundedBoxGeo(0.95, 0.26, 0.55, 0.04), []);
  const bracket = useMemo(() => roundedBoxGeo(0.5, 0.06, 0.5, 0.01), []);
  return (
    <group>
      {/* pés */}
      {[[-1.9, -1.0], [1.9, -1.0], [-1.9, 1.0], [1.9, 1.0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.07, z]} castShadow><cylinderGeometry args={[0.18, 0.2, 0.14, 24]} /><meshStandardMaterial color="#0e0e0f" roughness={0.6} /></mesh>
      ))}
      {/* corpo cinza */}
      <mesh geometry={body} position={[0, 1.09, 0]} castShadow receiveShadow><meshStandardMaterial color="#8d9094" metalness={0.45} roughness={0.42} /></mesh>
      {/* LED de energia (anel verde) */}
      <mesh position={[1.55, 1.0, 1.31]}><torusGeometry args={[0.1, 0.022, 12, 40]} /><meshStandardMaterial color="#1b3a24" emissive="#3dff8a" emissiveIntensity={0.1 + led * 3.2} /></mesh>
      <mesh position={[1.55, 1.0, 1.31]}><circleGeometry args={[0.08, 24]} /><meshStandardMaterial color="#0b0b0c" /></mesh>
      {led > 0.02 && <pointLight position={[1.55, 0.9, 1.9]} color="#5dff9a" intensity={1.8 * led} distance={4} />}
      {/* painel + botão de emergência */}
      <mesh geometry={disp} position={[1.35, 2.17, 0.5]} rotation={[-0.35, 0, 0]} castShadow><meshStandardMaterial color="#111214" roughness={0.35} /></mesh>
      <mesh position={[1.2, 2.2, 0.62]} rotation={[-0.35, 0, 0]}><boxGeometry args={[0.55, 0.1, 0.02]} /><meshStandardMaterial color="#220606" emissive="#ff2a1a" emissiveIntensity={1.4} /></mesh>
      <mesh position={[0.62, 2.12, 0.35]} castShadow><cylinderGeometry args={[0.13, 0.15, 0.12, 24]} /><meshStandardMaterial color="#b3151a" roughness={0.35} /></mesh>
      {/* tambor verde */}
      <mesh position={[DX, 2.98, DZ]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 1.92, 64, 1, true]} />
        <meshPhysicalMaterial color="#3fae1f" metalness={0.15} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} side={DoubleSide} />
      </mesh>
      <mesh position={[DX, 2.02, DZ]}><cylinderGeometry args={[1.0, 1.0, 0.06, 64]} /><meshStandardMaterial color="#2c2f33" /></mesh>
      <mesh position={[DX, 3.93, DZ]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.0, 0.035, 12, 64]} /><meshStandardMaterial color="#d9dce0" metalness={1} roughness={0.2} /></mesh>
      {/* calha inox frontal */}
      <mesh geometry={chute} position={[DX, 2.55, 1.0]} castShadow><Steel /></mesh>
      <mesh position={[DX, 2.45, 1.485]}><boxGeometry args={[1.08, 0.8, 0.02]} /><meshPhysicalMaterial color="#5a0d0d" roughness={0.1} transmission={0.2} transparent opacity={0.9} /></mesh>
      {/* alavanca da calha (esquerda) */}
      <group position={[DX - 0.8, 2.75, 1.05]} rotation={[lever, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.3, 0, 0]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.6, 16]} /><Steel /></mesh>
        <mesh position={[-0.62, 0, 0]} castShadow><sphereGeometry args={[0.11, 20, 16]} /><Steel /></mesh>
      </group>
      <mesh position={[DX - 0.8, 2.75, 1.05]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.08, 20]} /><Steel /></mesh>
      {/* tampa transparente articulada atrás */}
      <group position={[DX, 3.95, DZ - 1.0]} rotation={[-lid * 2.0, 0, 0]}>
        <mesh position={[0, 0.02, 1.0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.04, 1.04, 0.04, 64]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0.04} metalness={0} clearcoat={1} envMapIntensity={1.8} side={DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.03, 1.0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.04, 0.03, 12, 64]} /><meshStandardMaterial color="#e5e7ea" metalness={1} roughness={0.18} /></mesh>
        <mesh geometry={bracket} position={[0, 0.08, 1.0]}><Steel /></mesh>
        <mesh position={[0, 0.0, 0.04]}><boxGeometry args={[0.35, 0.08, 0.12]} /><Steel /></mesh>
      </group>
    </group>
  );
};

export const DRUM = {x: DX, z: DZ};

/** Balde verde (torneado), origem na base. */
export const Bucket3D: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const geo = useMemo(() => new LatheGeometry([[0, 0], [0.5, 0], [0.58, 0.04], [0.8, 0.95], [0.84, 1.0], [0.8, 1.0], [0.55, 0.1], [0, 0.08]].map(([x, y]) => new Vector2(x, y)), 48), []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#47bd1f" roughness={0.3} clearcoat={0.8} side={DoubleSide} />
      </mesh>
      {children}
    </group>
  );
};
