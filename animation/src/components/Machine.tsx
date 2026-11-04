import React from 'react';
import {C} from '../lib/theme';

/** Tratador de sementes DICALAB em vetor estilizado "product render" (cinza espacial + prata). Frente. */
export const Machine: React.FC<{lid?: number; led?: number; width?: number; chute?: number}> = ({lid = 0, led = 0, width = 760, chute = 0}) => (
  <svg width={width} height={width * 1.15} viewBox="0 0 600 690" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8e8e93" /><stop offset="0.45" stopColor="#d1d1d6" /><stop offset="1" stopColor="#636366" />
      </linearGradient>
      <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3a3c" /><stop offset="1" stopColor="#1c1c1e" />
      </linearGradient>
      <linearGradient id="drum" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#48484a" /><stop offset="0.3" stopColor="#e5e5ea" /><stop offset="0.55" stopColor="#8e8e93" /><stop offset="1" stopColor="#2c2c2e" />
      </linearGradient>
      <linearGradient id="glassc" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="rgba(255,255,255,0.35)" /><stop offset="1" stopColor="rgba(255,255,255,0.04)" />
      </linearGradient>
      <radialGradient id="ledg"><stop offset="0" stopColor={C.led} stopOpacity={0.9 * led} /><stop offset="1" stopColor={C.led} stopOpacity={0} /></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <ellipse cx="300" cy="655" rx="270" ry="22" fill="#000" opacity="0.5" filter="url(#soft)" />
    {[90, 510].map((x) => <ellipse key={x} cx={x} cy="628" rx="22" ry="12" fill="#111" />)}
    {/* corpo */}
    <rect x="40" y="330" width="520" height="290" rx="34" fill="url(#body)" stroke="rgba(255,255,255,0.22)" />
    <rect x="41" y="331" width="518" height="3" rx="2" fill="rgba(255,255,255,0.35)" />
    <text x="86" y="585" fill="rgba(255,255,255,0.45)" fontSize="22" fontWeight="200" letterSpacing="6" fontFamily="system-ui">DICALAB</text>
    {/* painel */}
    <rect x="360" y="285" width="130" height="62" rx="10" fill="#0a0a0c" stroke="rgba(255,255,255,0.2)" />
    <rect x="378" y="305" width="70" height="8" rx="4" fill={C.coated} opacity={0.4 + 0.6 * led} />
    <circle cx="520" cy="300" r="13" fill="#6b1a16" stroke="rgba(255,255,255,0.3)" />
    {/* LED de energia */}
    <circle cx="500" cy="440" r="60" fill="url(#ledg)" /><circle cx="500" cy="440" r="9" fill="none" stroke={C.led} strokeWidth="3" opacity={0.25 + 0.75 * led} />
    {/* tambor */}
    <rect x="165" y="70" width="270" height="290" rx="40" fill="url(#drum)" stroke="rgba(255,255,255,0.3)" />
    <rect x="170" y="78" width="6" height="270" rx="3" fill="rgba(255,255,255,0.45)" />
    {/* calha de saída (inox) */}
    <g transform={`rotate(${chute * -8} 300 330)`}>
      <rect x="200" y="215" width="170" height="150" rx="10" fill="url(#metal)" stroke="rgba(255,255,255,0.4)" />
      <rect x="214" y="230" width="142" height="122" rx="6" fill="#1a0a0a" opacity="0.85" />
      <rect x="214" y="230" width="142" height="122" rx="6" fill="url(#glassc)" />
    </g>
    <rect x="172" y="268" width="26" height="46" rx="8" fill="url(#metal)" />
    {/* tampa: articula na dobradiça à esquerda */}
    <g transform={`rotate(${-lid * 62} 175 70)`}>
      <ellipse cx="300" cy="66" rx="136" ry="22" fill="url(#metal)" stroke="rgba(255,255,255,0.5)" />
      <ellipse cx="300" cy="62" rx="120" ry="14" fill="url(#glassc)" />
    </g>
  </svg>
);

export const Bucket: React.FC<{width?: number; fill?: number; coat?: number}> = ({width = 420, fill = 0.5, coat = 1}) => {
  const h = width * 0.78;
  const y = h * (0.88 - fill * 0.5);
  return (
    <svg width={width} height={h} viewBox="0 0 420 328" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="bk" x1="0" x2="1"><stop offset="0" stopColor="#2c2c2e" /><stop offset="0.4" stopColor="#8e8e93" /><stop offset="1" stopColor="#1c1c1e" /></linearGradient>
        <clipPath id="bkc"><path d="M30 60 L390 60 L350 310 Q210 325 70 310 Z" /></clipPath>
      </defs>
      <path d="M30 60 L390 60 L350 310 Q210 325 70 310 Z" fill="url(#bk)" stroke="rgba(255,255,255,0.35)" />
      <g clipPath="url(#bkc)">
        <rect x="0" y={y * 328 / h} width="420" height="328" fill={`rgb(${150 + coat * 50},${60 - coat * 15},${50 - coat * 8})`} />
      </g>
      <ellipse cx="210" cy="60" rx="180" ry="26" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="4" />
    </svg>
  );
};
