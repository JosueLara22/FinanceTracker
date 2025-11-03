# Transfer Balance Calculation Fix

## Problem Description

The transfer operations were resetting account balances to incorrect values (often negative) instead of properly incrementing/decreasing from the current balance.

**Example of the bug:**
- Bank Account: $21,000
- Credit Card Debt: $10
- Transfer $10 from Bank to Credit Card
- **Result (BUGGY)**: Bank = -$10, Credit Card = -$10 ❌
- **Expected**: Bank = $20,990, Credit Card = $0 ✅

## Root Cause

The bug had TWO issues:

### Issue 1: Transaction Amount Signs
In `src/utils/transferOperations.ts`, transaction amounts were calculated using a condensed ternary operator that didn't properly handle all four transfer scenarios:
1. Bank → Bank
2. Bank → Credit Card (payment)
3. Credit Card → Bank (cash advance)
4. Credit Card → Credit Card

### Issue 2: Balance Recalculation from Zero (THE MAIN BUG)
**The critical bug**: `recalculateRunningBalances()` called `recalculateAccountBalance()` which recalculated balances by summing ALL transactions starting from **ZERO**, completely ignoring the account's opening balance!

When you create a bank account with $21,000, that balance is stored but NO opening balance transaction is created. Then when a transfer happens:
1. Transaction of -$10 is created
2. `recalculateAccountBalance()` sums all transactions: 0 + (-10) = **-$10** ❌
3. Account balance is set to -$10, overwriting the original $21,000!

## The Fix

### New Transaction Amount Logic

We replaced the condensed logic with explicit if-statements that clearly handle each account type:

```typescript
// Source account (money leaving)
if (transfer.fromAccountType === 'bank') {
  // Money leaving bank account
  debitAmount = -transfer.amount;
} else {
  // Money leaving credit card = taking cash advance = debt increases
  debitAmount = transfer.amount;
}

// Destination account (money arriving)
if (transfer.toAccountType === 'bank') {
  // Money arriving at bank account
  creditAmount = transfer.amount;
} else {
  // Money arriving at credit card = payment = debt decreases
  creditAmount = -transfer.amount;
}
```

### Transfer Semantics

**Account Type Conventions:**
- **Bank account**: positive = money in, negative = money out
- **Credit card**: positive = debt increase (charge), negative = debt decrease (payment)

### Examples

#### 1. Bank → Bank ($100 transfer)
- Source bank: **-$100** (money leaves)
- Destination bank: **+$100** (money arrives)
- ✅ Result: Source balance decreases by $100, destination increases by $100

#### 2. Bank → Credit Card ($100 payment)
- Source bank: **-$100** (money leaves)
- Destination credit card: **-$100** (debt decreases)
- ✅ Result: Bank balance decreases by $100, credit card debt decreases by $100

#### 3. Credit Card → Bank ($100 cash advance)
- Source credit card: **+$100** (debt increases)
- Destination bank: **+$100** (money arrives)
- ✅ Result: Credit card debt increases by $100, bank balance increases by $100

#### 4. Credit Card → Credit Card ($100 balance transfer)
- Source credit card: **+$100** (debt increases)
- Destination credit card: **-$100** (debt decreases)
- ✅ Result: Source card debt increases by $100, destination card debt decreases by $100

## The Solution

### 1. Fixed Transaction Amount Calculation
Replaced condensed ternary operators with explicit if-statements in `transferOperations.ts`.

### 2. Fixed Balance Update Logic
**Critical Change**: Modified the transfer creation to:
1. Create transactions with correct amounts
2. **Manually update account balances** by adding the transaction amounts to current balances
3. Call `recalculateRunningBalances()` only for updating the running balance fields on transactions
4. **Removed** the call to `recalculateAccountBalance()` from `recalculateRunningBalances()`

### 3. Modified recalculateRunningBalances()
Updated `transactionUtils.ts` to:
- Calculate the opening balance by working backwards from the current balance
- Use the opening balance as the starting point for running balance calculations
- **Not overwrite** the account's cached balance

## Files Modified

1. **`src/utils/transferOperations.ts`**:
   - Fixed `createTransfer()` function - clear transaction amount logic + manual balance updates (lines 57-177)
   - Fixed `updateTransfer()` function for account changes (lines 216-309)
   - Fixed `updateTransfer()` function for amount changes (lines 311-370)

2. **`src/utils/transactionUtils.ts`**:
   - Added warning comment to `recalculateAccountBalance()` (lines 19-26)
   - Completely rewrote `recalculateRunningBalances()` to preserve opening balances (lines 106-164)

## Testing Instructions

To verify the fix works correctly:

1. **Test Bank → Bank Transfer:**
   - Create two bank accounts (e.g., Account A with $1000, Account B with $500)
   - Transfer $200 from A to B
   - Verify: Account A shows $800, Account B shows $700

2. **Test Bank → Credit Card Payment:**
   - Create bank account with $1000
   - Create credit card with $500 debt (currentBalance = 500)
   - Transfer $200 from bank to credit card
   - Verify: Bank shows $800, credit card debt shows $300

3. **Test Credit Card → Bank Cash Advance:**
   - Create credit card with $300 debt
   - Create bank account with $500
   - Transfer $100 from credit card to bank
   - Verify: Credit card debt shows $400, bank shows $600

4. **Test Credit Card → Credit Card Balance Transfer:**
   - Create card A with $600 debt
   - Create card B with $300 debt
   - Transfer $200 from card A to card B
   - Verify: Card A debt shows $800, card B debt shows $100

## Migration Notes

**For existing transfers:** If you have existing transfers with incorrect balances, you may need to:

1. Run the reconciliation utility to recalculate all balances from transactions:
   ```typescript
   import { reconcileAllAccounts } from './utils/transactionUtils';
   await reconcileAllAccounts();
   ```

2. Or manually adjust affected account balances to correct values.

## Related Specification

This fix aligns with the specification in `financial-tracker-spec2.md`:
- Line 217: Transaction amount semantics
- Lines 231-250: Transfer entity definition
- Lines 710-738: Net Worth calculation (corrected formula)
