# [BUG] Order confirmation screen does not display an order reference number

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Medium — Degrades customer post-purchase experience by failing to provide an order reference identifier for tracking, receipts, or customer support.
- **Test Reference:** `tests/checkout.spec.ts: TC-CHK-001`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Navigate to checkout, complete all shipping and payment fields with valid data, and click **"Place Order"**.
3. Inspect the confirmation card rendered on `#page-confirm`.

---

### Expected Result

* Confirmation page renders an identifiable **Order Reference Number** (e.g. `Order #TS-9481`).
* Summary of purchased items and total charged is displayed.

---

### Actual Result

* `#page-confirm` renders only static generic text:
  ```html
  <div class="confirm-card">
    <div class="confirm-icon">✓</div>
    <h2>Order Placed!</h2>
    <p>Your order has been placed successfully.</p>
    <button class="btn btn-primary" onclick="showPage('products')">Continue Shopping</button>
  </div>
  ```
* No unique order ID, transaction reference, item list, or total amount charged exists in the DOM.

---

### Evidence

* **Playwright Test Failure:**
  `TC-CHK-001` asserts `expect(checkoutPage.orderReference).toBeVisible()`, which fails because no order reference text matching `/Order\s*#?[A-Z0-9-]+/i` exists on the page.
* **Source Code:** `techshop/broken-app/index.html` lines 137–144.

