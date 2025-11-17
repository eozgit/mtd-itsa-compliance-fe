import { test, expect } from '@playwright/test';
import { QuartersResponse } from '../src/app/core/api/models/quarters-response';
import { QuarterlyUpdate } from '../src/app/core/api/models/quarterly-update';

// Define some mock data that the chart should eventually display
const MOCK_QUARTERS_DATA: QuarterlyUpdate[] = [
  {
    id: 'quarter1-id',
    businessId: 102,
    taxYear: '2025/2026',
    quarterName: 'Q1',
    taxableIncome: 10000,
    allowableExpenses: 2000,
    netProfit: 8000,
    status: 'SUBMITTED',
  },
  {
    id: 'quarter2-id',
    businessId: 102,
    taxYear: '2025/2026',
    quarterName: 'Q2',
    taxableIncome: 12000,
    allowableExpenses: 3000,
    netProfit: 9000,
    status: 'SUBMITTED',
  },
  {
    id: 'quarter3-id',
    businessId: 102,
    taxYear: '2025/2026',
    quarterName: 'Q3',
    taxableIncome: 11000,
    allowableExpenses: 2500,
    netProfit: 8500,
    status: 'SUBMITTED',
  },
  {
    id: 'quarter4-id',
    businessId: 102,
    taxYear: '2025/2026',
    quarterName: 'Q4',
    taxableIncome: 13000,
    allowableExpenses: 3500,
    netProfit: 9500,
    status: 'SUBMITTED',
  },
];

test.describe('Dashboard Data Visualization Chart', () => {

  // FIX: Move API route mocking into a beforeEach block.
  // This guarantees the mock is active for the 'page' fixture for every test in this describe block,
  // before any navigation specific to the test runs.
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/quarters', async route => {
      console.log('Playwright DIAGNOSTIC: /api/quarters mock HIT!'); // This log MUST appear now!
      const responseBody: QuartersResponse = {
        quarters: MOCK_QUARTERS_DATA,
        cumulativeEstimatedTaxLiability: MOCK_QUARTERS_DATA.reduce((sum, q) => sum + ((q.taxableIncome ?? 0) - (q.allowableExpenses ?? 0)) * 0.2, 0),
        totalNetProfitSubmitted: MOCK_QUARTERS_DATA.reduce((sum, q) => sum + ((q.taxableIncome ?? 0) - (q.allowableExpenses ?? 0)), 0),
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    });
    // It's also good practice to ensure the base page is loaded if not handled by globalSetup for all tests.
    // However, since globalSetup lands on /dashboard, this might not be strictly necessary here.
    // We'll rely on the main test's page.goto for now.
  });

  test('should display Income vs Expenses trend chart with data after business setup and quarter updates', async ({ page }) => {
    await test.step('Navigate to Dashboard and wait for it to load', async () => {
      // Navigate to the dashboard. The browser context is already authenticated by globalSetup.
      // And the /api/quarters mock is now active via beforeEach().
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify chart presence and content', async () => {
      await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
      await expect(page.locator('h3', { hasText: 'Income vs. Expenses Trend' })).toBeVisible();

      // Locate the chart component itself
      const quarterlyTrendChartComponent = page.locator('app-quarterly-trend-chart');
      await expect(quarterlyTrendChartComponent).toBeVisible();
      console.log('PLAYWRIGHT DIAGNOSTIC: app-quarterly-trend-chart component is visible.');

      // As confirmed by the HTML, the chart's labels and legend are rendered directly onto the canvas.
      // Therefore, they are not accessible as distinct DOM text elements for Playwright's 'text=' locator.
      // Removing these assertions.

      // Now, after verifying content, check the canvas itself.
      const chartCanvas = quarterlyTrendChartComponent.locator('canvas');
      await expect(chartCanvas).toBeVisible({ timeout: 10000 }); // Shorter timeout as content should already be there
      console.log(`PLAYWRIGHT DIAGNOSTIC: 'canvas' element is VISIBLE.`);

      // Add assertions for canvas attributes to ensure it has been initialized by ng2-charts
      await expect(chartCanvas).toHaveAttribute('width', /^\d+$/); // Check if width attribute exists and is a number
      await expect(chartCanvas).toHaveAttribute('height', /^\d+$/); // Check if height attribute exists and is a number
      console.log(`PLAYWRIGHT DIAGNOSTIC: 'canvas' element has width and height attributes.`);

      await page.screenshot({ path: 'test-results/chart-fully-rendered.png' });
      console.log('PLAYWRIGHT DIAGNOSTIC: Screenshot taken after canvas visibility check.');

      // Removed assertions for legend text as they are part of the canvas and not distinct DOM elements.
      // await expect(quarterlyTrendChartComponent.locator('text=Taxable Income')).toBeVisible({ timeout: 20000 });
      // await expect(quarterlyTrendChartComponent.locator('text=Allowable Expenses')).toBeVisible({ timeout: 20000 });
    });
  });
});
