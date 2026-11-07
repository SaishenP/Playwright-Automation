# Bug Reporting Standard

## Purpose

When asked to report a bug from a failing Playwright test, trace, or manual exploration, use this procedure to produce a developer-ready defect report that can be investigated and resolved without follow-up questions.

---

## Required Bug Report Structure

Every bug report must strictly adhere to the following template:

### 1. Title
* **Format:** Specific, concise, and behavioral: `<Component/Action> <specific observed failure>`.
* **Standard:** State what went wrong under what circumstance. Never use vague labels like *"Checkout broken"* or *"Login bug"*.
* **Good:** *"Proceed to Checkout button does not respond to click"*
* **Good:** *"Password input displays entered characters in plaintext (type='text')'*
* **Bad:** *"Cart issues"*

### 2. Environment
Record the exact runtime environment:
* **App / Build Version:** (e.g. `TechShop broken-app commit 4a12b / Sprint 1`)
* **Browser & OS:** (e.g. `Chromium 1254 (Playwright 1.65.0) on Windows 11`)
* **Target URL:** (e.g. `http://localhost:3000`)
* **Test Suite / Spec Reference:** (e.g. `tests/login.spec.ts: TC-LOGIN-002`)

### 3. Steps to Reproduce
Numbered, deterministic, step-by-step instructions that any developer can follow from a clean state without prior context:
1. Start from an explicit baseline URL or screen.
2. State exact actions, clicks, inputs, and test data used.
3. Include the final trigger action (e.g. *"Click the 'Place Order' button"*).

### 4. Expected Result vs Actual Result
Must be presented as two distinct, separate sections — never combined into a single sentence:
* **Expected Result:** What the specification requires to happen (state transition, validation error, calculation, or attribute).
* **Actual Result:** What the application actually did (error thrown, missing transition, incorrect math, or element state).

### 5. Severity & Justification
Assign one severity level along with a **mandatory one-line justification**:
* **Critical:** Blocks core revenue/conversion path, causes data loss, or introduces a major security vulnerability (e.g. authentication bypass, unmasked passwords, broken checkout CTA).
* **High:** Major feature failure or severe data inaccuracy with no obvious workaround (e.g. broken discount calculations, cart totals failing to update).
* **Medium:** Noticeable functional defect or broken validation with an existing workaround (e.g. missing empty-cart transition on item deletion, missing session persistence).
* **Low:** Cosmetic defect, minor styling/alignment issue, or missing descriptive metadata (e.g. hardcoded `<title>Untitled</title>`, text overflow without data loss).

### 6. Evidence
* **Trace File:** Path or link to the saved Playwright trace (e.g. `test-results/login-TC-LOGIN-002-chromium/trace.zip`). Include the command to view it:
  `npx playwright show-trace <path-to-trace.zip>`
* **Screenshots / Video:** Paths to captured failure screenshots or recorded WebM videos.
* **Console / Network Logs:** Relevant HTTP status codes (e.g. `404 Not Found`) or JavaScript runtime exceptions captured during the run.

---

## Template Markdown

```markdown
# [BUG] <Specific, Behavioral Title>

- **Environment:** <App Version> | <Browser & Version> | <URL>
- **Severity:** <Critical | High | Medium | Low> — <One-line justification>
- **Test Reference:** <Spec file & Test ID, e.g. tests/login.spec.ts: TC-LOGIN-002>

### Steps to Reproduce
1. Navigate to `http://localhost:3000`.
2. ...
3. ...

### Expected Result
<Exact expected outcome per requirements specification>

### Actual Result
<Exact observed behavior and DOM state>

### Evidence
- **Trace:** `test-results/.../trace.zip` (`npx playwright show-trace <path>`)
- **Screenshot:** `test-results/.../test-failed-1.png`
- **Console / Network:** `<Relevant logs or HTTP status codes>`
```

---

## Mandatory Self-Check

Before finalizing and delivering the report, ask:

> **"Could a developer who has never seen this test suite reproduce this bug from the steps alone?"**

If the steps rely on implicit knowledge, missing test data, or undocumented preconditions, the report is **not done**. Refine the steps until they are 100% reproducible.

