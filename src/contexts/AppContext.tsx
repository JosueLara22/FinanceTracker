import { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { db } from '../data/db';
import {
  AppState,
  ActionType,
  Expense,
  Investment,
  Income,
} from '../types';
import { initialUserSettings } from '../data/defaults';

// Initial State for the application
const initialAppState: AppState = {
  user: initialUserSettings,
  expenses: [],
  incomes: [],
  investments: [],
  accounts: [],
  creditCards: [],
  budgets: [],
  savingsGoals: [],
  categories: [],
  ui: {
    isLoading: true,
    activeView: 'Dashboard',
    selectedPeriod: 'month',
    filters: {},
  },
};

// Reducer function to manage state transitions
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    // Expense Actions
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((exp) =>
          exp.id === action.payload.id ? action.payload : exp
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((exp) => exp.id !== action.payload),
      };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };

    // Income Actions
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] };
    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map((inc) =>
          inc.id === action.payload.id ? action.payload : inc
        ),
      };
    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter((inc) => inc.id !== action.payload),
      };
    case 'SET_INCOMES':
      return { ...state, incomes: action.payload };

    // Investment Actions
    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, action.payload] };
    case 'UPDATE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.map((inv) =>
          inv.id === action.payload.id ? action.payload : inv
        ),
      };
    case 'DELETE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.filter((inv) => inv.id !== action.payload),
      };
    case 'SET_INVESTMENTS':
      return { ...state, investments: action.payload };

    // Bank Account Actions
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((acc) =>
          acc.id === action.payload.id ? action.payload : acc
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((acc) => acc.id !== action.payload),
      };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };

    // Credit Card Actions
    case 'ADD_CREDIT_CARD':
      return { ...state, creditCards: [...state.creditCards, action.payload] };
    case 'UPDATE_CREDIT_CARD':
      return {
        ...state,
        creditCards: state.creditCards.map((cc) =>
          cc.id === action.payload.id ? action.payload : cc
        ),
      };
    case 'DELETE_CREDIT_CARD':
      return {
        ...state,
        creditCards: state.creditCards.filter((cc) => cc.id !== action.payload),
      };
    case 'SET_CREDIT_CARDS':
      return { ...state, creditCards: action.payload };

    // Budget Actions
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map((bud) =>
          bud.id === action.payload.id ? action.payload : bud
        ),
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter((bud) => bud.id !== action.payload),
      };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };

    // Savings Goal Actions
    case 'ADD_SAVINGS_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
      };
    case 'SET_SAVINGS_GOALS':
      return { ...state, savingsGoals: action.payload };

    // Category Actions
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    // UI Actions
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case 'SET_ACTIVE_VIEW':
      return { ...state, ui: { ...state.ui, activeView: action.payload } };
    case 'SET_SELECTED_PERIOD':
      return { ...state, ui: { ...state.ui, selectedPeriod: action.payload } };
    case 'SET_FILTERS':
      return { ...state, ui: { ...state.ui, filters: action.payload } };

    // User Settings Actions
    case 'UPDATE_USER_SETTINGS':
      return { ...state, user: { ...state.user, ...action.payload } };

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  // Other CRUD operations will be added here
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // Load initial data from IndexedDB
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const expenses = await db.expenses.toArray();
        dispatch({ type: 'SET_EXPENSES', payload: expenses });

        const investments = await db.investments.toArray();
        dispatch({ type: 'SET_INVESTMENTS', payload: investments });

        const incomes = await db.incomes.toArray();
        dispatch({ type: 'SET_INCOMES', payload: incomes.map(income => ({ ...income, date: new Date(income.date) })) });

        // Load other data types similarly
        // const accounts = await db.accounts.toArray();
        // dispatch({ type: 'SET_ACCOUNTS', payload: accounts });

        // const creditCards = await db.creditCards.toArray();
        // dispatch({ type: 'SET_CREDIT_CARDS', payload: creditCards });

        // const budgets = await db.budgets.toArray();
        // dispatch({ type: 'SET_BUDGETS', payload: budgets });

        // const savingsGoals = await db.savingsGoals.toArray();
        // dispatch({ type: 'SET_SAVINGS_GOALS', payload: savingsGoals });

        // const categories = await db.categories.toArray();
        // dispatch({ type: 'SET_CATEGORIES', payload: categories });

        // const userSettings = await db.userSettings.get('1'); // Assuming a single user settings entry
        // if (userSettings) {
        //   dispatch({ type: 'UPDATE_USER_SETTINGS', payload: userSettings });
        // }

      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadInitialData();
  }, []);

  // Persist state changes to IndexedDB
  useEffect(() => {
    // Debounce saving to avoid excessive writes
    const handler = setTimeout(async () => {
      try {
        // Save expenses
        await db.expenses.clear();
        await db.expenses.bulkAdd(state.expenses);

        // Save investments
        await db.investments.clear();
        await db.investments.bulkAdd(state.investments);

        // Save incomes
        await db.incomes.clear();
        await db.incomes.bulkAdd(state.incomes);

        // Save other data types similarly
        // await db.accounts.clear();
        // await db.accounts.bulkAdd(state.accounts);

        // await db.creditCards.clear();
        // await db.creditCards.bulkAdd(state.creditCards);

        // await db.budgets.clear();
        // await db.budgets.bulkAdd(state.budgets);

        // await db.savingsGoals.clear();
        // await db.savingsGoals.bulkAdd(state.savingsGoals);

        // await db.categories.clear();
        // await db.categories.bulkAdd(state.categories);

        // await db.userSettings.put(state.user, '1');

      } catch (error) {
        console.error('Failed to save data:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [state.expenses, state.investments, state.incomes, /* other state dependencies */]);


  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    await db.expenses.add(newExpense);
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  }, [dispatch]);

  const addInvestment = useCallback(async (investment: Omit<Investment, 'id'>) => {
    const newInvestment = { ...investment, id: crypto.randomUUID() };
    await db.investments.add(newInvestment);
    dispatch({ type: 'ADD_INVESTMENT', payload: newInvestment });
  }, [dispatch]);

  const addIncome = useCallback(async (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: crypto.randomUUID() };
    await db.incomes.add(newIncome);
    dispatch({ type: 'ADD_INCOME', payload: newIncome });
  }, [dispatch]);

  const updateIncome = useCallback(async (income: Income) => {
    await db.incomes.put(income);
    dispatch({ type: 'UPDATE_INCOME', payload: income });
  }, [dispatch]);

  const deleteIncome = useCallback(async (id: string) => {
    await db.incomes.delete(id);
    dispatch({ type: 'DELETE_INCOME', payload: id });
  }, [dispatch]);


  return (
    <AppContext.Provider value={{ state, dispatch, addExpense, addInvestment, addIncome, updateIncome, deleteIncome }}>
      {children}
    </AppContext.Provider>
  );
};
