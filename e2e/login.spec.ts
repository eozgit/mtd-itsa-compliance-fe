import { test, expect } from '@playwright/test';

test('has title and login form elements', async ({ page }) => {
  await page.goto('/auth/login'); // Navigate to your login page

  // Expect a title "to contain" a substring that matches the actual <title> in src/index.html
  await expect(page).toHaveTitle(/MtdItsaComplianceFe/i); // Corrected title assertion

  // Expect the login form selector to be visible
  await expect(page.locator('app-login')).toBeVisible();

  // Expect email and password input fields to be present
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toHaveText('Sign in'); // Corrected text assertion from 'Login' to 'Sign in'
});
