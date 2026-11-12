# [BUG] Removing an item from cart removes DOM row but leaves subtotal and total frozen

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** High — Overcharges customers by maintaining deleted items within the order subtotal and grand total.
- **Test Reference:** `tests/cart.spec.ts: TC-CART-003`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Sign in and add 1 unit of Product #1 (Wireless Headphones, `$88.19`) and 1 unit of Product #2 (USB-C Hub, `$34.47`) to the cart.
3. Open the Cart view (`#page-cart`). Note initial Subtotal (`$122.66`) and Total (`$127.65`).
4. Click the **"Remove"** button on Product #2 (`#cart-item-2`).
5. Observe the order summary panel on the right.

---

### Expected Result

* Product #2 row is deleted from the DOM.
* Navbar badge decrements from 2 to 1.
* Order Summary Subtotal recalculates to **`$71.99`** (reflecting only Product #1).
* Order Summary Grand Total recalculates to **`$76.98`** ($71.99 $+$ $4.99 shipping).

---

### Actual Result

* Product #2 DOM element is removed and navbar badge updates to 1.
* However, `#cart-subtotal` remains frozen at **`$122.66`**.
* `#cart-total` remains frozen at **`$127.65`**.
* The deleted product's cost is still charged in the summary.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 222–228), `buggyRemoveFromCart()` filters the `cart` array and removes the DOM node, but never updates `_frozenTotal` or the summary DOM spans:

```javascript
function buggyRemoveFromCart(productId) {
  cart = cart.filter(i => i.product.id !== productId);
  updateCartBadge();

  const row = document.getElementById('cart-item-' + productId);
  if (row) row.remove(); // ❌ Only removes row; subtotal and total spans are never updated!
}
```

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).toHaveText(expected) failed

  Locator:  locator('#cart-subtotal')
  Expected: "$71.99"
  Received: "$122.66"
  Timeout:  5000ms
  ```

