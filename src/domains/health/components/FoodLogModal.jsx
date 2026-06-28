import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { Icon, Field, TextInput } from '../../../shared/ds/Primitives';

export default function FoodLogModal({ isOpen, onClose }) {
    const { addFoodLog } = useHealth();
    const [name, setName] = useState('');
    const [kcal, setKcal] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!name.trim() || !kcal) return;
        setSaving(true);
        try {
            await addFoodLog({
                name: name.trim(),
                totalKcal: Number(kcal),
                macros: {
                    protein: Number(protein) || 0,
                    carbs: Number(carbs) || 0,
                    fat: Number(fat) || 0,
                },
            });
            setName(''); setKcal(''); setProtein(''); setCarbs(''); setFat('');
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
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-1)' }}>Registrar comida</div>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8 }}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <Field label="Alimento / comida">
                    <TextInput value={name} onChange={setName} placeholder="ej. Avena con leche" />
                </Field>

                <Field label="Calorías (kcal)">
                    <TextInput type="number" value={kcal} onChange={setKcal} placeholder="300" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <Field label="Proteína (g)">
                        <TextInput type="number" value={protein} onChange={setProtein} placeholder="15" />
                    </Field>
                    <Field label="Carbos (g)">
                        <TextInput type="number" value={carbs} onChange={setCarbs} placeholder="40" />
                    </Field>
                    <Field label="Grasa (g)">
                        <TextInput type="number" value={fat} onChange={setFat} placeholder="8" />
                    </Field>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!name.trim() || !kcal || saving}
                    style={{
                        width: '100%', height: 50, borderRadius: 14, border: 'none',
                        background: 'var(--olive-600, #5E6738)', color: '#fff',
                        fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15,
                        cursor: !name.trim() || !kcal || saving ? 'not-allowed' : 'pointer',
                        opacity: !name.trim() || !kcal || saving ? 0.6 : 1,
                    }}
                >
                    {saving ? 'Guardando…' : 'Registrar'}
                </button>
            </div>
        </div>
    );
}
