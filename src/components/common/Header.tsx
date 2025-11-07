
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

export const Header = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-primary-dark text-white dark:bg-primary-DEFAULT'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-primary-DEFAULT dark:text-primary-dark whitespace-nowrap">Control Financiero</h1>
          <ThemeSwitcher />
        </div>
        <nav className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
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
          <NavLink to="/transfers" className={navLinkClasses}>
            Transferencias
          </NavLink>
          <NavLink to="/categories" className={navLinkClasses}>
            Categorías
          </NavLink>
          <NavLink to="/budget" className={navLinkClasses}>
            Presupuesto
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
