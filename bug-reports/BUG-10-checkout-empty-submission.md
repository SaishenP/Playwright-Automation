# [BUG] Checkout form submits and confirms order when all required fields are blank

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Critical — Major transactional defect allowing empty orders with no customer, shipping address, or payment details to be processed.
- **Test Reference:** `tests/checkout.spec.ts: TC-CHK-004`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Navigate to the checkout page (`#page-checkout`).
3. Leave all form fields blank (First Name, Last Name, Address, City, ZIP, Email, Phone, Card Number, Expiry, CVV).
4. Click the **"Place Order"** button.

---

### Expected Result

* Form submission is prevented.
* User remains on `#page-checkout`.
* Mandatory required-field validation messages appear for missing shipping and payment details.

---

### Actual Result

* The application transitions directly to `#page-confirm` displaying:
  * "✓" checkmark icon.
  * Heading "Order Placed!".
  * Message "Your order has been placed successfully.".
* An order is created with completely empty customer and billing records.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 241–243), `buggyPlaceOrder()` blindly invokes `showPage('confirm')` without inspecting `input.value` across any form controls:

```javascript
function buggyPlaceOrder() {
  showPage('confirm'); // ❌ Submits completely empty form
}
```

---

### Evidence

* **Playwright Test Failure:**
  `TC-CHK-004` asserts that `confirmHeading` is not visible and validation errors appear when blank fields are submitted.

