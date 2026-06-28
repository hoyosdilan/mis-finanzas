import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Segmented } from '../../../shared/ds/Primitives';

export default function ContextSwitcher() {
    const { currentContext, setCurrentContext } = useFinance();
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
