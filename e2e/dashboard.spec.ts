import { test, expect } from '@playwright/test';
import { TEST_USER } from './shared'; // Import TEST_USER from the shared module

test.describe('Dashboard', () => {
  // Test 1: Ensure dashboard loads correctly for an authenticated user
  test('should display the dashboard for an authenticated user', async ({ page }) => {
    await test.step('Set up authenticated session and navigate to dashboard', async () => {
      // Use addInitScript to inject the authentication token into localStorage
      // before the page loads, as seen in auth-guard.spec.ts
      await page.context().addInitScript((user) => {
        localStorage.clear(); // Ensure a clean slate
        localStorage.setItem('auth_token', user.token);
        const userData = { userId: user.userId, userName: user.userName };
        localStorage.setItem('current_user', JSON.stringify(userData));
      }, TEST_USER);

      // Now navigate to the dashboard
      await page.goto('/dashboard');
    });

    await test.step('Verify dashboard elements', async () => {
      // Check for the main dashboard heading
      await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
      // Check for the welcome message
      await expect(page.locator('text=Welcome to your MTD-ITSA Compliance Portal dashboard!')).toBeVisible();
      // Check for the placeholder content
      await expect(page.locator('text=Your current business details and recent quarterly submissions will be displayed here.')).toBeVisible();
    });
  });

  // Test 2: Ensure an unauthenticated user is redirected to the login page
  test('should redirect to login page if unauthenticated', async ({ page }) => {
    await test.step('Attempt to navigate directly to dashboard', async () => {
      // Ensure no token is present by clearing localStorage before navigation
      await page.goto('/auth/login'); // Go to login first to ensure Angular app loads and initializes AuthService
      await page.evaluate(() => localStorage.clear());
      await page.reload(); // Force a full page reload to re-initialize Angular state after clearing localStorage

      await page.goto('/dashboard');
    });

    await test.step('Verify redirection to login page', async () => {
      // Check if the URL is the login page (including the returnUrl query param)
      await expect(page).toHaveURL(/.*\/auth\/login\?returnUrl=%2Fdashboard/);
      // Check for a login-specific element to confirm it's the login page
      // FIX: Changed locator from h1 with 'Login' to h2 with 'Sign in to your account'
      await expect(page.locator('h2', { hasText: 'Sign in to your account' })).toBeVisible();
    });
  });
});
