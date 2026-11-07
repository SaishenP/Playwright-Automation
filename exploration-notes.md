# Exploration Notes — TechShop Broken App

---

## Login

### Flows

1. Navigate to `http://localhost:3000`.
2. The login form is shown immediately — heading "Welcome back", two fields (Username, Password), and a "Sign In" button.
3. Type the username/email into the **Username** field (placeholder: "Enter username").
4. Type the password into the **Password** field (placeholder: "Enter password").
5. Click the **Sign In** button.
6. On success, the login form is replaced by the Products page (URL stays `http://localhost:3000/` throughout).
7. **Invalid email flow**: Entering an invalid email format (e.g. `not-an-email` or `admin`) with password `password123` allows immediate login with no error.
8. **Session persistence flow**: After logging in, refreshing the browser (`F5` / reload) resets the application back to `#page-login`; session state is lost.

---

### Selectors

| Element | Recommended Locator |
|---|---|
| Username field | `page.getByRole('textbox', { name: 'Username' })` |
| Password field | `page.getByRole('textbox', { name: 'Password' })` |
| Sign In button | `page.getByRole('button', { name: 'Sign In' })` |
| Browse as Guest button | `page.getByRole('button', { name: 'Browse as Guest' })` |
| Error message | None observed — no error element exists in the DOM (see Surprises) |
| Products heading (post-login) | `page.getByRole('heading', { name: 'Our Products' })` |

---

### Surprises

**1. Password field is not masked (type="text")**
- **Breaks Requirement**: *"Password field must mask input characters"*
- Did: Inspected the `type` attribute of the password input before submitting.
- Expected: `type="password"` so characters are hidden with bullets (●●●●●).
- Actual: `type="text"` — the password is visible in plaintext as the user types.
- Bug candidate: Password input must use `type="password"`.

**2. Empty form submission bypasses authentication**
- **Breaks Requirement**: *"Empty fields must be rejected with an error message"*
- Did: Left both Username and Password fields empty, clicked Sign In.
- Expected: Validation error(s) preventing submission — e.g. "Username is required".
- Actual: The form accepted the empty submission and immediately showed the Products page.
- Bug candidate: No client-side or server-side validation is performed on empty fields.

**3. Wrong password is accepted**
- **Breaks Requirement**: *"Failed login shows error message, stays on login page"*
- Did: Entered valid username (`demo@techshop.com`) with an incorrect password (`wrongpassword`), clicked Sign In.
- Expected: An error message such as "Invalid username or password"; form remains visible.
- Actual: Login succeeded — Products page shown. Any password (or none) grants access.
- Bug candidate: Credential validation logic is entirely absent.

**4. Invalid email format accepted without validation**
- **Breaks Requirement**: *"Email must be valid format (contains @ and domain)"*
- Did: Entered `not-an-email` in the username field and clicked Sign In.
- Expected: Submission blocked with an error requiring a valid email format containing `@` and domain.
- Actual: Accepted immediately and logged in without validation.
- Bug candidate: Missing email format regex/type check.

**5. Session does not persist across page reloads**
- **Breaks Requirement**: *"Session persists for the browser session"*
- Did: Logged in to the product catalog, then refreshed the page (`page.goto('http://localhost:3000')`).
- Expected: User remains logged in on the product catalog for the duration of the browser session.
- Actual: Application resets to `#page-login`; login session is completely lost on reload.
- Bug candidate: Authentication state is not stored in `sessionStorage` or cookies.

**6. No error messages rendered for any failed input**
- **Breaks Requirement**: *"Failed login shows error message, stays on login page"* & *"Empty fields must be rejected with an error message"*
- Did: Tried empty fields and wrong password across multiple attempts.
- Expected: An inline error element (e.g. an alert or labelled text) to appear near the form.
- Actual: No error element appears in the DOM under any input condition.
- Bug candidate: Missing error feedback prevents users from understanding why login failed.

**7. Field label says "Username" but spec specifies email**
- **Breaks Requirement**: *"Users log in with email and password"*
- Did: Read label and hint text below the form.
- Expected: Field labelled "Email" (or "Email Address") matching the requirement.
- Actual: Label reads "Username", conflicting with the requirement that users log in with email.
- Bug candidate: Field label and input semantics mismatch specification.

**8. No URL change after login**
- Did: Completed a successful login.
- Expected: A redirect to a distinct route such as `/products` or `/dashboard`.
- Actual: URL remains `http://localhost:3000/` before and after login.
- Bug candidate (minor): Single-page routing is not implemented; deep-linking and back-navigation are broken.

---

## Catalog

### Flows

1. Navigate to the catalog either by logging in, clicking "Browse as Guest" on the login card, or clicking "Products" in the persistent navbar.
2. The catalog view renders under the heading "Our Products" with subtitle "Discover the latest tech gadgets at great prices".
3. Four product cards are rendered in `#products-grid`:
   - **Wireless Headphones**: Original `$89.99`, Badge `20% OFF`, Displayed price `$88.19`.
   - **USB-C Hub 7-in-1**: Original `$34.99`, Badge `15% OFF`, Displayed price `$34.47`.
   - **Mechanical Keyboard**: Original `$129.99`, Badge `10% OFF`, Displayed price `$128.69`.
   - **Webcam HD 1080p**: Original `$59.99`, Badge `25% OFF`, Displayed price `$58.49`.
4. Each card displays an image, title, description, pricing row (original crossed-out, discounted, percentage badge), a quantity number input (defaulting to 1), and an "Add to Cart" button.
5. Users select a quantity and click "Add to Cart", which triggers a brief toast notification (e.g. *"Wireless Headphones added to cart!"*) and increments the navbar cart badge count.
6. **Stock check flow**: Inspected all cards and dataset for stock indicators; none exist.

---

### Selectors

| Element | Recommended Locator |
|---|---|
| Products heading | `page.getByRole('heading', { name: 'Our Products' })` |
| Products grid container | `page.locator('#products-grid')` |
| Product card | `page.locator('.product-card')` |
| Product name | `page.locator('.product-name')` (or `page.getByText('Wireless Headphones')`) |
| Product description | `page.locator('.product-desc')` |
| Original price | `page.locator('.price-original')` |
| Discounted price | `page.locator('.price-discounted')` |
| Discount badge | `page.locator('.badge-discount')` |
| Quantity input (per product ID) | `page.locator('#qty-1')` (or `page.getByRole('spinbutton').nth(0)`) |
| Add to Cart button (per card) | `page.getByRole('button', { name: 'Add to Cart' })` |
| Toast notification | `page.locator('#toast')` |
| Navbar "Products" link | `page.locator('.nav-links').getByText('Products')` |
| Navbar "Cart" link & badge | `page.locator('.cart-icon')` / `page.locator('#cart-count')` |

---

### Surprises

**1. Page title is hardcoded to "Untitled" instead of "TechShop — Products"**
- **Breaks Requirement**: *"Page title: 'TechShop — Products'"*
- Did: Checked `<title>` in `index.html` and document title via browser API.
- Expected: Document title matches `"TechShop — Products"`.
- Actual: Title is `<title>Untitled</title>` across the entire application lifecycle.
- Bug candidate: Missing `<title>` metadata.

**2. Out of stock indicators and disabled buttons are completely missing**
- **Breaks Requirement**: *"Out of Stock products show badge and disabled button"*
- Did: Examined product cards, DOM, and the `PRODUCTS` data array in `app.js`.
- Expected: Products that are out of stock display an "Out of Stock" badge and have a disabled "Add to Cart" button.
- Actual: No stock status logic or badge exists; all products always show active "Add to Cart" buttons.
- Bug candidate: Out-of-stock badge and button disabling are completely unimplemented.

**3. Discount calculation formula divides by 1000 instead of 100**
- **Breaks Requirement**: *"Each card: product name, price, image placeholder, Add to Cart button"*
- Did: Inspected displayed prices and discount percentages across all four products, and reviewed `calcDiscountedBuggy(price, discountPct)`.
- Expected: Accurate discounted prices (20% off $89.99 = $71.99; 15% off $34.99 = $29.74; 10% off $129.99 = $116.99; 25% off $59.99 = $44.99).
- Actual: The formula uses `price * (1 - discountPct / 1000)`, giving $88.19 (only ~2% off), $34.47 (1.5% off), $128.69 (1% off), and $58.49 (2.5% off).
- Bug candidate: Discount calculation math defect renders prices nearly identical to original.

**4. Broken image link and missing alt attribute on Wireless Headphones**
- **Breaks Requirement**: *"Each card: product name, price, image placeholder, Add to Cart button"*
- Did: Inspected the `<img>` element for product #1 (Wireless Headphones) and monitored network logs.
- Expected: Image renders successfully with descriptive alternative text (`alt="Wireless Headphones"`).
- Actual: Image URL is `https://images.unsplash.com/BROKEN_LINK_404/headphones.jpg` returning HTTP 404, and the `<img>` tag completely lacks an `alt` attribute.
- Bug candidate: Broken image asset URL and accessibility violation on product #1.

**5. External image service 500 error on USB-C Hub**
- **Breaks Requirement**: *"Each card: product name, price, image placeholder, Add to Cart button"*
- Did: Observed network requests for product #2 (USB-C Hub 7-in-1).
- Expected: Image displays reliably from a stable CDN.
- Actual: `loremflickr.com` returned HTTP 500, resulting in a broken image icon.
- Bug candidate: Fragile third-party image dependency with no fallback.

**6. Mechanical Keyboard description text overflows out of its card**
- **Breaks Requirement**: *"Grid of available products"*
- Did: Inspected layout and styling of product #3 (Mechanical Keyboard).
- Expected: Description text wraps neatly across multiple lines within the card boundaries.
- Actual: Element has class `overflow-bug` which sets `white-space: nowrap;`, causing the long description to run horizontally off the screen and overflow the card container.
- Bug candidate: CSS defect `.product-desc.overflow-bug { white-space: nowrap; }`.

**7. Navbar is visible and accessible before authentication**
- Did: Loaded the application at `http://localhost:3000` while on the login view.
- Expected: Main navigation is either hidden or restricted until the user signs in.
- Actual: Navbar is displayed unconditionally. Clicking "Products" or "Cart" immediately navigates to those views, completely bypassing the login screen.
- Bug candidate: Navigation bar exposes post-login pages prior to authentication.

---

## Cart

### Flows

1. From the catalog, select desired quantity and click "Add to Cart" on one or more items.
2. Toast confirms addition; cart count in the top-right navbar updates to the total quantity across items.
3. Click "Cart" in the navbar (or trigger `showPage('cart')`) to view the cart page.
4. If empty, the page shows an empty cart icon, "Your cart is empty.", and a "Shop Now" button.
5. If items exist, the cart layout shows:
   - Left panel: list of cart items showing image, product name, discounted unit price, numeric quantity input, line subtotal, and a "Remove" button.
   - Right panel ("Order Summary"): Subtotal, Shipping ($4.99 flat rate), Grand Total, "Proceed to Checkout" button, and "Continue Shopping" button.
6. User can change item quantity in the input field.
7. User can click "Remove" to delete an item from the cart.
8. User clicks "Proceed to Checkout" to move to the checkout view.
9. **Cart persistence flow**: Added items to cart, then refreshed browser (`page.goto('http://localhost:3000')`). Cart badge resets to "0"; all cart items are wiped.
10. **Minimum order value flow**: Placed an order with an empty cart ($0.00 subtotal). No minimum order check is triggered; order succeeds without error.

---

### Selectors

| Element | Recommended Locator |
|---|---|
| Cart navbar link | `page.locator('.cart-icon')` |
| Cart badge count | `page.locator('#cart-count')` |
| Shopping Cart heading | `page.getByRole('heading', { name: 'Shopping Cart' })` |
| Cart empty container | `page.locator('.cart-empty')` |
| Cart items header | `page.getByRole('heading', { name: /Cart Items/ })` |
| Cart item container | `page.locator('.cart-item')` (or `page.locator('#cart-item-1')`) |
| Cart item title | `page.locator('.cart-item-name')` |
| Cart item unit price | `page.locator('.cart-item-price')` |
| Cart item quantity input | `page.locator('.cart-item-qty')` (or `page.getByRole('spinbutton')`) |
| Cart item subtotal | `page.locator('.cart-item-subtotal')` |
| Remove item button | `page.getByRole('button', { name: 'Remove' })` |
| Order summary Subtotal | `page.locator('#cart-subtotal')` |
| Order summary Total | `page.locator('#cart-total')` |
| Proceed to Checkout button | `page.getByRole('button', { name: 'Proceed to Checkout' })` |
| Continue Shopping button | `page.getByRole('button', { name: 'Continue Shopping' })` |

---

### Surprises

**1. "Proceed to Checkout" button does nothing (stubbed return false)**
- **Breaks Requirement**: *"Accessible via 'Proceed to Checkout' button in cart"*
- Did: Clicked "Proceed to Checkout" button with items in the cart.
- Expected: Navigates to the Checkout page (`#page-checkout`).
- Actual: Nothing happens. In `app.js`, `proceedToCheckoutBuggy()` is defined as `function proceedToCheckoutBuggy() { return false; }` — it never invokes `showPage('checkout')`.
- Bug candidate: Broken checkout CTA blocks progression to payment.

**2. Order summary and item subtotals never update when changing quantity**
- **Breaks Requirement**: *"Cart shows: name, unit price, quantity, line total, order total"*
- Did: Changed the item quantity input in the cart (e.g. from 4 to 2, or from 1 to 5).
- Expected: Line item subtotal, order subtotal, and grand total recalculate dynamically to match the new quantity.
- Actual: `updateCartItemQty()` only updates `item.qty` and the navbar badge; it never recalculates line subtotals or `_frozenTotal`. Order Summary remains completely frozen at initial load values.
- Bug candidate: Cart totals fail to recalculate on quantity modifications.

**3. Negative and zero quantities are permitted (lacks minimum 1 constraint)**
- **Breaks Requirement**: *"Increment/decrement quantity controls — minimum 1"*
- Did: Typed `0` and `-5` into the cart item quantity input.
- Expected: Controls enforce minimum 1, or remove item if 0, rejecting negative numbers.
- Actual: Zero and negative numbers are accepted without error. The navbar cart badge updates to negative numbers (e.g. "-5"), and line items remain in the cart. Also, no separate increment/decrement buttons exist.
- Bug candidate: Cart quantity inputs lack `min="1"` and validation boundaries.

**4. Minimum order value of $10.00 is not enforced**
- **Breaks Requirement**: *"Orders under $10.00 rejected with message: 'Minimum order value is $10.00'"*
- Did: Navigated to checkout and submitted an order with $0.00 subtotal (empty cart / zeroed items).
- Expected: Order is rejected with error message: *"Minimum order value is $10.00"*.
- Actual: Order is accepted immediately and displays the confirmation page; no minimum order check exists.
- Bug candidate: Missing minimum order value validation rule.

**5. Cart state does not persist within the browser session**
- **Breaks Requirement**: *"Cart state persists within session only"*
- Did: Added items to cart (badge = 1), then reloaded the page (`page.goto('http://localhost:3000')`).
- Expected: Cart items and badge count persist across page reloads within the browser session.
- Actual: Cart state resets to empty (`cart = []`, badge = "0") because it is stored purely in an in-memory JS variable.
- Bug candidate: Missing `sessionStorage` backing for cart state.

**6. Removing an item does not update order totals or switch to empty state**
- **Breaks Requirement**: *"Remove individual items"* & *"Empty cart message: 'Your cart is empty'"*
- Did: Clicked "Remove" on an item in the cart.
- Expected: The item row is removed, subtotal and grand total recalculate; if all items are removed, view switches to "Your cart is empty."
- Actual: `buggyRemoveFromCart()` removes the row element and decrements badge, but leaves the Order Summary subtotal and total unchanged. When the last item is removed, the stale Order Summary remains on screen instead of displaying the empty state.
- Bug candidate: Stale cart summary math and missing empty-state transition on item deletion.

---

## Checkout

### Flows

1. From the cart (or via `showPage('checkout')`), navigate to the Checkout page.
2. The page renders under the heading "Checkout" with two columns:
   - **Shipping Information**: First Name, Last Name, Address, City, ZIP Code.
   - **Contact Details**: Email Address, Phone Number.
   - **Payment**: Card Number, Expiry, CVV.
   - Action: "Place Order" button.
   - **Order Summary** side panel.
3. User enters shipping, contact, and payment details.
4. User clicks "Place Order".
5. On submission, the application switches to the Confirmation page (`#page-confirm`) showing a green checkmark, "Order Placed!", "Your order has been placed successfully.", and a "Continue Shopping" button.
6. **Field format validation flow**: Tested submitting with:
   - Invalid email: `not-an-email`
   - Invalid phone: `123` (non-10 digits)
   - Invalid card number: `4111` (non-16 digits)
   - Expired date: `01/20` (past expiry)
   - Invalid CVV: `99` (non-3 digits)
   All invalid values were accepted without error, and order was placed.

---

### Selectors

| Element | Recommended Locator |
|---|---|
| Checkout page heading | `page.getByRole('heading', { name: 'Checkout' })` |
| First Name field | `page.locator('#co-firstname')` |
| Last Name field | `page.locator('#co-lastname')` |
| Address field | `page.locator('#co-address')` |
| City field | `page.locator('#co-city')` |
| ZIP Code field | `page.locator('#co-zip')` |
| Email Address field | `page.locator('#co-email')` |
| Phone Number field | `page.locator('#co-phone')` |
| Card Number field | `page.locator('#co-card')` |
| Expiry field | `page.locator('#co-expiry')` |
| CVV field | `page.locator('#co-cvv')` |
| Place Order button | `page.getByRole('button', { name: 'Place Order' })` |
| Order Placed heading | `page.getByRole('heading', { name: 'Order Placed!' })` |
| Confirmation message | `page.getByText('Your order has been placed successfully.')` |
| Continue Shopping button (confirmation) | `page.getByRole('button', { name: 'Continue Shopping' })` |

---

### Surprises

**1. Submitting empty checkout form succeeds without validation**
- **Breaks Requirement**: *"All fields required — empty submission rejected"*
- Did: Clicked "Place Order" while leaving all shipping, contact, and payment inputs blank.
- Expected: Form validation triggers, highlighting required fields (Name, Address, Email, Card Number, Expiry, CVV) and blocking submission.
- Actual: `buggyPlaceOrder()` immediately navigates to `#page-confirm` displaying "Order Placed!".
- Bug candidate: Zero form validation allows blank orders to be placed.

**2. Invalid email format is accepted on checkout**
- **Breaks Requirement**: *"Email: valid format"*
- Did: Entered `not-an-email` in `#co-email` and submitted the order.
- Expected: Rejected with email format validation error.
- Actual: Order placed successfully; no email format validation.
- Bug candidate: Missing email regex or type validation on checkout.

**3. Card Number does not enforce exactly 16 digits**
- **Breaks Requirement**: *"Card Number: exactly 16 digits"*
- Did: Entered a 4-digit card number (`4111`) and non-numeric characters.
- Expected: Rejected with error requiring exactly 16 digits.
- Actual: Accepted; card input is plain unvalidated `<input type="text">`.
- Bug candidate: Missing 16-digit card number validation.

**4. Phone does not enforce exactly 10 digits**
- **Breaks Requirement**: *"Phone: 10 digits"*
- Did: Entered `123` into `#co-phone` and submitted.
- Expected: Rejected with error requiring a 10-digit phone number.
- Actual: Accepted without validation.
- Bug candidate: Missing 10-digit phone number validation.

**5. Expiry does not enforce MM/YY format or future date**
- **Breaks Requirement**: *"Expiry: MM/YY format, not in the past"*
- Did: Entered expired date `01/20` into `#co-expiry` and submitted.
- Expected: Rejected with error requiring non-expired MM/YY date.
- Actual: Accepted without validation.
- Bug candidate: Missing expiry format and past-date validation.

**6. CVV does not enforce exactly 3 digits**
- **Breaks Requirement**: *"CVV: 3 digits"*
- Did: Entered `99` into `#co-cvv` and submitted.
- Expected: Rejected with error requiring exactly 3 digits.
- Actual: Accepted without validation.
- Bug candidate: Missing 3-digit CVV validation.

**7. Confirmation page lacks order reference, items, and total**
- **Breaks Requirement**: *"Success: confirmation page with order reference, items, total"*
- Did: Inspected the order confirmation screen (`#page-confirm`) after placing an order.
- Expected: Confirmation view displays an order reference number, purchased item list, and total amount charged.
- Actual: Displays only generic text: "Order Placed! Your order has been placed successfully." No order reference, no items list, no total.
- Bug candidate: Confirmation view lacks transaction summary metadata.

**8. Checkout Order Summary is permanently blank ("Nothing to show here.")**
- Did: Navigated to Checkout with items in cart and inspected the right-hand "Order Summary" panel.
- Expected: Items list, quantities, subtotal, shipping fee, and grand total displayed for review.
- Actual: In `app.js`, `renderCheckoutSummary()` is an empty function (`function renderCheckoutSummary() {}`). The panel permanently displays placeholder text: *"Nothing to show here."*
- Bug candidate: `renderCheckoutSummary()` is unimplemented, leaving customers without an order review before payment.

**9. Cart is not cleared after order completion**
- Did: Successfully submitted an order and checked the navbar cart badge and cart contents.
- Expected: Upon order placement, cart is emptied (`cart = []`, badge reset to 0).
- Actual: The navbar cart badge still retains the prior count (e.g. "1"), and navigating back to the cart shows all items still in the cart.
- Bug candidate: Cart state is not reset on order placement.

---

## Requirements Coverage & Compliance Matrix

| Area | Requirement | Checked? | Result | Notes / Violation |
|---|---|---|---|---|
| **Login** | Users log in with email and password | Yes | **FAIL** | Input is labelled "Username" and accepts non-email strings (e.g. `admin`). |
| **Login** | Email must be valid format (contains @ and domain) | Yes | **FAIL** | `not-an-email` accepted with no error. |
| **Login** | Password field must mask input characters | Yes | **FAIL** | Input has `type="text"`; password visible in plaintext. |
| **Login** | Empty fields must be rejected with an error message | Yes | **FAIL** | Empty submission accepted; no error displayed. |
| **Login** | Valid credentials: demo@techshop.com / password123 | Yes | **PASS** | Successfully logs in to products catalog. |
| **Login** | Successful login redirects to product catalog | Yes | **PASS** | Catalog view rendered (SPA toggle). |
| **Login** | Failed login shows error message, stays on login page | Yes | **FAIL** | Wrong credentials still navigate to catalog; no error shown. |
| **Login** | Session persists for the browser session | Yes | **FAIL** | Page reload resets state to login page; session lost. |
| **Catalog** | Grid of available products | Yes | **PASS** | 4-item product grid rendered. |
| **Catalog** | Each card: product name, price, image placeholder, Add to Cart button | Yes | **FAIL** | Broken image links (404/500), text overflow, and discount /1000 math bug. |
| **Catalog** | Out of Stock products show badge and disabled button | Yes | **FAIL** | Completely missing from dataset and DOM. |
| **Catalog** | Page title: "TechShop — Products" | Yes | **FAIL** | Title is hardcoded to "Untitled". |
| **Cart** | Add products from catalog | Yes | **PASS** | Items added; navbar cart badge increments. |
| **Cart** | Cart shows: name, unit price, quantity, line total, order total | Yes | **FAIL** | Totals frozen at load time; modifying quantity does not update line total or order total. |
| **Cart** | Increment/decrement quantity controls — minimum 1 | Yes | **FAIL** | Lacks controls; permits 0 and negative quantities. |
| **Cart** | Remove individual items | Yes | **FAIL** | Removes DOM row but fails to update totals or trigger empty cart state. |
| **Cart** | Empty cart message: "Your cart is empty" | Yes | **PASS** | Rendered on initial empty cart view. |
| **Cart** | Cart state persists within session only | Yes | **FAIL** | Page reload clears cart completely; not persisted in `sessionStorage`. |
| **Cart** | Orders under $10.00 rejected with message: "Minimum order value is $10.00" | Yes | **FAIL** | No minimum order check; $0.00 orders succeed. |
| **Checkout** | Accessible via "Proceed to Checkout" button in cart | Yes | **FAIL** | Button handler returns `false` and does not navigate. |
| **Checkout** | Fields: First Name, Last Name, Email, Phone, Card Number, Expiry Date, CVV | Yes | **PASS** | All required fields present in form. |
| **Checkout** | All fields required — empty submission rejected | Yes | **FAIL** | Empty form submits directly to confirmation screen. |
| **Checkout** | Email: valid format | Yes | **FAIL** | Invalid emails accepted without error. |
| **Checkout** | Card Number: exactly 16 digits | Yes | **FAIL** | Any length/text accepted (e.g. 4-digit `4111`). |
| **Checkout** | Phone: 10 digits | Yes | **FAIL** | Any length accepted (e.g. 3-digit `123`). |
| **Checkout** | Expiry: MM/YY format, not in the past | Yes | **FAIL** | Expired dates (e.g. `01/20`) accepted. |
| **Checkout** | CVV: 3 digits | Yes | **FAIL** | Any length accepted (e.g. 2-digit `99`). |
| **Checkout** | Success: confirmation page with order reference, items, total | Yes | **FAIL** | Confirmation page has no reference, no items, and no total. |

---

## Coverage Summary

- **Total Requirements in Spec**: 28
- **Requirements Checked**: 28 (100% coverage)
- **Requirements Passed**: 5
- **Requirements Failed**: 23
- **Blocked / Untestable in Normal User Flow**:
  - *Direct checkout navigation*: Blocked by broken "Proceed to Checkout" button (`proceedToCheckoutBuggy()` returns `false`); required bypassing via `showPage('checkout')` to test checkout fields.
  - *Checkout Order Summary review*: Blocked because `renderCheckoutSummary()` is an empty stub.
  - *Out of Stock UI*: Untestable from a natural product state because no products in the dataset have zero stock or out-of-stock flags.
