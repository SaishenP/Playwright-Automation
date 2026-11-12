# [BUG] Login form accepts empty username and password submission without validation

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Critical — Authentication bypass allowing empty, unauthenticated requests directly into the protected product catalog.
- **Test Reference:** `tests/login.spec.ts: TC-LOGIN-003` (also `TC-LOGIN-004`, `TC-LOGIN-005`)

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Ensure both the **Username** and **Password** input fields are completely blank.
3. Click the **"Sign In"** button.

---

### Expected Result

* Form submission is blocked.
* User remains on the login view (`#page-login`).
* A visible validation error (e.g. *"Please enter your username and password"*) is rendered.

---

### Actual Result

* The application immediately transitions to `#page-products`.
* The login section receives `class="page hidden"`, granting unauthenticated access to the store without credentials.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 78–87), `buggyLogin()` has no validation checks for empty values and calls `showPage('products')` regardless:

```javascript
function buggyLogin() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;

  if (!VALID_USERS.includes(user) || pass !== 'password123') {
    showPage('products'); // ❌ Unconditionally routes to products
    return;
  }
  showPage('products');
}
```

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).not.toHaveClass(expected) failed

  Locator: locator('#page-login')
  Expected pattern: not /hidden/
  Received string: "page hidden"
  Timeout: 5000ms
  ```

