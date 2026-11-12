import { type Locator, type Page } from '@playwright/test';
import { type CartPage } from './CartPage';

/**
 * Page Object representing the Checkout and Order Confirmation views in TechShop.
 * Follows the updated Playwright Test Authoring Standard:
 * - Semantic container-scoped field lookup (no raw CSS IDs for labeled inputs).
 * - Declarative key-value form population (no repetitive if-ladders).
 * - Encapsulated multi-step journey traversal.
 * - Semantic regex-based locators (no speculative selector chains).
 */
export class CheckoutPage {
  readonly page: Page;

  // ── Checkout Form Locators ──
  readonly checkoutSection: Locator;
  readonly checkoutHeading: Locator;
  readonly placeOrderButton: Locator;
  readonly errorMessage: Locator;

  // ── Confirmation Page Locators ──
  readonly confirmSection: Locator;
  readonly confirmHeading: Locator;
  readonly confirmationMessage: Locator;
  readonly orderReference: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Checkout View
    this.checkoutSection = page.locator('#page-checkout');
    this.checkoutHeading = page.getByRole('heading', { name: 'Checkout' });
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.errorMessage = page.getByRole('alert');

    // Confirmation Screen
    this.confirmSection = page.locator('#page-confirm');
    this.confirmHeading = page.getByRole('heading', { name: /Order (Placed|Confirmed)!/i });
    this.confirmationMessage = page.getByText(/Your order has been placed successfully|Thank you for your purchase/i);
    // Matches order reference text dynamically (e.g. "Order #TS-9481" or "Order Reference:")
    this.orderReference = this.confirmSection.getByText(/Order\s*#\s*[A-Z0-9-]+/i);
    this.continueShoppingButton = this.confirmSection.getByRole('button', { name: 'Continue Shopping' });
  }

  /**
   * Resolves a form textbox scoped by its visible label text within its container group.
   * Resilient to HTML ID changes, missing label `for` bindings, and framework refactoring.
   */
  field(labelText: string): Locator {
    return this.page
      .locator('.form-group')
      .filter({ has: this.page.getByText(new RegExp(`^\\s*${labelText}(\\s*\\*)?\\s*$`, 'i')) })
      .getByRole('textbox');
  }

  // ── Named Accessors for Clean Spec Autocompletion ──
  get firstNameInput() { return this.field('First Name'); }
  get lastNameInput() { return this.field('Last Name'); }
  get addressInput() { return this.field('Address'); }
  get cityInput() { return this.field('City'); }
  get zipInput() { return this.field('ZIP Code'); }
  get emailInput() { return this.field('Email Address'); }
  get phoneInput() { return this.field('Phone Number'); }
  get cardNumberInput() { return this.field('Card Number'); }
  get expiryInput() { return this.field('Expiry'); }
  get cvvInput() { return this.field('CVV'); }

  /**
   * Declaratively fills form fields by visible label name.
   * Eliminates repetitive field-by-field ladders.
   */
  async fillForm(fields: Record<string, string>) {
    for (const [label, value] of Object.entries(fields)) {
      await this.field(label).fill(value);
    }
  }

  /**
   * Submits the checkout order.
   */
  async placeOrder() {
    await this.placeOrderButton.click();
  }

  /**
   * Encapsulates the complete user journey from catalog to checkout:
   * Adds product to cart, navigates to cart, and clicks "Proceed to Checkout".
   */
  async navigateViaCart(cartPage: CartPage, productId: number = 1, qty: number = 1) {
    await cartPage.addProductToCart(productId, qty);
    await cartPage.openCart();
    await cartPage.proceedToCheckoutButton.click();
  }
}
