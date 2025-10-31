
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Expenses } from './components/Expenses';
import { Investments } from './components/Investments';
import { Accounts } from './components/Accounts'; // Import actual Accounts component
import { useCategories } from './hooks/useCategories';
import { useExpenses } from './hooks/useExpenses';
import { defaultCategories } from './data/defaults';
import { ExpenseForm } from './components/Expenses/ExpenseForm';
import { Header } from './components/common/Header';
import { useTheme } from './hooks/useTheme';
import { Categories } from './components/Categories'; // Import actual Categories component

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
    <Router>
      <main className={`bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <Header />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard onAddExpenseClick={() => setExpenseFormOpen(true)} />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
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
    </Router>
  );
}

export default App;
