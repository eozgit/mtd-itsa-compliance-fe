import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the register page before each test
    await page.goto('/auth/register');
  });

  test('has the correct title and register form elements', async ({ page }) => {
    await expect(page).toHaveTitle(/MtdItsaComplianceFe/i);

    // Expect the register form selector to be visible
    await expect(page.locator('app-register')).toBeVisible();

    // Expect email, username, and password input fields to be present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible(); // Using name attribute for username
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Register');
    await expect(page.locator('a[routerLink="/auth/login"]')).toBeVisible();
    await expect(page.locator('a[routerLink="/auth/login"]')).toHaveText('sign in to your existing account');
  });

  // This test now passes because the proxy is fixed (layer connectivity resolved)
  test('successfully registers a new user and redirects to setup', async ({ page }) => {
    const email = `test-register-${Date.now()}@example.com`;
    const username = `TestUser${Date.now()}`;
    const password = 'securepassword123';

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[type="password"]').fill(password);

    // Wait for the button to become enabled before clicking
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Expect to be redirected to the /setup page after successful registration
    await page.waitForURL('/setup');
    await expect(page).toHaveURL('/setup');

    // Optionally, verify that the setup component is visible
    await expect(page.locator('app-setup')).toBeVisible();
  });

  test('displays error message for invalid registration attempt (e.g., missing fields)', async ({ page }) => {
    // Only fill in the email and username
    await page.locator('input[type="email"]').fill('test@invalid.com');
    await page.locator('input[name="username"]').fill('validuser');
    // password field is left empty

    // Simulate touching the password field by focusing it and then blurring it.
    // This is crucial for Angular to mark the form control as 'touched' and display validation errors.
    await page.locator('input[type="password"]').focus();
    await page.locator('input[type="password"]').blur();

    // For debugging: take a screenshot to visually inspect the page state
    await page.screenshot({ path: 'test-results/password-error-screenshot.png' });

    const submitButton = page.locator('button[type="submit"]');

    // 1. ASSERT that the button is DISABLED, which is the expected behavior for missing required fields.
    await expect(submitButton).toBeDisabled();

    // 2. ASSERT the error message is visible. Using the new ID for robustness.
    const passwordErrorMessageLocator = page.locator('#password-error-message');
    await expect(passwordErrorMessageLocator).toBeVisible();
    await expect(passwordErrorMessageLocator).toContainText('Password is required.');
  });

  // Add more tests for existing user, invalid password format, etc. if needed
});

