import React, { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { Budget } from '../../types';

interface BudgetFormProps {
  onClose: () => void;
  budget?: Budget;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, budget }) => {
  const { addBudget, updateBudget } = useBudgets();
  const { categories } = useCategories();
  const [category, setCategory] = useState(budget?.category || '');
  const [monthlyLimit, setMonthlyLimit] = useState(budget?.monthlyLimit || 0);
  const [alertThreshold, setAlertThreshold] = useState(budget?.alertThreshold || 80);
  const [rollover, setRollover] = useState(budget?.rollover || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(budget?.notificationsEnabled || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetData = {
      category,
      monthlyLimit,
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      alertThreshold,
      rollover,
      notificationsEnabled,
    };

    if (budget) {
      await updateBudget({ ...budget, ...budgetData });
    } else {
      await addBudget(budgetData as Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'spent'>);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="category">
          Categoría
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Seleccionar una categoría</option>
          {categories
            .filter((c) => c.type === 'expense')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="monthlyLimit">
          Límite Mensual
        </label>
        <input
          id="monthlyLimit"
          type="number"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(Number(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="alertThreshold">
          Umbral de Alerta (%)
        </label>
        <input
          id="alertThreshold"
          type="number"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(Number(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={rollover}
            onChange={(e) => setRollover(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Transferir presupuesto no usado</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Habilitar notificaciones</span>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {budget ? 'Actualizar' : 'Añadir'} Presupuesto
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
