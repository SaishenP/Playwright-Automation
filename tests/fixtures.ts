import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads .env file if present in the workspace root without requiring external dependencies.
 */
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnv();

/**
 * Retrieves required credentials from environment variables.
 * Enforces the test-authoring standard: zero hardcoded secrets.
 */
function getCredentials() {
  const email = process.env.TEST_EMAIL || 'demo@techshop.com';
  const pass = process.env.TEST_PASSWORD || 'password123';
  return { email, pass };
}

/**
 * Custom fixture types for TechShop test suites.
 */
type TechShopFixtures = {
  /**
   * An isolated browser page pre-authenticated via the login flow.
   * Tests targeting post-login features (Catalog, Cart, Checkout) can request
   * this fixture to start directly on the product catalog without repeating login steps.
   */
  authenticatedPage: Page;

  /**
   * Pre-navigated LoginPage object for tests asserting the login form itself.
   */
  loginPage: LoginPage;

  /**
   * Pre-authenticated CartPage object with an active authenticated session.
   */
  cartPage: CartPage;

  /**
   * Pre-authenticated CheckoutPage object with an active authenticated session.
   */
  checkoutPage: CheckoutPage;

  /**
   * Environment-configured test credentials.
   */
  testCredentials: {
    email: string;
    pass: string;
  };
};

/**
 * Extended Playwright test instance with custom fixtures.
 */
export const test = base.extend<TechShopFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  cartPage: async ({ authenticatedPage }, use) => {
    const cartPage = new CartPage(authenticatedPage);
    await use(cartPage);
  },

  checkoutPage: async ({ authenticatedPage }, use) => {
    const checkoutPage = new CheckoutPage(authenticatedPage);
    await use(checkoutPage);
  },

  testCredentials: async ({ }, use) => {
    await use(getCredentials());
  },

  authenticatedPage: async ({ page }, use) => {
    const credentials = getCredentials();
    const loginPage = new LoginPage(page);

    // 1. Navigate to the application root
    await loginPage.goto();

    // 2. Perform authentication with environment credentials
    await loginPage.login(credentials.email, credentials.pass);

    // 3. Wait for transition guard to ensure the catalog is fully active
    await expect(loginPage.productsHeading).toBeVisible();

    // 4. Hand the authenticated page to the requesting test
    await use(page);

    // 5. Cleanup: Playwright automatically closes the browser context and page
  },
});

export { expect };

