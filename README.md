
# MTD-ITSA Compliance Portal Frontend

This project is the Angular (TypeScript) frontend for a Making Tax Digital for Income Tax Self Assessment (MTD-ITSA) Compliance Portal. It aims to provide a robust, full-stack boilerplate, focusing on secure user authentication, business registration, and quarterly income/expense data management.

## Key Features

*   **Secure User Authentication:** Implemented Login and Register screens.
*   **Business Setup:** Form for registering a single self-employment business.
*   **Admin Dashboard Structure:** Basic navigation and user information display (upcoming).
*   **Quarterly Data Entry & Submission:** UI for inputting income/expenses and simulated submission (upcoming).
*   **Data Enrichment Display:** Net Profit/Loss, Cumulative Estimated Tax Liability (upcoming).
*   **Data Visualization:** Income vs. Expenses trend comparison (upcoming).

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
