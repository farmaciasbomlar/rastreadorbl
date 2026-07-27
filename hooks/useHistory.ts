
import { useState, useEffect } from 'react';
import { HistoryItem, ExecucaoItem, ExecutionType, StoreType } from '../types';

const HISTORY_KEY = 'rastreadorSjHistory';

interface AddHistoryPayload {
    type: ExecutionType;
    results: ExecucaoItem[];
    store: StoreType;
    searchTerm?: string;
    fileName?: string;
}

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (error) {
            console.error("Error reading history from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Error saving history to localStorage", error);
        }
    }, [history]);

    const addHistory = (payload: AddHistoryPayload) => {
        const newHistoryItem: HistoryItem = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            itemCount: payload.results.length,
            ...payload,
        };

        setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    };

    return { history, addHistory };
};
