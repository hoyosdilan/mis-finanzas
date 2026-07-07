import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Segmented } from '../../../shared/ds/Primitives';
import { FEATURES } from '../../../config/features';

export default function ContextSwitcher() {
    const { currentContext, setCurrentContext } = useFinance();
    // Sin el contexto Negocio el switcher no tiene nada que alternar
    if (!FEATURES.business) return null;
    return (
        <div style={{ padding: '10px 20px 12px' }}>
            <Segmented
                size="sm"
                value={currentContext}
                onChange={setCurrentContext}
                options={[
                    { value: 'personal', label: 'Personal' },
                    { value: 'unified',  label: 'General' },
                    { value: 'business', label: 'Negocio' },
                ]}
            />
        </div>
    );
}
