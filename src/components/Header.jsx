import React from 'react';
import { Icon, Segmented } from './ds/Primitives';

export default function Header({ currentContext, onContextChange }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(251, 247, 238, 0.82)',
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      borderBottom: '1px solid rgba(31, 27, 20, 0.06)',
    }}>
      {/* Brand + actions row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px 0',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--ink-800)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="donut_small" size={18} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-1)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            Mis Finanzas
          </div>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--fg-4)', marginTop: 1,
          }}>
            Dashboard personal
          </div>
        </div>
      </div>

      {/* Context switcher */}
      <div style={{ padding: '10px 20px 12px' }}>
        <Segmented
          size="sm"
          value={currentContext}
          onChange={onContextChange}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'unified',  label: 'General' },
            { value: 'business', label: 'Negocio' },
          ]}
        />
      </div>
    </header>
  );
}
