# E2E Testing of Microsoft 365 solutions with Playwright

This repository can be used as a template to get started with [Playwright](https://playwright.dev/) to test Microsoft 365 solutions.

## Installation

- Clone this repository or use it as a template
- Run `npm install` to install the dependencies
- Run `npx playwright install` to install the browsers

## Configuration

To get started, you need to configure the following environment variables:

```bash
PAGE_URL=
USERNAME=
PASSWORD=
```

## Run the tests

In the `tests` folder, you can find a sample test that navigates to SharePoint and verifies the Site Title. You can start from there or create your own tests.

> **Important**: the `login.setup.ts` file contains the code to login to Microsoft 365. It is configured to run before all tests in the `playwright.config.ts` file.

To run the tests, execute the following command:

```bash
npm test
```

There are two optional scripts available:

- `npm run test:ui` to run the tests in UI mode
- `npm run test:debug` to run the tests in debug mode
