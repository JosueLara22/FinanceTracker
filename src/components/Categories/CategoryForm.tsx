import React, { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types';

interface CategoryFormProps {
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onClose, categoryToEdit }) => {
  const { addCategory, updateCategory } = useCategories();
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'both'>('expense');
  const [icon, setIcon] = useState('');

  const isEditMode = !!categoryToEdit;

  useEffect(() => {
    if (isEditMode) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setIcon(categoryToEdit.icon || '');
    }
  }, [categoryToEdit, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, rellena el nombre de la categoría.');
      return;
    }

    if (isEditMode) {
      updateCategory(categoryToEdit.id, {
        name,
        type,
        icon,
      });
    } else {
      addCategory({
        name,
        type,
        icon,
        isDefault: false,
        order: 0,
        budgetEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre de la Categoría
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Categoría
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'expense' | 'income' | 'both')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="both">Ambos</option>
        </select>
      </div>
      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Icono (e.g., 💸, 🏠, 🍔)
        </label>
        <input
          type="text"
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          {isEditMode ? 'Actualizar Categoría' : 'Agregar Categoría'}
        </button>
      </div>
    </form>
  );
};
