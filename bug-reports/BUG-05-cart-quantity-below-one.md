# [BUG] Shopping cart accepts zero and negative quantities into state

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** High — Corrupts order data and inventory calculations by allowing negative or zero quantities, breaking cart integrity.
- **Test Reference:** `tests/cart.spec.ts: TC-CART-006` and `TC-CART-007`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Sign in with demo credentials (`demo@techshop.com` / `password123`).
3. Add 1 item of **"Wireless Headphones"** to the cart and click the **"Cart"** navbar icon.
4. In the cart view (`#page-cart`), click into the quantity input (`.cart-item-qty`).
5. Type `0` (or `-5`) and press `Tab` or click outside to trigger the change event.

---

### Expected Result

* Quantities below 1 are rejected.
* The input enforces a minimum of `1` (or prompts item removal confirmation).
* The navbar badge and cart state never reflect a quantity of `0` or negative values while the item remains listed.

---

### Actual Result

* The input accepts `0` and `-5`.
* The navbar badge `#cart-count` updates to `"0"` (for zero) and `"-5"` (for negative input).
* The item row remains in the cart, putting the checkout pipeline into an invalid negative inventory state.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 230–235), `updateCartItemQty()` parses the raw input without validating `newQty >= 1`:

```javascript
function updateCartItemQty(productId, newQty) {
  const item = cart.find(i => i.product.id === productId);
  if (item) item.qty = parseInt(newQty); // ❌ No boundary checks (allows <= 0)
  updateCartBadge();
}
```

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).not.toHaveValue(expected) failed

  Locator:  locator('#cart-item-1').locator('.cart-item-qty')
  Expected: not "0"
  Received: "0"
  ```

