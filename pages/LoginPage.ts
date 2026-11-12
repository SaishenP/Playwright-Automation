import { type Locator, type Page } from '@playwright/test';

/**
 * Lightweight Page Object for the TechShop Login page.
 * Follows the test-authoring standard: readonly locators and action methods.
 */
export class LoginPage {
  readonly page: Page;
  readonly loginSection: Locator;
  readonly productsSection: Locator;
  readonly productsHeading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly browseAsGuestButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginSection = page.locator('#page-login');
    this.productsSection = page.locator('#page-products');
    this.productsHeading = page.getByRole('heading', { name: 'Our Products' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.browseAsGuestButton = page.getByRole('button', { name: 'Browse as Guest' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.signInButton.click();
  }
}

