# [BUG] Checkout CVV input accepts letters and special characters

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** High — Allows non-numeric characters in CVV security code, causing payment processing failures and corrupted payment payloads.
- **Test Reference:** `tests/checkout.spec.ts: TC-CHK-017`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Add an item to cart and open the checkout form (`#page-checkout`).
3. Fill valid shipping details, 16-digit card number, and future expiry (`12/29`).
4. In the **CVV** field (`#co-cvv`), enter non-numeric characters: `12A` or `ABC`.
5. Click **"Place Order"**.

---

### Expected Result

* Submission is rejected.
* User remains on the checkout form (`#page-checkout`).
* An error is displayed indicating the CVV must contain exactly 3 numeric digits.

---

### Actual Result

* The order submits successfully and displays `#page-confirm` ("Order Placed!").
* The application allows alphabetical and symbolic characters to bypass CVV validation.

#### Root Cause Analysis
In `techshop/broken-app/index.html` (line 123), the input lacks HTML5 pattern/min/max constraints:
```html
<input type="text" id="co-cvv" placeholder="123" />
```
And `buggyPlaceOrder()` in `app.js` runs zero regex or length validation on `#co-cvv`.

---

### Evidence

* **Playwright Test Failure:**
  `TC-CHK-017` asserts `expect(checkoutPage.confirmHeading).not.toBeVisible()` when non-numeric CVV values are submitted.

