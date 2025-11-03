
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
<<<<<<< Updated upstream
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-primary-DEFAULT dark:text-primary-dark">Control Financiero</h1>
        <nav class="flex space-x-4">
          <NavLink to="/" class={navLinkClasses}>
            Panel
          </NavLink>
          <NavLink to="/expenses" class={navLinkClasses}>
            Gastos
          </NavLink>
          <NavLink to="/income" class={navLinkClasses}>
            Ingresos
          </NavLink>
          <NavLink to="/investments" class={navLinkClasses}>
            Inversiones
          </NavLink>
          <NavLink to="/accounts" class={navLinkClasses}>
            Cuentas
          </NavLink>
          <NavLink to="/categories" class={navLinkClasses}>
            Categorías
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
