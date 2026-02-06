# Specification

## Summary
**Goal:** Fix Firestore security rules so newly authenticated users can create their own profile document during signup.

**Planned changes:**
- Update `frontend/firestore.rules` to ensure the `match /users/{userId}` rule explicitly allows `create` only when `request.auth != null` and `request.auth.uid == userId`.
- Keep all other Firestore rules (including admin/helper permissions and non-`users/{userId}` collections) unchanged except as strictly required for the self-profile create permission.

**User-visible outcome:** A brand-new user can complete signup and successfully create their profile document at `users/{auth.uid}` without encountering a “Missing or insufficient permissions” error, while still being unable to write to other users’ profile documents.
