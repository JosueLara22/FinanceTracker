# Testing Guide - Financial Tracker Phase 2

This guide covers how to run and understand the Playwright E2E tests for Phase 2 features.

## 📋 Test Coverage

Phase 2 Playwright tests cover the following features:

### 1. **Basic Expense Operations** (`tests/expense.spec.ts`)
- ✅ Adding new expenses
- ✅ Dashboard metric updates
- ✅ Deleting expenses with confirmation

### 2. **Filters and Search** (`tests/expense-filters.spec.ts`)
- ✅ Search by description/category
- ✅ Filter by category (multi-select)
- ✅ Filter by payment method (multi-select)
- ✅ Filter by date range
- ✅ Quick date filters (Today, This Week, This Month, This Year)
- ✅ Filter by amount range (min/max)
- ✅ Clear all filters
- ✅ Combine multiple filters
- ✅ Active filters summary

### 3. **Edit Functionality** (`tests/expense-edit.spec.ts`)
- ✅ Open edit form with pre-filled data
- ✅ Update expense successfully
- ✅ Cancel edit without saving
- ✅ Update category and payment method

### 4. **Advanced Fields** (`tests/expense-advanced-fields.spec.ts`)
- ✅ Add expense with subcategory
- ✅ Add expense with tags
- ✅ Add tag by pressing Enter
- ✅ Remove tags
- ✅ Mark expense as recurring
- ✅ Combine subcategory and tags

### 5. **Calendar View** (`tests/expense-calendar.spec.ts`)
- ✅ Display calendar with week headers
- ✅ Show expenses on calendar days
- ✅ Navigate between months
- ✅ Go to today
- ✅ Show expense details when clicking a day
- ✅ Close day details panel
- ✅ Edit expense from calendar view
- ✅ Highlight today

### 6. **Reports and Export** (`tests/expense-reports.spec.ts`)
- ✅ Display summary cards (total, average, month comparison)
- ✅ Display top categories with progress bars
- ✅ Display payment method breakdown
- ✅ Display monthly breakdown (last 6 months)
- ✅ Display additional statistics
- ✅ Export buttons visibility
- ✅ Trigger CSV download
- ✅ Trigger JSON download
- ✅ Month-over-month comparison
- ✅ Empty state when no expenses
- ✅ Reports respect filters from list view

## 🚀 Running Tests

### Prerequisites
Make sure you have the dev server running:
```bash
npm run dev
```

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
# Run only filter tests
npx playwright test tests/expense-filters.spec.ts

# Run only edit tests
npx playwright test tests/expense-edit.spec.ts

# Run only calendar tests
npx playwright test tests/expense-calendar.spec.ts

# Run only reports tests
npx playwright test tests/expense-reports.spec.ts

# Run only advanced fields tests
npx playwright test tests/expense-advanced-fields.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Specific Test
```bash
npx playwright test -g "should filter expenses by search term"
```

### Debug Tests
```bash
npx playwright test --debug
```

## 📊 Test Reports

### Generate HTML Report
```bash
npx playwright test --reporter=html
```

View the report:
```bash
npx playwright show-report
```

### View Last Test Run
```bash
npx playwright show-report
```

## 🎯 Test Structure

Each test file follows this structure:

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to page, add test data
  });

  test('should do something', async ({ page }) => {
    // Test steps
    // Assertions
  });
});
```

## 🔍 Common Test Patterns

### Adding Test Data
```typescript
await page.click('text=Dashboard');
await page.getByRole('button', { name: 'Add Expense' }).click();
await page.getByPlaceholder('Ej: Compras en supermercado').fill('Test');
await page.getByPlaceholder('0.00').fill('100');
// ... fill other fields
await page.getByRole('button', { name: /Agregar Gasto/ }).click();
```

### Waiting for Elements
```typescript
await page.waitForTimeout(500); // Wait for animations
await page.locator('.modal').waitFor({ state: 'hidden' });
```

### Testing Downloads
```typescript
const downloadPromise = page.waitForEvent('download');
await page.click('button:has-text("Export")');
const download = await downloadPromise;
expect(download.suggestedFilename()).toContain('.csv');
```

## 🐛 Troubleshooting

### Tests Fail Due to Timing Issues
- Increase `waitForTimeout` values
- Use `page.waitForSelector()` instead of timeouts
- Check if animations are interfering

### Tests Can't Find Elements
- Check if Spanish text changed
- Verify CSS selectors are correct
- Use Playwright Inspector: `npx playwright test --debug`

### Port Already in Use
- Make sure dev server is on the expected port (5173)
- Update port in test files if needed
- Kill any hung processes

### Tests Fail on First Run
- Make sure the app is fully loaded
- Clear browser storage: `await page.context().clearCookies()`
- Reset database state between test runs

## 📝 Writing New Tests

### Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Setup code
  });

  test('should do something useful', async ({ page }) => {
    // Arrange: Set up test conditions

    // Act: Perform actions

    // Assert: Verify results
    await expect(page.locator('text=Expected')).toBeVisible();
  });
});
```

### Best Practices
1. **Use semantic selectors**: `getByRole`, `getByText`, `getByPlaceholder`
2. **Wait for state changes**: Don't rely only on timeouts
3. **Test user journeys**: Complete flows, not just individual actions
4. **Clean up**: Reset state between tests
5. **Use meaningful test names**: Describe what the test validates
6. **Keep tests independent**: Each test should run in isolation

## 🎨 Test Naming Convention

```typescript
test('should [action] [expected result]', async ({ page }) => {
  // Good examples:
  // 'should filter expenses by search term'
  // 'should update expense successfully'
  // 'should display calendar with week headers'
});
```

## 📦 Continuous Integration

To run tests in CI:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run dev server
  run: npm run dev &

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## ✅ Test Checklist

Before committing:
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Tests are independent
- [ ] No hardcoded waits (use proper waiting strategies)
- [ ] Test names are descriptive
- [ ] Tests clean up after themselves

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

---

**Happy Testing! 🧪**
