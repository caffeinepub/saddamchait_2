# Specification

## Summary
**Goal:** Fix the existing My Profile page and the header (top-right) avatar to display profile name, email, and avatar strictly from Firestore `users/{uid}` (`name`, `email`, `photoURL`) rather than Firebase Auth fields.

**Planned changes:**
- Update the existing My Profile page bindings to read `photoURL`, `name`, and `email` from Firestore `users/{uid}` only (no Firebase Auth-derived display values).
- Implement deterministic avatar fallback on the My Profile page: if `users/{uid}.photoURL` is missing/empty, render initials derived from `users/{uid}.name` and do not attempt to load an empty image URL.
- Update the existing header avatar to use Firestore `users/{uid}.photoURL`, with initials-from-`name` fallback when `photoURL` is missing/empty (no Firebase Auth-derived display values).
- Ensure both My Profile and header avatar fetch and display Firestore `users/{uid}` data whenever the document exists, without changing layout/design, routing, or any approval/role logic.

**User-visible outcome:** The My Profile page and header avatar consistently show the user’s Firestore profile (photo/name/email). If no photo URL is set, avatars show initials from the Firestore name instead of a broken image.
