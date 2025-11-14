import { test, expect } from '@playwright/test';

// Define a test user object for localStorage mocking
const TEST_USER = {
  userId: 'mock-test-user-id',
  userName: 'TestUser',
  token: 'mock-jwt-token-authenticated',
};

test.describe('Auth Guard', () => {
  test('should redirect unauthenticated user from /setup to /auth/login', async ({ page }) => {
    // Ensure no token is present (e.g., by clearing local storage or starting fresh)
    await page.goto('/auth/login'); // Go to login first to ensure Angular app loads and initializes AuthService
    await page.evaluate(() => localStorage.clear()); // Clear local storage in the browser context
    await page.reload(); // Force a full page reload to re-initialize Angular state after clearing localStorage

    // Attempt to navigate directly to /setup
    await page.goto('/setup');

    // Expect to be redirected to the login page
    await expect(page).toHaveURL(/auth\/login\?returnUrl=%2Fsetup/);
    await expect(page.locator('app-login')).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Sign in to your account' })).toBeVisible();
  });

  test('should redirect unauthenticated user from /dashboard to /auth/login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload(); // Force a full page reload to re-initialize Angular state after clearing localStorage

    // Attempt to navigate directly to /dashboard
    await page.goto('/dashboard');

    // Expect to be redirected to the login page
    await expect(page).toHaveURL(/auth\/login\?returnUrl=%2Fdashboard/);
    await expect(page.locator('app-login')).toBeVisible();
  });

  // Reverting to the recommended Playwright pattern: addInitScript followed by direct navigation.
  test('should allow authenticated user to access /setup', async ({ page }) => {
    // Inject script to set auth state before the page loads/navigates.
    // This is the most reliable way to mock initial state.
    await page.context().addInitScript((user) => {
      localStorage.clear();
      localStorage.setItem('auth_token', user.token);
      // Correct payload: only user data, no token
      const userData = { userId: user.userId, userName: user.userName };
      localStorage.setItem('current_user', JSON.stringify(userData));
    }, TEST_USER);

    // Navigate directly to the protected route /setup.
    // The init script runs before the Angular app's bundle is executed on this navigation.
    await page.goto('/setup');

    // Expect to remain on /setup and see the component
    await expect(page).toHaveURL('/setup');
    await expect(page.locator('app-setup')).toBeVisible();
  });

  // Reverting to the recommended Playwright pattern: addInitScript followed by direct navigation.
  test('should allow authenticated user to access /dashboard', async ({ page }) => {
    // Inject script to set auth state before the page loads/navigates.
    // This is the most reliable way to mock initial state.
    await page.context().addInitScript((user) => {
      localStorage.clear();
      localStorage.setItem('auth_token', user.token);
      // Correct payload: only user data, no token
      const userData = { userId: user.userId, userName: user.userName };
      localStorage.setItem('current_user', JSON.stringify(userData));
    }, TEST_USER);

    // Navigate directly to the protected route /dashboard.
    // The init script runs before the Angular app's bundle is executed on this navigation.
    await page.goto('/dashboard');

    // Expect to land directly on the dashboard page
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('app-dashboard')).toBeVisible();
  });
});
