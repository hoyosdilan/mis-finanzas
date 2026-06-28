import React, { useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { Icon, Field, TextInput } from '../../../shared/ds/Primitives';

const ICONS = ['checklist', 'shopping_cart', 'work', 'fitness_center', 'restaurant', 'home', 'school', 'favorite', 'travel_explore', 'code'];
const COLORS = ['var(--ink-100)', 'var(--clay-50)', 'var(--olive-50)', 'var(--amber-50)', 'var(--plum-50)'];

export default function TaskListModal({ isOpen, onClose }) {
    const { addList } = useTasks();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('checklist');
    const [color] = useState(COLORS[0]);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await addList({ name: name.trim(), icon, color });
            setName('');
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
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-1)' }}>Nueva lista</div>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8 }}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <Field label="Nombre">
                    <TextInput value={name} onChange={setName} placeholder="ej. Supermercado" />
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
                                    background: icon === ic ? 'var(--ink-700)' : 'var(--bg-sunken)',
                                    color: icon === ic ? '#fff' : 'var(--fg-2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Icon name={ic} size={20} />
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
                        background: 'var(--ink-700)', color: '#fff',
                        fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15,
                        cursor: !name.trim() || saving ? 'not-allowed' : 'pointer',
                        opacity: !name.trim() || saving ? 0.6 : 1,
                    }}
                >
                    {saving ? 'Guardando…' : 'Crear lista'}
                </button>
            </div>
        </div>
    );
}
