# Specification

## Summary
**Goal:** Align roles and navigation so all approved users land on /chat, unify /users as the approved user directory for starting conversations via chat requests, and keep admin access separate from the normal chat flow.

**Planned changes:**
- Update post-login redirect logic: unapproved users go to /pending-approval; all approved users (including admin and super_admin) go to /chat with no role-based redirect to /users or admin pages.
- Make /chat the default landing page for approved users, including an empty state showing exactly: "Start a conversation. Tap + to find users." plus a bottom-right FAB that navigates to /users.
- Rework /users into a single User List for all roles that shows all approved users (including admins, super_admins, and the currently logged-in user), with each row showing profile photo, name, and an optional small role badge.
- Implement chat-request flow from /users: selecting a user reveals a "Send Chat Request" action; sending writes a chat_request record with { fromUid, toUid, status: "pending", createdAt } and prevents duplicate pending requests for the same sender/recipient pair.
- Add incoming request handling UI: receivers see pending requests and can Accept or Reject; Accept creates a 1-to-1 chat thread visible to both users from /chat, Reject does not create a chat, and messaging is only possible after acceptance.
- Separate admin access from chat flow: only admin/super_admin see an "Admin Dashboard" item in the header profile dropdown; guard admin routes so normal users cannot access them; admin access must not affect /chat landing behavior.
- Apply a cohesive non-blue/non-purple theme across /chat and /users (typography, spacing, component styling), keeping the FAB prominent and accessible.

**User-visible outcome:** After login/signup, unapproved users see a pending approval screen, while all approved users land on /chat with a clear empty state and a + button to find users. Users start conversations by sending/accepting chat requests from /users, and admins/super_admins access the Admin Dashboard only via the profile dropdown without disrupting normal chat behavior.
