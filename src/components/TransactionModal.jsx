import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Timestamp } from 'firebase/firestore';
import ConfirmModal from './ConfirmModal';
import { Icon, Field, Segmented } from './ds/Primitives';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-default)', borderRadius: 12, padding: '11px 12px',
  fontFamily: 'var(--font-sans)', fontSize: 14,
  color: 'var(--fg-1)', outline: 'none',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
};

export default function TransactionModal({ isOpen, onClose, editingTransaction, initialMode = 'transaction' }) {
  const { addTransaction, updateTransaction, addTransfer, appConfig, deleteTransaction } = useFinance();

  const allCategories = useMemo(() => {
    if (!appConfig?.categories) return [];
    return appConfig.categories.map(c => {
      if (typeof c === 'string') {
        const isIncome = c.toLowerCase().includes('ingreso');
        return { name: c, subcategories: [], type: isIncome ? 'credit' : 'debit', context: 'personal' };
      }
      return c;
    });
  }, [appConfig]);

  const mode = (editingTransaction?.type === 'transfer' || editingTransaction?.isTransfer)
    ? 'transfer' : (editingTransaction ? 'transaction' : initialMode);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', amount: '', type: 'debit', context: 'personal',
    category: allCategories?.[0]?.name || 'general', subcategory: '',
    currency: appConfig?.currencies?.[0] || 'USD',
    card: appConfig?.accounts?.[0] || '',
    date: '', comments: '', destinationContext: 'personal',
    destinationCard: appConfig?.accounts?.[0] || '',
  });

  const filteredCategories = useMemo(() => {
    if (mode === 'transfer') {
      return allCategories.filter(c => {
        const cCtx = c.context || 'personal';
        return cCtx === formData.context || cCtx === 'both';
      });
    }
    return allCategories.filter(c => {
      const cType = c.type || 'debit';
      const cCtx  = c.context || 'personal';
      return cType === formData.type && (cCtx === formData.context || cCtx === 'both');
    });
  }, [allCategories, formData.type, formData.context, mode]);

  React.useEffect(() => {
    if (isOpen && filteredCategories.length > 0) {
      const isValid = filteredCategories.some(c => c.name === formData.category);
      if (!isValid) setFormData(prev => ({ ...prev, category: filteredCategories[0].name, subcategory: '' }));
    }
  }, [formData.type, formData.context, filteredCategories, mode, isOpen]);

  React.useEffect(() => {
    if (editingTransaction) {
      let formattedDate = '';
      if (editingTransaction.date) {
        const d = editingTransaction.date;
        const dateObj = d?.toDate ? d.toDate() : new Date(d);
        if (!isNaN(dateObj)) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day   = String(dateObj.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }
      setFormData({
        title: editingTransaction.title || '',
        amount: editingTransaction.amount || '',
        type: editingTransaction.type || 'debit',
        context: editingTransaction.context || 'personal',
        category: (typeof editingTransaction.category === 'object' ? editingTransaction.category?.name : editingTransaction.category) || allCategories?.[0]?.name || 'general',
        subcategory: editingTransaction.subcategory || '',
        currency: editingTransaction.currency || appConfig?.currencies?.[0] || 'USD',
        card: editingTransaction.card || appConfig?.accounts?.[0] || '',
        date: formattedDate,
        comments: editingTransaction.comments || '',
        destinationContext: editingTransaction.destinationContext || 'personal',
        destinationCard: editingTransaction.destinationCard || appConfig?.accounts?.[0] || '',
      });
    } else {
      setFormData({
        title: mode === 'transfer' ? 'Transferencia' : '',
        amount: '', type: 'debit', context: 'personal',
        category: allCategories?.[0]?.name || 'general', subcategory: '',
        currency: appConfig?.currencies?.[0] || 'USD',
        card: appConfig?.accounts?.[0] || '',
        date: '', comments: '', destinationContext: 'personal',
        destinationCard: appConfig?.accounts?.[0] || '',
      });
    }
  }, [editingTransaction, appConfig, allCategories, mode, isOpen]);

  const currentSubcategories = useMemo(() => {
    const cat = filteredCategories.find(c => c.name === formData.category);
    return cat ? cat.subcategories : [];
  }, [filteredCategories, formData.category]);

  if (!isOpen) return null;

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let txDate = formData.date;
      if (!txDate) {
        const today = new Date();
        txDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      }
      if (mode === 'transfer') {
        if (formData.card === formData.destinationCard && formData.context === formData.destinationContext) {
          alert("La cuenta de origen y destino no pueden ser la misma."); return;
        }
        if (editingTransaction) {
          await updateTransaction(editingTransaction.id, {
            title: formData.title || 'Transferencia', amount: Number(formData.amount),
            type: 'transfer', context: formData.context, destinationContext: formData.destinationContext,
            category: formData.category, subcategory: formData.subcategory,
            currency: formData.currency, card: formData.card, destinationCard: formData.destinationCard,
            comments: formData.comments, date: txDate,
          });
        } else {
          await addTransfer({
            title: formData.title || 'Transferencia', amount: formData.amount,
            currency: formData.currency, date: txDate, comments: formData.comments,
            category: formData.category, subcategory: formData.subcategory,
            sourceContext: formData.context, sourceAccount: formData.card,
            destinationContext: formData.destinationContext, destinationAccount: formData.destinationCard,
          });
        }
      } else {
        const txData = {
          title: formData.title, amount: Number(formData.amount), type: formData.type,
          context: formData.context, category: formData.category, subcategory: formData.subcategory,
          currency: formData.currency, card: formData.card, comments: formData.comments, date: txDate,
        };
        if (editingTransaction) await updateTransaction(editingTransaction.id, txData);
        else await addTransaction(txData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving transaction", error);
    }
  };

  const isNew = !editingTransaction;
  const title = mode === 'transfer'
    ? (isNew ? 'Nueva transferencia' : 'Editar transferencia')
    : (isNew ? 'Nueva transacción' : 'Editar transacción');

  return (
    <>
      {/* Scrim */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--bg-overlay)' }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 91,
          background: 'var(--bg-raised)',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '96dvh', overflowY: 'auto',
          animation: 'sheetIn 280ms var(--ease-out)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--ink-100)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>
              {title}
            </h2>
            <button type="button" onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: 'var(--ink-50)', color: 'var(--fg-2)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Type selector (transaction mode) */}
          {mode === 'transaction' && (
            <Segmented
              value={formData.type}
              onChange={v => set('type', v)}
              options={[
                { value: 'debit',  label: 'Gasto' },
                { value: 'credit', label: 'Ingreso' },
              ]}
            />
          )}

          {/* Concepto */}
          <Field label="Concepto">
            <input
              required
              type="text"
              placeholder={mode === 'transfer' ? 'Ej. Transferencia mensual' : 'Ej. Almuerzo'}
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              style={inputStyle}
            />
          </Field>

          {/* Amount + currency */}
          <Field label="Monto">
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--bg-default)', border: '1px solid var(--border-default)',
              borderRadius: 12, padding: '2px 14px',
            }}>
              <span style={{ color: 'var(--fg-3)', fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>$</span>
              <input
                required
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.amount}
                onChange={e => set('amount', e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  padding: '12px 10px', fontSize: 22, fontWeight: 800,
                  color: 'var(--fg-1)', fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
              <select
                value={formData.currency}
                onChange={e => set('currency', e.target.value)}
                style={{
                  border: 'none', background: 'transparent', color: 'var(--fg-2)',
                  fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em',
                  cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
                }}
              >
                {(appConfig?.currencies || ['COP', 'USD']).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Field>

          {/* Fecha + Contexto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha">
              <input type="date" value={formData.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
            </Field>
            <Field label={mode === 'transfer' ? 'Contexto origen' : 'Contexto'}>
              <div style={{ position: 'relative' }}>
                <select value={formData.context} onChange={e => set('context', e.target.value)} style={selectStyle}>
                  <option value="personal">Personal</option>
                  <option value="business">Negocio</option>
                </select>
                <Icon name="expand_more" size={16} color="var(--fg-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </Field>
          </div>

          {/* Source + Destination accounts */}
          <div style={{ display: 'grid', gridTemplateColumns: mode === 'transfer' ? '1fr 1fr' : '1fr', gap: 12 }}>
            <Field label={mode === 'transfer' ? 'Cuenta origen' : 'Tarjeta / Cuenta'}>
              <div style={{ position: 'relative' }}>
                <select required value={formData.card} onChange={e => set('card', e.target.value)} style={selectStyle}>
                  <option value="" disabled>Seleccionar…</option>
                  {(appConfig?.accounts || []).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <Icon name="expand_more" size={16} color="var(--fg-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </Field>
            {mode === 'transfer' && (
              <Field label="Cuenta destino">
                <div style={{ position: 'relative' }}>
                  <select required value={formData.destinationCard} onChange={e => set('destinationCard', e.target.value)} style={selectStyle}>
                    <option value="" disabled>Seleccionar…</option>
                    {(appConfig?.accounts || []).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <Icon name="expand_more" size={16} color="var(--fg-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </Field>
            )}
          </div>

          {/* Destination context (transfer) */}
          {mode === 'transfer' && (
            <Field label="Contexto destino">
              <div style={{ position: 'relative' }}>
                <select value={formData.destinationContext} onChange={e => set('destinationContext', e.target.value)} style={selectStyle}>
                  <option value="personal">Personal</option>
                  <option value="business">Negocio</option>
                </select>
                <Icon name="expand_more" size={16} color="var(--fg-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </Field>
          )}

          {/* Categoría + Subcategoría */}
          <div style={{ display: 'grid', gridTemplateColumns: currentSubcategories.length > 0 ? '1fr 1fr' : '1fr', gap: 12 }}>
            <Field label="Categoría">
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.category}
                  onChange={e => set('category', e.target.value) || set('subcategory', '')}
                  style={selectStyle}
                >
                  {filteredCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <Icon name="expand_more" size={16} color="var(--fg-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </Field>
            {currentSubcategories.length > 0 && (
              <Field label="Subcategoría">
                <div style={{ position: 'relative' }}>
                  <select value={formData.subcategory} onChange={e => set('subcategory', e.target.value)} style={selectStyle}>
                    <option value="">(Sin subcategoría)</option>
                    {currentSubcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Icon name="expand_more" size={16} color="var(--fg-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </Field>
            )}
          </div>

          {/* Comentarios */}
          <Field label="Comentarios" optional>
            <textarea
              placeholder="Opcional · contexto, recordatorios…"
              rows={2}
              value={formData.comments}
              onChange={e => set('comments', e.target.value)}
              style={{
                ...inputStyle, resize: 'none',
                lineHeight: 1.5,
              }}
            />
          </Field>

          {/* Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <button
              type="submit"
              style={{
                padding: '14px 16px', border: 'none', cursor: 'pointer',
                background: 'var(--clay-500)', color: '#fff', borderRadius: 14,
                fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 14,
                boxShadow: 'var(--shadow-clay)', letterSpacing: '-0.01em',
                transition: 'background var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--clay-600)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--clay-500)'}
            >
              {isNew ? `Registrar ${mode === 'transfer' ? 'transferencia' : 'transacción'}` : 'Guardar cambios'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                style={{
                  padding: '12px 16px', border: 'none', cursor: 'pointer',
                  background: 'var(--danger-50)', color: 'var(--danger-700)', borderRadius: 14,
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
                }}
              >
                Eliminar transacción
              </button>
            )}
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          deleteTransaction(editingTransaction.id);
          setConfirmDeleteOpen(false);
          onClose();
        }}
        title="Eliminar transacción"
        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive
      />
    </>
  );
}
