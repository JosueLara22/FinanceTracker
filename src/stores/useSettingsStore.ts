import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { UserSettings, Category, BankAccount } from '../types';
import { db, dbReady } from '../data/db';
import { initialUserSettings, defaultCategories as defaultCategoriesBase, defaultAccounts as defaultAccountsBase } from '../data/defaults';

// Add IDs to default categories
const defaultCategories: Category[] = defaultCategoriesBase.map((cat) => ({
  ...cat,
  id: uuidv4(),
}));

// Add IDs to default accounts
const defaultAccounts: BankAccount[] = defaultAccountsBase.map((acc) => ({
  ...acc,
  id: uuidv4(),
}));

interface SettingsState {
  userSettings: UserSettings;
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // User Settings Actions
  loadUserSettings: () => Promise<void>;
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetUserSettings: () => Promise<void>;

  // Category Actions
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Initialize with defaults if database is empty
  initializeDefaults: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      userSettings: initialUserSettings,
      categories: defaultCategories,
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      loadUserSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          await dbReady;
          const settings = await db.userSettings.toArray();

          if (settings.length > 0) {
            set({ userSettings: settings[0], isLoading: false });
          } else {
            // Initialize with defaults
            await db.userSettings.add(initialUserSettings);
            set({ userSettings: initialUserSettings, isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load user settings',
            isLoading: false
          });
        }
      },

      updateUserSettings: async (updates) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });
          const currentSettings = get().userSettings;

          const updatedSettings = { ...currentSettings, ...updates };

          await db.userSettings.put(updatedSettings);

          set({ userSettings: updatedSettings, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update user settings',
            isLoading: false
          });
          throw error;
        }
      },

      resetUserSettings: async () => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          await db.userSettings.clear();
          await db.userSettings.add(initialUserSettings);

          set({ userSettings: initialUserSettings, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to reset user settings',
            isLoading: false
          });
          throw error;
        }
      },

      loadCategories: async () => {
        try {
          set({ isLoading: true, error: null });
          await dbReady;
          const categories = await db.categories.toArray();

          if (categories.length > 0) {
            set({ categories, isLoading: false });
          } else {
            // Initialize with default categories
            await db.categories.bulkAdd(defaultCategories);
            set({ categories: defaultCategories, isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load categories',
            isLoading: false
          });
        }
      },

      addCategory: async (categoryData) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          const newCategory: Category = {
            ...categoryData,
            id: uuidv4(),
          };

          await db.categories.add(newCategory);

          set((state) => ({
            categories: [...state.categories, newCategory],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add category',
            isLoading: false
          });
          throw error;
        }
      },

      updateCategory: async (id, updates) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          await db.categories.update(id, updates);

          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === id ? { ...cat, ...updates } : cat
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update category',
            isLoading: false
          });
          throw error;
        }
      },

      deleteCategory: async (id) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          await db.categories.delete(id);

          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete category',
            isLoading: false
          });
          throw error;
        }
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((cat) => cat.type === type);
      },

      initializeDefaults: async () => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          // Check if user settings exist
          const settings = await db.userSettings.toArray();
          if (settings.length === 0) {
            await db.userSettings.add(initialUserSettings);
          }

          // Check if categories exist
          const categories = await db.categories.toArray();
          if (categories.length === 0) {
            await db.categories.bulkAdd(defaultCategories);
          }

          // Check if bank accounts exist
          const accounts = await db.accounts.toArray();
          if (accounts.length === 0) {
            await db.accounts.bulkAdd(defaultAccounts);
          }

          set({
            userSettings: settings.length > 0 ? settings[0] : initialUserSettings,
            categories: categories.length > 0 ? categories : defaultCategories,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize defaults',
            isLoading: false
          });
        }
      },
    }),
    { name: 'SettingsStore' }
  )
);
