# [BUG] Cart item unit price and order summary divide discount by 1000 instead of 100

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** High — Severe financial and calculation inaccuracy that overcharges customers on all discounted catalog items with no user workaround.
- **Test Reference:** `tests/cart.spec.ts: TC-CART-017`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Enter username `demo@techshop.com` and password `password123`, then click **"Sign In"**.
3. On the product catalog screen, locate the **"Wireless Headphones"** product card (Base price: `$89.99`, Discount badge: `20% OFF`).
4. Keep quantity set to `1` and click **"Add to Cart"**.
5. Click the **"Cart"** icon in the navbar to open the shopping cart view (`#page-cart`).
6. Inspect the displayed unit price (`.cart-item-price`), the summary subtotal (`#cart-subtotal`), and the grand total (`#cart-total`).

---

### Expected Result

* **Unit Price:** Displays **`$71.99 each`** ($89.99 base price $\times$ $(1 - 0.20)$).
* **Cart Subtotal:** Displays **`$71.99`**.
* **Order Grand Total:** Displays **`$76.98`** ($71.99 subtotal $+$ $4.99 flat shipping).

---

### Actual Result

* **Unit Price:** Displays **`$88.19 each`**.
* **Cart Subtotal:** Displays **`$88.19`**.
* **Order Grand Total:** Displays **`$93.18`**.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 92–94), the discount calculation function contains an arithmetic error:

```javascript
function calcDiscountedBuggy(price, discountPct) {
  return (price * (1 - discountPct / 1000)).toFixed(2); // ❌ Divides by 1000 instead of 100
}
```

Because `discountPct` (20) is divided by 1000 rather than 100, the formula calculates `89.99 * (1 - 0.02) = 89.99 * 0.98 = 88.1902` (a 2% discount) instead of the advertised 20% discount ($71.99), resulting in an overcharge of $16.20 per unit.

---

### Evidence

* **Playwright Trace:** `test-results/cart-Shopping-Cart-Feature-85411-centage-Regression-—-Bug-4--chromium/trace.zip`
  * Inspect via CLI:
    ```bash
    npx playwright show-trace test-results/cart-Shopping-Cart-Feature-85411-centage-Regression-—-Bug-4--chromium/trace.zip
    ```
* **Failure Stack Trace:**
  ```text
  Error: expect(locator).toHaveText(expected) failed

  Locator:  locator('#cart-item-1').locator('.cart-item-price')
  Expected: "$71.99 each"
  Received: "$88.19 each"
  Timeout:  5000ms

  Call log:
    - Expect "toHaveText" locator('#cart-item-1').locator('.cart-item-price') with timeout 5000ms
    - waiting for locator('#cart-item-1').locator('.cart-item-price')
      14 × locator resolved to <div class="cart-item-price">$88.19 each</div>
         - unexpected value "$88.19 each"
  ```
* **App State:** Visual snapshot in trace shows `<div class="cart-item-price">$88.19 each</div>` rendered statically in DOM with no network errors or UI race conditions.

