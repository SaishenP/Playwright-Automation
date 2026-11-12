# [BUG] Checkout form accepts expired credit card dates in the past

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** High — Allows expired card credentials to submit successfully, leading to downstream payment gateway rejections and broken order handling.
- **Test Reference:** `tests/checkout.spec.ts: TC-CHK-009`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Add an item to cart and open the checkout form (`#page-checkout`).
3. Fill valid shipping details (Name, Address, City, ZIP, Email, Phone).
4. Enter a valid 16-digit card number `4111222233334444` and CVV `123`.
5. Enter an expired date in the **Expiry** field: `01/20`.
6. Click **"Place Order"**.

---

### Expected Result

* Submission is blocked.
* User remains on the checkout form (`#page-checkout`).
* An inline validation error highlights the Expiry field indicating the card date cannot be in the past.

---

### Actual Result

* The order submits immediately.
* The application routes to `#page-confirm` displaying "Order Placed!", accepting the invalid expired payment method.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 241–243), `buggyPlaceOrder()` performs zero field validation on expiry dates:

```javascript
function buggyPlaceOrder() {
  showPage('confirm'); // ❌ Unconditionally confirms order without date validation
}
```

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).not.toBeVisible() failed
  // When Bug #9 is bypassed or once resolved, TC-CHK-009 asserts that confirmHeading is not shown for past expiry.
  ```

