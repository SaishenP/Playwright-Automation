# Playwright Test Authoring Standard

## Purpose

When asked to write or maintain Playwright tests, follow these mandatory instructions to produce clean, resilient, isolated, and maintainable test suites.

---

## 1. Locators: User-Facing & Resilient

Always locate elements the way a user (or assistive tech) identifies them:

* **Preferred Hierarchy:**
  1. `page.getByRole(role, { name })` — buttons, headings, links, textboxes, dialogs.
  2. `page.getByLabel(text)` — form inputs associated with `<label>`.
  3. `page.getByText(text, { exact })` — static non-interactive text elements.
  4. `page.getByTestId(id)` — when accessible roles or labels are unavailable.
* **Strictly Forbidden:**
  * Brittle DOM/CSS path chains (e.g. `div > div:nth-child(3) > span`).
  * Fragile styling classes (e.g. `.css-1x8a9df`, `.btn-primary.mt-2`).
  * XPath expressions based on page structure.
  * Speculative selector chains (e.g. `.order-ref, #order-ref, [data-testid="order-ref"]`).
  * Raw implementation IDs for inputs with visible labels (e.g. `#co-firstname`, `#co-card`).
* **Unassociated Form Fields & Container Scoping:** When form inputs lack explicit `<label for="...">` or `aria-label` bindings:
  * Do NOT fall back to raw implementation IDs (`#co-firstname`, `#co-card`, `#co-expiry`).
  * Instead, scope the input by its visible label within its container:
    ```ts
    // ✅ Resilient to ID/framework refactoring:
    page.locator('.form-group', { hasText: 'First Name' }).getByRole('textbox')
    ```
  * Or locate by unique user-facing placeholder: `page.getByPlaceholder('MM/YY')`.
  * In Page Objects, provide a semantic helper method:
    ```ts
    field(labelText: string): Locator {
      return this.page.locator('.form-group', { hasText: labelText }).getByRole('textbox');
    }
    ```
* **Missing Locators:** If an element lacks accessible semantics (e.g. an icon button with no text/aria-label, or an input without a label), flag it immediately and recommend adding an accessible attribute (`aria-label`, `label`, or `data-testid`).

---

## 2. Assertions: Meaningful & Web-First

Every test must assert a real functional outcome — never simply that an action did not throw an error.

* **Web-First Assertions:** Always use `expect(locator)` with auto-retrying web-first matchers:
  ```ts
  // ✅ GOOD: Retries until condition is met or timeout
  await expect(page.getByRole('heading', { name: 'Our Products' })).toBeVisible();
  await expect(cartPage.totalPrice).toHaveText('$357.75');
  await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  ```
* **Strictly Forbidden:**
  * Non-retrying manual checks (e.g. `expect(await locator.isVisible()).toBe(true)`).
  * Meaningless assertions (e.g. asserting static page elements that never change regardless of test outcome).
  * Omitting assertions after user actions.

---

## 3. Suite Structure & Light Page Objects

Maintain clear modularity and high reusability:

* **File Organization:**
  * One test spec per feature area:
    * `tests/login.spec.ts`
    * `tests/catalog.spec.ts`
    * `tests/cart.spec.ts`
    * `tests/checkout.spec.ts`
  * Page Objects live in `pages/` (e.g. `pages/LoginPage.ts`, `pages/CartPage.ts`).
* **Lightweight Page Objects:**
  * Store locators as readonly properties initialized in the constructor.
  * Encapsulate multi-step interactions as descriptive action methods.
  * Do not put assertions inside Page Object methods unless performing standard transition guards.
* **Declarative Form Handling & Journey Encapsulation:**
  * **Eliminate Repetitive Field Ladders:** Never write ladders of `if (data.field !== undefined) await this.fieldInput.fill(data.field)` across Page Objects. Use declarative key-value mapping:
    ```ts
    async fillForm(fields: Record<string, string>) {
      for (const [label, value] of Object.entries(fields)) {
        await this.field(label).fill(value);
      }
    }
    ```
  * **Encapsulate Multi-Step User Journeys:** If reaching a feature requires navigating upstream steps (e.g. adding an item to the cart and proceeding to checkout), encapsulate that sequence in a Page Object helper method (e.g. `checkoutPage.navigateViaCart(productId)`) or fixture rather than duplicating the same 4-line flow in every test.
  ```ts
  export class LoginPage {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly errorMessage: Locator;

    constructor(private readonly page: Page) {
      this.usernameInput = page.getByRole('textbox', { name: 'Username' });
      this.passwordInput = page.getByRole('textbox', { name: 'Password' });
      this.signInButton = page.getByRole('button', { name: 'Sign In' });
      this.errorMessage = page.locator('#login-error');
    }

    async goto() {
      await this.page.goto('/');
    }

    async login(email: string, pass: string) {
      await this.usernameInput.fill(email);
      await this.passwordInput.fill(pass);
      await this.signInButton.click();
    }
  }
  ```

---

## 4. Fixtures: Centralized Setup

Never duplicate boilerplate setup across tests or copy-paste authentication steps.

* **Custom Fixtures:** Extend Playwright's `test` to inject pre-configured page objects and authenticated sessions:
  ```ts
  // fixtures.ts
  import { test as base } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';
  import { CartPage } from '../pages/CartPage';

  type TechShopFixtures = {
    loginPage: LoginPage;
    cartPage: CartPage;
    authenticatedUser: void;
  };

  export const test = base.extend<TechShopFixtures>({
    loginPage: async ({ page }, use) => {
      await use(new LoginPage(page));
    },
    cartPage: async ({ page }, use) => {
      await use(new CartPage(page));
    },
    authenticatedUser: async ({ loginPage }, use) => {
      await loginPage.goto();
      await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
      await use();
    },
  });

  export { expect } from '@playwright/test';
  ```

---

## 5. Test Isolation: Zero Coupling

* Every test must be completely independent and runnable in parallel or in any arbitrary order.
* Never rely on state left behind by a previous test.
* Each test operates within its own fresh browser context and page lifecycle.

---

## 6. Secrets & Environment Configuration

* **Never Hardcode Credentials:** Never embed plain-text credentials or API tokens in spec files or page objects.
* **Environment Variables:** Load credentials and base URLs from environment variables:
  * `process.env.TEST_EMAIL`
  * `process.env.TEST_PASSWORD`
  * `process.env.BASE_URL` (configured in `playwright.config.ts`)
* Provide clean fallbacks for local test execution via `.env` files (ignored in `.gitignore`).

---

## 7. The Strictly Forbidden List

1. **NO Manual Sleeps:** Never write `page.waitForTimeout(n)` or arbitrary `setTimeout()`. Rely exclusively on Playwright's auto-waiting and web-first `expect(locator)` assertions.
2. **NO Hardcoded Secrets:** No plain credentials in test files.
3. **NO Vacuous Assertions:** No assertions that verify static boilerplate rather than the dynamic outcome of the tested operation.
4. **NO Test Interdependence:** No passing variables or state between `test()` blocks.
5. **NO Raw Implementation IDs for Labeled Fields:** Do not use `#co-card`, `#co-firstname`, etc. when form fields have visible labels or placeholders.
6. **NO Speculative Fallback Chains:** Do not use comma-separated speculative selector lists (`#error, .error, .alert-danger`).
7. **NO Repetitive Multi-Step Journey Setup:** Do not copy-paste multi-line page traversal setup across test cases.

