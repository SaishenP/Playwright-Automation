import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object representing the Shopping Cart and cart interactions in TechShop.
 * Adheres to the test-authoring standard: semantic locators, accessible roles,
 * and isolated interaction helpers.
 */
export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly toast: Locator;
  readonly cartHeading: Locator;
  readonly emptyCartMessage: Locator;
  readonly shopNowButton: Locator;
  readonly cartItems: Locator;
  readonly subtotalText: Locator;
  readonly totalText: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator('.cart-icon');
    this.cartBadge = page.locator('#cart-count');
    this.toast = page.locator('#toast');
    this.cartHeading = page.getByRole('heading', { name: 'Shopping Cart' });
    this.emptyCartMessage = page.getByText('Your cart is empty.');
    this.shopNowButton = page.getByRole('button', { name: 'Shop Now' });
    this.cartItems = page.locator('.cart-item');
    this.subtotalText = page.locator('#cart-subtotal');
    this.totalText = page.locator('#cart-total');
    this.proceedToCheckoutButton = page.getByRole('button', { name: 'Proceed to Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
    this.checkoutHeading = page.getByRole('heading', { name: 'Checkout' });
  }

  /**
   * Navigates to the shopping cart view by clicking the Cart navbar icon.
   * Uses web-first auto-retrying assertion for transition synchronization.
   */
  async openCart() {
    await this.cartIcon.click();
    await expect(this.cartHeading).toBeVisible();
  }

  /**
   * Adds a product from the catalog grid into the cart with the requested quantity.
   * Employs accessible role `spinbutton` to set quantity.
   */
  async addProductToCart(productId: number, qty: number = 1) {
    const card = this.page.locator('.product-card').filter({
      has: this.page.locator(`#qty-${productId}`),
    });
    await card.getByRole('spinbutton').fill(String(qty));
    await card.getByRole('button', { name: 'Add to Cart' }).click();
  }

  /**
   * Returns scoped locators for a specific cart item row using accessible roles.
   */
  getCartItem(productId: number) {
    const row = this.page.locator(`#cart-item-${productId}`);
    return {
      row,
      name: row.locator('.cart-item-name'),
      price: row.locator('.cart-item-price'),
      qtyInput: row.getByRole('spinbutton'),
      subtotal: row.locator('.cart-item-subtotal'),
      removeButton: row.getByRole('button', { name: 'Remove' }),
    };
  }

  /**
   * Updates an item's quantity in the cart and dispatches the change event.
   */
  async updateItemQuantity(productId: number, newQty: number | string) {
    const item = this.getCartItem(productId);
    await item.qtyInput.fill(String(newQty));
    await item.qtyInput.dispatchEvent('change');
    await item.qtyInput.press('Tab');
  }

  /**
   * Clicks the Remove button on an item in the cart.
   */
  async removeItem(productId: number) {
    const item = this.getCartItem(productId);
    await item.removeButton.click();
  }
}
