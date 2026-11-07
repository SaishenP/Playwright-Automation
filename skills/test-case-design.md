# Test Case Design Standard

## Purpose

When asked to design test cases for a feature, use this procedure to generate an actionable, implementation-ready test matrix derived from the feature requirements and empirical exploration notes.

---

## Inputs Required

Before writing test cases, ensure you have:
1. **Feature Requirements** — the expected behavior specification (e.g. `requirements.md`).
2. **Exploration Notes** — empirical findings, actual DOM locators, quirks, and discovered defects (e.g. `exploration-notes.md`).

Do not invent hypothetical fields or workflows; ground all preconditions, selectors, and inputs in the real application recorded in the exploration notes.

---

## Required Categories per Feature

Every feature matrix must cover all three categories:

1. **Positive Cases (Happy Path)**
   - Valid inputs and typical user flows.
   - Verifies the feature succeeds as intended, produces expected state transitions, updates UI badges/totals, and lands on the correct destination.

2. **Negative Cases (Error Handling & Rejection)**
   - Invalid, missing, or malformed inputs.
   - Includes: empty required fields, incorrect credentials, invalid formats (e.g. non-email in email fields, letters in numeric fields, malformed phone/card numbers).
   - Verifies the application rejects submission, preserves user input where appropriate, retains the user on the current screen, and renders user-facing error feedback.

3. **Edge Cases (Boundary & Limits)**
   - Boundary conditions and corner scenarios.
   - Includes: minimums/maximums, zero, just-below-minimum (e.g. $9.99 on a $10.00 minimum), exact length limits (e.g. 15 vs 16 digit card, 9 vs 10 digit phone), past vs current vs future dates, session persistence on page reload/refresh, and removal of last items.

---

## Test Case Format

Every test case must strictly follow this structure:

| Field | Requirement |
|---|---|
| **ID** | Unique identifier following `TC-<FEATURE>-<NUMBER>` (e.g. `TC-LOGIN-001`, `TC-CART-003`). |
| **Title** | Concise behavior description stating condition and outcome (e.g. *"Login rejects empty password"*, *"Cart updates total when quantity changes"*). Never use generic names like *"Test login 1"*. |
| **Category** | `Positive` \| `Negative` \| `Edge`. |
| **Preconditions** | Starting application state (e.g. *"User is on `http://localhost:3000` with login form visible"*, *"Cart contains 1 item ($34.47)"*). |
| **Steps** | Explicit, numbered sequence of user actions using concrete values and target controls. |
| **Expected Result** | Concrete, observable verification criteria (assertions, visible elements, text, URLs, or calculation totals). |
| **Bug / Regression Flag** | If this case covers an observed failure from exploration notes, flag it explicitly: `[Regression — Known Bug: <Description>]`. |

---

## Grounding in Real Application Reality

1. **Use verified locators**: Reference the recommended selectors documented in `exploration-notes.md` (`getByRole`, `getByLabel`, stable IDs) rather than arbitrary CSS paths.
2. **Use real test data**: Use credentials, products, and prices discovered during exploration (e.g. `demo@techshop.com`, `password123`, `$89.99` base price).
3. **Account for known bugs**: When a test documents what *should* happen per spec, but the app currently fails, write the test case to assert the **correct requirement behavior** and tag it with `[Regression — Known Bug]`. These become automated regression tests once the application is patched.

---

## Execution Checklist

Before delivering the test matrix, verify:
- [ ] Every in-scope requirement has at least one associated test case.
- [ ] Positive, Negative, and Edge categories are all represented for each feature.
- [ ] Every title describes clear behavior.
- [ ] Preconditions and steps are deterministic and reproducible.
- [ ] Every known bug from exploration notes is represented as a tagged regression test case.

