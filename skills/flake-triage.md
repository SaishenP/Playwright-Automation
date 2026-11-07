# Test Flake Triage Standard

## Purpose

When presented with a failing Playwright test, follow this triage procedure to determine whether the failure is a **REAL BUG** in the application or a **FLAKY TEST** in the automation suite. Never file a bug report for test-induced instability.

---

## The Triage Checklist

Work through all five steps in sequence before making a determination:

### 1. Consistency Check (Reproducibility)
* **Question:** Does the test fail every single time, or only intermittently?
  * **Consistently fails (100% of runs):** Strongly indicates a deterministic issue (leans **REAL BUG** or fundamentally broken test logic).
  * **Fails intermittently (e.g. 1 out of 5 runs, or only in CI):** Strongly indicates timing, race conditions, animation delays, or state leakage (leans **FLAKY TEST**).
* **Rule:** If consistency is unknown or inconclusive from a single failure, **do not guess**. Run or request to run the test 3–5 times in isolation:
  ```bash
  npx playwright test <path/to/spec> -g "<test-title>" --repeat-each=5
  ```

### 2. Root Cause Analysis (App vs Test)
Examine the failure point and stack trace:
* **App Behaving Wrong:**
  * Assertion failed because an actual value or element state deviated from the requirement (e.g. expected `$71.99`, received `$88.19`; expected `type="password"`, received `type="text"`).
  * DOM rendered an unexpected error, or failed to complete a transition that is completely finished loading.
* **Test Behaving Wrong:**
  * `TimeoutError`: Waiting for a selector that exists under a different query or during an unawaited transition.
  * Race condition: Action attempted before an animation or network request settled.
  * Fragile locator: Reliance on dynamic class names, position-based selectors (`nth(2)`), or brittle CSS chains that shifted.
  * Context leakage: Test depended on state (cookies, storage, cart items) left behind by an earlier test.

### 3. Trace & Timeline Evidence (Visual & Network State)
Inspect the Playwright trace (`trace.zip`):
* **Look at the filmstrip & DOM snapshot at the exact moment of failure:**
  * Was the page fully rendered and settled, but displaying incorrect data or an invalid state? → **Application defect**.
  * Was the page still loading, animating, displaying a spinner, or mid-transition when the assertion timed out? → **Premature test assertion**.
* **Look at network calls:**
  * Did an application API return `500 Internal Server Error` or unhandled rejection? → **Application defect**.
  * Did the test fail to wait for an ongoing `fetch`/`xhr` response before asserting? → **Missing auto-wait / web-first assertion**.

### 4. Classification
Provide a definitive, prominent verdict:
* **Verdict:** `REAL BUG` OR `FLAKY TEST`
* Include a brief summary explaining the deciding factor based on steps 1–3.

### 5. Recommendation & Next Steps
* **If classified as REAL BUG:**
  * Do not edit the test to mask the failure.
  * Generate a formal defect report following [`bug-reporting.md`](./bug-reporting.md).
  * Mark or group the test as a known regression tracking case if needed.
* **If classified as FLAKY TEST:**
  * **Do NOT file a bug report against the product.**
  * Identify and apply the exact automation remedy:
    * **Locator Fix:** Replace structural/CSS selector with user-facing `getByRole` or `getByLabel`.
    * **Timing Fix:** Replace manual boolean evaluations or hardcoded waits with web-first auto-retrying assertions (`await expect(locator)...`).
    * **Network Synchronization:** Add `page.waitForResponse()` or await the visible completion state.
    * **Isolation Fix:** Reset storage/cookies in the fixture or ensure test does not rely on shared execution order.

---

## Triage Output Format

When delivering triage results, use this structure:

```markdown
## Triage Analysis: <Test ID or Title>

1. **Consistency:** <Deterministic (X/X failed) | Intermittent (X/Y failed)>
2. **Root Cause:** <App logic failure vs Test timing/locator failure>
3. **Trace Evidence:** <What the DOM snapshot and network timeline showed at the point of failure>
4. **Classification:** **REAL BUG** | **FLAKY TEST**
5. **Action Plan:**
   - If REAL BUG: File report per bug-reporting standard.
   - If FLAKY TEST: <Specific code fix required in the test/page object>.
```

