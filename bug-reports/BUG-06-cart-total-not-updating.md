# [BUG] Shopping cart line subtotals and order totals do not update when item quantity changes

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** High — Severe data inaccuracy displaying outdated order totals after quantity adjustments, confusing customers about billing amounts.
- **Test Reference:** `tests/cart.spec.ts: TC-CART-009`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Sign in with demo credentials (`demo@techshop.com` / `password123`).
3. Add 1 item of **"Wireless Headphones"** (discounted price: `$71.99`) to the cart and open the Cart.
4. Note initial Subtotal (`#cart-subtotal`) and Total (`#cart-total`).
5. Change the quantity input from `1` to `3` and press `Tab`.

---

### Expected Result

* Line item subtotal updates to **`$215.97`** ($71.99 $\times$ 3).
* Order Summary Subtotal updates to **`$215.97`**.
* Order Summary Grand Total updates to **`$220.96`** ($215.97 $+$ $4.99 shipping).

---

### Actual Result

* The line item subtotal remains frozen at **`$88.19`**.
* Order Summary Subtotal remains frozen at **`$88.19`**.
* Order Summary Grand Total remains frozen at **`$93.18`**.
* Only the navbar cart badge updates to 3.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 230–235), `updateCartItemQty()` only calls `updateCartBadge()` and never triggers DOM recalculation for prices or order summaries:

```javascript
function updateCartItemQty(productId, newQty) {
  const item = cart.find(i => i.product.id === productId);
  if (item) item.qty = parseInt(newQty);
  updateCartBadge(); // ❌ Never updates line subtotal, #cart-subtotal, or #cart-total
}
```

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).toHaveText(expected) failed

  Locator:  locator('#cart-item-1').locator('.cart-item-subtotal')
  Expected: "$215.97"
  Received: "$88.19"
  Timeout:  5000ms
  ```

