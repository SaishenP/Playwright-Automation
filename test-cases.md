# TechShop Test Matrix

**Specification Reference:** [`techshop/requirements.md`](./techshop/requirements.md)  
**Empirical Source of Truth:** [`exploration-notes.md`](./exploration-notes.md)  
**Standard Followed:** [`skills/test-case-design.md`](./skills/test-case-design.md)

---

## Table of Contents
1. [Login](#1-login)
2. [Catalog / Product Listing](#2-catalog--product-listing)
3. [Shopping Cart](#3-shopping-cart)
4. [Checkout Form](#4-checkout-form)
5. [Dedicated Regression Suite: The 13 Confirmed Bugs](#5-dedicated-regression-suite-the-13-confirmed-bugs)
6. [Traceability & Regression Summary](#6-traceability--regression-summary)

---

## 1. Login

### Overview

| ID | Title | Category | Bug / Regression Tag |
|---|---|---|---|
| `TC-LOGIN-001` | Successful login with valid credentials navigates to product catalog | **Positive** | None |
| `TC-LOGIN-002` | Password input masks characters with type="password" | **Positive** | `[Regression — Bug #1: Password shows plaintext]` |
| `TC-LOGIN-003` | Login rejects empty submission with validation error | **Negative** | `[Regression — Bug #2: Empty credentials accepted]` |
| `TC-LOGIN-004` | Login rejects empty email when password is provided | **Negative** | `[Regression — Known Bug: Missing field validation]` |
| `TC-LOGIN-005` | Login rejects empty password when email is provided | **Negative** | `[Regression — Known Bug: Missing field validation]` |
| `TC-LOGIN-006` | Login rejects incorrect password with error message | **Negative** | `[Regression — Bug #3: Wrong credentials redirect to catalog]` |
| `TC-LOGIN-007` | Login rejects invalid email format missing @ and domain | **Negative** | `[Regression — Known Bug: Invalid email format accepted]` |
| `TC-LOGIN-008` | Failed login renders visible error message and stays on login page | **Negative** | `[Regression — Known Bug: No error element in DOM on failure]` |
| `TC-LOGIN-009` | Authenticated session persists across page reload | **Edge** | `[Regression — Known Bug: Session lost on page reload]` |
| `TC-LOGIN-010` | Login trims leading and trailing whitespace from email input | **Edge** | None |
| `TC-LOGIN-011` | Password validation enforces exact case sensitivity | **Edge** | `[Regression — Known Bug: Wrong password accepted]` |

---

### Test Cases

#### `TC-LOGIN-001`: Successful login with valid credentials navigates to product catalog
* **Category:** Positive
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card (`#page-login`) is visible.
* **Steps:**
  1. Fill `page.getByRole('textbox', { name: 'Username' })` with `"demo@techshop.com"`.
  2. Fill `page.locator('#login-pass')` with `"password123"`.
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * Login form (`#page-login`) is hidden.
  * Products page (`#page-products`) is visible.
  * Heading `page.getByRole('heading', { name: 'Our Products' })` is visible.
* **Bug / Regression Flag:** None.

#### `TC-LOGIN-002`: Password input masks characters with type="password"
* **Category:** Positive (Regression)
* **Related Bug:** **Bug #1 — Password field shows text in plaintext (should be masked)**
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Inspect the DOM element for `page.locator('#login-pass')`.
  2. Fill `page.locator('#login-pass')` with `"password123"`.
* **Expected Result (Correct Behavior):**
  * Element attribute `type` strictly equals `"password"`.
  * Input characters are masked as bullets/dots in the browser UI.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — attribute is `type="text"`, characters visible in plaintext.
  * **Fixed App:** `PASS` — attribute is `type="password"`, characters masked.
* **Bug / Regression Flag:** `[Regression — Bug #1: Password field shows text in plaintext]`

#### `TC-LOGIN-003`: Login rejects empty submission with validation error
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #2 — Empty email/password is accepted (should be rejected)**
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login fields are completely empty.
* **Steps:**
  1. Leave email/username and password inputs empty.
  2. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result (Correct Behavior):**
  * Form submission is blocked; user stays on `#page-login`.
  * Products catalog (`#page-products`) is NOT displayed.
  * A visible error message is displayed (e.g. *"Email and password are required"*).
* **Regression Behavior:**
  * **Broken App:** `FAIL` — form silently submits, hides login, and displays catalog.
  * **Fixed App:** `PASS` — user remains on login view with validation error displayed.
* **Bug / Regression Flag:** `[Regression — Bug #2: Empty email/password is accepted]`

#### `TC-LOGIN-004`: Login rejects empty email when password is provided
* **Category:** Negative
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Leave email/username input empty.
  2. Fill `page.locator('#login-pass')` with `"password123"`.
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * Submission is blocked; user remains on login form.
  * Visible validation error indicates email is required.
* **Bug / Regression Flag:** `[Regression — Known Bug: Empty fields accepted without error]`

#### `TC-LOGIN-005`: Login rejects empty password when email is provided
* **Category:** Negative
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Fill `page.getByRole('textbox', { name: 'Username' })` with `"demo@techshop.com"`.
  2. Leave password input empty.
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * Submission is blocked; user remains on login form.
  * Visible validation error indicates password is required.
* **Bug / Regression Flag:** `[Regression — Known Bug: Empty fields accepted without error]`

#### `TC-LOGIN-006`: Login rejects incorrect password with error message
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #3 — Wrong credentials redirect to the catalog (should show an error)**
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Fill `page.getByRole('textbox', { name: 'Username' })` with `"demo@techshop.com"`.
  2. Fill `page.locator('#login-pass')` with `"wrongpassword"`.
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result (Correct Behavior):**
  * Submission is rejected; user remains on `#page-login`.
  * Products catalog (`#page-products`) is NOT shown.
  * Visible error message is rendered (e.g. *"Invalid email or password"*).
* **Regression Behavior:**
  * **Broken App:** `FAIL` — `buggyLogin()` grants immediate access to catalog for any password.
  * **Fixed App:** `PASS` — user remains on login page and error message is displayed.
* **Bug / Regression Flag:** `[Regression — Bug #3: Wrong credentials redirect to catalog]`

#### `TC-LOGIN-007`: Login rejects invalid email format missing @ and domain
* **Category:** Negative
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Fill `page.getByRole('textbox', { name: 'Username' })` with `"not-an-email"`.
  2. Fill `page.locator('#login-pass')` with `"password123"`.
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * Submission is blocked; user remains on `#page-login`.
  * Error message indicates invalid email format (must contain `@` and a valid domain).
* **Bug / Regression Flag:** `[Regression — Known Bug: Non-email strings like "not-an-email" and "admin" accepted without format validation]`

#### `TC-LOGIN-008`: Failed login renders visible error message and stays on login page
* **Category:** Negative
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Fill invalid credentials: `"unknown@techshop.com"` / `"badpass999"`.
  2. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * An error container or alert message element exists in the DOM and is visible.
  * Login input fields remain visible on screen so the user can correct their input.
* **Bug / Regression Flag:** `[Regression — Known Bug: Zero error message elements exist in the DOM; errors are never rendered]`

#### `TC-LOGIN-009`: Authenticated session persists across page reload
* **Category:** Edge
* **Preconditions:** User has successfully logged in; `#page-products` is currently active.
* **Steps:**
  1. Reload the page (`await page.reload()` or navigate to `http://localhost:3000`).
* **Expected Result:**
  * Session persists within the browser session.
  * User remains authenticated; `#page-products` heading remains visible.
  * User is not redirected back to `#page-login`.
* **Bug / Regression Flag:** `[Regression — Known Bug: Application state resets to login on every page reload]`

#### `TC-LOGIN-010`: Login trims leading and trailing whitespace from email input
* **Category:** Edge
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Fill `page.getByRole('textbox', { name: 'Username' })` with `"  demo@techshop.com  "`.
  2. Fill `page.locator('#login-pass')` with `"password123"`.
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * Whitespace is trimmed; authentication succeeds.
  * Product catalog is displayed.
* **Bug / Regression Flag:** None.

#### `TC-LOGIN-011`: Password validation enforces exact case sensitivity
* **Category:** Edge
* **Preconditions:** Browser is navigated to `http://localhost:3000`; login card is visible.
* **Steps:**
  1. Fill `page.getByRole('textbox', { name: 'Username' })` with `"demo@techshop.com"`.
  2. Fill `page.locator('#login-pass')` with `"Password123"` (uppercase 'P').
  3. Click `page.getByRole('button', { name: 'Sign In' })`.
* **Expected Result:**
  * Login is rejected because passwords must be case-sensitive.
  * User remains on login screen with an error message.
* **Bug / Regression Flag:** `[Regression — Known Bug: Case sensitivity ignored because all passwords currently pass]`

---

## 2. Catalog / Product Listing

### Overview

| ID | Title | Category | Bug / Regression Tag |
|---|---|---|---|
| `TC-CAT-001` | Product grid displays all available items with name, price, and Add to Cart button | **Positive** | None |
| `TC-CAT-002` | Document title displays "TechShop — Products" | **Positive** | `[Regression — Bug #12: Title shows "Untitled"]` |
| `TC-CAT-003` | Product card displays accurate discounted price matching discount badge | **Positive** | `[Regression — Bug #4: Discount divides by 1000]` |
| `TC-CAT-004` | Product images render with valid source and descriptive alt text | **Positive** | `[Regression — Known Bug: Broken 404 image link on product #1]` |
| `TC-CAT-005` | Out of stock products display "Out of Stock" badge and disable Add to Cart button | **Negative** | `[Regression — Known Bug: Out of stock status completely missing]` |
| `TC-CAT-006` | Unauthenticated direct access to catalog via navbar is restricted | **Negative** | `[Regression — Bug #13: Navbar visible before auth]` |
| `TC-CAT-007` | Long product descriptions wrap neatly within card boundaries without horizontal overflow | **Edge** | `[Regression — Known Bug: Description overflows card due to white-space: nowrap]` |
| `TC-CAT-008` | Product card handles image loading failure with fallback placeholder | **Edge** | `[Regression — Known Bug: External loremflickr 500 failure leaves broken image]` |
| `TC-CAT-009` | Catalog rejects zero or negative quantity when adding to cart | **Negative** | `[Regression — Known Bug: Adding negative quantity corrupts cart]` |
| `TC-CAT-010` | Catalog rejects non-numeric or decimal quantity on product card | **Negative** | `[Regression — Known Bug: Non-integer quantity accepted on product card]` |
| `TC-CAT-011` | Guest browsing via "Browse as Guest" button navigates directly to catalog without credentials | **Positive** | None |
| `TC-CAT-012` | Adding the same product multiple times accumulates quantity correctly in existing cart item | **Edge** | None |

---

### Test Cases

#### `TC-CAT-001`: Product grid displays all available items with name, price, and Add to Cart button
* **Category:** Positive
* **Preconditions:** User is on the catalog page (`http://localhost:3000`; `#page-products` active).
* **Steps:**
  1. Locate all product cards inside `page.locator('#products-grid .product-card')`.
  2. Verify count equals 4.
  3. Verify each card contains:
     * Product title (`.product-name`)
     * Price display (`.price-original` and `.price-discounted`)
     * Quantity input (`.qty-input`)
     * Add to Cart button (`page.getByRole('button', { name: 'Add to Cart' })`)
* **Expected Result:**
  * 4 product cards are visible in the grid.
  * Every card possesses name, prices, quantity input, and an interactive Add to Cart button.
* **Bug / Regression Flag:** None.

#### `TC-CAT-002`: Document title displays "TechShop — Products"
* **Category:** Positive (Regression)
* **Related Bug:** **Bug #12 — Browser tab title shows "Untitled"**
* **Preconditions:** User is on the catalog page (`http://localhost:3000`).
* **Steps:**
  1. Inspect the browser document title via `await page.title()`.
* **Expected Result (Correct Behavior):**
  * Document title strictly equals `"TechShop — Products"`.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — returns `"Untitled"`.
  * **Fixed App:** `PASS` — returns `"TechShop — Products"`.
* **Bug / Regression Flag:** `[Regression — Bug #12: Browser tab title shows "Untitled"]`

#### `TC-CAT-003`: Product card displays accurate discounted price matching discount badge
* **Category:** Positive (Regression)
* **Related Bug:** **Bug #4 — Cart discount divides by 1000 instead of 100 (totals are wrong)**
* **Preconditions:** User is on the catalog page (`#page-products` visible).
* **Steps:**
  1. Inspect product card #1 (Wireless Headphones): original price `$89.99`, discount badge `"20% OFF"`.
  2. Inspect product card #2 (USB-C Hub): original price `$34.99`, discount badge `"15% OFF"`.
  3. Inspect product card #3 (Mechanical Keyboard): original price `$129.99`, discount badge `"10% OFF"`.
  4. Inspect product card #4 (Webcam HD): original price `$59.99`, discount badge `"25% OFF"`.
* **Expected Result (Correct Behavior):**
  * Wireless Headphones discounted price displays `$71.99` ($89.99 × 0.80).
  * USB-C Hub discounted price displays `$29.74` ($34.99 × 0.85).
  * Mechanical Keyboard discounted price displays `$116.99` ($129.99 × 0.90).
  * Webcam HD discounted price displays `$44.99` ($59.99 × 0.75).
* **Regression Behavior:**
  * **Broken App:** `FAIL` — displays `$88.19`, `$34.47`, `$128.69`, and `$58.49` because `calcDiscountedBuggy` divides by 1000 instead of 100.
  * **Fixed App:** `PASS` — displays accurate discounted pricing.
* **Bug / Regression Flag:** `[Regression — Bug #4: Cart discount divides by 1000 instead of 100]`

#### `TC-CAT-004`: Product images render with valid source and descriptive alt text
* **Category:** Positive
* **Preconditions:** User is on the catalog page (`#page-products` visible).
* **Steps:**
  1. Inspect `<img>` elements for all 4 product cards.
  2. Verify HTTP response code for each image source URL.
  3. Verify presence of non-empty `alt` attribute describing the product.
* **Expected Result:**
  * All 4 images load with HTTP 200.
  * Product #1 `<img>` has `alt="Wireless Headphones"` and a valid image URL.
* **Bug / Regression Flag:** `[Regression — Known Bug: Product #1 uses BROKEN_LINK_404 URL returning HTTP 404 and omits the alt attribute entirely]`

#### `TC-CAT-005`: Out of stock products display "Out of Stock" badge and disable Add to Cart button
* **Category:** Negative
* **Preconditions:** Catalog contains an inventory-depleted / out-of-stock item.
* **Steps:**
  1. Locate an out-of-stock product card.
  2. Inspect the card for an out-of-stock indicator.
  3. Inspect the state of the "Add to Cart" button on that card.
* **Expected Result:**
  * An "Out of Stock" badge is prominently displayed.
  * The "Add to Cart" button is disabled (`button[disabled]`).
  * Clicking the button does not increment the cart.
* **Bug / Regression Flag:** `[Regression — Known Bug: Out-of-stock badge and button disabling are completely unimplemented in data model and UI]`

#### `TC-CAT-006`: Unauthenticated direct access to catalog via navbar is restricted
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #13 — Navbar is visible on the login page before authentication**
* **Preconditions:** User navigates to `http://localhost:3000` while unauthenticated (login form visible).
* **Steps:**
  1. Check visibility of top navigation bar while on `#page-login`.
  2. Attempt to click `"Products"` or `"Cart"` in the top navigation.
* **Expected Result (Correct Behavior):**
  * Top navigation links to authenticated areas are hidden or disabled on the login screen.
  * Unauthenticated users cannot bypass login to access product browsing or cart.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — navbar is permanently visible and clicking "Products" or "Cart" bypasses login completely.
  * **Fixed App:** `PASS` — navbar is hidden or protected until login completes.
* **Bug / Regression Flag:** `[Regression — Bug #13: Navbar is visible on the login page before authentication]`

#### `TC-CAT-007`: Long product descriptions wrap neatly within card boundaries without horizontal overflow
* **Category:** Edge
* **Preconditions:** User is on the catalog page (`#page-products` visible).
* **Steps:**
  1. Inspect the description container `.product-desc` of product #3 (Mechanical Keyboard).
  2. Evaluate `scrollWidth` vs `clientWidth` of the element.
* **Expected Result:**
  * `scrollWidth <= clientWidth` (text wraps within the card).
  * No text extends past the card border.
* **Bug / Regression Flag:** `[Regression — Known Bug: Mechanical Keyboard description has class .overflow-bug setting white-space: nowrap]`

#### `TC-CAT-008`: Product card handles image loading failure with fallback placeholder
* **Category:** Edge
* **Preconditions:** User is on the catalog page; external image service (e.g. `loremflickr.com`) fails with HTTP 500.
* **Steps:**
  1. Intercept image network request for product #2 and simulate HTTP 500 error.
  2. Inspect the product image container.
* **Expected Result:**
  * Card renders a clean fallback placeholder icon rather than a broken image graphic.
* **Bug / Regression Flag:** `[Regression — Known Bug: External loremflickr dependency fails with 500 and has no onError fallback placeholder]`

#### `TC-CAT-009`: Catalog rejects zero or negative quantity when adding to cart
* **Category:** Negative
* **Preconditions:** User is on the catalog page; cart has 0 items.
* **Steps:**
  1. Set `#qty-1` to `0` and click "Add to Cart".
  2. Set `#qty-1` to `-2` and click "Add to Cart".
* **Expected Result:**
  * Adding 0 or negative items is rejected.
  * Cart badge remains `0`.
  * Toast or validation alert indicates quantity must be at least 1.
* **Bug / Regression Flag:** `[Regression — Known Bug: buggyAddToCart parses negative numbers and corrupts cart total and badge]`

#### `TC-CAT-010`: Catalog rejects non-numeric or decimal quantity on product card
* **Category:** Negative
* **Preconditions:** User is on the catalog page.
* **Steps:**
  1. Fill `#qty-1` with `"1.5"` or `"abc"`.
  2. Click "Add to Cart".
* **Expected Result:**
  * Decimal or non-numeric input is rejected or rounded to whole integer.
  * Fractional quantities (e.g. 1.5 units) cannot be added to cart.
* **Bug / Regression Flag:** `[Regression — Known Bug: Quantity input lacks integer step constraint]`

#### `TC-CAT-011`: Guest browsing via "Browse as Guest" button navigates directly to catalog without credentials
* **Category:** Positive
* **Preconditions:** User is on `#page-login`.
* **Steps:**
  1. Click `page.getByRole('button', { name: 'Browse as Guest' })`.
* **Expected Result:**
  * `#page-login` hides.
  * `#page-products` displays with heading `"Our Products"`.
  * User can browse products without entering any credentials.
* **Bug / Regression Flag:** None.

#### `TC-CAT-012`: Adding the same product multiple times accumulates quantity correctly in existing cart item
* **Category:** Edge
* **Preconditions:** User is on catalog page; cart currently has 1 unit of product #1 (Wireless Headphones).
* **Steps:**
  1. Set `#qty-1` to `3`.
  2. Click "Add to Cart" on product #1.
  3. Navigate to Cart view.
* **Expected Result:**
  * Exactly 1 item row for Wireless Headphones exists (no duplicate rows created).
  * Quantity displays `"4"` (1 + 3).
  * Line subtotal correctly reflects 4 × unit price.
* **Bug / Regression Flag:** None.

---

## 3. Shopping Cart

### Overview

| ID | Title | Category | Bug / Regression Tag |
|---|---|---|---|
| `TC-CART-001` | Adding a product from catalog increments cart badge and shows confirmation toast | **Positive** | None |
| `TC-CART-002` | Cart displays added items with accurate name, unit price, quantity, line total, and grand total | **Positive** | None |
| `TC-CART-003` | Removing an item deletes it from cart and recalculates order summary totals | **Positive** | `[Regression — Known Bug: Item removal fails to recalculate summary subtotal and grand total]` |
| `TC-CART-004` | Empty cart view displays "Your cart is empty" message and Shop Now button | **Positive** | None |
| `TC-CART-005` | Proceed to Checkout button navigates from cart to checkout page | **Positive** | `[Regression — Bug #9: Proceed to Checkout does not respond (BLOCKER)]` |
| `TC-CART-006` | Cart rejects zero quantity and enforces minimum quantity of 1 | **Negative** | `[Regression — Bug #5: Cart allows quantities below 1]` |
| `TC-CART-007` | Cart rejects negative quantity inputs | **Negative** | `[Regression — Bug #5: Cart allows quantities below 1]` |
| `TC-CART-008` | Cart rejects checkout when order subtotal is below $10.00 with minimum order message | **Negative** | `[Regression — Known Bug: Minimum order value of $10.00 is not enforced]` |
| `TC-CART-009` | Cart totals dynamically recalculate when quantity is modified | **Edge** | `[Regression — Bug #6: Order total does not update on quantity change]` |
| `TC-CART-010` | Cart state persists across page reload within the browser session | **Edge** | `[Regression — Known Bug: Cart memory wiped on page reload]` |
| `TC-CART-011` | Removing the final item in cart immediately switches view to empty cart state | **Edge** | `[Regression — Known Bug: Removing last item leaves stale Order Summary on screen]` |
| `TC-CART-012` | Order with subtotal exactly at $10.00 boundary is accepted | **Edge** | None |
| `TC-CART-013` | Cart rejects order subtotal at $9.99 just below the $10.00 minimum threshold | **Negative** | `[Regression — Known Bug: Minimum order threshold of $10.00 is not enforced]` |
| `TC-CART-014` | Cart rejects invalid promo / discount coupon code with error feedback | **Negative** | `[Regression — Known Bug: Discount code input missing]` |
| `TC-CART-015` | Shipping fee remains flat $4.99 regardless of number of distinct items or quantities | **Edge** | None |
| `TC-CART-016` | "Continue Shopping" button on cart navigates back to product catalog preserving cart items | **Positive** | None |
| `TC-CART-017` | Cart item unit price and subtotal calculate using true discount percentage (not /1000) | **Positive** | `[Regression — Bug #4: Cart discount divides by 1000 instead of 100]` |

---

### Test Cases

#### `TC-CART-001`: Adding a product from catalog increments cart badge and shows confirmation toast
* **Category:** Positive
* **Preconditions:** User is on the catalog page with an empty cart (badge count = 0).
* **Steps:**
  1. Set quantity input for product #1 (`#qty-1`) to `2`.
  2. Click "Add to Cart" button on product #1.
* **Expected Result:**
  * Toast `#toast` appears with message `"Wireless Headphones added to cart!"`.
  * Navbar cart badge `#cart-count` updates to `"2"`.
* **Bug / Regression Flag:** None.

#### `TC-CART-002`: Cart displays added items with accurate name, unit price, quantity, line total, and grand total
* **Category:** Positive
* **Preconditions:** User has added 1 USB-C Hub to cart.
* **Steps:**
  1. Click the "Cart" link in the navbar (`page.locator('.cart-icon')`).
* **Expected Result:**
  * Shopping cart view (`#page-cart`) is displayed.
  * Item row displays title `"USB-C Hub 7-in-1"`.
  * Quantity spinbutton displays `"1"`.
  * Line item subtotal and Order Summary match expected calculations.
* **Bug / Regression Flag:** None.

#### `TC-CART-003`: Removing an item deletes it from cart and recalculates order summary totals
* **Category:** Positive
* **Preconditions:** Cart contains 2 distinct items (Item A subtotal $88.19, Item B subtotal $34.47, Grand Total $127.65).
* **Steps:**
  1. Click "Remove" button on Item B (`#cart-item-2 .btn-danger`).
* **Expected Result:**
  * Item B row `#cart-item-2` is removed from the DOM.
  * Navbar badge decrements accordingly.
  * Order Summary Subtotal recalculates to `$88.19`.
  * Grand Total recalculates to `$93.18` ($88.19 + $4.99 shipping).
* **Bug / Regression Flag:** `[Regression — Known Bug: buggyRemoveFromCart removes DOM node but leaves subtotal and total frozen at original values]`

#### `TC-CART-004`: Empty cart view displays "Your cart is empty" message and Shop Now button
* **Category:** Positive
* **Preconditions:** Cart contains 0 items.
* **Steps:**
  1. Click the "Cart" link in the navbar.
* **Expected Result:**
  * Empty cart panel `.cart-empty` is visible.
  * Text `"Your cart is empty."` is visible.
  * Button `"Shop Now"` is visible and clicking it returns user to `#page-products`.
* **Bug / Regression Flag:** None.

#### `TC-CART-005`: Proceed to Checkout button navigates from cart to checkout page
* **Category:** Positive (Regression — CRITICAL BLOCKER)
* **Related Bug:** **Bug #9 — "Proceed to Checkout" button does not respond (blocker)**
* **Preconditions:** Cart contains at least 1 item; user is viewing `#page-cart`.
* **Steps:**
  1. Click `page.getByRole('button', { name: 'Proceed to Checkout' })`.
* **Expected Result (Correct Behavior):**
  * Cart page (`#page-cart`) is hidden.
  * Checkout page (`#page-checkout`) is rendered and visible.
  * Heading `page.getByRole('heading', { name: 'Checkout' })` is visible.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — `proceedToCheckoutBuggy()` returns `false` without navigating; user is permanently trapped on the cart page.
  * **Fixed App:** `PASS` — navigates cleanly to `#page-checkout`.
* **Blocker Note:** **CRITICAL BLOCKER.** This defect halts the entire purchase funnel. All downstream automated end-to-end checkout journey tests cannot proceed naturally from the cart and will remain RED until this button is fixed.
* **Bug / Regression Flag:** `[Regression — Bug #9: Proceed to Checkout button does not respond (BLOCKER)]`

#### `TC-CART-006`: Cart rejects zero quantity and enforces minimum quantity of 1
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #5 — Cart allows quantities below 1 (negative quantities)**
* **Preconditions:** Cart contains 1 item; user is on `#page-cart`.
* **Steps:**
  1. Fill `.cart-item-qty` input with `"0"`.
  2. Press `Tab` or click outside to trigger `change` event.
* **Expected Result (Correct Behavior):**
  * Input rejects `0` (reverts to `1`, prompts confirmation to remove item, or removes item cleanly).
  * Cart badge does not display `0` while item row is present.
  * Subtotal does not become `$0.00` while keeping active shipping fees.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — accepts 0, leaves item row in DOM, sets badge to 0, and freezes subtotal.
  * **Fixed App:** `PASS` — enforces minimum quantity of 1 or prompts removal.
* **Bug / Regression Flag:** `[Regression — Bug #5: Cart allows quantities below 1]`

#### `TC-CART-007`: Cart rejects negative quantity inputs
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #5 — Cart allows quantities below 1 (negative quantities)**
* **Preconditions:** Cart contains 1 item; user is on `#page-cart`.
* **Steps:**
  1. Fill `.cart-item-qty` input with `"-5"`.
  2. Press `Tab` to commit change.
* **Expected Result (Correct Behavior):**
  * Input rejects negative value (enforces `min="1"`).
  * Error is displayed or value resets to `1`.
  * Navbar cart badge does not show `"-5"`.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — accepts -5, updates navbar badge to "-5", and corrupts cart state.
  * **Fixed App:** `PASS` — rejects negative values and resets to minimum 1.
* **Bug / Regression Flag:** `[Regression — Bug #5: Cart allows quantities below 1]`

#### `TC-CART-008`: Cart rejects checkout when order subtotal is below $10.00 with minimum order message
* **Category:** Negative
* **Preconditions:** Cart contains items totaling less than $10.00 (e.g. $0.00 subtotal).
* **Steps:**
  1. Attempt to proceed to checkout or submit order with subtotal < $10.00.
* **Expected Result:**
  * Checkout is blocked.
  * Visible error message is displayed: `"Minimum order value is $10.00"`.
* **Bug / Regression Flag:** `[Regression — Known Bug: Minimum order value of $10.00 is completely unenforced]`

#### `TC-CART-009`: Cart totals dynamically recalculate when quantity is modified
* **Category:** Edge (Regression)
* **Related Bug:** **Bug #6 — Order total does not update when quantity changes**
* **Preconditions:** Cart contains 1 item (unit price `$71.99`, line subtotal `$71.99`, grand total `$76.98`).
* **Steps:**
  1. Change `.cart-item-qty` from `1` to `3`.
  2. Press `Tab` to trigger update.
* **Expected Result (Correct Behavior):**
  * Line item subtotal updates to `$215.97` (3 × $71.99).
  * Order Summary Subtotal `#cart-subtotal` updates to `$215.97`.
  * Order Summary Total `#cart-total` updates to `$220.96` ($215.97 + $4.99 shipping).
* **Regression Behavior:**
  * **Broken App:** `FAIL` — `updateCartItemQty()` only updates badge; line item subtotal and Order Summary totals remain frozen at initial load values.
  * **Fixed App:** `PASS` — subtotals and grand total dynamically recalculate to match the new quantity.
* **Bug / Regression Flag:** `[Regression — Bug #6: Order total does not update when quantity changes]`

#### `TC-CART-010`: Cart state persists across page reload within the browser session
* **Category:** Edge
* **Preconditions:** Cart contains 2 items; navbar cart badge displays `"2"`.
* **Steps:**
  1. Reload the browser page (`await page.reload()`).
  2. Inspect navbar cart badge.
  3. Navigate to `#page-cart`.
* **Expected Result:**
  * Navbar cart badge still displays `"2"`.
  * Shopping cart still displays the 2 items with correct quantities and totals.
* **Bug / Regression Flag:** `[Regression — Known Bug: Cart is stored purely in a temporary JS variable let cart = []; page reload resets cart to empty]`

#### `TC-CART-011`: Removing the final item in cart immediately switches view to empty cart state
* **Category:** Edge
* **Preconditions:** Cart contains exactly 1 item.
* **Steps:**
  1. Click "Remove" button on the single item.
* **Expected Result:**
  * The item row disappears.
  * The Order Summary panel disappears.
  * The empty cart view (`.cart-empty`) renders showing `"Your cart is empty."` and `"Shop Now"` button.
* **Bug / Regression Flag:** `[Regression — Known Bug: Removing the last item leaves the stale Order Summary and totals visible instead of showing empty state]`

#### `TC-CART-012`: Order with subtotal exactly at $10.00 boundary is accepted
* **Category:** Edge
* **Preconditions:** Cart subtotal is exactly `$10.00`.
* **Steps:**
  1. Click "Proceed to Checkout".
* **Expected Result:**
  * Checkout is permitted without minimum order value warning.
* **Bug / Regression Flag:** None.

#### `TC-CART-013`: Cart rejects order subtotal at $9.99 just below the $10.00 minimum threshold
* **Category:** Negative
* **Preconditions:** Cart contains item(s) totaling exactly `$9.99` subtotal.
* **Steps:**
  1. Click "Proceed to Checkout".
* **Expected Result:**
  * Checkout navigation is blocked.
  * Error message displays: `"Minimum order value is $10.00"`.
* **Bug / Regression Flag:** `[Regression — Known Bug: Minimum order threshold of $10.00 is not enforced]`

#### `TC-CART-014`: Cart rejects invalid promo / discount coupon code with error feedback
* **Category:** Negative
* **Preconditions:** User is on `#page-cart` with items in cart.
* **Steps:**
  1. Locate promo/discount code field.
  2. Enter invalid coupon code `"FAKEPROMO100"` and submit.
* **Expected Result:**
  * Rejection message appears: `"Invalid discount code"`.
  * Subtotal and total remain unchanged.
* **Bug / Regression Flag:** `[Regression — Known Bug: Discount code input and coupon validation is completely missing in cart markup and scripts]`

#### `TC-CART-015`: Shipping fee remains flat $4.99 regardless of number of distinct items or quantities
* **Category:** Edge
* **Preconditions:** Cart contains 3 different products with multiple units (total quantity = 8 items).
* **Steps:**
  1. Inspect Shipping line item in Order Summary.
* **Expected Result:**
  * Shipping line displays exactly `$4.99` flat rate (does not multiply per item).
* **Bug / Regression Flag:** None.

#### `TC-CART-016`: "Continue Shopping" button on cart navigates back to product catalog preserving cart items
* **Category:** Positive
* **Preconditions:** Cart contains 2 items.
* **Steps:**
  1. On `#page-cart`, click `page.getByRole('button', { name: 'Continue Shopping' })`.
* **Expected Result:**
  * App transitions to `#page-products`.
  * Navbar cart badge continues to show `"2"`.
* **Bug / Regression Flag:** None.

#### `TC-CART-017`: Cart item unit price and subtotal calculate using true discount percentage (not /1000)
* **Category:** Positive (Regression)
* **Related Bug:** **Bug #4 — Cart discount divides by 1000 instead of 100 (totals are wrong)**
* **Preconditions:** User adds 1 unit of Wireless Headphones ($89.99 base price, 20% discount) to cart.
* **Steps:**
  1. Navigate to `#page-cart`.
  2. Inspect unit price `.cart-item-price` and subtotal `#cart-subtotal`.
* **Expected Result (Correct Behavior):**
  * Unit price displays `$71.99 each` ($89.99 × (1 - 0.20)).
  * Subtotal displays `$71.99`.
  * Grand total displays `$76.98` ($71.99 + $4.99 shipping).
* **Regression Behavior:**
  * **Broken App:** `FAIL` — unit price displays `$88.19 each` and total displays `$93.18` because discount divides by 1000.
  * **Fixed App:** `PASS` — unit price and totals calculate using true 20% discount.
* **Bug / Regression Flag:** `[Regression — Bug #4: Cart discount divides by 1000 instead of 100]`

---

## 4. Checkout Form

### Overview

| ID | Title | Category | Bug / Regression Tag |
|---|---|---|---|
| `TC-CHK-001` | Valid checkout submission navigates to confirmation page with order reference, items, and total | **Positive** | `[Regression — Bug #11: Confirmation missing order reference]` |
| `TC-CHK-002` | Checkout displays accurate Order Summary panel reviewing items, subtotal, shipping, and grand total | **Positive** | `[Regression — Known Bug: Order summary permanently displays 'Nothing to show here.']` |
| `TC-CHK-003` | Cart is completely cleared upon successful order placement | **Positive** | `[Regression — Known Bug: Cart items persist after order completion]` |
| `TC-CHK-004` | Checkout rejects submission when all required fields are blank | **Negative** | `[Regression — Bug #10: Checkout submits with all fields empty]` |
| `TC-CHK-005` | Checkout rejects invalid email format missing @ or domain | **Negative** | `[Regression — Known Bug: Invalid email format accepted on checkout]` |
| `TC-CHK-006` | Checkout rejects card number with fewer than 16 digits | **Negative** | `[Regression — Known Bug: Short card numbers accepted without validation]` |
| `TC-CHK-007` | Checkout rejects card number with non-numeric characters | **Negative** | `[Regression — Known Bug: Non-numeric card numbers accepted]` |
| `TC-CHK-008` | Checkout rejects phone number with fewer or more than 10 digits | **Negative** | `[Regression — Known Bug: Non-10-digit phone numbers accepted without validation]` |
| `TC-CHK-009` | Checkout rejects expired card date in the past | **Negative** | `[Regression — Bug #7: Checkout accepts past card expiry]` |
| `TC-CHK-010` | Checkout rejects invalid expiry format not matching MM/YY | **Negative** | `[Regression — Known Bug: Arbitrary expiry formats accepted]` |
| `TC-CHK-011` | Checkout rejects CVV with fewer or more than 3 digits | **Negative** | `[Regression — Known Bug: Non-3-digit CVVs accepted without validation]` |
| `TC-CHK-012` | Card Number rejects 15 digits and 17 digits at the 16-digit boundary | **Edge** | `[Regression — Known Bug: Card length boundary of exactly 16 digits not enforced]` |
| `TC-CHK-013` | Phone Number rejects 9 digits and 11 digits at the 10-digit boundary | **Edge** | `[Regression — Known Bug: Phone length boundary of exactly 10 digits not enforced]` |
| `TC-CHK-014` | Expiry date accepts current month and year as valid | **Edge** | `[Regression — Known Bug: Expiry date logic missing]` |
| `TC-CHK-015` | CVV rejects 2 digits and 4 digits at the 3-digit boundary | **Edge** | `[Regression — Known Bug: CVV length boundary of exactly 3 digits not enforced]` |
| `TC-CHK-016` | Inputs distinguish placeholder hints from actual user input values | **Edge** | `[Regression — Known Bug: Realistic placeholder values visually mimic pre-filled input data]` |
| `TC-CHK-017` | Checkout rejects CVV containing letters or special characters | **Negative** | `[Regression — Bug #8: CVV accepts letters and symbols]` |
| `TC-CHK-018` | Checkout rejects phone number containing letters | **Negative** | `[Regression — Known Bug: Phone field accepts letters and symbols]` |
| `TC-CHK-019` | Checkout rejects invalid expiry month greater than 12 (e.g. 13/28) | **Negative** | `[Regression — Known Bug: Month range 01-12 not validated in expiry input]` |
| `TC-CHK-020` | Checkout rejects order submission when cart is completely empty ($0.00) | **Negative** | `[Regression — Known Bug: Zero-item / empty cart orders accepted on checkout]` |
| `TC-CHK-021` | Card number input automatically formats or strips whitespace and hyphens | **Edge** | None |
| `TC-CHK-022` | "Continue Shopping" button on confirmation screen navigates back to catalog with empty cart | **Positive** | None |

---

### Test Cases

#### `TC-CHK-001`: Valid checkout submission navigates to confirmation page with order reference, items, and total
* **Category:** Positive (Regression)
* **Related Bug:** **Bug #11 — Confirmation page is missing the order reference number**
* **Preconditions:** User has items in cart and is on `#page-checkout`.
* **Steps:**
  1. Fill valid shipping details (`#co-firstname`, `#co-lastname`, `#co-address`, `#co-city`, `#co-zip`, `#co-email`, `#co-phone`).
  2. Fill valid payment details (`#co-card` 16 digits, `#co-expiry` future date, `#co-cvv` 3 digits).
  3. Click `page.getByRole('button', { name: 'Place Order' })`.
* **Expected Result (Correct Behavior):**
  * User lands on `#page-confirm`.
  * Heading `page.getByRole('heading', { name: 'Order Placed!' })` is visible.
  * Confirmation displays an **Order Reference Number** (e.g. `Order #TS-XXXX`).
  * Confirmation displays list of purchased items, quantities, and line totals.
  * Confirmation displays total amount charged matching cart grand total.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — confirmation page displays only a generic checkmark and "Your order has been placed successfully." with NO order reference number, NO item list, and NO total.
  * **Fixed App:** `PASS` — displays complete transaction receipt with order reference, items, and total.
* **Bug / Regression Flag:** `[Regression — Bug #11: Confirmation page missing order reference number]`

#### `TC-CHK-002`: Checkout displays accurate Order Summary panel reviewing items, subtotal, shipping, and grand total
* **Category:** Positive
* **Preconditions:** User has added 1 item ($34.99) to cart and navigated to `#page-checkout`.
* **Steps:**
  1. Inspect the right-hand panel `.checkout-order-panel`.
* **Expected Result:**
  * Panel displays items recap with product name, quantity, and price.
  * Subtotal displays `$34.99` (or discounted unit price).
  * Shipping displays `$4.99`.
  * Total displays grand total.
  * Placeholder text `"Nothing to show here."` is NOT present.
* **Bug / Regression Flag:** `[Regression — Known Bug: renderCheckoutSummary() is an empty function; panel permanently displays "Nothing to show here."]`

#### `TC-CHK-003`: Cart is completely cleared upon successful order placement
* **Category:** Positive
* **Preconditions:** Cart has 2 items (badge count = 2); user completes checkout.
* **Steps:**
  1. Complete valid checkout and click "Place Order".
  2. Verify confirmation screen appears.
  3. Inspect navbar cart badge `#cart-count`.
  4. Click "Cart" icon in navbar.
* **Expected Result:**
  * Navbar cart badge `#cart-count` resets to `"0"`.
  * Navigating to cart displays the empty cart state (`.cart-empty`).
* **Bug / Regression Flag:** `[Regression — Known Bug: Cart is not emptied after placing order; badge count and cart items persist]`

#### `TC-CHK-004`: Checkout rejects submission when all required fields are blank
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #10 — Checkout form submits with all fields empty**
* **Preconditions:** User is on `#page-checkout` with all inputs blank.
* **Steps:**
  1. Click `page.getByRole('button', { name: 'Place Order' })`.
* **Expected Result (Correct Behavior):**
  * Order is NOT placed; user remains on `#page-checkout`.
  * Confirmation screen `#page-confirm` is NOT shown.
  * Validation errors highlight required fields (First Name, Last Name, Email, Phone, Card Number, Expiry, CVV).
* **Regression Behavior:**
  * **Broken App:** `FAIL` — `buggyPlaceOrder()` immediately shows confirmation screen without any validation.
  * **Fixed App:** `PASS` — form submission is blocked and required field errors are rendered.
* **Bug / Regression Flag:** `[Regression — Bug #10: Checkout form submits with all fields empty]`

#### `TC-CHK-005`: Checkout rejects invalid email format missing @ or domain
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill valid shipping details and card info.
  2. Fill `#co-email` with `"jane-at-example.com"`.
  3. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Error indicates invalid email format.
* **Bug / Regression Flag:** `[Regression — Known Bug: Invalid email strings accepted on checkout]`

#### `TC-CHK-006`: Checkout rejects card number with fewer than 16 digits
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-card` with `"411122223333"` (12 digits).
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Validation error indicates card number must be exactly 16 digits.
* **Bug / Regression Flag:** `[Regression — Known Bug: Card Number does not validate length; short numbers accepted]`

#### `TC-CHK-007`: Checkout rejects card number with non-numeric characters
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-card` with `"4111-ABCD-5555-ZZZZ"`.
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Validation error indicates card number must contain digits only.
* **Bug / Regression Flag:** `[Regression — Known Bug: Card input is unvalidated text input accepting letters and symbols]`

#### `TC-CHK-008`: Checkout rejects phone number with fewer or more than 10 digits
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-phone` with `"555-01"` (5 digits).
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Error indicates phone number must be exactly 10 digits.
* **Bug / Regression Flag:** `[Regression — Known Bug: Phone number accepts any text or length without 10-digit check]`

#### `TC-CHK-009`: Checkout rejects expired card date in the past
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #7 — Checkout accepts a past card expiry date**
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill valid shipping, contact, card number, and CVV.
  2. Fill `#co-expiry` with `"01/20"` (past date).
  3. Click "Place Order".
* **Expected Result (Correct Behavior):**
  * Submission is blocked; user stays on `#page-checkout`.
  * Validation error indicates card expiration date cannot be in the past.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — order submits successfully to confirmation screen.
  * **Fixed App:** `PASS` — submission is rejected with past expiry date error.
* **Bug / Regression Flag:** `[Regression — Bug #7: Checkout accepts a past card expiry date]`

#### `TC-CHK-010`: Checkout rejects invalid expiry format not matching MM/YY
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-expiry` with `"99/99"` or `"2028-12"`.
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Error indicates expiry must follow MM/YY format with valid month (01–12).
* **Bug / Regression Flag:** `[Regression — Known Bug: Arbitrary text accepted in expiry input]`

#### `TC-CHK-011`: Checkout rejects CVV with fewer or more than 3 digits
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-cvv` with `"9"` (1 digit) or `"12345"` (5 digits).
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Error indicates CVV must be exactly 3 digits.
* **Bug / Regression Flag:** `[Regression — Known Bug: CVV accepts arbitrary text and length]`

#### `TC-CHK-012`: Card Number rejects 15 digits and 17 digits at the 16-digit boundary
* **Category:** Edge
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Test Card Number with 15 digits (`"123456789012345"`): submit form.
  2. Test Card Number with 17 digits (`"12345678901234567"`): submit form.
* **Expected Result:**
  * Both 15-digit and 17-digit entries are rejected.
  * Only exactly 16 digits are accepted.
* **Bug / Regression Flag:** `[Regression — Known Bug: 16-digit length boundary is not enforced]`

#### `TC-CHK-013`: Phone Number rejects 9 digits and 11 digits at the 10-digit boundary
* **Category:** Edge
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Test Phone with 9 digits (`"123456789"`): submit form.
  2. Test Phone with 11 digits (`"12345678901"`): submit form.
* **Expected Result:**
  * Both 9-digit and 11-digit entries are rejected.
  * Exactly 10 digits are required.
* **Bug / Regression Flag:** `[Regression — Known Bug: 10-digit boundary is not enforced]`

#### `TC-CHK-014`: Expiry date accepts current month and year as valid
* **Category:** Edge
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Format current month and 2-digit year (e.g. `MM/YY` for current month).
  2. Enter into `#co-expiry` and submit valid form.
* **Expected Result:**
  * Current month/year is accepted (card expires at the end of the specified month).
* **Bug / Regression Flag:** `[Regression — Known Bug: Expiry date logic missing]`

#### `TC-CHK-015`: CVV rejects 2 digits and 4 digits at the 3-digit boundary
* **Category:** Edge
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Test CVV with 2 digits (`"12"`): submit form.
  2. Test CVV with 4 digits (`"1234"`): submit form.
* **Expected Result:**
  * Both 2-digit and 4-digit inputs are rejected.
  * Exactly 3 numeric digits are required.
* **Bug / Regression Flag:** `[Regression — Known Bug: CVV 3-digit boundary is not enforced]`

#### `TC-CHK-016`: Inputs distinguish placeholder hints from actual user input values
* **Category:** Edge
* **Preconditions:** User loads `#page-checkout` with blank inputs.
* **Steps:**
  1. Check `.value` property of `#co-card`, `#co-expiry`, and `#co-cvv`.
  2. Verify placeholders (`"1234 5678 9012 3456"`, `"MM/YY"`, `"123"`) do not count as entered text.
* **Expected Result:**
  * Input `.value` is empty string `""`.
  * Submitting without typing does not submit placeholder text as valid data.
* **Bug / Regression Flag:** `[Regression — Known Bug: Placeholders visually mimic pre-filled input data]`

#### `TC-CHK-017`: Checkout rejects CVV containing letters or special characters
* **Category:** Negative (Regression)
* **Related Bug:** **Bug #8 — CVV accepts letters and symbols**
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill valid shipping, contact, card number, and expiry date.
  2. Fill `#co-cvv` with `"12A"`, `"ABC"`, or `"!@#"`.
  3. Click "Place Order".
* **Expected Result (Correct Behavior):**
  * Submission is blocked; user stays on `#page-checkout`.
  * Error indicates CVV must contain numeric digits only.
* **Regression Behavior:**
  * **Broken App:** `FAIL` — letters and symbols accepted without error.
  * **Fixed App:** `PASS` — submission rejected with numeric CVV error.
* **Bug / Regression Flag:** `[Regression — Bug #8: CVV accepts letters and symbols]`

#### `TC-CHK-018`: Checkout rejects phone number containing letters
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-phone` with `"555-CALLME"`.
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Error indicates phone number must contain numeric digits only.
* **Bug / Regression Flag:** `[Regression — Known Bug: Phone field accepts letters and symbols]`

#### `TC-CHK-019`: Checkout rejects invalid expiry month greater than 12 (e.g. 13/28)
* **Category:** Negative
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-expiry` with `"13/28"` or `"00/28"`.
  2. Click "Place Order".
* **Expected Result:**
  * Submission is blocked.
  * Validation error indicates month must be between 01 and 12.
* **Bug / Regression Flag:** `[Regression — Known Bug: Month range 01-12 not validated in expiry input]`

#### `TC-CHK-020`: Checkout rejects order submission when cart is completely empty ($0.00)
* **Category:** Negative
* **Preconditions:** User has 0 items in cart ($0.00 subtotal) and navigates to `#page-checkout`.
* **Steps:**
  1. Fill valid shipping and payment details.
  2. Click "Place Order".
* **Expected Result:**
  * Order is rejected; user is redirected back to cart with message `"Cannot checkout with an empty cart"`.
* **Bug / Regression Flag:** `[Regression — Known Bug: Zero-item / empty cart orders accepted on checkout]`

#### `TC-CHK-021`: Card number input automatically formats or strips whitespace and hyphens
* **Category:** Edge
* **Preconditions:** User is on `#page-checkout`.
* **Steps:**
  1. Fill `#co-card` with spaced number `"4532 0150 1234 5678"` or hyphenated `"4532-0150-1234-5678"`.
  2. Complete other fields and click "Place Order".
* **Expected Result:**
  * Card number is sanitized/normalized to 16 digits and accepted without length error.
* **Bug / Regression Flag:** None.

#### `TC-CHK-022`: "Continue Shopping" button on confirmation screen navigates back to catalog with empty cart
* **Category:** Positive
* **Preconditions:** Order has been successfully placed; `#page-confirm` is visible.
* **Steps:**
  1. Click `page.getByRole('button', { name: 'Continue Shopping' })`.
* **Expected Result:**
  * User is navigated back to `#page-products`.
  * Navbar cart count badge displays `"0"`.
* **Bug / Regression Flag:** None.

---

## 5. Dedicated Regression Suite: The 13 Confirmed Bugs

Every confirmed defect from the exploration phase has a dedicated regression test case that **asserts the correct requirement behavior**. Each test will **FAIL** against the current broken application and turn **GREEN (PASS)** once the developer patches the code.

| Bug # | Confirmed Defect Description | Test Case ID | Test Category | Broken App (FAIL) | Fixed App (PASS) | Blocker Impact |
|:---:|---|:---:|:---:|---|---|:---:|
| **1** | Password field shows text in plaintext (should be masked) | `TC-LOGIN-002` | Positive | `type="text"` | `type="password"` | None |
| **2** | Empty email/password is accepted (should be rejected) | `TC-LOGIN-003` | Negative | Submits to catalog | Stays on login + error | None |
| **3** | Wrong credentials redirect to the catalog (should show an error) | `TC-LOGIN-006` | Negative | Redirects to catalog | Stays on login + error | None |
| **4** | Cart discount divides by 1000 instead of 100 (totals are wrong) | `TC-CAT-003` & `TC-CART-017` | Positive | 20% off gives $88.19 | 20% off gives $71.99 | None |
| **5** | Cart allows quantities below 1 (negative quantities) | `TC-CART-006` & `TC-CART-007` | Negative | Accepts 0 & -5 | Enforces min 1 | None |
| **6** | Order total does not update when quantity changes | `TC-CART-009` | Edge | Totals frozen at load | Totals update dynamically | None |
| **7** | Checkout accepts a past card expiry date | `TC-CHK-009` | Negative | Accepts 01/20 | Rejects past date | None |
| **8** | CVV accepts letters and symbols | `TC-CHK-017` | Negative | Accepts "12A" / "!@#" | Rejects non-numeric | None |
| **9** | **"Proceed to Checkout" button does not respond** | `TC-CART-005` | Positive | `return false;` (stuck) | Navigates to `#page-checkout` | **CRITICAL BLOCKER** |
| **10** | Checkout form submits with all fields empty | `TC-CHK-004` | Negative | Submits to confirm | Validates required fields | None |
| **11** | Confirmation page is missing the order reference number | `TC-CHK-001` | Positive | No order reference | Displays `Order #TS-XXXX` | None |
| **12** | Browser tab title shows "Untitled" | `TC-CAT-002` | Positive | Title is "Untitled" | "TechShop — Products" | None |
| **13** | Navbar is visible on the login page before authentication | `TC-CAT-006` | Negative | Full navbar active | Navbar hidden / guarded | None |

### ⚠️ Note on the "Proceed to Checkout" Blocker (`TC-CART-005`)
> **CRITICAL FLOW BLOCKER:** Bug #9 (`TC-CART-005`) is a hard blocker for the user purchase journey. Clicking "Proceed to Checkout" invokes `function proceedToCheckoutBuggy() { return false; }`, which fails to execute the `#page-checkout` transition.
>
> **Impact on the Automated Test Suite:**
> While individual unit/component tests for checkout (such as `#page-checkout` field validation) can temporarily be exercised by direct DOM navigation (`showPage('checkout')`), any end-to-end journey test that starts at the catalog, adds items to the cart, and clicks "Proceed to Checkout" **will stay strictly RED (fail)** until this blocker is fixed in `app.js`.

---

## 6. Traceability & Regression Summary

### Overall Metrics

| Feature | Positive Cases | Negative Cases | Edge Cases | Total Cases | Known Bug Regressions |
|---|:---:|:---:|:---:|:---:|:---:|
| **Login** | 2 | 6 | 3 | **11** | 9 |
| **Catalog** | 5 | 4 | 3 | **12** | 9 |
| **Shopping Cart** | 7 | 5 | 5 | **17** | 11 |
| **Checkout Form** | 4 | 12 | 6 | **22** | 19 |
| **Totals** | **18** | **27** | **17** | **62** | **48** |

* **Specification Coverage:** 100% of functional requirements defined in [`requirements.md`](./techshop/requirements.md) are mapped to test cases.
* **Regression Test Readiness:** All 13 confirmed defects plus domain edge cases have dedicated, automated regression test cases tagged to verify future developer bug fixes.
