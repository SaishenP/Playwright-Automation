import { test, expect } from '../fixtures/test-fixtures';

test.describe('Login Feature', () => {
  // ── Positive Tests ──

  test('TC-LOGIN-001: Successful login with valid credentials navigates to product catalog', async ({
    loginPage,
    testCredentials,
  }) => {
    await loginPage.login(testCredentials.email, testCredentials.pass);

    await expect(loginPage.productsHeading).toBeVisible();
    await expect(loginPage.loginSection).toHaveClass(/hidden/);
  });

  test('TC-LOGIN-002: Password input masks characters with type="password" [Regression — Known Bug]', async ({
    loginPage,
  }) => {
    // Verifies password characters are masked for security
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  // ── Negative Tests ──

  test('TC-LOGIN-003: Login rejects empty submission with validation error [Regression — Known Bug]', async ({
    loginPage,
  }) => {
    await loginPage.signInButton.click();

    await expect(loginPage.loginSection).not.toHaveClass(/hidden/);
    await expect(loginPage.productsSection).toHaveClass(/hidden/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-LOGIN-004: Login rejects empty email when password is provided [Regression — Known Bug]', async ({
    loginPage,
    testCredentials,
  }) => {
    await loginPage.passwordInput.fill(testCredentials.pass);
    await loginPage.signInButton.click();

    await expect(loginPage.loginSection).not.toHaveClass(/hidden/);
    await expect(loginPage.productsSection).toHaveClass(/hidden/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-LOGIN-005: Login rejects empty password when email is provided [Regression — Known Bug]', async ({
    loginPage,
    testCredentials,
  }) => {
    await loginPage.usernameInput.fill(testCredentials.email);
    await loginPage.signInButton.click();

    await expect(loginPage.loginSection).not.toHaveClass(/hidden/);
    await expect(loginPage.productsSection).toHaveClass(/hidden/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-LOGIN-006: Login rejects incorrect password with error message [Regression — Known Bug]', async ({
    loginPage,
    testCredentials,
  }) => {
    await loginPage.login(testCredentials.email, 'wrongpassword');

    await expect(loginPage.loginSection).not.toHaveClass(/hidden/);
    await expect(loginPage.productsSection).toHaveClass(/hidden/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-LOGIN-007: Login rejects invalid email format missing @ and domain [Regression — Known Bug]', async ({
    loginPage,
    testCredentials,
  }) => {
    await loginPage.login('not-an-email', testCredentials.pass);

    await expect(loginPage.loginSection).not.toHaveClass(/hidden/);
    await expect(loginPage.productsSection).toHaveClass(/hidden/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-LOGIN-008: Failed login renders visible error message and stays on login page [Regression — Known Bug]', async ({
    loginPage,
  }) => {
    await loginPage.login('unknown@techshop.com', 'badpass999');

    await expect(loginPage.loginSection).toBeVisible();
    await expect(loginPage.errorMessage).toBeVisible();
  });

  // ── Edge Tests ──

  test('TC-LOGIN-009: Authenticated session persists across page reload [Regression — Known Bug]', async ({
    loginPage,
    testCredentials,
    page,
  }) => {
    await loginPage.login(testCredentials.email, testCredentials.pass);
    await expect(loginPage.productsHeading).toBeVisible();

    await page.reload();

    // Session must persist: user stays on catalog and is not booted to login
    await expect(loginPage.productsHeading).toBeVisible();
    await expect(loginPage.loginSection).toHaveClass(/hidden/);
  });

  test('TC-LOGIN-010: Login trims leading and trailing whitespace from email input', async ({
    loginPage,
    testCredentials,
  }) => {
    const paddedEmail = `  ${testCredentials.email}  `;
    await loginPage.login(paddedEmail, testCredentials.pass);

    await expect(loginPage.productsHeading).toBeVisible();
  });

  test('TC-LOGIN-011: Password validation enforces exact case sensitivity [Regression — Known Bug]', async ({
    loginPage,
    testCredentials,
  }) => {
    // Change case of the valid password ('Password123' vs 'password123')
    const wrongCasePassword =
      testCredentials.pass.charAt(0).toUpperCase() + testCredentials.pass.slice(1);
    await loginPage.login(testCredentials.email, wrongCasePassword);

    await expect(loginPage.loginSection).not.toHaveClass(/hidden/);
    await expect(loginPage.productsSection).toHaveClass(/hidden/);
    await expect(loginPage.errorMessage).toBeVisible();
  });
});

