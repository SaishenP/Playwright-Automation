# [BUG] Login with invalid credentials redirects to catalog instead of displaying error

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Critical — Complete authentication bypass allowing any arbitrary username and wrong password to access the application.
- **Test Reference:** `tests/login.spec.ts: TC-LOGIN-006` (also `TC-LOGIN-007`, `TC-LOGIN-008`, `TC-LOGIN-011`)

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Enter valid username `demo@techshop.com` and an incorrect password `wrongpassword999`.
3. Click the **"Sign In"** button.

---

### Expected Result

* Access is denied.
* User remains on the login view (`#page-login`).
* An accessible error message (e.g. *"Invalid email or password"*) is rendered on screen.

---

### Actual Result

* The user is immediately granted entry to `#page-products` with heading "Our Products".
* `#page-login` is hidden (`class="page hidden"`).
* Zero error messages are displayed.

#### Root Cause Analysis
In `techshop/broken-app/app.js` (lines 82–85), the conditional branch for invalid credentials invokes `showPage('products')` instead of displaying an error and aborting:

```javascript
if (!VALID_USERS.includes(user) || pass !== 'password123') {
  showPage('products'); // ❌ Bug: Navigates to products on auth failure!
  return;
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

