import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get not started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

// 🚨 INTENTIONAL BUGS FOR AI TESTING 🚨
test('broken test with security issue', async ({ page }) => {
  // Security vulnerability: eval usage
  const userInput = "alert('XSS')";
  eval(userInput); // AI should flag this as security risk
  
  await page.goto('https://playwright.dev/');
  
  // Performance issue: unnecessary wait
  await page.waitForTimeout(5000); // AI should suggest optimization
  
  // Wrong selector that will fail
  await expect(page.getByRole('button', { name: 'NonExistentButton' })).toBeVisible();
});

test('test with type safety issues', async ({ page }) => {
  // Type safety issue: using any
  const config: any = { timeout: "not a number" }; // AI should flag this
  
  await page.goto('https://playwright.dev/', { timeout: config.timeout });
  
  // Missing error handling
  await page.locator('#non-existent-id').click(); // Will throw, no try-catch
});


test('verify navigation functionality', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
