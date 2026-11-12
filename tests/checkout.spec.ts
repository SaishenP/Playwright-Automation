import { test, expect } from './fixtures';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHECKOUT SPECIFICATION & BLOCKER DEPENDENCY NOTICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KNOWN BLOCKER: Bug #9 — "Proceed to Checkout" button does not respond.
 *
 * Adhering to the updated Playwright Test Authoring Standard:
 * 1. Exercises the complete, authentic end-to-end user journey via `navigateViaCart`.
 * 2. Does NOT fake navigation (e.g. showPage('checkout')) or skip the flow silently.
 * 3. Scopes form fields by visible text labels (no brittle CSS IDs).
 * 4. Fills form data declaratively (no repetitive field ladders).
 * 5. Uses semantic user-facing regex matchers (no speculative selector lists).
 * 6. Because the "Proceed to Checkout" button is blocked in the broken TechShop app,
 *    each test will fail at the transition guard awaiting the Checkout heading.
 *    Once Bug #9 is resolved by developers, these tests will automatically progress
 *    into the checkout form and validate their respective regression cases.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Shared valid shipping data declared by visible form label
const VALID_SHIPPING_FIELDS: Record<string, string> = {
  'First Name': 'Jane',
  'Last Name': 'Doe',
  'Address': '123 Tech Lane',
  'City': 'Metropolis',
  'ZIP Code': '10001',
  'Email Address': 'jane.doe@example.com',
  'Phone Number': '555-0199',
};

const VALID_PAYMENT_FIELDS: Record<string, string> = {
  'Card Number': '4111222233334444',
  'Expiry': '12/29',
  'CVV': '123',
};

test.describe('Checkout Feature', () => {
  // ── Blocker Dependency Regression Tests ──

  test('TC-CHK-004: Checkout rejects submission when all required fields are blank [Regression — Bug #10]', async ({
    cartPage,
    checkoutPage,
  }) => {
    // Encapsulated authentic user journey: Catalog -> Cart -> Proceed to Checkout
    await checkoutPage.navigateViaCart(cartPage);

    // Transition Guard: Requires Bug #9 fix to proceed
    await expect(checkoutPage.checkoutHeading).toBeVisible();

    // Attempt submission with all fields blank
    await checkoutPage.placeOrder();

    // Verification: Order must NOT be placed; user stays on checkout with error
    await expect(checkoutPage.confirmHeading).not.toBeVisible();
    await expect(checkoutPage.checkoutHeading).toBeVisible();
    await expect(checkoutPage.errorMessage).toBeVisible();
  });

  test('TC-CHK-009: Checkout rejects expired card date in the past [Regression — Bug #7]', async ({
    cartPage,
    checkoutPage,
  }) => {
    await checkoutPage.navigateViaCart(cartPage);

    // Transition Guard: Requires Bug #9 fix to proceed
    await expect(checkoutPage.checkoutHeading).toBeVisible();

    // Declaratively fill valid shipping + payment, with an EXPIRED card date
    await checkoutPage.fillForm({
      ...VALID_SHIPPING_FIELDS,
      ...VALID_PAYMENT_FIELDS,
      'Expiry': '01/20', // Past expiration date
    });

    await checkoutPage.placeOrder();

    // Verification: Past expiry must be rejected; order must not be confirmed
    await expect(checkoutPage.confirmHeading).not.toBeVisible();
    await expect(checkoutPage.checkoutHeading).toBeVisible();
    await expect(checkoutPage.errorMessage).toBeVisible();
  });

  test('TC-CHK-017: Checkout rejects CVV containing letters or symbols [Regression — Bug #8]', async ({
    cartPage,
    checkoutPage,
  }) => {
    await checkoutPage.navigateViaCart(cartPage);

    // Transition Guard: Requires Bug #9 fix to proceed
    await expect(checkoutPage.checkoutHeading).toBeVisible();

    // Declaratively fill valid shipping + payment, with an INVALID CVV with letters
    await checkoutPage.fillForm({
      ...VALID_SHIPPING_FIELDS,
      ...VALID_PAYMENT_FIELDS,
      'CVV': '12A', // Non-numeric characters
    });

    await checkoutPage.placeOrder();

    // Verification: Non-numeric CVV must be rejected; order must not be confirmed
    await expect(checkoutPage.confirmHeading).not.toBeVisible();
    await expect(checkoutPage.checkoutHeading).toBeVisible();
    await expect(checkoutPage.errorMessage).toBeVisible();
  });

  test('TC-CHK-001: Valid checkout submission navigates to confirmation page with order reference [Regression — Bug #11]', async ({
    cartPage,
    checkoutPage,
  }) => {
    await checkoutPage.navigateViaCart(cartPage);

    // Transition Guard: Requires Bug #9 fix to proceed
    await expect(checkoutPage.checkoutHeading).toBeVisible();

    // Declaratively fill complete valid shipping and payment details
    await checkoutPage.fillForm({
      ...VALID_SHIPPING_FIELDS,
      ...VALID_PAYMENT_FIELDS,
    });

    await checkoutPage.placeOrder();

    // Verification: Order placed confirmation is displayed
    await expect(checkoutPage.confirmHeading).toBeVisible();
    await expect(checkoutPage.confirmationMessage).toBeVisible();

    // Order reference number must be generated and visible (e.g. Order #TS-XXXX)
    await expect(checkoutPage.orderReference).toBeVisible();
  });
});
