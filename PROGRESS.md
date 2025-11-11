
# Project Progress Log: MTD-ITSA Compliance Portal Frontend

This document tracks the overall progress of the MTD-ITSA Compliance Portal Frontend development, outlining the main objectives, completed tasks, and upcoming work items. It is intended to provide a clear overview for any resuming developer, including the AI assistant.

---

## I. Project Overview & Goal

**Source:** `mtd-itsa.md`, `mtd2.md`, `README.md`

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

*   **Frontend:** Angular (TypeScript) - Adhering to the latest Angular style guide (no `.component` or `.service` suffixes for class/file names).
*   **UI/Styling:** Tailwind CSS.
*   **API Client:** Generated from OpenAPI spec using `ng-openapi-gen`.
*   **Testing:** Playwright for E2E tests.

---

## III. Frontend Development Progress

### Current Status: Initial Setup and Naming Conventions Resolved

We have successfully resolved the initial `ng serve` compilation errors and aligned the project's component and service naming conventions with the new Angular style guide (e.g., `login.ts` for `Login` component, rather than `login.component.ts` for `LoginComponent`). The application now builds and serves successfully.

**Last Confirmed State:** `ng serve` runs without errors, and bundles are generated.

### Completed Tasks:

*   **Reviewed Project Specifications:** Understood core requirements from `mtd-itsa.md` and `mtd2.md`.
*   **Identified `ng serve` Errors:** Addressed "Cannot find module" errors.
*   **Investigated Angular Naming Conventions:** Confirmed new style guide for component/service file and class names (e.g., `login.ts` for `Login` class).
*   **Applied Naming Convention Fixes:** Updated `src/app/auth/login/login.ts`, `src/app/auth/register/register.ts`, `src/app/dashboard/dashboard.ts`, `src/app/setup/setup.ts`, and `src/app/app.routes.ts` to reflect the correct file paths and class names.
*   **Verified Build Success:** `npx ng serve` now compiles and serves the application.

### Next Steps & Future Tasks:

1.  **Playwright Setup:**
    *   Install `@playwright/test` as a dev dependency.
    *   Configure basic Playwright setup in the project.
    *   Create a simple, "smoke" E2E test to verify Playwright installation and basic functionality (e.g., app loads, login page is visible).
2.  **Implement Register Component:**
    *   Create `src/app/auth/register/register.html` and `src/app/auth/register/register.scss`.
    *   Implement `Register` component logic to use `AuthService.register()`.
    *   Add routing from Login to Register and vice-versa.
    *   Write Playwright E2E tests for user registration.
3.  **Implement Business Setup Component:**
    *   Create `src/app/setup/setup.html` and `src/app/setup/setup.scss`.
    *   Implement `Setup` component logic to register a new business.
    *   Write Playwright E2E tests for business registration.
4.  **Implement Dashboard Component:**
    *   Create `src/app/dashboard/dashboard.html` and `src/app/dashboard/dashboard.scss`.
    *   Implement basic dashboard layout and data display.
    *   Write Playwright E2E tests for dashboard viewing.
5.  **Auth Guard Implementation:**
    *   Create an Angular route guard to protect routes (e.g., `/setup`, `/dashboard`) from unauthenticated access.
    *   Update `app.routes.ts` to apply the guard.
    *   Write Playwright E2E tests for unauthorized access attempts.
