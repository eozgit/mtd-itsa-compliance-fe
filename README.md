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
![User Registration Form with Validation](https://raw.githubusercontent.com/eozgit/mtd-itsa-compliance-fe/main/media/password-error-screenshot.png "Register for an account with validation errors")

#### Business Setup Form
This screenshot captures the "Set Up Your Business" form. It highlights the required fields "Business Name" and "Accounting Start Date" with clear validation messages, ensuring users provide essential information for their self-employment business.
![Business Setup Form with Required Field Indicators](https://raw.githubusercontent.com/eozgit/mtd-itsa-compliance-fe/main/media/business-setup-error-screenshot.png "Business Setup form showing validation errors")

#### Successful Business Registration Flow
This video demonstrates a seamless user experience where a new user successfully registers a business. Upon successful submission of business details, the application smoothly navigates and redirects the user to their personalized dashboard, showcasing the completed setup process.

https://github.com/user-attachments/assets/8b91786f-adc4-432c-8214-091c5fe317f2

### Dashboard and Data Management

#### Main User Dashboard with Financial Overview
This image presents the main dashboard of the MTD-ITSA Compliance Portal. It welcomes the user and features an "Income vs. Expenses Trend" chart, providing a clear and engaging visualization of key financial data over time.
![Main User Dashboard with Financial Overview](https://raw.githubusercontent.com/eozgit/mtd-itsa-compliance-fe/main/media/chart-fully-rendered.png "Main User Dashboard showing Income vs. Expenses Trend")

#### Listing of Available Quarterly Submissions (Drafts)
This video illustrates the "Quarters List Page," where users can view their quarterly tax submissions. It effectively shows how draft quarters are clearly presented, indicating their availability for further editing or submission.

https://github.com/user-attachments/assets/a78c7bef-07a4-4a9f-a307-912df1df4e5b

#### Dynamic Net Profit/Loss Calculation in Quarterly Data Entry
Observe the dynamic capabilities of the "Quarter Form" in this video. As users input their taxable income and allowable expenses, the system instantly calculates and displays the "Net Profit/Loss," providing immediate financial feedback.

https://github.com/user-attachments/assets/7213602e-ce76-49b2-b6b5-7617f5001913

#### Main User Dashboard: Trend Chart Rendering
This video demonstrates the successful rendering of the Dashboard page after a user has authenticated and the application has received quarterly data. It highlights the 'Income vs. Expenses Trend' chart being dynamically loaded and verified, confirming the correct display of financial data visualization components.

https://github.com/user-attachments/assets/7213602e-ce76-49b2-b6b5-7617f5001913

---

## 🚀 Deployment and Local Development with Docker

To run the MTD-ITSA Compliance Portal locally using **Docker Compose**, including the required backend services and database, you must use the separate deployment repository.

Follow these steps from your terminal:

1.  **Clone the Deployment Manifests Repository:**
    ```bash
    git clone [https://github.com/eozgit/deployment-manifests](https://github.com/eozgit/deployment-manifests)
    ```

2.  **Navigate to the Application Directory:**
    ```bash
    cd deployment-manifests/mtd-itsa-compliance
    ```

3.  **Build and Run the Services:**
    Use Docker Compose to build the application containers (including this frontend application) and start all services in detached mode (`-d`).

    The frontend container image will be built from the source code in the `deployment-manifests` repository.

    ```bash
    docker compose up --build -d
    ```

Once the services are up, the frontend application will be available in your browser at `http://localhost:4200`.

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
