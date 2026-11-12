# [BUG] Authenticated session is lost on browser page reload

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Medium — Causes user disruption and lost cart/browsing state by logging authenticated users out upon any browser refresh.
- **Test Reference:** `tests/login.spec.ts: TC-LOGIN-009`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Enter valid credentials (`demo@techshop.com` / `password123`) and click **"Sign In"**.
3. Verify the product catalog (`#page-products`) is active and heading "Our Products" is visible.
4. Refresh/reload the browser page (`F5` or `Ctrl+R`).

---

### Expected Result

* User session is preserved via web storage (`localStorage` or `sessionStorage`).
* The browser reloads onto the product catalog (`#page-products`) with the user remaining authenticated.

---

### Actual Result

* The page resets back to `#page-login`.
* The login form is displayed again, forcing the user to re-authenticate from scratch.

#### Root Cause Analysis
In `techshop/broken-app/app.js`, authentication and page state are stored entirely in ephemeral JavaScript variables (`let cart = [];`, `function showPage()`). No auth tokens, session flags, or cart contents are persisted to `localStorage` or `sessionStorage`. When the page reloads, the initial HTML loads with `#page-login` unhidden.

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).toBeVisible() failed

  Locator: getByRole('heading', { name: 'Our Products' })
  Expected: visible
  Timeout: 5000ms
  Error: element(s) not found
  ```

