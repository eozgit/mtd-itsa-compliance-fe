
# Project Progress Log: MTD-ITSA Compliance Portal Frontend

This document tracks the overall progress of the MTD-ITSA Compliance Portal Frontend development, outlining the main objectives, completed tasks, and upcoming work items. It is intended to provide a clear overview for any resuming developer, including the AI assistant.

---

## I. Project Overview & Goal

**Source:** `mtd-itsa.md`, `mtd2.md`, `README.md`, Backend README
**Reminder for future AI self:** When starting a session from scratch, always ask the user for fresh copies of `mtd-itsa.md`, `mtd2.md`, Backend `README.md`, and any relevant Swagger/OpenAPI documentation to ensure I'm working with the latest specifications. Remember to use four tildes `~~~~` before and after code blocks for easy yanking.

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

### Current Status: Core Angular App Stable, All 13 Playwright E2E Tests Passing (Login, Register, Business Setup, Auth Guard, Dashboard)

The Angular application is now compiling, serving, and rendering correctly. Server-Side Rendering (SSR) has been successfully removed, simplifying the application architecture and resolving test environment complexities. Client-side routing for deep links (`/auth/login`) is fully functional. Playwright is set up, and all 13 E2E tests, including those for Login, Register, Business Setup, Auth Guard, and now the **Dashboard**, are passing for Chromium. Firefox and WebKit have been removed from the Playwright configuration as Safari/Firefox compatibility is not a requirement. The Business Setup component is fully implemented on the frontend, and its E2E tests are now passing, indicating that the test environment successfully provides the necessary authentication token.

**Last Confirmed State:** `npm run start` serves the Angular app successfully at `http://localhost:4200/auth/login`, rendering the login form. `npm run test:e2e` now shows **13 passed tests** (Login, Register, Business Setup, Auth Guard, and Dashboard E2E).

### Completed Tasks:

*   **Reviewed Project Specifications:** Understood core requirements from `mtd-itsa.md` and `mtd2.md`.
*   **Identified `ng serve` Errors:** Addressed "Cannot find module" errors.
*   **Investigated Angular Naming Conventions:** Confirmed new style guide for component/service file and class names (e.g., `login.ts` for `Login` component).
*   **Applied Naming Convention Fixes:** Updated `src/app/auth/login/login.ts`, `src/app/auth/register/register.ts`, `src/app/dashboard/dashboard.ts`, `src/app/setup/setup.ts`, and `src/app/app.routes.ts` to reflect the correct file paths and class names.
*   **Verified Build Success:** `npx ng serve` (now `npm run start`) compiles and serves the application.
*   **Addressed `404 Not Found` for Deep Links:** Configured `proxy.conf.js` (and `angular.json`) to allow `ng serve` to correctly handle client-side routes like `/auth/login`.
*   **Removed Server-Side Rendering (SSR):**
    *   Deleted `src/main.server.ts`, `src/server.ts`, `src/app/app.config.server.ts`, and `src/app/app.routes.server.ts`.
    *   Updated `angular.json` to remove SSR build options (`server`, `ssr`, `outputMode: "server"`) and configured `outputMode: "browser"`.
    *   Updated `package.json` to remove SSR related scripts (`serve:ssr:mtd-itsa-compliance-fe`).
*   **Resolved SSR `localStorage is not defined` Error:** (Now implicitly resolved by SSR removal, original platform-aware `AuthService` changes are still in place as good practice).
*   **Configured `HttpClient` for Interceptors:** Added `withFetch()` and registered `authInterceptor` to `provideHttpClient()` in `app.config.ts`.
*   **Initialized Playwright:** Used `npm init playwright` to create `playwright.config.ts` and the `e2e` directory.
*   **Updated Playwright Configuration:**
    *   Increased global test and assertion timeouts.
    *   Configured HTML reporter not to open automatically.
    *   Removed 'firefox' project and other unused browser configurations.
*   **Added Playwright Test Scripts:** Updated `package.json` with `test:e2e` and related scripts.
*   **Created Initial `e2e/login.spec.ts`:** Basic test for login page elements.
*   **Fixed Playwright Assertion Mismatches (Register Component):** Updated `e2e/register.spec.ts` to correctly assert error messages on the register page by simulating user interaction and using robust locators.
*   **Resolved Playwright WebKit Dependencies:** WebKit browser support was explicitly removed from `playwright.config.ts` as Safari compatibility is not required.
*   **Implemented Register Component:**
    *   Created `src/app/auth/register/register.html` and `src/app/auth/register/register.scss`.
    *   Implemented `Register` component logic to use `AuthService.register()`.
    *   Added routing from Login to Register and vice-versa.
    *   Wrote and fixed Playwright E2E tests for user registration (successful and invalid attempts).
*   **Resolved Authentication Token Handling for E2E Tests:**
    *   Correctly mapped `user_id`, `user_name`, and `token` from snake_case API response to camelCase `CurrentUser` interface in `AuthService.register` and `AuthService.login` *within the E2E testing environment*. The E2E tests now successfully receive and store a mock authentication token, enabling subsequent protected API calls (like business registration) to pass.
    *   Removed extensive debug logging from `AuthService` and Playwright tests after successful diagnosis and SSR removal.
*   **Implemented Business Setup Component (Frontend):**
    *   Created `src/app/setup/setup.html` and `src/app/setup/setup.scss`.
    *   Implemented `Setup` component logic, including `ReactiveFormsModule` for form handling and `apiBusinessPost` for business registration.
    *   Wrote and fixed Playwright E2E tests for business registration, which are now passing due to the resolved token handling.
*   **Implemented Auth Guard and Passing E2E Tests:**
    *   Created `src/app/auth/auth.guard.ts` to protect routes.
    *   Updated `app.routes.ts` to apply the guard to `/setup` and `/dashboard`.
    *   Modified `AuthService` and `AuthGuard` (removing `_isAuthServiceReady`, simplifying `combineLatest` usage) to function correctly without SSR.
    *   Wrote and fixed Playwright E2E tests for unauthorized and authorized access attempts to protected routes, which are now all passing.
*   **[NEW] Backend API Authentication Response:** The `/api/auth/register` and `/api/auth/login` endpoints **now correctly return a full `AuthResponse` object with a token**, resolving the previous backend issue. This means the frontend can now process authentication responses directly without needing to assume an empty body or immediately re-login.
*   **[NEW] Implemented Dashboard Component (Frontend):**
    *   Created `src/app/dashboard/dashboard.html` with a basic layout and placeholder content using Tailwind CSS.
    *   Confirmed `src/app/dashboard/dashboard.scss` can remain minimal or empty due to Tailwind CSS usage.
    *   Wrote and fixed Playwright E2E tests (`e2e/dashboard.spec.ts`) for dashboard viewing (authenticated access and unauthenticated redirection), which are now passing.

### Remaining Issues & Next Steps:

1.  **Quarterly Data Entry & Submission Components:** Start development of UI for inputting income/expenses and simulated submission. This will involve:
    *   Creating new components for quarterly updates.
    *   Implementing forms for income and expense entry.
    *   Integrating with relevant API endpoints (`apiQuarterIdPut`, `apiQuarterIdSubmitPost`, `apiQuartersGet`).
    *   Writing Playwright E2E tests for these new features.
2.  **Data Enrichment Display:** Implement UI for Net Profit/Loss and Cumulative Estimated Tax Liability.
3.  **Data Visualization:** Implement UI for Income vs. Expenses trend comparison.
