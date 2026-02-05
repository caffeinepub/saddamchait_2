# Specification

## Summary
**Goal:** Fix login approval gating to always use a fresh, server-forced Firestore read of `users/{auth.uid}` and gate access solely on that document’s `approved` boolean.

**Planned changes:**
- Update the login approval check to fetch `doc(db, 'users', uid)` (where `uid` is the authenticated Firebase Auth user UID) on every login attempt using a server-forced read (no cache-eligible reads).
- Use only `users/{uid}.approved === true` as the approval source of truth; if the doc is missing or `approved !== true`, sign the user out and show: "Your account is pending admin approval."
- Remove/disable any email-based user profile lookup and any reuse of prior approval state between logins (no `where('email'...)`, no cached/stored approval flags).
- Update LIVE smoke test / deployment verification guidance to confirm: fresh server read each login, document path `users/{auth.uid}` only, no email lookup, and no cached approval state; include expected console/log indicators for troubleshooting.

**User-visible outcome:** On each login attempt, approval status reflects the current `approved` value in Firestore `users/{auth.uid}` immediately (even if toggled by an admin between attempts), and unapproved/missing profiles are signed out with the pending-approval message.
