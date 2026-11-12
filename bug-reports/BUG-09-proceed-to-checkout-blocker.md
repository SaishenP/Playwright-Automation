# [BUG] 'Proceed to Checkout' button does not respond to click (CRITICAL BLOCKER)

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Critical — Complete blocker halting 100% of purchase conversions by trapping users on the cart page with no path to checkout.
- **Test Reference:** `tests/cart.spec.ts: TC-CART-005` (also blocks `tests/checkout.spec.ts: TC-CHK-001`, `TC-CHK-004`, `TC-CHK-009`, `TC-CHK-017`)

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Sign in with demo credentials (`demo@techshop.com` / `password123`).
3. Add any product to the cart (e.g. 1 unit of "Wireless Headphones").
4. Click the **"Cart"** navbar icon to view `#page-cart`.
5. Click the primary **"Proceed to Checkout"** button in the Order Summary panel.

---

### Expected Result

* `#page-cart` is hidden (`class="page hidden"`).
* `#page-checkout` is unhidden and visible.
* Heading **"Checkout"** and the shipping/payment form are rendered.

---

### Actual Result

* Nothing happens. The button click does not trigger any DOM update or page transition.
* User remains permanently stuck on the shopping cart page.
* Downstream automated checkout end-to-end test suites are blocked from reaching the checkout screen.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 236–238), `proceedToCheckoutBuggy()` is a stub that returns `false` without invoking `showPage('checkout')`:

```javascript
function proceedToCheckoutBuggy() {
  return false; // ❌ Hardcoded stub prevents navigation!
}
```

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).toBeVisible() failed

  Locator: getByRole('heading', { name: 'Checkout' })
  Expected: visible
  Timeout: 5000ms
  Error: element(s) not found
  ```

