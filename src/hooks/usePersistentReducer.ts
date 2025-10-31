import { useReducer, useEffect } from 'react';
import { AppState, ActionType } from '../types';

const usePersistentReducer = (
  reducer: (state: AppState, action: ActionType) => AppState,
  initialState: AppState,
  storageKey: string
) => {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Dates are stored as strings, so we need to convert them back
        // This is a simplified example; a more robust solution would be needed for full date revival
        if (parsed.expenses) {
          parsed.expenses = parsed.expenses.map((e: any) => ({ ...e, date: new Date(e.date) }));
        }
        return { ...initial, ...parsed };
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
    return initial;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [state, storageKey]);

  return [state, dispatch] as const;
};

export default usePersistentReducer;
