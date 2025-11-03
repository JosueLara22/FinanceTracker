/**
 * Utility functions for exporting data in various formats
 */

import { Expense, Income, Investment, BankAccount, CreditCard } from '../types';
import { formatDate } from './formatters';

/**
 * Convert array of objects to CSV string
 */
const arrayToCSV = (data: any[], headers: string[]): string => {
  const headerRow = headers.join(',');
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // Escape commas and quotes in values
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
};

/**
 * Download a string as a file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = (expenses: Expense[], filename?: string) => {
  const data = expenses.map(expense => ({
    Fecha: formatDate(expense.date),
    Descripción: expense.description,
    Monto: expense.amount,
    Categoría: expense.category,
    Subcategoría: expense.subcategory || '',
    'Método de Pago': expense.paymentMethod,
    Etiquetas: expense.tags?.join('; ') || '',
    Recurrente: expense.recurring ? 'Sí' : 'No'
  }));

  const headers = ['Fecha', 'Descripción', 'Monto', 'Categoría', 'Subcategoría', 'Método de Pago', 'Etiquetas', 'Recurrente'];
  const csv = arrayToCSV(data, headers);

  const fileName = filename || `gastos_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
};

/**
 * Export incomes to CSV
 */
export const exportIncomesToCSV = (incomes: Income[], filename?: string) => {
  const data = incomes.map(income => ({
    Fecha: formatDate(income.date),
    Descripción: income.description,
    Monto: income.amount,
    Categoría: income.category,
    Fuente: income.source,
    Recurrente: income.recurring ? 'Sí' : 'No'
  }));

  const headers = ['Fecha', 'Descripción', 'Monto', 'Categoría', 'Fuente', 'Recurrente'];
  const csv = arrayToCSV(data, headers);

  const fileName = filename || `ingresos_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
};

/**
 * Export investments to CSV
 */
export const exportInvestmentsToCSV = (investments: Investment[], filename?: string) => {
  const data = investments.map(investment => ({
    Plataforma: investment.platform,
    Tipo: investment.type,
    'Capital Inicial': investment.initialCapital,
    'Fecha de Inicio': formatDate(investment.startDate),
    'GAT %': investment.gatPercentage,
    'Retorno Diario': investment.dailyReturn,
    'Retornos Acumulados': investment.accumulatedReturns,
    'Valor Actual': investment.currentValue,
    'Última Actualización': formatDate(investment.lastUpdate),
    'Auto-Reinversión': investment.autoReinvest ? 'Sí' : 'No'
  }));

  const headers = ['Plataforma', 'Tipo', 'Capital Inicial', 'Fecha de Inicio', 'GAT %', 'Retorno Diario', 'Retornos Acumulados', 'Valor Actual', 'Última Actualización', 'Auto-Reinversión'];
  const csv = arrayToCSV(data, headers);

  const fileName = filename || `inversiones_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
};

/**
 * Export bank accounts to CSV
 */
export const exportAccountsToCSV = (accounts: BankAccount[], filename?: string) => {
  const data = accounts.map(account => ({
    Banco: account.bankName || account.name,
    'Tipo de Cuenta': account.accountType || account.type,
    'Número de Cuenta': account.accountNumber || '',
    Saldo: account.balance,
    Moneda: account.currency,
    'Última Actualización': formatDate(account.lastUpdate),
    Activa: account.isActive ? 'Sí' : 'No'
  }));

  const headers = ['Banco', 'Tipo de Cuenta', 'Número de Cuenta', 'Saldo', 'Moneda', 'Última Actualización', 'Activa'];
  const csv = arrayToCSV(data, headers);

  const fileName = filename || `cuentas_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
};

/**
 * Export credit cards to CSV
 */
export const exportCreditCardsToCSV = (cards: CreditCard[], filename?: string) => {
  const data = cards.map(card => ({
    Banco: card.bank,
    'Nombre de Tarjeta': card.cardName,
    'Últimos 4 Dígitos': card.lastFourDigits,
    'Límite de Crédito': card.creditLimit,
    'Saldo Actual': card.currentBalance,
    'Crédito Disponible': card.availableCredit,
    'Fecha de Corte': card.cutoffDate,
    'Fecha de Pago': card.paymentDate,
    'Tasa de Interés': card.interestRate
  }));

  const headers = ['Banco', 'Nombre de Tarjeta', 'Últimos 4 Dígitos', 'Límite de Crédito', 'Saldo Actual', 'Crédito Disponible', 'Fecha de Corte', 'Fecha de Pago', 'Tasa de Interés'];
  const csv = arrayToCSV(data, headers);

  const fileName = filename || `tarjetas_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
};

/**
 * Export expenses to JSON
 */
export const exportExpensesToJSON = (expenses: Expense[], filename?: string) => {
  const json = JSON.stringify(expenses, null, 2);
  const fileName = filename || `gastos_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, fileName, 'application/json');
};

/**
 * Export incomes to JSON
 */
export const exportIncomesToJSON = (incomes: Income[], filename?: string) => {
  const json = JSON.stringify(incomes, null, 2);
  const fileName = filename || `ingresos_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, fileName, 'application/json');
};

/**
 * Export all data to JSON (backup)
 */
export const exportAllDataToJSON = (data: {
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
}, filename?: string) => {
  const json = JSON.stringify(data, null, 2);
  const fileName = filename || `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, fileName, 'application/json');
};

/**
 * Import data from JSON file
 */
export const importFromJSON = <T>(file: File): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Error al leer el archivo JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};
