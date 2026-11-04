import React from 'react';

/** Vidro fosco: blur pesado, borda interna iluminada de 1px, brilho especular fino no topo. */
export const Glass: React.FC<{style?: React.CSSProperties; children?: React.ReactNode; dark?: boolean}> = ({
  style,
  children,
  dark = true,
}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 44,
      background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(48px) saturate(180%)',
      WebkitBackdropFilter: 'blur(48px) saturate(180%)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.8)'}`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,${dark ? 0.35 : 0.9}),
                  inset 0 -1px 0 rgba(0,0,0,0.25),
                  0 30px 80px rgba(0,0,0,${dark ? 0.5 : 0.18})`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%)',
      }}
    />
    {children}
  </div>
);
