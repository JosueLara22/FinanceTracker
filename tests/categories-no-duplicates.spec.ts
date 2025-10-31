import { test, expect } from '@playwright/test';

test.describe('Categories - No Duplicates', () => {
  test('should not have duplicate categories after initialization', async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:5173');

    // Wait for app to load
    await page.waitForSelector('header', { timeout: 10000 });

    // Navigate to categories page
    await page.click('text=Categories');
    await page.waitForURL('**/categories');

    // Get all category names
    const categoryElements = await page.locator('[class*="bg-gray-50"] h3').all();
    const categoryNames: string[] = [];

    for (const element of categoryElements) {
      const text = await element.textContent();
      if (text) {
        // Remove icon emojis and trim
        const cleanName = text.replace(/[\p{Emoji}]/gu, '').trim();
        categoryNames.push(cleanName);
      }
    }

    // Check for duplicates
    const uniqueNames = new Set(categoryNames);
    const hasDuplicates = uniqueNames.size !== categoryNames.size;

    console.log('Categories found:', categoryNames);
    console.log('Unique categories:', Array.from(uniqueNames));

    // Find duplicates if any
    if (hasDuplicates) {
      const duplicates = categoryNames.filter((name, index) =>
        categoryNames.indexOf(name) !== index
      );
      console.log('Duplicate categories:', duplicates);
    }

    expect(hasDuplicates).toBe(false);
    expect(categoryNames.length).toBeGreaterThan(0);
  });

  test('should load default categories on fresh database', async ({ context, page }) => {
    // Clear IndexedDB
    await context.clearCookies();
    await page.goto('http://localhost:5173');

    await page.evaluate(async () => {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });

    // Reload page
    await page.reload();
    await page.waitForSelector('header', { timeout: 10000 });

    // Navigate to categories
    await page.click('text=Categories');
    await page.waitForURL('**/categories');

    // Wait for categories to load
    await page.waitForSelector('[class*="bg-gray-50"]', { timeout: 5000 });

    // Count categories
    const categoryCount = await page.locator('[class*="bg-gray-50"] h3').count();

    // Should have the default categories (10 expense + 5 income = 15)
    expect(categoryCount).toBe(15);

    // Verify no "No categories" message
    const noCategoriesMessage = await page.locator('text=No categories added yet').count();
    expect(noCategoriesMessage).toBe(0);
  });
});
