import { FullConfig, chromium, expect } from '@playwright/test';

const TEST_USER = {
  userId: 'mock-test-user-id',
  userName: 'TestUser',
  token: 'mock-jwt-token-authenticated',
  email: 'test@example.com',
  password: 'securepassword123',
};
// Path to the file where the authentication state will be saved
const authFile = 'playwright-auth-state.json';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;

  if (!baseURL) {
    throw new Error('baseURL is not defined in Playwright configuration.');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Playwright globalSetup: Starting authentication and business registration...`);

  // 1. Mock API calls needed for setup (login/register business)
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: TEST_USER.token,
        userId: TEST_USER.userId,
        userName: TEST_USER.userName,
        message: 'Login successful'
      }),
    });
  });

  await page.route('**/api/business', async route => {
    const requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        businessId: 'mockBusinessId-123',
        name: requestBody.name,
        message: 'Business created successfully.'
      }),
    });
  });

  // 2. Perform the actual login
  await page.goto(`${baseURL}/auth/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');

  await page.waitForURL(`${baseURL}/setup`);
  console.log('Playwright globalSetup: Logged in successfully, redirected to setup.');

  // 3. Register a business
  // FIX: Correct the ID selector for the business name input field
  await page.fill('input[id="business-name"]', 'Playwright Setup Business');
  // FIX: Correct the ID selector for the start date input field (assuming it also has a hyphen based on setup.spec.ts)
  await page.fill('input[id="accounting-start-date"]', '2025-04-06');
  await page.click('button[type="submit"]');

  await page.waitForURL(`${baseURL}/dashboard`);
  await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
  console.log('Playwright globalSetup: Business registered successfully, redirected to dashboard.');

  // 4. Save the storage state
  await page.context().storageState({ path: authFile });
  console.log(`Playwright globalSetup: Auth state saved to ${authFile}`);

  await browser.close();
  console.log(`Playwright globalSetup: Browser closed.`);
}

export default globalSetup;
