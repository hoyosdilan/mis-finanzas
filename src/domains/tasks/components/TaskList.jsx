import React, { useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { Icon, Card, IconBtn } from '../../../shared/ds/Primitives';

export default function TaskList({ list, onBack }) {
    const { items, addItem, toggleItem, deleteItem } = useTasks();
    const [newText, setNewText] = useState('');
    const [adding, setAdding] = useState(false);

    if (!list) return null;

    const listItems = items.filter(i => i.listId === list.id);
    const pending = listItems.filter(i => !i.done);
    const done = listItems.filter(i => i.done);

    const handleAdd = async () => {
        if (!newText.trim()) return;
        setAdding(true);
        try {
            await addItem(list.id, newText.trim());
            setNewText('');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 0 24px' }}>
            {/* Header */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 30,
                background: 'rgba(251, 247, 238, 0.92)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <IconBtn icon="arrow_back" tone="sunken" size={36} onClick={onBack} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {list.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>
                        {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Add new task */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                        placeholder="Nueva tarea…"
                        style={{
                            flex: 1, height: 44, padding: '0 14px', borderRadius: 12,
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-default)',
                            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fg-1)', outline: 'none',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--ink-700)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newText.trim() || adding}
                        style={{
                            height: 44, padding: '0 16px', borderRadius: 12, border: 'none',
                            background: 'var(--ink-700)', color: '#fff', cursor: 'pointer',
                            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
                            opacity: !newText.trim() || adding ? 0.5 : 1,
                        }}
                    >
                        <Icon name="add" size={20} />
                    </button>
                </div>

                {/* Pending items */}
                {pending.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {pending.map(item => (
                            <TaskItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                        ))}
                    </div>
                )}

                {/* Done items */}
                {done.length > 0 && (
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Completadas ({done.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {done.map(item => (
                                <TaskItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                            ))}
                        </div>
                    </div>
                )}

                {listItems.length === 0 && (
                    <Card padding={20} variant="outlined">
                        <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
                            Sin tareas. Agrega la primera arriba.
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

function TaskItemRow({ item, onToggle, onDelete }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'var(--bg-raised)', boxShadow: 'var(--shadow-sm)',
        }}>
            <button
                type="button"
                onClick={() => onToggle(item.id, !item.done)}
                style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    border: item.done ? 'none' : '2px solid var(--border-default)',
                    background: item.done ? 'var(--ink-700)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background var(--dur-fast) var(--ease-out)',
                }}
            >
                {item.done && <Icon name="check" size={14} color="#fff" />}
            </button>
            <span style={{
                flex: 1, minWidth: 0, fontSize: 14, color: item.done ? 'var(--fg-3)' : 'var(--fg-1)',
                fontWeight: item.done ? 500 : 600,
                textDecoration: item.done ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {item.text}
            </span>
            <button
                type="button"
                onClick={() => onDelete(item.id)}
                style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--fg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-50)'; e.currentTarget.style.color = 'var(--danger-700)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-4)'; }}
            >
                <Icon name="delete" size={16} />
            </button>
        </div>
    );
}
