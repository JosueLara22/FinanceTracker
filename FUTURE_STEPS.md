# Future Steps and Improvements for Finance Tracker

This document outlines potential areas for improvement and refactoring identified during a code review. Addressing these points can lead to a more efficient, maintainable, and robust application.

## 1. Refactor `useInvestmentStore.ts`

The `useInvestmentStore` currently contains a mix of UI-related state, direct database interactions, and pure calculation logic.

### Proposed Changes:

*   **Extract UI-related state:** Consider moving `isLoading` and `error` states to a more UI-centric store (e.g., `useUIStore`) or managing them directly within components. This will make `useInvestmentStore` solely responsible for investment data.
*   **Centralize Database Operations:** Encapsulate all direct `db.investments` interactions within a dedicated service layer (e.g., `investmentService.ts` or by extending `investmentTransactions.ts`). The store should then call methods on this service, making it a pure state management layer.
*   **Extract Calculation Functions:** Move `calculateDailyReturn` and `calculateTotalROI` to `src/utils/investmentCalculations.ts`. These are pure functions and do not need to reside within the store.
*   **Optimize `dbReady` calls:** Investigate if `await dbReady;` can be handled more elegantly, perhaps once during application initialization or implicitly within wrapped database operations, to avoid redundant calls in every async method.
*   **Refine `addInvestment` parameter type:** The verbose `Omit<Investment, 'id' | 'accumulatedReturns' | 'currentValue' | 'lastUpdate' | 'contributions' | 'withdrawals'>` suggests the `Investment` type might be overloaded. Consider creating more specific types for different contexts (e.g., `NewInvestmentData`).
*   **Streamline State Updates:** Modify service functions (e.g., `addContributionWithAccountDeduction`, `processWithdrawalToAccount`) to return the fully updated investment object. This would eliminate the need for the store to perform an extra `db.investments.get(investmentId)` call after a service operation.

## 2. General Error Handling Improvement

The current error handling across stores is basic, primarily catching errors and setting an error message in the state.

### Proposed Changes:

*   **Implement more sophisticated error handling:**
    *   **Logging:** Integrate with a logging service (e.g., Sentry, custom backend logging) to capture and monitor errors in production.
    *   **User Feedback:** Provide more user-friendly error messages that guide the user on what went wrong and how to potentially resolve it.
    *   **Retry Mechanisms:** For transient errors (e.g., network issues), implement retry logic.
    *   **Global Error Boundary:** Consider a global error boundary for React components to gracefully handle unexpected UI errors.

## 3. Implement Optimistic Updates

The application currently waits for database operations to complete before updating the UI, which can lead to a perceived delay.

### Proposed Changes:

*   **Introduce optimistic updates:** For actions like adding, updating, or deleting transactions, update the UI immediately. If the backend operation fails, revert the UI state and inform the user. This significantly improves the perceived responsiveness of the application.

## 4. Refactor `useUIStore`

The `useUIStore` is a large, monolithic store managing various UI concerns.

### Proposed Changes:

*   **Split into smaller, focused stores:** Break down `useUIStore` into more granular stores, each responsible for a specific UI domain (e.g., `useFilterStore`, `useSidebarStore`, `useToastStore`). This improves maintainability, reduces complexity, and can enhance performance by limiting re-renders to only relevant parts of the UI.

## 5. Review `useTransactionStore`'s `calculateBalanceAfterTransaction`

The `calculateBalanceAfterTransaction` function in `useTransactionStore` appears to be calculating a balance based on in-memory transactions and then adding a new amount. This might be a remnant of an older approach or could lead to inconsistencies if not carefully managed alongside `recalculateAccountBalance`.

### Proposed Changes:

*   **Clarify Purpose/Remove Redundancy:** Review if `calculateBalanceAfterTransaction` is still necessary given the existence and recent improvements to `recalculateAccountBalance`. If its logic is duplicated or can be replaced by `recalculateAccountBalance`, consider removing it to reduce code duplication and potential for bugs. If it serves a distinct purpose (e.g., predicting a balance *before* a transaction is committed), ensure its usage is clear and its logic is sound and consistent with the overall balance management strategy.
