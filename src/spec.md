# Specification

## Summary
**Goal:** Fix the header avatar/name and the My Profile screen so they display user photo, name, and email strictly from Firestore `users/{auth.uid}` fields (`photoURL`, `name`, `email`) with reliable fresh server reads.

**Planned changes:**
- Update My Profile (`/profile`) to read and render `photoURL`, `name`, and `email` ONLY from Firestore document `users/{auth.uid}` (no display binding to Firebase Auth user fields).
- Implement deterministic avatar fallback on My Profile: if Firestore `photoURL` is missing/empty/whitespace, render initials derived from Firestore `name` instead of attempting an image URL.
- Fix header top-right avatar and header/profile-menu displayed name to bind ONLY to Firestore `users/{auth.uid}`: use `photoURL` when non-empty; otherwise show initials from Firestore `name`; display name exactly from Firestore `name`.
- Ensure the Firestore read targets the exact path `users/{auth.uid}` and performs an awaited fresh server read (not cache-only), with console logs showing the UID used and that the read is not from cache.

**User-visible outcome:** The header and `/profile` consistently show the logged-in user’s Firestore-backed name, email, and photo (or initials fallback) based solely on `users/{uid}` data, without blank/misbound values when Firestore data exists.
