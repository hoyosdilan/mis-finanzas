import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../../firebase';
import {
    collection, onSnapshot, addDoc, doc, setDoc, getDoc,
    Timestamp, deleteDoc, query, orderBy, limit,
} from 'firebase/firestore';

const HealthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useHealth = () => useContext(HealthContext);

const DEFAULT_SETTINGS = {
    calorieTarget: 2000,
    macroTargets: { protein: 150, carbs: 250, fat: 65 },
    weightUnit: 'kg',
};

export const HealthProvider = ({ children }) => {
    const [foodLogs, setFoodLogs] = useState([]);
    const [weightLogs, setWeightLogs] = useState([]);
    const [workoutLogs, setWorkoutLogs] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const snap = await getDoc(doc(db, 'health_settings', 'default'));
                if (snap.exists()) setSettings(snap.data());
                else await setDoc(doc(db, 'health_settings', 'default'), DEFAULT_SETTINGS);
            } catch (e) {
                console.error('HealthContext: error fetching settings', e);
            }
        };
        fetchSettings();

        const qFood = query(collection(db, 'health_food_logs'), orderBy('date', 'desc'), limit(90));
        const unsubFood = onSnapshot(qFood, (snap) => {
            setFoodLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (e) => { console.error('health_food_logs:', e); setLoading(false); });

        const qWeight = query(collection(db, 'health_weight_logs'), orderBy('date', 'desc'), limit(90));
        const unsubWeight = onSnapshot(qWeight, (snap) => {
            setWeightLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (e) => console.error('health_weight_logs:', e));

        const qWorkout = query(collection(db, 'health_workout_logs'), orderBy('date', 'desc'), limit(60));
        const unsubWorkout = onSnapshot(qWorkout, (snap) => {
            setWorkoutLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (e) => console.error('health_workout_logs:', e));

        return () => { unsubFood(); unsubWeight(); unsubWorkout(); };
    }, []);

    const updateSettings = useCallback(async (newSettings) => {
        try {
            await setDoc(doc(db, 'health_settings', 'default'), newSettings);
            setSettings(newSettings);
        } catch (e) {
            console.error('HealthContext: error saving settings', e);
            throw e;
        }
    }, []);

    const addFoodLog = useCallback(async (data) => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        await addDoc(collection(db, 'health_food_logs'), {
            date: dateStr,
            timestamp: Timestamp.now(),
            ...data,
        });
    }, []);

    const deleteFoodLog = useCallback(async (id) => {
        await deleteDoc(doc(db, 'health_food_logs', id));
    }, []);

    // Weight log — doc id = YYYY-MM-DD (one entry per day, idempotent setDoc)
    const logWeight = useCallback(async (weight, dateStr) => {
        const id = dateStr || (() => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        })();
        await setDoc(doc(db, 'health_weight_logs', id), {
            date: id,
            weight,
            unit: settings.weightUnit,
            timestamp: Timestamp.now(),
        }, { merge: true });
    }, [settings.weightUnit]);

    const addWorkoutLog = useCallback(async (data) => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        await addDoc(collection(db, 'health_workout_logs'), {
            date: dateStr,
            timestamp: Timestamp.now(),
            ...data,
        });
    }, []);

    const deleteWorkoutLog = useCallback(async (id) => {
        await deleteDoc(doc(db, 'health_workout_logs', id));
    }, []);

    // Today's food summary
    const todayFoodSummary = useMemo(() => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const todayLogs = foodLogs.filter(l => l.date === todayStr);
        return todayLogs.reduce((acc, log) => {
            acc.kcal += log.totalKcal || 0;
            acc.protein += log.macros?.protein || 0;
            acc.carbs += log.macros?.carbs || 0;
            acc.fat += log.macros?.fat || 0;
            return acc;
        }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    }, [foodLogs]);

    const value = useMemo(() => ({
        foodLogs, weightLogs, workoutLogs, settings, loading,
        todayFoodSummary,
        updateSettings, addFoodLog, deleteFoodLog,
        logWeight, addWorkoutLog, deleteWorkoutLog,
    }), [
        foodLogs, weightLogs, workoutLogs, settings, loading, todayFoodSummary,
        updateSettings, addFoodLog, deleteFoodLog, logWeight, addWorkoutLog, deleteWorkoutLog,
    ]);

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
};
