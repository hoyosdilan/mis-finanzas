import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { Icon, Field, TextInput } from '../../../shared/ds/Primitives';

const ACTIVITIES = ['Correr', 'Ciclismo', 'Natación', 'Fuerza', 'Yoga', 'Caminata', 'HIIT', 'Otro'];

export default function WorkoutLogModal({ isOpen, onClose }) {
    const { addWorkoutLog } = useHealth();
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [kcalBurned, setKcalBurned] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!activity.trim()) return;
        setSaving(true);
        try {
            await addWorkoutLog({
                activity: activity.trim(),
                duration: Number(duration) || 0,
                kcalBurned: Number(kcalBurned) || 0,
                notes: notes.trim(),
            });
            setActivity(''); setDuration(''); setKcalBurned(''); setNotes('');
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: 'var(--bg-raised)',
                borderRadius: '24px 24px 0 0',
                padding: '20px 20px calc(20px + env(safe-area-inset-bottom))',
                width: '100%', maxWidth: 520,
                boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column', gap: 14,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-1)' }}>Registrar entrenamiento</div>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8 }}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <Field label="Actividad">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {ACTIVITIES.map(a => (
                            <button
                                key={a}
                                type="button"
                                onClick={() => setActivity(a)}
                                style={{
                                    padding: '6px 12px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                                    background: activity === a ? 'var(--olive-600, #5E6738)' : 'var(--bg-sunken)',
                                    color: activity === a ? '#fff' : 'var(--fg-2)',
                                    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12,
                                }}
                            >{a}</button>
                        ))}
                    </div>
                    <TextInput value={activity} onChange={setActivity} placeholder="O escribe una actividad…" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Duración (min)">
                        <TextInput type="number" value={duration} onChange={setDuration} placeholder="30" />
                    </Field>
                    <Field label="Kcal quemadas">
                        <TextInput type="number" value={kcalBurned} onChange={setKcalBurned} placeholder="250" />
                    </Field>
                </div>

                <Field label="Notas (opcional)">
                    <TextInput value={notes} onChange={setNotes} placeholder="Observaciones…" />
                </Field>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!activity.trim() || saving}
                    style={{
                        width: '100%', height: 50, borderRadius: 14, border: 'none',
                        background: 'var(--olive-600, #5E6738)', color: '#fff',
                        fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15,
                        cursor: !activity.trim() || saving ? 'not-allowed' : 'pointer',
                        opacity: !activity.trim() || saving ? 0.6 : 1,
                    }}
                >
                    {saving ? 'Guardando…' : 'Registrar'}
                </button>
            </div>
        </div>
    );
}
