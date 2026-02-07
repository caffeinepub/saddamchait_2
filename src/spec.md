# Specification

## Summary
**Goal:** Fix the Admin Users list so admins always see all users with key details visible, and enforce the exact approved-users chat request flow (sender/receiver visibility rules, permanent 1:1 chat on accept, and 24h resend rule on reject).

**Planned changes:**
- Update the existing `/admin/users` screen to always render a single combined list/table of all users (approved, pending/unapproved, rejected, blocked) while keeping the current Admin layout, route guard, and actions menu structure.
- Ensure each `/admin/users` row permanently displays user photo/avatar, name, email, phone number, and a human-readable signup date/time derived from `users.createdAt` (not only inside a dialog).
- Keep admin actions working for every user in the list (approve, block, delete, make helper admin/promote) and refresh the affected row immediately after each action without a manual page reload.
- Enforce chat request UI rules on the approved users list: users can send requests to approved users; senders only see “Request Sent”; receivers see Accept/Reject only for incoming requests where `toUserId === currentUserId` and `status === "pending"`.
- On Accept, open a permanent private 1-to-1 chat room with a standard chat UI (message history + input) that remains available later under the user’s Chats.
- On Reject, show a clear rejected state to the sender and block re-sending to the same receiver until 24 hours have passed since rejection (persisted via Firestore timestamps).
- Ensure each change is immediately verifiable in Draft preview without unrelated UI redesign.

**User-visible outcome:** Admins can always view and manage all users in `/admin/users` with essential details visible in the list, and approved users experience a correct chat-request flow where request states are shown to the right party, rejected requests enforce a 24-hour cooldown, and accepted requests open a permanent 1:1 chat with messages and input.
