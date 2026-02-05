# Specification

## Summary
**Goal:** Unify the app experience with a global header/profile menu and a role-based, in-app Admin Dashboard backed by a consistent `users/{uid}` Firestore schema and enforced by security rules.

**Planned changes:**
- Align Firestore user documents to `users/{uid}` with fields: `name`, `email`, `photoURL`, `role` (`user|admin|super_admin`), `approved`, `createdAt`; ensure signup writes these fields and profile reads use them.
- Implement first-ever signup behavior: first user becomes `super_admin` and `approved=true`; subsequent users become `user` and `approved=false`.
- Add a global header on all pages with app logo + app name on the left and a clickable user avatar on the right when authenticated.
- Add an avatar-triggered profile popup showing the current user’s name and role, a conditional “Open Admin Dashboard” button for `admin`/`super_admin`, and a “Logout” action that returns to `/login`.
- Add an in-app Admin Dashboard (no separate app) restricted to `admin`/`super_admin`, with pages: Dashboard (stats), Users list, Chats, Reports, Settings.
- Implement Admin Users list to display all users (including `super_admin`) and support approve/block and role changes (`user`↔`admin`) with permissions and safeguards (no setting/demoting `super_admin` via UI).
- Update Firestore security rules to enforce user self-access limits, admin read-all access for listing, and restrictions around `role`/`approved` updates (including protecting `super_admin`).
- Apply a clean, WhatsApp-style, mobile-friendly green-forward UI across auth, header, home, and admin dashboard with English-only user-facing text.
- Add a static app logo asset under `frontend/public/assets/generated/` and render it in the header.

**User-visible outcome:** Users can sign up and log in (subject to approval), see a consistent header with their avatar menu, and authorized admins can open an in-app Admin Dashboard to view basic stats and manage users (approve/block and change roles) with role-based access controls.
