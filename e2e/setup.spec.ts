import { test, expect } from '@playwright/test';

test.describe('Business Setup', () => {
  // Before each test, register a new user to land on the /setup page
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      console.log(msg);
    });

    await page.goto('/auth/register');

    const email = `setup-test-user-${Date.now()}@example.com`;
    const username = `SetupUser${Date.now()}`;
    const password = 'securepassword123';

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[type="password"]').fill(password);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const localStorageToken0 = await page.evaluate(() => localStorage.getItem('auth_token'));
    console.log(`Playwright: localStorage['auth_token'] after submit: ${localStorageToken0 ? localStorageToken0.substring(0, 10) + '...' : 'null'}`);

    // After successful registration, the app should redirect to /setup
    await page.waitForURL('/setup');
    // Wait for the network to be idle to ensure all Angular components and data are loaded
    await page.waitForLoadState('networkidle');

    // --- NEW: Directly inspect localStorage from Playwright context ---
    const localStorageToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    console.log(`Playwright: localStorage['auth_token'] after redirect: ${localStorageToken ? localStorageToken.substring(0, 10) + '...' : 'null'}`);
    // --- END NEW ---

    // Take a screenshot to help debug if the page isn't rendering as expected
    await page.screenshot({ path: 'test-results/setup-page-after-redirect.png' });

    await expect(page).toHaveURL('/setup');
    await expect(page.locator('app-setup')).toBeVisible();

    // Explicitly wait for the main heading to be attached to the DOM
    await page.locator('h2', { hasText: 'Set Up Your Business' }).waitFor({ state: 'attached' });
  });

  test('has the correct title and business setup form elements', async ({ page }) => {
    await expect(page).toHaveTitle(/MtdItsaComplianceFe/i); // Assuming this is still the main title

    await expect(page.locator('h2', { hasText: 'Set Up Your Business' })).toBeVisible();
    await expect(page.locator('input[id="business-name"]')).toBeVisible();
    await expect(page.locator('input[id="accounting-start-date"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Save Business Details');
  });

  test('successfully registers a new business and redirects to dashboard', async ({ page }) => {
    const businessName = `Test Business ${Date.now()}`;
    const accountingStartDate = '2025-04-06';

    await page.locator('input[id="business-name"]').fill(businessName);
    await page.locator('input[id="accounting-start-date"]').fill(accountingStartDate);

    const saveButton = page.locator('button[type="submit"]');
    await expect(saveButton).toBeEnabled();

    // Add a listener for the API response BEFORE clicking the button
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/business') && resp.request().method() === 'POST'),
      saveButton.click()
    ]);

    // Log the API response status for debugging
    console.log(`API /api/business response status: ${response.status()}`);

    // Expect the API call to be successful (e.g., 200 or 201 Created)
    expect(response.status()).toBe(200); // The ng-openapi-gen generated a void response, so 200 is expected. mtd2.md says 201, but the generated client expects 200.

    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('app-dashboard')).toBeVisible();
  });

  test('displays error messages for missing required fields', async ({ page }) => {
    // Leave both fields empty

    await page.locator('input[id="business-name"]').focus();
    await page.locator('input[id="business-name"]').blur();

    await page.locator('input[id="accounting-start-date"]').focus();
    await page.locator('input[id="accounting-start-date"]').blur();

    await page.screenshot({ path: 'test-results/business-setup-error-screenshot.png' });

    const saveButton = page.locator('button[type="submit"]');

    await expect(saveButton).toBeDisabled();

    await expect(page.locator('#business-name-error')).toBeVisible();
    await expect(page.locator('#business-name-error')).toContainText('Business Name is required.');

    await expect(page.locator('#start-date-error')).toBeVisible();
    await expect(page.locator('#start-date-error')).toContainText('Accounting Start Date is required.');
  });
});
