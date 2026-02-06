# Specification

## Summary
**Goal:** Add in-app Super Admin access to an admin area and implement a pending-user approval flow driven by Firestore user profile fields.

**Planned changes:**
- Show an "Admin Dashboard"/"User Approval" navigation item in the profile/avatar menu only when Firestore `users/{uid}.role === "super_admin"` (do not use Firebase Auth displayName/photoURL).
- Add/confirm an in-app admin screen for super admins to review pending users (`approved == false`) and view key signup details (fullName, age, relation, phoneNumber, email, photoURL) before taking action.
- Provide approve/reject actions per pending user: approve sets `approved=true` (and clears `rejected`), reject sets `rejected=true` while keeping `approved=false`, with the pending list refreshing after each action.
- Add a pending approval screen and routing guard so users with Firestore `approved === false` are routed to the pending screen on signup/login, showing English text that includes the exact phrase "Pending approval for admin".

**User-visible outcome:** Super admins can open an admin area from the profile menu to review full pending-user details and approve/reject accounts, while unapproved users are blocked from the main app and see a clear "Pending approval for admin" message until approved.
