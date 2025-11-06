import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Expenses } from './components/Expenses';
import { Investments } from './components/Investments';
import { Accounts } from './components/Accounts';
import { Income } from './components/Income';
import { ExpenseForm } from './components/Expenses/ExpenseForm';
import { IncomeForm } from './components/Income/IncomeForm';
import { AccountDetail } from './components/Accounts/AccountDetail';
import { Header } from './components/common/Header';
import { BudgetPlanner } from './components/Budget';
import { Categories } from './components/Categories';
import { Transfers } from './components/Transfers';
import { DataBackup } from './components/DataBackup';
import {
  initializeStores,
  useExpenseStore,
  useIncomeStore,
  useUIStore
} from './stores';

function App() {
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false);
  const [isIncomeFormOpen, setIncomeFormOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Zustand stores
  const addExpense = useExpenseStore((state) => state.addExpense);
  const addIncome = useIncomeStore((state) => state.addIncome);
  const isLoading = useUIStore((state) => state.isLoading);
  const setLoading = useUIStore((state) => state.setLoading);

  useEffect(() => {
    // Initialize all stores on app mount
    const initialize = async () => {
      setLoading(true);
      try {
        await initializeStores();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [setLoading]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando Control Financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <main className={`bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <Header />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard onAddExpenseClick={() => setExpenseFormOpen(true)} onAddIncomeClick={() => setIncomeFormOpen(true)} />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/income" element={<Income />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/accounts/bank/:id" element={<AccountDetail type="bank" />} />
            <Route path="/accounts/credit/:id" element={<AccountDetail type="credit" />} />
            <Route path="/expenses/:id" element={<Expenses />} />
            <Route path="/incomes/:id" element={<Income />} />
          </Routes>
        </div>

        {isExpenseFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
              <ExpenseForm 
                onAddExpense={async (expense) => {
                  await addExpense(expense);
                  setExpenseFormOpen(false);
                }}
                onClose={() => setExpenseFormOpen(false)} 
              />
            </div>
          </div>
        )}

        {isIncomeFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
              <IncomeForm 
                onAddIncome={(income) => {
                  addIncome(income);
                  setIncomeFormOpen(false);
                }}
                onClose={() => setIncomeFormOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Data Backup Utility */}
        <DataBackup />
      </main>
    </Router>
  );
}

export default App;
