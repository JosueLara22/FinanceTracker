
import React, { createContext, useContext, ReactNode } from 'react';
import usePersistentReducer from '../hooks/usePersistentReducer';
import { AppState, ActionType } from '../types';

const initialState: AppState = {
  user: {
    id: 'user-1',
    name: 'Usuario',
    currency: 'MXN',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    enableNotifications: true,
    enableBiometricLock: false,
    theme: 'auto',
  },
  expenses: [],
  investments: [],
  accounts: [],
  creditCards: [],
  budgets: [],
  savingsGoals: [],
  categories: [],
  ui: {
    isLoading: false,
    activeView: 'dashboard',
    selectedPeriod: '2025-10',
    filters: {},
  },
};

const AppReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    // TODO: Implement reducer cases
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = usePersistentReducer(
    AppReducer,
    initialState,
    'finance-tracker-state'
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
