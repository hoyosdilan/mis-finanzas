import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../../firebase';
import {
    collection, onSnapshot, addDoc, doc, setDoc,
    Timestamp, deleteDoc, updateDoc, query, orderBy,
} from 'firebase/firestore';
import { currentStreak, completedToday } from '../utils/streakHelpers';

const HabitsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useHabits = () => useContext(HabitsContext);

export const HabitsProvider = ({ children }) => {
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubHabits = onSnapshot(
            query(collection(db, 'habits'), orderBy('createdAt', 'asc')),
            (snap) => {
                setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (e) => { console.error('habits:', e); setLoading(false); }
        );

        // Load last 90 days of logs
        const unsubLogs = onSnapshot(
            collection(db, 'habit_logs'),
            (snap) => {
                setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            (e) => console.error('habit_logs:', e)
        );

        return () => { unsubHabits(); unsubLogs(); };
    }, []);

    const addHabit = useCallback(async (data) => {
        await addDoc(collection(db, 'habits'), {
            ...data,
            createdAt: Timestamp.now(),
        });
    }, []);

    const updateHabit = useCallback(async (id, data) => {
        await updateDoc(doc(db, 'habits', id), data);
    }, []);

    const deleteHabit = useCallback(async (id) => {
        await deleteDoc(doc(db, 'habits', id));
    }, []);

    // doc id = {habitId}_{YYYY-MM-DD} — idempotent setDoc
    const toggleLog = useCallback(async (habitId, dateStr, done) => {
        const logId = `${habitId}_${dateStr}`;
        if (done) {
            await setDoc(doc(db, 'habit_logs', logId), {
                habitId, date: dateStr, done: true, timestamp: Timestamp.now(),
            });
        } else {
            await deleteDoc(doc(db, 'habit_logs', logId));
        }
    }, []);

    // Derived: per-habit streak + today completion
    const habitStats = useMemo(() => {
        return habits.map(habit => {
            const habitLogs = logs.filter(l => l.habitId === habit.id && l.done);
            const dates = new Set(habitLogs.map(l => l.date));
            return {
                ...habit,
                streak: currentStreak(dates),
                doneToday: completedToday(dates),
            };
        });
    }, [habits, logs]);

    const todayCompleted = useMemo(
        () => habitStats.filter(h => h.doneToday).length,
        [habitStats]
    );
    const bestStreak = useMemo(
        () => Math.max(0, ...habitStats.map(h => h.streak)),
        [habitStats]
    );

    const value = useMemo(() => ({
        habits, logs, loading, habitStats, todayCompleted, bestStreak,
        addHabit, updateHabit, deleteHabit, toggleLog,
    }), [
        habits, logs, loading, habitStats, todayCompleted, bestStreak,
        addHabit, updateHabit, deleteHabit, toggleLog,
    ]);

    return (
        <HabitsContext.Provider value={value}>
            {children}
        </HabitsContext.Provider>
    );
};
