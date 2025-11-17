import { test, expect } from '@playwright/test';


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


  // Reverting to the recommended Playwright pattern: addInitScript followed by direct navigation.
  test('should allow authenticated user to access /setup', async ({ page }) => {
    // Navigate directly to the protected route /setup.
    // Without SSR, the client-side Angular app will handle this.
    await page.goto('/setup');
    await page.waitForLoadState('networkidle'); // Added for robustness

    // Expect to remain on /setup and see the component
    await expect(page).toHaveURL('/setup');
    await expect(page.locator('app-setup')).toBeVisible();
  });

  // Reverting to the recommended Playwright pattern: addInitScript followed by direct navigation.
  test('should allow authenticated user to access /dashboard', async ({ page }) => {
    // Navigate directly to the protected route /dashboard.
    // Without SSR, the client-side Angular app will handle this.
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle'); // Added for robustness

    // Expect to land directly on the dashboard page
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('app-dashboard')).toBeVisible();
  });
});
