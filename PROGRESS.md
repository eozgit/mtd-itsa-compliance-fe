# Project Progress Log: MTD-ITSA Compliance Portal Frontend

This document tracks the overall progress of the MTD-ITSA Compliance Portal Frontend development, outlining the main objectives, completed tasks, and upcoming work items. It is intended to provide a clear overview for any resuming developer, including the AI assistant.

---

## I. Project Overview & Goal

**Source:** `mtd-itsa.md`, `mtd2.md`, `README.md`, Backend README
**Reminder for future AI self:** When starting a session from scratch, always ask the user for fresh copies of `mtd-itsa.md`, `mtd2.md`, Backend `README.md`, and any relevant Swagger/OpenAPI documentation to ensure I'm working with the latest specifications.

The primary goal is to build a robust, full-stack boilerplate for a Making Tax Digital for Income Tax Self Assessment (MTD-ITSA) Compliance Portal. This log specifically focuses on the **Angular (TypeScript) Frontend**.

**Key Deliverables (Frontend Focus):**
1.  **Secure User Authentication:** Login and Register screens.
2.  **Admin Dashboard Structure:** Basic navigation and user info display.
3.  **Business Setup:** Form for registering a single self-employment business.
4.  **Quarterly Data Entry & Submission:** UI for inputting income/expenses and simulated submission.
5.  **Data Enrichment Display:** Net Profit/Loss, Cumulative Estimated Tax Liability.
6.  **Data Visualization:** Income vs. Expenses trend comparison.
7.  **Technical Stack:** Angular, Tailwind CSS, leveraging generated API client.

---

## II. Technical Stack & Conventions

*   **Frontend:** Angular (TypeScript) - Adhering to the latest Angular style guide (no `.component` or `.service` suffixes for component/service class and file names).
*   **UI/Styling:** Tailwind CSS.
*   **API Client:** Generated from OpenAPI spec using `ng-openapi-gen`.
*   **Testing:** Playwright for E2E tests.

---

## III. Frontend Development Progress

### Current Status: Core Angular App Stable, Playwright Configured, E2E Test Fixes Remaining

The Angular application is now compiling, serving, and rendering correctly, including SSR. Client-side routing for deep links (`/auth/login`) is also fully functional. Playwright is set up, but tests are failing due to a system dependency issue for WebKit and assertion mismatches for Chromium/Firefox.

**Last Confirmed State:** `npm run start` serves the Angular app successfully at `http://localhost:4200/auth/login`, rendering the login form.

### Completed Tasks:

*   **Reviewed Project Specifications:** Understood core requirements from `mtd-itsa.md` and `mtd2.md`.
*   **Identified `ng serve` Errors:** Addressed "Cannot find module" errors.
*   **Investigated Angular Naming Conventions:** Confirmed new style guide for component/service file and class names (e.g., `login.ts` for `Login` component).
*   **Applied Naming Convention Fixes:** Updated `src/app/auth/login/login.ts`, `src/app/auth/register/register.ts`, `src/app/dashboard/dashboard.ts`, `src/app/setup/setup.ts`, and `src/app/app.routes.ts` to reflect the correct file paths and class names.
*   **Verified Build Success:** `npx ng serve` (now `npm run start`) compiles and serves the application.
*   **Addressed `404 Not Found` for Deep Links:** Configured `proxy.conf.js` (and `angular.json`) to allow `ng serve` to correctly handle client-side routes like `/auth/login`.
*   **Resolved SSR `localStorage is not defined` Error:** Modified `AuthService` to be platform-aware using `PLATFORM_ID` and `isPlatformBrowser`.
*   **Configured `HttpClient` for SSR:** Added `withFetch()` to `provideHttpClient()` in `app.config.ts`.
*   **Initialized Playwright:** Used `npm init playwright` to create `playwright.config.ts` and the `e2e` directory.
*   **Added Playwright Test Scripts:** Updated `package.json` with `test:e2e` and related scripts.
*   **Created Initial `e2e/login.spec.ts`:** Basic test for login page elements.

### Remaining Issues & Next Steps:

1.  **Fix Playwright Assertion Mismatches:**
    *   **Action:** Update `e2e/login.spec.ts` to expect `toHaveTitle(/MtdItsaComplianceFe/i)` and `toHaveText('Sign in')` for the login button. (Done in this progress log, needs to be applied by user).
    *   **Status:** Pending user application.
2.  **Resolve Playwright WebKit Dependencies:**
    *   **Issue:** `webkit` browser fails to launch due to missing host system libraries (`libicudata.so.66`, `libxml2.so.2`, etc.).
    *   **Action (Next when resuming):** Investigate why `sudo env PATH="$PATH" npx playwright install-deps` (or direct `sudo pacman -S` commands for specific packages on Arch Linux) isn't fully resolving these, and find the correct way to install them.
    *   **Status:** Pending (requires user interaction).
3.  **Run Playwright Tests:**
    *   **Action:** Re-run `npm run test:e2e` after applying assertion fixes and resolving WebKit dependencies.
    *   **Status:** Pending.

### Future Tasks (After Playwright is fully functional):

1.  **Implement Register Component:**
    *   Create `src/app/auth/register/register.html` and `src/app/auth/register/register.scss`.
    *   Implement `Register` component logic to use `AuthService.register()`.
    *   Add routing from Login to Register and vice-versa.
    *   Write Playwright E2E tests for user registration.
2.  **Implement Business Setup Component:**
    *   Create `src/app/setup/setup.html` and `src/app/setup/setup.scss`.
    *   Implement `Setup` component logic to register a new business.
    *   Write Playwright E2E tests for business registration.
3.  **Implement Dashboard Component:**
    *   Create `src/app/dashboard/dashboard.html` and `src/app/dashboard/dashboard.scss`.
    *   Implement basic dashboard layout and data display.
    *   Write Playwright E2E tests for dashboard viewing.
4.  **Auth Guard Implementation:**
    *   Create an Angular route guard to protect routes (e.g., `/setup`, `/dashboard`) from unauthenticated access.
    *   Update `app.routes.ts` to apply the guard.
    *   Write Playwright E2E tests for unauthorized access attempts.
