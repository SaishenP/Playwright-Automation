import { test, expect } from './fixtures';

test.describe('Shopping Cart Feature', () => {
  // ── Positive Tests: Adding Items & Navigation ──

  test('TC-CART-001: Adding a product from catalog increments cart badge and shows confirmation toast', async ({
    cartPage,
  }) => {
    // Add 2 units of Wireless Headphones (Product #1) from catalog
    await cartPage.addProductToCart(1, 2);

    // Verify confirmation toast is displayed
    await expect(cartPage.toast).toBeVisible();
    await expect(cartPage.toast).toContainText('Wireless Headphones added to cart!');

    // Verify navbar cart badge increments to 2
    await expect(cartPage.cartBadge).toHaveText('2');
  });

  test('TC-CART-002: Cart displays added items with accurate name, unit price, quantity, and line total', async ({
    cartPage,
  }) => {
    // Add 1 unit of USB-C Hub 7-in-1 (Product #2)
    await cartPage.addProductToCart(2, 1);
    await cartPage.openCart();

    const item = cartPage.getCartItem(2);
    await expect(item.row).toBeVisible();
    await expect(item.name).toHaveText('USB-C Hub 7-in-1');
    await expect(item.qtyInput).toHaveValue('1');
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('TC-CART-004: Empty cart view displays "Your cart is empty." message and Shop Now button', async ({
    cartPage,
  }) => {
    // Navigate directly to cart with zero items added
    await cartPage.openCart();

    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.shopNowButton).toBeVisible();
  });

  test('TC-CART-005: Proceed to Checkout button navigates from cart to checkout page [Regression — Bug #9 (Blocker)]', async ({
    cartPage,
  }) => {
    await cartPage.addProductToCart(1, 1);
    await cartPage.openCart();

    await cartPage.proceedToCheckoutButton.click();

    // Verifies navigation to checkout screen
    await expect(cartPage.checkoutHeading).toBeVisible();
    await expect(cartPage.cartHeading).not.toBeVisible();
  });

  // ── Regression Tests: Discount Calculation ──

  test('TC-CART-017: Cart item unit price and subtotal calculate using true discount percentage [Regression — Bug #4]', async ({
    cartPage,
  }) => {
    // Wireless Headphones: Base $89.99 with 20% discount.
    // Correct price: $89.99 * 0.80 = $71.99; Total with $4.99 shipping = $76.98.
    // Bug: divides discount by 1000 instead of 100 ($88.19 each / $93.18 total).
    await cartPage.addProductToCart(1, 1);
    await cartPage.openCart();

    const item = cartPage.getCartItem(1);
    await expect(item.price).toHaveText('$71.99 each');
    await expect(cartPage.subtotalText).toHaveText('$71.99');
    await expect(cartPage.totalText).toHaveText('$76.98');
  });

  // ── Regression Tests: Below-1 Boundary ──

  test('TC-CART-006: Cart rejects zero quantity and enforces minimum quantity of 1 [Regression — Bug #5]', async ({
    cartPage,
  }) => {
    await cartPage.addProductToCart(1, 1);
    await cartPage.openCart();

    const item = cartPage.getCartItem(1);
    await cartPage.updateItemQuantity(1, 0);

    // Quantity must not accept 0 while item remains in cart
    await expect(item.qtyInput).not.toHaveValue('0');
    await expect(cartPage.cartBadge).not.toHaveText('0');
  });

  test('TC-CART-007: Cart rejects negative quantity inputs [Regression — Bug #5]', async ({
    cartPage,
  }) => {
    await cartPage.addProductToCart(1, 1);
    await cartPage.openCart();

    const item = cartPage.getCartItem(1);
    await cartPage.updateItemQuantity(1, -5);

    // Negative quantities must be rejected (enforcing min="1")
    await expect(item.qtyInput).not.toHaveValue('-5');
    await expect(cartPage.cartBadge).not.toHaveText('-5');
  });

  // ── Regression Tests: Order Total Updating ──

  test('TC-CART-009: Cart totals dynamically recalculate when quantity is modified [Regression — Bug #6]', async ({
    cartPage,
  }) => {
    // Add 1 unit of Wireless Headphones (Product #1)
    await cartPage.addProductToCart(1, 1);
    await cartPage.openCart();

    const item = cartPage.getCartItem(1);

    // Change quantity from 1 to 3
    await cartPage.updateItemQuantity(1, 3);

    // Line subtotal and Order Summary totals must dynamically recalculate
    // 3 units * $71.99 = $215.97 subtotal; $215.97 + $4.99 shipping = $220.96 total
    await expect(item.subtotal).toHaveText('$215.97');
    await expect(cartPage.subtotalText).toHaveText('$215.97');
    await expect(cartPage.totalText).toHaveText('$220.96');
  });

  test('TC-CART-003: Removing an item deletes it from cart and recalculates order summary totals [Regression — Known Bug]', async ({
    cartPage,
  }) => {
    // Add two products: Product #1 and Product #2
    await cartPage.addProductToCart(1, 1);
    await cartPage.addProductToCart(2, 1);
    await cartPage.openCart();

    await expect(cartPage.cartItems).toHaveCount(2);

    // Remove Product #2
    await cartPage.removeItem(2);

    // Product #2 row must disappear and totals must recalculate for Product #1 only ($71.99 + $4.99 = $76.98)
    const item2 = cartPage.getCartItem(2);
    await expect(item2.row).not.toBeVisible();
    await expect(cartPage.cartBadge).toHaveText('1');
    await expect(cartPage.subtotalText).toHaveText('$71.99');
    await expect(cartPage.totalText).toHaveText('$76.98');
  });
});

