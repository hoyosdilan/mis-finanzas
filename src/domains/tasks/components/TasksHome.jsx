import React, { useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { Icon, Card, Eyebrow, SectionHeader, IconBtn } from '../../../shared/ds/Primitives';
import TaskList from './TaskList';
import TaskListModal from './TaskListModal';

export default function TasksHome() {
    const { lists, items, pendingCount, loading } = useTasks();
    const [selectedListId, setSelectedListId] = useState(null);
    const [showListModal, setShowListModal] = useState(false);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'var(--fg-3)' }}>
                <Icon name="autorenew" size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
                Cargando…
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (selectedListId) {
        const list = lists.find(l => l.id === selectedListId);
        return <TaskList list={list} onBack={() => setSelectedListId(null)} />;
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero */}
            <Card padding={20} style={{ background: 'var(--ink-700)', color: '#fff', borderRadius: 28 }}>
                <Eyebrow style={{ color: 'rgba(255,255,255,0.55)' }}>Pendientes</Eyebrow>
                <div style={{ marginTop: 8, fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                    {pendingCount}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>
                    tarea{pendingCount !== 1 ? 's' : ''} por completar en {lists.length} lista{lists.length !== 1 ? 's' : ''}
                </div>
            </Card>

            {/* Lists */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <SectionHeader title="Mis listas" eyebrow={`${lists.length} lista${lists.length !== 1 ? 's' : ''}`} />
                    <IconBtn icon="add" tone="sunken" size={34} onClick={() => setShowListModal(true)} title="Nueva lista" />
                </div>

                {lists.length === 0 ? (
                    <Card padding={20} variant="outlined">
                        <div style={{ textAlign: 'center', color: 'var(--fg-3)' }}>
                            <Icon name="checklist" size={32} style={{ opacity: 0.4 }} />
                            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700 }}>Sin listas aún</div>
                            <div style={{ marginTop: 4, fontSize: 12 }}>Crea tu primera lista de tareas</div>
                        </div>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {lists.map(list => {
                            const listItems = items.filter(i => i.listId === list.id);
                            const done = listItems.filter(i => i.done).length;
                            const total = listItems.length;
                            const pct = total > 0 ? (done / total) * 100 : 0;
                            return (
                                <button
                                    key={list.id}
                                    type="button"
                                    onClick={() => setSelectedListId(list.id)}
                                    style={{
                                        width: '100%', background: 'var(--bg-raised)', borderRadius: 16,
                                        padding: '14px 16px', border: 'none', cursor: 'pointer',
                                        textAlign: 'left', boxShadow: 'var(--shadow-sm)',
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        transition: 'transform var(--dur-fast) var(--ease-out)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                        background: list.color || 'var(--ink-100)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--ink-700)',
                                    }}>
                                        <Icon name={list.icon || 'checklist'} size={22} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {list.name}
                                        </div>
                                        <div style={{ marginTop: 3, fontSize: 11, color: 'var(--fg-3)' }}>
                                            {done}/{total} completadas
                                        </div>
                                        {total > 0 && (
                                            <div style={{ marginTop: 5, height: 3, background: 'var(--bg-sunken)', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ink-700)', borderRadius: 9999 }} />
                                            </div>
                                        )}
                                    </div>
                                    <Icon name="chevron_right" size={18} color="var(--fg-3)" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                type="button"
                onClick={() => setShowListModal(true)}
                style={{
                    position: 'fixed', right: 20, bottom: 'calc(var(--tabbar-h, 72px) + 20px)',
                    height: 52, padding: '0 20px 0 16px', borderRadius: 9999, border: 'none',
                    background: 'var(--ink-700)', color: '#fff', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 13,
                    boxShadow: '0 8px 24px -6px rgba(31,27,20,0.30)',
                    zIndex: 45,
                }}
            >
                <Icon name="add" size={20} />
                Nueva lista
            </button>

            <TaskListModal isOpen={showListModal} onClose={() => setShowListModal(false)} />
        </div>
    );
}
