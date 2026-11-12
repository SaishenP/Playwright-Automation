# [BUG] Password input displays entered characters in plaintext (type='text')

- **Environment:** TechShop broken-app (Sprint 1) | Chromium (Playwright 1.65.0) | Windows 11 | `http://localhost:3000`
- **Severity:** Critical — Major security vulnerability exposing confidential user passwords in plaintext on screen, vulnerable to shoulder-surfing and screen recording.
- **Test Reference:** `tests/login.spec.ts: TC-LOGIN-002`

---

### Steps to Reproduce

1. Open a browser and navigate to `http://localhost:3000`.
2. Inspect the **"Password"** input field (`#login-pass`) on the login card.
3. Type any characters (e.g. `password123`).
4. Observe whether characters are masked as bullets/dots or displayed as readable plaintext.

---

### Expected Result

* The input element has the HTML attribute `type="password"`.
* Entered password characters are masked by the browser to protect sensitive user credentials.

---

### Actual Result

* The input element has `type="text"`:
  ```html
  <input type="text" id="login-pass" placeholder="Enter password" />
  ```
* All typed password characters appear unmasked in readable plaintext.

---

### Evidence

* **Playwright Test Failure:**
  ```text
  Error: expect(locator).toHaveAttribute(expected) failed

  Locator:  locator('#login-pass')
  Expected: "password"
  Received: "text"
  Timeout:  5000ms
  ```
* **Source Code:** `techshop/broken-app/index.html` line 34.

