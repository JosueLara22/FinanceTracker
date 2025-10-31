
import React, { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Expenses } from './components/Expenses';
import { Investments } from './components/Investments';
import { useCategories } from './hooks/useCategories';
import { useExpenses } from './hooks/useExpenses';
import { defaultCategories } from './data/defaults';
import { ExpenseForm } from './components/Expenses/ExpenseForm';
import { Header } from './components/common/Header';
import { useTheme } from './hooks/useTheme';

function App() {
  const { categories, addCategory } = useCategories();
  const { addExpense } = useExpenses();
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Seed database with default categories if none exist
    if (categories.length === 0) {
      defaultCategories.forEach(category => {
        addCategory(category);
      });
    }
  }, [categories, addCategory]);

  return (
    <main className={`bg-gray-100 dark:bg-gray-900 min-h-screen`}>
      <Header />
      <div className="container mx-auto p-4">
        <Dashboard onAddExpenseClick={() => setExpenseFormOpen(true)} />
        <Expenses />
        <Investments />
      </div>

      {isExpenseFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <ExpenseForm 
              onAddExpense={(expense) => {
                addExpense(expense);
                setExpenseFormOpen(false);
              }}
              onClose={() => setExpenseFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
