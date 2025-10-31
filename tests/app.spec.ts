import { test, expect } from '@playwright/test';

test('homepage has title and heading', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Financial Tracker - Rastreador Financiero/);

  // Expect a heading with "Finance Tracker"
  await expect(page.getByRole('heading', { name: 'Financial Tracker' })).toHaveText('Financial Tracker');
});