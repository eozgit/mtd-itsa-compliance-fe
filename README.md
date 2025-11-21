# MTD-ITSA Compliance Portal Frontend

This project is the Angular (TypeScript) frontend for a Making Tax Digital for Income Tax Self Assessment (MTD-ITSA) Compliance Portal. It aims to provide a robust, full-stack boilerplate, focusing on secure user authentication, business registration, and quarterly income/expense data management.

## Key Features

*   **Secure User Authentication:** Implemented Login and Register screens.
*   **Business Setup:** Form for registering a single self-employment business.
*   **Admin Dashboard Structure:** Basic navigation and user information display (upcoming).
*   **Quarterly Data Entry & Submission:** UI for inputting income/expenses and simulated submission (upcoming).
*   **Data Enrichment Display:** Net Profit/Loss, Cumulative Estimated Tax Liability (upcoming).
*   **Data Visualization:** Income vs. Expenses trend comparison (upcoming).

---

## Frontend Demonstrations

Here are some visual demonstrations showcasing key functionalities of the MTD-ITSA Compliance Portal frontend. These are generated from our end-to-end (E2E) test suite, ensuring reliability and accuracy.

### User Authentication

#### Register for an account
This image displays the user registration form, complete with input fields for email, username, and password. It demonstrates the application's client-side validation, showing a "Password is required" message when the field is left empty.
![User Registration Form with Validation](https://raw.githubusercontent.com/username/repo/main/media/register-Register-an-account-sh-2084b-invalid-credentials-chromium/original.png "Register for an account with validation errors")

#### Business Setup Form
This screenshot captures the "Set Up Your Business" form. It highlights the required fields "Business Name" and "Accounting Start Date" with clear validation messages, ensuring users provide essential information for their self-employment business.
![Business Setup Form with Required Field Indicators](https://raw.githubusercontent.com/username/repo/main/media/setup-Business-Setup-form-753ea-validation-errors-chromium/original.png "Business Setup form showing validation errors")

#### Successful Business Registration Flow (Video)
This video demonstrates a seamless user experience where a new user successfully registers a business. Upon successful submission of business details, the application smoothly navigates and redirects the user to their personalized dashboard, showcasing the completed setup process.

<details>
  <summary>Watch: Successful Business Registration</summary>
  <video controls src="https://github.com/username/repo/assets/00000000/8a9c8d30-b386-455b-9d41-e8d1976a2675"></video>
</details>

### Dashboard and Data Management

#### Main User Dashboard with Financial Overview
This image presents the main dashboard of the MTD-ITSA Compliance Portal. It welcomes the user and features an "Income vs. Expenses Trend" chart, providing a clear and engaging visualization of key financial data over time.
![Main User Dashboard with Financial Overview](https://raw.githubusercontent.com/username/repo/main/media/dashboard-chart-Dashboard--7524c-s-setup-and-quarter-updates-chromium/original.png "Main User Dashboard showing Income vs. Expenses Trend")

#### Listing of Available Quarterly Submissions (Drafts) (Video)
This video illustrates the "Quarters List Page," where users can view their quarterly tax submissions. It effectively shows how draft quarters are clearly presented, indicating their availability for further editing or submission.

<details>
  <summary>Watch: Quarterly Submissions Listing</summary>
  <video controls src="https://github.com/username/repo/assets/00000000/c2e0ef7c-1f6e-443b-8f19-94b2a8d11c50"></video>
</details>

#### Dynamic Net Profit/Loss Calculation in Quarterly Data Entry (Video)
Observe the dynamic capabilities of the "Quarter Form" in this video. As users input their taxable income and allowable expenses, the system instantly calculates and displays the "Net Profit/Loss," providing immediate financial feedback.

<details>
  <summary>Watch: Dynamic Net Profit/Loss Calculation</summary>
  <video controls src="https://github.com/username/repo/assets/00000000/544747a8-4e4b-4899-b1ff-97f26792ed71"></video>
</details>

---

## Technical Stack

*   **Frontend:** Angular (TypeScript)
*   **UI/Styling:** Tailwind CSS
*   **API Client:** Generated from OpenAPI spec using `ng-openapi-gen`
*   **End-to-End Testing:** Playwright

## Getting Started

### Prerequisites

Ensure you have Node.js (LTS recommended) and npm installed.

### Installation

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Install dependencies:
    ````bash
    npm install
    ````

### Development Server

To start the local development server (with proxy configured for API calls), run:

````bash
npm run start
````

Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

### API Client Generation

The API client is generated from an OpenAPI specification. If the OpenAPI spec changes, you can regenerate the client using:

````bash
npm run generate:api
````
*(Note: This assumes you have a script named `generate:api` configured in your `package.json` for `ng-openapi-gen`)*

## Testing

### End-to-End Tests (Playwright)

To run the End-to-End tests using Playwright, execute:

````bash
npm run test:e2e
````

This will launch the application and run the Playwright tests in a headless browser (Chromium by default). A detailed HTML report will be generated after the tests complete, which can be viewed by running `npx playwright show-report`.
