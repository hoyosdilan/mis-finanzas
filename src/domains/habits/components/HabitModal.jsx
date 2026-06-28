import React, { useState } from 'react';
import { useHabits } from '../context/HabitsContext';
import { Icon, Field, TextInput } from '../../../shared/ds/Primitives';

const ICONS = ['local_fire_department', 'fitness_center', 'restaurant', 'book', 'water_drop', 'bedtime', 'self_improvement', 'directions_run', 'music_note', 'code'];

export default function HabitModal({ isOpen, onClose, habit }) {
    const { addHabit, updateHabit } = useHabits();
    const [name, setName] = useState(habit?.name || '');
    const [icon, setIcon] = useState(habit?.icon || 'local_fire_department');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            if (habit) {
                await updateHabit(habit.id, { name: name.trim(), icon });
            } else {
                await addHabit({ name: name.trim(), icon });
            }
            if (!habit) { setName(''); setIcon('local_fire_department'); }
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
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-1)' }}>{habit ? 'Editar hábito' : 'Nuevo hábito'}</div>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8 }}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <Field label="Nombre del hábito">
                    <TextInput value={name} onChange={setName} placeholder="ej. Leer 30 minutos" />
                </Field>

                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Ícono</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ICONS.map(ic => (
                            <button
                                key={ic}
                                type="button"
                                onClick={() => setIcon(ic)}
                                style={{
                                    width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                                    background: icon === ic ? 'var(--clay-500)' : 'var(--bg-sunken)',
                                    color: icon === ic ? '#fff' : 'var(--fg-2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Icon name={ic} size={20} fill={icon === ic} />
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!name.trim() || saving}
                    style={{
                        width: '100%', height: 50, borderRadius: 14, border: 'none',
                        background: 'var(--clay-500)', color: '#fff',
                        fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15,
                        cursor: !name.trim() || saving ? 'not-allowed' : 'pointer',
                        opacity: !name.trim() || saving ? 0.6 : 1,
                        boxShadow: 'var(--shadow-clay)',
                    }}
                >
                    {saving ? 'Guardando…' : habit ? 'Guardar cambios' : 'Crear hábito'}
                </button>
            </div>
        </div>
    );
}
