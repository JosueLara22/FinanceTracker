
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { db } from '../data/db';
import { Category } from '../types';

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newId = crypto.randomUUID();
    const newCategory: Category = { ...category, id: newId };
    await db.categories.add(newCategory);
    return newId;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await db.categories.update(id, updates);
  };

  const deleteCategory = async (id: string) => {
    await db.categories.delete(id);
  };

  const getCategoryById = useCallback((id: string) => {
    return db.categories.get(id);
  }, []);

  return {
    categories: categories || [],
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
