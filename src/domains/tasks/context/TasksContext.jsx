import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../../firebase';
import {
    collection, onSnapshot, addDoc, doc,
    Timestamp, deleteDoc, updateDoc, query, orderBy,
} from 'firebase/firestore';

const TasksContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => useContext(TasksContext);

export const TasksProvider = ({ children }) => {
    const [lists, setLists] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubLists = onSnapshot(
            query(collection(db, 'task_lists'), orderBy('createdAt', 'asc')),
            (snap) => {
                setLists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (e) => { console.error('task_lists:', e); setLoading(false); }
        );

        const unsubItems = onSnapshot(
            query(collection(db, 'task_items'), orderBy('order', 'asc')),
            (snap) => {
                setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            (e) => console.error('task_items:', e)
        );

        return () => { unsubLists(); unsubItems(); };
    }, []);

    const addList = useCallback(async (data) => {
        await addDoc(collection(db, 'task_lists'), {
            ...data,
            createdAt: Timestamp.now(),
        });
    }, []);

    const updateList = useCallback(async (id, data) => {
        await updateDoc(doc(db, 'task_lists', id), data);
    }, []);

    const deleteList = useCallback(async (id) => {
        // Also delete all items belonging to this list
        const listItems = items.filter(item => item.listId === id);
        await Promise.all(listItems.map(item => deleteDoc(doc(db, 'task_items', item.id))));
        await deleteDoc(doc(db, 'task_lists', id));
    }, [items]);

    const addItem = useCallback(async (listId, text, extras = {}) => {
        const listItems = items.filter(i => i.listId === listId);
        await addDoc(collection(db, 'task_items'), {
            listId,
            text,
            done: false,
            order: listItems.length,
            createdAt: Timestamp.now(),
            ...extras,
        });
    }, [items]);

    const toggleItem = useCallback(async (id, done) => {
        await updateDoc(doc(db, 'task_items', id), {
            done,
            completedAt: done ? Timestamp.now() : null,
        });
    }, []);

    const updateItem = useCallback(async (id, data) => {
        await updateDoc(doc(db, 'task_items', id), data);
    }, []);

    const deleteItem = useCallback(async (id) => {
        await deleteDoc(doc(db, 'task_items', id));
    }, []);

    const pendingCount = useMemo(() => items.filter(i => !i.done).length, [items]);

    const value = useMemo(() => ({
        lists, items, loading, pendingCount,
        addList, updateList, deleteList,
        addItem, toggleItem, updateItem, deleteItem,
    }), [
        lists, items, loading, pendingCount,
        addList, updateList, deleteList,
        addItem, toggleItem, updateItem, deleteItem,
    ]);

    return (
        <TasksContext.Provider value={value}>
            {children}
        </TasksContext.Provider>
    );
};
