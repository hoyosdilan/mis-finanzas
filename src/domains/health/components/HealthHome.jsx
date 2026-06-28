import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { Icon, Card, Eyebrow, SectionHeader, ProgressBar, IconBtn } from '../../../shared/ds/Primitives';
import FoodLogModal from './FoodLogModal';
import WorkoutLogModal from './WorkoutLogModal';

export default function HealthHome({ fabTrigger }) {
    const { settings, todayFoodSummary, weightLogs, workoutLogs, loading } = useHealth();
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);

    useEffect(() => {
        if (fabTrigger > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowFoodModal(true);
        }
    }, [fabTrigger]);

    const latestWeight = weightLogs[0];
    const todayStr = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    })();
    const todayWorkouts = workoutLogs.filter(w => w.date === todayStr);
    const kcalBurned = todayWorkouts.reduce((a, w) => a + (w.kcalBurned || 0), 0);
    const calorieTarget = settings?.calorieTarget || 2000;
    const netKcal = todayFoodSummary.kcal - kcalBurned;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'var(--fg-3)' }}>
                <Icon name="autorenew" size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
                Cargando…
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero — calorie ring */}
            <Card padding={20} style={{ background: 'var(--olive-600, #5E6738)', color: '#fff', borderRadius: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Eyebrow style={{ color: 'rgba(255,255,255,0.65)' }}>Calorías hoy</Eyebrow>
                    <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 9999 }}>
                        {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
                <div style={{ marginTop: 10, fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                    {netKcal.toLocaleString('es-CO')}
                    <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.7, marginLeft: 6 }}>kcal netas</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                    {todayFoodSummary.kcal} consumidas · {kcalBurned} quemadas
                </div>
                <div style={{ marginTop: 14 }}>
                    <ProgressBar value={todayFoodSummary.kcal} max={calorieTarget} color="rgba(255,255,255,0.85)" warningAt={0.95} height={7} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, opacity: 0.6, fontWeight: 700 }}>
                        <span>0 kcal</span>
                        <span>Meta: {calorieTarget} kcal</span>
                    </div>
                </div>
            </Card>

            {/* Macros */}
            <div>
                <SectionHeader title="Macros de hoy" eyebrow="Gramos" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                    {[
                        { label: 'Proteína', key: 'protein', color: 'var(--clay-500)', target: settings?.macroTargets?.protein || 150 },
                        { label: 'Carbos', key: 'carbs', color: 'var(--amber-500, #DCA63B)', target: settings?.macroTargets?.carbs || 250 },
                        { label: 'Grasa', key: 'fat', color: 'var(--plum-400, #9B59B6)', target: settings?.macroTargets?.fat || 65 },
                    ].map(m => (
                        <Card key={m.key} padding={12}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                {m.label}
                            </div>
                            <div style={{ marginTop: 5, fontSize: 20, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
                                {Math.round(todayFoodSummary[m.key])}g
                            </div>
                            <div style={{ marginTop: 4 }}>
                                <ProgressBar value={todayFoodSummary[m.key]} max={m.target} color={m.color} height={4} />
                            </div>
                            <div style={{ marginTop: 3, fontSize: 10, color: 'var(--fg-3)', fontWeight: 600 }}>meta {m.target}g</div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Weight */}
            {latestWeight && (
                <Card padding={16}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ink-50)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="monitor_weight" size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Eyebrow>Último pesaje</Eyebrow>
                            <div style={{ marginTop: 3, fontSize: 22, fontWeight: 800, color: 'var(--fg-1)' }}>
                                {latestWeight.weight} {latestWeight.unit}
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{latestWeight.date}</div>
                    </div>
                </Card>
            )}

            {/* Today's workouts */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <SectionHeader title="Entrenamientos hoy" eyebrow={todayWorkouts.length === 0 ? 'Ninguno aún' : `${todayWorkouts.length} sesión${todayWorkouts.length !== 1 ? 'es' : ''}`} />
                    <IconBtn icon="add" tone="sunken" size={34} onClick={() => setShowWorkoutModal(true)} title="Agregar entrenamiento" />
                </div>
                {todayWorkouts.length === 0 ? (
                    <Card padding={16} variant="outlined">
                        <div style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>Sin actividad registrada hoy.</div>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {todayWorkouts.map(w => (
                            <Card key={w.id} padding={14}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--olive-50, #f0f2e8)', color: 'var(--olive-600, #5E6738)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon name="fitness_center" size={20} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>{w.activity}</div>
                                        <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                                            {w.duration ? `${w.duration} min` : ''}{w.kcalBurned ? ` · ${w.kcalBurned} kcal` : ''}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB — log food */}
            <button
                type="button"
                onClick={() => setShowFoodModal(true)}
                style={{
                    position: 'fixed', right: 20, bottom: 'calc(var(--tabbar-h, 72px) + 20px)',
                    height: 52, padding: '0 20px 0 16px', borderRadius: 9999, border: 'none',
                    background: 'var(--olive-600, #5E6738)', color: '#fff', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 13,
                    boxShadow: '0 8px 24px -6px rgba(94,103,56,0.45)',
                    zIndex: 45,
                }}
            >
                <Icon name="restaurant" size={20} />
                Registrar comida
            </button>

            <FoodLogModal isOpen={showFoodModal} onClose={() => setShowFoodModal(false)} />
            <WorkoutLogModal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} />
        </div>
    );
}
