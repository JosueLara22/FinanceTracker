# Investment Deletion Improvement Plan

## Problem
Currently, deleting an investment results in a hard delete from the database. This leads to several issues:
1.  **Loss of historical data:** All records of the investment are permanently removed, making it impossible to audit past financial states.
2.  **Orphaned related records:** Associated `investmentSnapshots`, `investmentContributions`, and `investmentWithdrawals` are not deleted, becoming disconnected from their parent investment and leading to data inconsistency.
3.  **Unaccounted funds:** The "money" (current value) of the deleted investment is simply removed from the tracking system without being transferred to another account, which can be confusing for the user.

## Proposed Solution
Implement a soft deletion mechanism for investments and their related entities. Additionally, provide an optional step to transfer the investment's current value to a selected bank account upon deletion.

## Implementation Checklist

### Step 1: Update Data Models and Types
- [x] In `src/types/index.ts`, add `deletedAt?: Date;` to the `Investment`, `InvestmentSnapshot`, `InvestmentContribution`, and `InvestmentWithdrawal` interfaces.
- [x] In the `Investment` interface, formally deprecate and remove the `isActive: boolean;` field. All logic should be updated to use `deletedAt`.

### Step 2: Update Database Schema and Migration
- [x] In `src/data/db.ts`, create a new schema `version(5)`.
- [x] Update the `stores` definition for `investments`, `investmentSnapshots`, `investmentContributions`, and `investmentWithdrawals` to include `deletedAt` as an indexed field.
- [x] In the `upgrade` function of the new version, write a migration script to remove the `isActive` property from existing `investments` records to keep the data clean.

### Step 3: Modify `deleteInvestment` Function
- [x] In `src/stores/useInvestmentStore.ts`, change the `deleteInvestment` function from a hard delete to a soft delete by setting the `deletedAt` field.
- [x] Add logic to soft-delete all related records (snapshots, contributions, withdrawals) by setting their `deletedAt` field.
- [x] **Optional Fund Transfer:**
    - [x] The `deleteInvestment` function now accepts an optional `destinationAccountId`. If provided, the investment's `currentValue` will be transferred to this account via a new transaction.
    - [x] **UI Implementation Needed:** Implement the UI to prompt the user for a `destinationAccountId`. The UI should assume there is always at least one bank account available for transfer, simplifying edge case handling for account availability. The UI should also handle user cancellation of the transfer. 

### Step 4: Update Data Fetching Logic
- [x] In `src/stores/useInvestmentStore.ts`, modify `loadInvestments` to only fetch records where `deletedAt` is `null` or `undefined`.
- [x] Review and update all other functions that fetch investments or related data (e.g., `getInvestmentById`, `getInvestmentContributions`, `getInvestmentWithdrawals`, `getTotalInvested`) to filter out soft-deleted records.

### Step 5: Update Financial Calculations
- [x] In `src/stores/useAccountStore.ts`, `calculateNetWorth` has been updated to include the current value of active investments.
- [x] Reviewed `src/utils/investmentCalculations.ts` and confirmed no changes are needed as these functions operate on individual investment objects passed to them.

### Step 6: Update User Interface
- [x] By default, soft-deleted investments should not appear in lists, dropdowns, or overviews.
- [x] Implement the UI for the optional fund transfer during deletion (as mentioned in Step 3).
- [x] Provide an option in the UI (e.g., a filter toggle or a dedicated "Archived Investments" view, as preferred by the user) to allow users to see, and possibly restore, soft-deleted investments.

### Step 7: Implement UI for Adding Contributions
- [ ] Create a UI component (e.g., `InvestmentContributionForm.tsx`) or modify an existing one to allow users to add contributions to an existing investment.
- [ ] This component should include input fields for the contribution `amount` and an optional `sourceAccountId` (bank account).
- [ ] Integrate this UI component to call the `addContributionWithAccountDeduction` function from `src/services/investmentTransactions.ts` upon submission, passing the `investmentId`, `amount`, and `sourceAccountId`.