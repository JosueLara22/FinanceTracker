import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Category } from '../types';
import { db, dbReady } from '../data/db';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      loadCategories: async () => {
        try {
          set({ isLoading: true, error: null });
          await dbReady;
          const categories = await db.categories.toArray();
          set({ categories, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load categories',
            isLoading: false
          });
        }
      },
      getCategoryById: (id) => {
        return get().categories.find((category) => category.id === id);
      }
    }),
    { name: 'CategoryStore' }
  )
);