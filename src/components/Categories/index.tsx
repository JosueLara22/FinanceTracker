import React, { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';

export const Categories: React.FC = () => {
  const { categories, deleteCategory } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setCategoryToEdit(category);
      setIsFormOpen(true);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      deleteCategory(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCategoryToEdit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Agregar Categoría
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-4">{categoryToEdit ? 'Editar Categoría' : 'Agregar Categoría'}</h2>
              <CategoryForm onClose={handleCloseForm} categoryToEdit={categoryToEdit} />
            </div>
          </div>
        </div>
      )}

      <CategoryList
        categories={categories}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};
