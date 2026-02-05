# Specification

## Summary
**Goal:** Update Saddam Chat branding and fix role-based routing/guards so users land on the correct post-login screens and super_admin can reach User Management from Chat.

**Planned changes:**
- Replace all user-facing "Admin Portal" text with "Saddam Chat" (app header, screen headings/titles, and the HTML document title/meta in frontend/index.html).
- Adjust post-login redirect logic:
  - super_admin → /chat
  - admin → /chat
  - approved non-admin users → /chat
  - unapproved non-admin users → /pending-approval
- Ensure routing/guard checks do not send admin/super_admin users through the Pending Approval flow or force them onto dashboard-only routes (e.g., /admin) unless they explicitly navigate there.
- Add a "User Management" item to the Chat header profile dropdown for super_admin only, linking to /admin/users.
- Ensure super_admin can always access /admin/users even if an "approved" flag is false/missing; approval gating applies only to non-admin users.

**User-visible outcome:** The app consistently displays the name "Saddam Chat"; after login, users are routed to Chat or Pending Approval based on role/approval rules; super_admin can open User Management from the Chat header menu and is never blocked by approval gating or dashboard-only redirects.
