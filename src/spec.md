# Specification

## Summary
**Goal:** Add an admin approval dashboard with strict separation between `super_admin` and `helper_admin` capabilities, and update login/admin access behavior accordingly.

**Planned changes:**
- Replace all legacy `admin` role checks/displays with the exact roles: `super_admin`, `helper_admin`, `user`, and update related TypeScript role types.
- Enforce admin-route access so only `super_admin`/`helper_admin` can access `/admin/users`, including hiding admin navigation entry points from normal users and redirecting unauthorized access using the existing pattern.
- Create/adjust `/admin/users` to show a Pending list sourced from Firestore `users` where `approved === false`, including an empty state when none exist.
- Implement field-level visibility on `/admin/users`: `super_admin` sees full details (including phone/email/role); `helper_admin` sees only profile photo, name, age, relation, and approval status (no phone/email/role UI anywhere).
- Implement pending-user actions with role separation: `super_admin` can Approve/Reject/Block/Promote to `helper_admin`; `helper_admin` can Approve/Reject only, with disallowed actions not exposed or executable via client-side paths.
- Persist approval/rejection/block state to Firestore: approval sets `approved=true`; rejection keeps `approved=false` and sets a rejected indicator; block sets a blocked indicator; keep existing signup flow unchanged.
- Update login flow messaging/behavior: show exact “Rejected by admin” for rejected users, block blocked users with a clear English message, keep existing pending/approved redirects (`/pending-approval` and `/chat`).
- Update `frontend/firestore.rules` to support `helper_admin` reading pending users and updating only minimal approval/rejection fields, while reserving role updates/privileged changes for `super_admin`.
- Ensure role privacy in non-admin UI so normal users are not shown labels revealing `super_admin` vs `helper_admin`.

**User-visible outcome:** Admins can access `/admin/users` to review only unapproved users and take allowed actions based on their admin role; normal users cannot access admin routes and will see correct login outcomes/messages for pending, rejected, blocked, or approved status.
