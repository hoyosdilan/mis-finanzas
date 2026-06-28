import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitsContext';
import { Icon, Card, Eyebrow, SectionHeader, IconBtn } from '../../../shared/ds/Primitives';
import HabitModal from './HabitModal';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export default function HabitsHome({ fabTrigger }) {
    const { habitStats, todayCompleted, bestStreak, loading, toggleLog, habits } = useHabits();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (fabTrigger > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowModal(true);
        }
    }, [fabTrigger]);
    const today = todayStr();

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

            {/* Hero */}
            <Card padding={20} style={{ background: 'var(--clay-500)', color: '#fff', borderRadius: 28 }}>
                <Eyebrow style={{ color: 'rgba(255,255,255,0.55)' }}>Hoy</Eyebrow>
                <div style={{ marginTop: 8, fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em' }}>
                    {todayCompleted}/{habits.length}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, opacity: 0.8 }}>
                    hábito{todayCompleted !== 1 ? 's' : ''} completado{todayCompleted !== 1 ? 's' : ''} hoy
                </div>
                {bestStreak > 0 && (
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.85 }}>
                        <Icon name="local_fire_department" size={16} fill />
                        Mejor racha: {bestStreak} día{bestStreak !== 1 ? 's' : ''}
                    </div>
                )}
            </Card>

            {/* Habits list */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <SectionHeader title="Mis hábitos" eyebrow={`${habits.length} hábito${habits.length !== 1 ? 's' : ''}`} />
                    <IconBtn icon="add" tone="sunken" size={34} onClick={() => setShowModal(true)} title="Nuevo hábito" />
                </div>

                {habits.length === 0 ? (
                    <Card padding={20} variant="outlined">
                        <div style={{ textAlign: 'center', color: 'var(--fg-3)' }}>
                            <Icon name="local_fire_department" size={32} style={{ opacity: 0.4 }} />
                            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700 }}>Sin hábitos aún</div>
                            <div style={{ marginTop: 4, fontSize: 12 }}>Crea tu primer hábito y empieza tu racha</div>
                        </div>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {habitStats.map(habit => (
                            <HabitRow
                                key={habit.id}
                                habit={habit}
                                today={today}
                                onToggle={toggleLog}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{
                    position: 'fixed', right: 20, bottom: 'calc(var(--tabbar-h, 72px) + 20px)',
                    height: 52, padding: '0 20px 0 16px', borderRadius: 9999, border: 'none',
                    background: 'var(--clay-500)', color: '#fff', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 13,
                    boxShadow: 'var(--shadow-clay)',
                    zIndex: 45,
                }}
            >
                <Icon name="add" size={20} />
                Nuevo hábito
            </button>

            <HabitModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}

function HabitRow({ habit, today, onToggle }) {
    const [toggling, setToggling] = useState(false);

    const handleToggle = async () => {
        if (toggling) return;
        setToggling(true);
        try {
            await onToggle(habit.id, today, !habit.doneToday);
        } finally {
            setToggling(false);
        }
    };

    return (
        <Card padding={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: habit.doneToday ? 'var(--clay-500)' : 'var(--bg-sunken)',
                    color: habit.doneToday ? '#fff' : 'var(--fg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
                }}>
                    <Icon name={habit.icon || 'local_fire_department'} size={22} fill={habit.doneToday} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {habit.name}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="local_fire_department" size={12} color="var(--clay-500)" />
                        {habit.streak} día{habit.streak !== 1 ? 's' : ''} de racha
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={toggling}
                    style={{
                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: toggling ? 'wait' : 'pointer',
                        background: habit.doneToday ? 'var(--success-50)' : 'var(--bg-sunken)',
                        color: habit.doneToday ? 'var(--success-700)' : 'var(--fg-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background var(--dur-fast) var(--ease-out)',
                        flexShrink: 0,
                    }}
                >
                    <Icon name={habit.doneToday ? 'check_circle' : 'radio_button_unchecked'} size={22} fill={habit.doneToday} />
                </button>
            </div>
        </Card>
    );
}
