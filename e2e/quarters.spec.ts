import { test, expect } from '@playwright/test';
import { TEST_USER } from './shared'; // Assuming TEST_USER contains a valid token and user info

test.describe('Quarters List Page', () => {

  test('should redirect unauthenticated user to login page with returnUrl', async ({ page }) => {
    // Ensure no authentication token is present
    await page.goto('/auth/login'); // Navigate to a neutral page first
    await page.evaluate(() => localStorage.clear()); // Explicitly clear localStorage

    // Attempt to navigate directly to /quarters as an unauthenticated user
    await page.goto('/quarters');

    // Expect to be redirected to the login page with the correct returnUrl
    await expect(page).toHaveURL(/.*\/auth\/login\?returnUrl=%2Fquarters/);
    await expect(page.locator('h2', { hasText: 'Sign in to your account' })).toBeVisible();
  });

  test.describe('Authenticated User Access', () => {

    test.beforeEach(async ({ page }) => {
      // 1. Add a default mock with ONE quarter.
      // This ensures the <table> renders even for the first test.
      await page.route('**/api/quarters', async route => {
        const mockResponse = {
          quarters: [
            // Provide one minimal, default quarter
            {
              id: 'default-mock-id',
              taxYear: '2025/2026',
              quarterName: 'Q1',
              status: 'DRAFT',
              taxableIncome: 100,
              allowableExpenses: 50,
              netProfit: 50
            }
          ],
          totalNetProfitSubmitted: 50,
          cumulativeEstimatedTaxLiability: 10
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse),
        });
      });

      // 2. Set the initial local storage state via an Init Script.
      await page.context().addInitScript((user) => {
        localStorage.clear();
        localStorage.setItem('auth_token', user.token);
        const userData = { userId: user.userId, userName: user.userName };
        localStorage.setItem('current_user', JSON.stringify(userData));
      }, TEST_USER);

      // 3. Navigate to the protected page.
      await page.goto('/quarters');

      // 4. Wait for the page content to be stable
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    });


    test('should display quarterly updates for an authenticated user', async ({ page }) => {
      await expect(page).toHaveURL('/quarters');
      await expect(page.locator('app-quarters')).toBeVisible();
      await expect(page.locator('h1', { hasText: 'Quarterly Updates' })).toBeVisible();

      // Check if the table and its headers are visible
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th', { hasText: 'Quarter' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Status' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Taxable Income' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Allowable Expenses' })).toBeVisible();
      await expect(page.locator('th', { hasText: 'Net Profit' })).toBeVisible();
    });

    test('should display quarters from the API response and allow editing drafts', async ({ page }) => {
      // Mock API response for /api/quarters endpoint to ensure predictable data
      await page.route('**/api/quarters', async route => {
        const mockQuarters = {
          quarters: [
            {
              id: 'mock-q1-draft',
              taxYear: '2025/2026',
              quarterName: 'Q1',
              status: 'DRAFT',
              taxableIncome: 1000,
              allowableExpenses: 200,
              netProfit: 800,
            },
            {
              id: 'mock-q2-draft',
              taxYear: '2025/2026',
              quarterName: 'Q2',
              status: 'DRAFT',
              taxableIncome: 0,
              allowableExpenses: 0,
              netProfit: 0,
            },
            {
              id: 'mock-q3-submitted',
              taxYear: '2025/2026',
              quarterName: 'Q3',
              status: 'SUBMITTED',
              taxableIncome: 5000,
              allowableExpenses: 1000,
              netProfit: 4000,
              submissionDetails: { refNumber: 'MTD-ACK-XYZ', submittedAt: '2025-10-01T10:00:00Z' }
            },
          ],
          totalNetProfitSubmitted: 4000,
          cumulativeEstimatedTaxLiability: 800,
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockQuarters),
        });
      });

      // Re-navigate to /quarters to ensure the mock is active for the component's data fetch
      await page.goto('/quarters');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveURL('/quarters');

      // Verify all three quarters are displayed
      await expect(page.locator('tbody tr')).toHaveCount(3);

      // Verify Q1 Draft details
      const q1Row = page.locator('tbody tr').nth(0);
      await expect(q1Row.locator('td').nth(0)).toContainText('Q1 (2025/2026)');
      await expect(q1Row.locator('td').nth(1)).toContainText('DRAFT');
      await expect(q1Row.locator('td').nth(1).locator('span')).toHaveClass(/bg-blue-100 text-blue-800/);
      await expect(q1Row.locator('td').nth(2)).toContainText('£1,000.00');
      await expect(q1Row.locator('td').nth(3)).toContainText('£200.00');
      await expect(q1Row.locator('td').nth(4)).toContainText('£800.00');
      await expect(q1Row.locator('a', { hasText: 'Edit' })).toBeVisible();
      await expect(q1Row.locator('a', { hasText: 'Edit' })).toHaveAttribute('href', '/quarters/edit/mock-q1-draft');


      // Verify Q2 Draft details (initial zeros)
      const q2Row = page.locator('tbody tr').nth(1);
      await expect(q2Row.locator('td').nth(0)).toContainText('Q2 (2025/2026)');
      await expect(q2Row.locator('td').nth(1)).toContainText('DRAFT');
      await expect(q2Row.locator('a', { hasText: 'Edit' })).toBeVisible();
      await expect(q2Row.locator('a', { hasText: 'Edit' })).toHaveAttribute('href', '/quarters/edit/mock-q2-draft');


      // Verify Q3 Submitted details
      const q3Row = page.locator('tbody tr').nth(2);
      await expect(q3Row.locator('td').nth(0)).toContainText('Q3 (2025/2026)');
      await expect(q3Row.locator('td').nth(1)).toContainText('SUBMITTED');
      await expect(q3Row.locator('td').nth(1).locator('span')).toHaveClass(/bg-green-100 text-green-800/);
      await expect(q3Row.locator('span', { hasText: 'View (Submitted)' })).toBeVisible();
      await expect(q3Row.locator('a', { hasText: 'Edit' })).not.toBeVisible();
    });

    test('should navigate to edit page when clicking "Edit First Draft Quarter" button', async ({ page }) => {
      // Mock API response to ensure a draft exists
      await page.route('**/api/quarters', async route => {
        const mockQuarters = {
          quarters: [
            { id: 'first-draft-id', taxYear: '2025/2026', quarterName: 'Q1', status: 'DRAFT', taxableIncome: 0, allowableExpenses: 0, netProfit: 0 },
            { id: 'second-draft-id', taxYear: '2025/2026', quarterName: 'Q2', status: 'DRAFT', taxableIncome: 0, allowableExpenses: 0, netProfit: 0 },
          ],
          totalNetProfitSubmitted: 0,
          cumulativeEstimatedTaxLiability: 0,
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockQuarters) });
      });

      // Re-navigate to /quarters to ensure the mock is active
      await page.goto('/quarters');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const editButton = page.locator('button', { hasText: 'Edit First Draft Quarter' });
      await expect(editButton).toBeEnabled();
      await editButton.click();

      await expect(page).toHaveURL('/quarters/edit/first-draft-id');
      await expect(page.locator('app-quarter-form')).toBeVisible();
    });

    test('should disable "Edit First Draft Quarter" button if no draft quarters are available', async ({ page }) => {
      // Mock API response with no draft quarters
      await page.route('**/api/quarters', async route => {
        const mockQuarters = {
          quarters: [
            { id: 'submitted-q1', taxYear: '2025/2026', quarterName: 'Q1', status: 'SUBMITTED', taxableIncome: 100, allowableExpenses: 50, netProfit: 50, submissionDetails: { refNumber: 'MTD-ACK-XYZ', submittedAt: '2025-10-01T10:00:00Z' } },
          ],
          totalNetProfitSubmitted: 50,
          cumulativeEstimatedTaxLiability: 10,
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockQuarters) });
      });

      // Re-navigate to /quarters to ensure the mock is active
      await page.goto('/quarters');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const editButton = page.locator('button', { hasText: 'No Drafts Available' });
      await expect(editButton).toBeDisabled();
      await expect(editButton).toBeVisible(); // Ensure the text updates
    });

    test('should navigate to edit page when clicking individual "Edit" link for a DRAFT quarter', async ({ page }) => {
      // Mock API response with a specific draft quarter
      await page.route('**/api/quarters', async route => {
        const mockQuarters = {
          quarters: [
            { id: 'q1-submitted', taxYear: '2025/2026', quarterName: 'Q1', status: 'SUBMITTED', taxableIncome: 100, allowableExpenses: 50, netProfit: 50, submissionDetails: { refNumber: 'MTD-ACK-XYZ', submittedAt: '2025-10-01T10:00:00Z' } },
            { id: 'q2-specific-draft', taxYear: '2025/2026', quarterName: 'Q2', status: 'DRAFT', taxableIncome: 0, allowableExpenses: 0, netProfit: 0 },
          ],
          totalNetProfitSubmitted: 50,
          cumulativeEstimatedTaxLiability: 10,
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockQuarters) });
      });

      // Re-navigate to /quarters to ensure the mock is active
      await page.goto('/quarters');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const q2Row = page.locator('tbody tr').filter({ hasText: 'Q2 (2025/2026)' });
      const editLink = q2Row.locator('a', { hasText: 'Edit' });
      await expect(editLink).toBeVisible();
      await editLink.click();

      await expect(page).toHaveURL('/quarters/edit/q2-specific-draft');
      await expect(page.locator('app-quarter-form')).toBeVisible();
    });
  });
});
