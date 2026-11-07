import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type TechShopFixtures = {
  loginPage: LoginPage;
  testCredentials: {
    email: string;
    pass: string;
  };
};

export const test = base.extend<TechShopFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  testCredentials: async ({}, use) => {
    await use({
      email: process.env.TEST_EMAIL || 'demo@techshop.com',
      pass: process.env.TEST_PASSWORD || 'password123',
    });
  },
});

export { expect };

