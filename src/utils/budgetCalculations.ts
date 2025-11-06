import { Budget, BudgetStatus, Expense, Category } from '../types';

// Helper function to get all descendant category IDs
const getDescendantCategoryIds = (
  parentCategoryId: string,
  allCategories: Category[]
): string[] => {
  const descendantIds: string[] = [];
  const queue: string[] = [parentCategoryId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allCategories.filter(
      (c) => c.parentCategoryId === currentId
    );
    for (const child of children) {
      descendantIds.push(child.id);
      queue.push(child.id);
    }
  }
  // Add the parent category itself to the list
  descendantIds.push(parentCategoryId);
  return descendantIds;
};


export function calculateBudgetUsage(
  budget: Budget,
  allExpenses: Expense[],
  allCategories: Category[]
): BudgetStatus {
  const { category: budgetCategoryId, period } = budget;
  const [year, month] = period.split('-').map(Number);

  // Get all applicable category IDs (the budget's category + all its descendants)
  const applicableCategoryIds = getDescendantCategoryIds(budgetCategoryId, allCategories);

  const spent = allExpenses
    .filter(e => {
      const d = new Date(e.date);
      // Check if the expense's category is one of the applicable categories
      return applicableCategoryIds.includes(e.category) &&
        d.getFullYear() === year &&
        d.getMonth() + 1 === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const limit = budget.monthlyLimit + (budget.rolloverAmount || 0);
  const percentage = limit > 0 ? (spent / limit) * 100 : (spent > 0 ? 100 : 0);
  const remaining = limit - spent;

  let status: 'safe' | 'warning' | 'danger' | 'exceeded';
  if (percentage < budget.alertThreshold) {
    status = 'safe';
  } else if (percentage < 100) {
    status = 'warning';
  } else if (percentage === 100) {
    status = 'danger';
  } else {
    status = 'exceeded';
  }

  return {
    spent,
    limit,
    percentage,
    remaining,
    status
  };
}
