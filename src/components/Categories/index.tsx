import React, { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';

export const Categories: React.FC = () => {
  const { categories, deleteCategory } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditCategory = (id: string) => {
    // Implement edit logic later
    console.log('Edit category:', id);
    alert('Edit functionality not yet implemented.');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Category Management</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
        >
          Add New Category
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h3>
            <CategoryForm onClose={() => setIsFormOpen(false)} />
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
