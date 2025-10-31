import React, { useMemo, useState } from 'react';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { isSameDate } from '../../utils/dateUtils';

interface ExpenseCalendarProps {
  expenses: Expense[];
  onDayClick?: (date: Date, expenses: Expense[]) => void;
}

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({ expenses, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Days to show from previous month
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Days in the month
    const daysInMonth = lastDay.getDate();

    // Create array of days to display
    const days: {
      date: Date;
      isCurrentMonth: boolean;
      expenses: Expense[];
      total: number;
    }[] = [];

    // Add days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        expenses: [],
        total: 0
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayExpenses = expenses.filter(e => isSameDate(e.date, date));
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      days.push({
        date,
        isCurrentMonth: true,
        expenses: dayExpenses,
        total
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          isCurrentMonth: false,
          expenses: [],
          total: 0
        });
      }
    }

    return days;
  }, [currentDate, expenses]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
          {monthName}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-primary-DEFAULT text-white rounded hover:bg-primary-dark"
          >
            Hoy
          </button>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarData.map((day, index) => {
          const isToday = isSameDate(day.date, new Date());
          const hasExpenses = day.expenses.length > 0;

          return (
            <div
              key={index}
              onClick={() => hasExpenses && onDayClick?.(day.date, day.expenses)}
              className={`
                min-h-20 p-2 border rounded-lg transition-all
                ${day.isCurrentMonth
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50'
                }
                ${hasExpenses && day.isCurrentMonth ? 'cursor-pointer hover:shadow-md hover:border-primary-DEFAULT' : ''}
                ${isToday ? 'ring-2 ring-primary-DEFAULT' : ''}
              `}
            >
              {/* Day number */}
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'text-primary-DEFAULT font-bold'
                    : day.isCurrentMonth
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {day.date.getDate()}
              </div>

              {/* Expense info */}
              {hasExpenses && day.isCurrentMonth && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(day.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {day.expenses.length} gasto{day.expenses.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-DEFAULT rounded"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded"></div>
          <span>Con gastos</span>
        </div>
      </div>
    </div>
  );
};
