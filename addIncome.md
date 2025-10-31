# Plan to Add Income Section

This document outlines a detailed plan to integrate the Income tracking section into the Financial Tracker application, based on the provided project specification.

**Note:** Before starting the Income section implementation, a bug in `src/components/Expenses/ExpenseForm.tsx` was fixed to ensure UI consistency. The `description` input was missing `value`, `onChange`, and `placeholder` props.

## 1. Data Model Definition - (Completed)

**Objective:** Ensure the `Income` interface is correctly defined and available globally.

**Files to Modify:**
- `src/types/index.ts`

**Changes:**
- The `Income` interface is already defined in `src/types/index.ts` and matches the specification.

## 2. State Management Integration - (Largely Completed)

**Objective:** Integrate income data into the global application state using React Context API.

**Files to Modify:**
- `src/contexts/AppContext.tsx`

**Changes:**
- `incomes: Income[];` is already added to the `AppState` interface.
- The `appReducer` already handles actions for `ADD_INCOME`, `UPDATE_INCOME`, `DELETE_INCOME`, and `SET_INCOMES`.
- `incomes` is initialized in the `initialAppState`.
- The `useEffect` hook in `AppContext` already handles loading and saving `incomes` to IndexedDB.

## 3. Custom Hook for Income Management - (Completed)

**Objective:** Create a custom hook `useIncomes` to abstract income-related logic, similar to `useExpenses`.

**Files to Create:**
- `src/hooks/useIncomes.ts`

**Changes:**
- `useIncomes.ts` has been created, providing functions like `addIncome`, `updateIncome`, `deleteIncome`, and `getIncomeById`. This hook interacts with `AppContext` to dispatch actions and access income state.

## 4. UI Components for Income - (Completed)

**Objective:** Develop React components for adding and listing income entries.

**Files to Create:**
- `src/components/Income/index.tsx` (for routing/overall orchestration)
- `src/components/Income/IncomeForm.tsx`
- `src/components/Income/IncomeList.tsx`
- Optionally, `src/components/Income/IncomeCategoryManagement.tsx` if categories are dynamic.

**Changes:**

### `IncomeForm.tsx` - (Completed)
- A form with inputs for `date`, `amount`, `category`, `description`, `source`, and checkboxes for `recurring`.
- Uses `useIncomes` to add new income entries.
- Implements form validation and clears state after submission.
- Styling with Tailwind CSS, consistent with other forms.

### `IncomeList.tsx` - (Completed)
- Displays a list of income entries, potentially with pagination, sorting, and filtering options (by source, category, date).
- Each item should show `date`, `amount`, `category`, `description`, `source`.
- Include edit and delete actions using `useIncomes` functions.
- Styling with Tailwind CSS, consistent with other lists.

## 5. Integration into Application Views - (Completed)

**Objective:** Add the income components to the main application interface.

**Files to Modify:**
- `src/App.tsx`
- `src/main.tsx` (No changes needed)
- `src/components/Dashboard/index.tsx`
- `src/components/common/Header.tsx`

**Changes:**
- A new route for "Income" is added in `src/App.tsx`.
- In `src/components/Dashboard/index.tsx`, an "Add Income" quick action button has been made functional.
- `src/components/common/Header.tsx` already includes a navigation link to the Income section.

## 6. Data Persistence for Income - (Largely Completed)

**Objective:** Ensure income data is stored persistently using LocalStorage and IndexedDB.

**Files to Modify:**
- `src/data/db.ts`
- `src/contexts/AppContext.tsx`

**Changes:**
- In `db.ts`, a new store for `incomes` is already added to the Dexie schema.
- `AppContext` already uses `db.incomes.put()` for saving and `db.incomes.toArray()` for loading.

## 7. Reporting and Calculations Updates - (Pending)

**Objective:** Incorporate income data into existing and new financial calculations and reports.

**Files to Modify:**
- `src/utils/calculations.ts` (or similar utility file)
- `src/components/Dashboard/index.tsx`
- New reporting components if created.

**Changes:**
- Update the "Monthly Cash Flow" calculation: `Total Income - Total Expenses`.
- Implement "Monthly/Annual income summary" and "Income trend analysis" as specified in the UI components section under "Income Tracker Views". This might involve new charting components (e.g., `src/components/Dashboard/IncomeChart.tsx`).

## 8. Localization - (Pending)

**Objective:** Ensure income-related strings are localized.

**Files to Modify:**
- Relevant localization files (if an i18n solution is in place, otherwise add placeholders).

**Changes:**
- Add translations for "Income", "Add Income", "Source", "Category", etc., consistent with Spanish as the primary language.

## 9. Testing - (Pending)

**Objective:** Add unit and integration tests for the new income functionality.

**Files to Create/Modify:**
- `tests/income.spec.ts` (or integrate into `app.spec.ts`)
- Unit test files for `useIncomes` hook and `IncomeForm` logic.

**Changes:**
- **Unit Tests:**
  - Test `useIncomes` hook for adding, updating, and deleting incomes.
  - Test `IncomeForm` rendering, input handling, and submission.
  - Test income calculations (e.g., cash flow).
- **Integration Tests:**
  - Test persistence of income data to LocalStorage/IndexedDB.
  - Test end-to-end flow of adding an income and seeing it reflected in the list and dashboard.
  - Verify navigation to the income section.

## 10. Refinement and Styling - (Ongoing)

**Objective:** Ensure the income section is visually consistent and user-friendly.

**Files to Modify:**
- All new and modified UI component files.
- `src/index.css` or Tailwind config if new global styles are needed.

**Changes:**
- Apply Tailwind CSS classes to all new components to match the existing design system (cards, buttons, forms).
- Ensure responsiveness across different screen sizes.
- Utilize Lucide React for relevant icons.

This plan provides a structured approach to adding the income section, breaking it down into manageable tasks and ensuring consistency with the overall project goals and technical specifications.