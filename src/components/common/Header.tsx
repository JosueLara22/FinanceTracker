
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary-dark text-white dark:bg-primary-DEFAULT'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <header className="bg-gray-50 dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-DEFAULT dark:text-primary-dark">Control Financiero</h1>
        <nav className="flex space-x-4">
          <NavLink to="/" className={navLinkClasses}>
            Panel
          </NavLink>
          <NavLink to="/expenses" className={navLinkClasses}>
            Gastos
          </NavLink>
          <NavLink to="/income" className={navLinkClasses}>
            Ingresos
          </NavLink>
          <NavLink to="/investments" className={navLinkClasses}>
            Inversiones
          </NavLink>
          <NavLink to="/accounts" className={navLinkClasses}>
            Cuentas
          </NavLink>
          <NavLink to="/categories" className={navLinkClasses}>
            Categorías
          </NavLink>
        </nav>
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
