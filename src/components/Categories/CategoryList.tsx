import React from 'react';
import { Category } from '../../types'; // Adjust path as needed

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEditCategory, onDeleteCategory }) => {
  if (categories.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">No categories added yet. Add your first category!</p>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-gray-50 dark:bg-gray-800 shadow overflow-hidden rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.icon && <span className="mr-2">{category.icon}</span>}
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{category.type}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditCategory(category.id)}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteCategory(category.id)}
              className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-danger hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
