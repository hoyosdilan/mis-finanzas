import React from 'react';
import { Icon, Card, Eyebrow, Editorial, Pill, SectionHeader, IconBtn } from './ds/Primitives';

// Visual plate — circle split into thirds with macro icons
function Plate() {
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <filter id="plateShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(31,27,20,0.15)" />
        </filter>
      </defs>
      <circle cx="120" cy="120" r="110" fill="#fff" stroke="var(--parchment-200)" strokeWidth="3" filter="url(#plateShadow)" />
      <circle cx="120" cy="120" r="92" fill="none" stroke="var(--parchment-100)" strokeWidth="1.5" />
      <path d="M 120 28 A 92 92 0 0 1 211.7 116 L 120 120 Z" fill="var(--amber-100)" />
      <path d="M 211.7 116 A 92 92 0 0 1 60 195 L 120 120 Z" fill="var(--clay-100)" />
      <path d="M 60 195 A 92 92 0 0 1 120 28 L 120 120 Z" fill="var(--olive-100)" />
      <g transform="translate(120, 65)">
        <circle r="20" fill="var(--amber-300)" />
        <text textAnchor="middle" dy="6" fontSize="22" fontFamily="Material Symbols Outlined" fill="#fff">grain</text>
      </g>
      <g transform="translate(168, 158)">
        <circle r="20" fill="var(--clay-500)" />
        <text textAnchor="middle" dy="6" fontSize="22" fontFamily="Material Symbols Outlined" fill="#fff">egg_alt</text>
      </g>
      <g transform="translate(72, 158)">
        <circle r="20" fill="var(--olive-500)" />
        <text textAnchor="middle" dy="6" fontSize="22" fontFamily="Material Symbols Outlined" fill="#fff">eco</text>
      </g>
      <circle cx="120" cy="120" r="28" fill="#fff" stroke="var(--parchment-200)" strokeWidth="1.5" />
      <text x="120" y="118" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1" fill="var(--fg-3)" fontFamily="var(--font-sans)">META</text>
      <text x="120" y="132" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg-1)" fontFamily="var(--font-sans)">77%</text>
    </svg>
  );
}

const MACROS = [
  { label: 'Proteína', value: '98g', pct: 21, color: 'var(--clay-500)' },
  { label: 'Carbs', value: '186g', pct: 40, color: 'var(--amber-300)' },
  { label: 'Grasas', value: '62g', pct: 30, color: 'var(--olive-500)' },
];

const WEEK = [
  { d: 'L', v: 2180 }, { d: 'M', v: 1980 }, { d: 'M', v: 2340 },
  { d: 'J', v: 2050 }, { d: 'V', v: 1920 }, { d: 'S', v: 1842 }, { d: 'D', v: null },
];

export default function Nutricion({ onBack }) {
  return (
    <div className="animate-fade-up" style={{ minHeight: '100%' }}>
      {/* In-screen header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px 10px', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(251,247,238,0.9)', backdropFilter: 'blur(16px)',
      }}>
        <IconBtn icon="arrow_back" tone="sunken" onClick={onBack} title="Volver" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow style={{ marginBottom: 2 }}>Plato del día</Eyebrow>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>Nutrición</div>
        </div>
        <Pill variant="amber">Demo</Pill>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '6px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Plate viz */}
        <Card padding={20} style={{ borderRadius: 26 }}>
          <Eyebrow style={{ color: 'var(--amber-500)' }}>Distribución del día</Eyebrow>
          <div style={{ marginTop: 4 }}>
            <Editorial size={28}>
              1.842 <span style={{ fontSize: 14, color: 'var(--fg-3)', fontStyle: 'normal', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>kcal de 2.400</span>
            </Editorial>
          </div>

          <div style={{ marginTop: 16, width: '100%', maxWidth: 240, aspectRatio: '1 / 1', marginLeft: 'auto', marginRight: 'auto' }}>
            <Plate />
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {MACROS.map(macro => (
              <div key={macro.label} style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: macro.color }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{macro.label}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>{macro.value}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{macro.pct}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Water / steps / weight */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Card padding={14}>
            <Icon name="water_drop" size={18} color="var(--olive-500)" />
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
              1.8<span style={{ fontSize: 11, opacity: 0.5, fontWeight: 500 }}>L</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 600, marginTop: 2 }}>de 2.5L</div>
          </Card>
          <Card padding={14}>
            <Icon name="directions_walk" size={18} color="var(--clay-500)" />
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>8.420</div>
            <div style={{ fontSize: 10, color: 'var(--olive-600)', fontWeight: 600, marginTop: 2 }}>pasos · ↑84%</div>
          </Card>
          <Card padding={14}>
            <Icon name="monitor_weight" size={18} color="var(--ink-700)" />
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
              74.2<span style={{ fontSize: 11, opacity: 0.5, fontWeight: 500 }}>kg</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--olive-600)', fontWeight: 600, marginTop: 2 }}>↓ 0.4 sem</div>
          </Card>
        </div>

        {/* Week strip */}
        <div>
          <SectionHeader title="Esta semana" eyebrow="Calorías diarias" />
          <Card padding={16} style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
              {WEEK.map((day, i) => {
                const today = i === 5;
                const future = day.v === null;
                const h = future ? 6 : (day.v / 2500) * 78;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: '100%', height: h, borderRadius: 6,
                      background: future ? 'transparent' : (today ? 'var(--amber-300)' : 'var(--parchment-200)'),
                      border: future ? '1.5px dashed var(--border-strong)' : 'none',
                      position: 'relative',
                    }}>
                      {today && (
                        <div style={{
                          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                          fontSize: 10, fontWeight: 800, color: 'var(--amber-500)', fontFamily: 'var(--font-mono)',
                        }}>1842</div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: today ? 800 : 500, color: today ? 'var(--amber-500)' : 'var(--fg-3)' }}>{day.d}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 2, background: 'var(--ink-300)' }} />
              <span>Meta diaria: 2.400 kcal</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--fg-1)' }}>Prom 2.052</span>
            </div>
          </Card>
        </div>

        {/* Diagnostic */}
        <Card padding={14} moduleHue="var(--module-nutrition)" style={{ background: 'var(--amber-50)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Icon name="lightbulb" size={20} fill color="var(--amber-500)" />
            <div style={{ fontSize: 12.5, color: 'var(--ink-600)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--amber-500)' }}>Te falta proteína.</strong> Llevas 98g de 140g. Considera un snack alto en proteína esta tarde.
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-4)', lineHeight: 1.5 }}>
          Pantalla de demostración — el módulo de nutrición extiende el sistema de diseño.
          No está conectado a datos reales.
        </div>
      </div>
    </div>
  );
}
