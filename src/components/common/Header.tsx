
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">Financial Tracker</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
      </div>
    </header>
  );
};
