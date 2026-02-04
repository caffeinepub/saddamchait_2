# Specification

## Summary
**Goal:** Make the Signup button functional in UI-only draft mode by adding form submission handling, field validation with inline errors, and a clear success confirmation.

**Planned changes:**
- Wire the green “Signup” button on `frontend/src/screens/SignupScreen.tsx` to a real form submit handler (e.g., `form onSubmit`) that prevents default page reload and performs no backend calls.
- Add client-side validation on submit for required fields (at minimum all “*” fields plus email/password/confirm password), showing inline, field-specific English error messages and updating/clearing them appropriately on re-submit.
- Add conditional validation: when Relation is “Other”, require the custom relation text input and show an inline error when empty.
- Validate password and confirm password for missing values and mismatch, with inline errors.
- When validation passes, show a clear UI-only success state/message (“Signup successful / Pending approval”) and provide an obvious working next action (e.g., “Back to Login”).

**User-visible outcome:** Clicking “Signup” submits the form without reloading the page; users see inline errors for missing/invalid inputs, and when everything is valid they see a clear success confirmation with a working next step (such as returning to Login).
