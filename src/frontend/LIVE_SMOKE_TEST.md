# LIVE Environment Smoke Test

## Test Execution Checklist

### 1. Signup Flow
- [ ] Navigate to signup page
- [ ] Fill in all required fields (name, email, password, profile photo)
- [ ] Submit signup form
- [ ] Verify success message displayed
- [ ] Verify user is signed out after signup
- [ ] Check Firestore: `users/{uid}` document created with `approved: false`

### 2. First User Super Admin Auto-Approval
- [ ] Clear Firestore `users` collection
- [ ] Sign up first user
- [ ] Check Firestore: First user has `role: "super_admin"` and `approved: true`
- [ ] Attempt login with first user
- [ ] Verify login succeeds without approval message
- [ ] Verify access to admin features

### 3. Critical Approval Gating Tests

#### 3.1 Document Path Verification
- [ ] Open browser console
- [ ] Attempt login
- [ ] Verify console shows: "getUserProfile - Fetching FRESH server data for uid: {actual_uid}"
- [ ] Verify uid matches Firebase Auth currentUser.uid
- [ ] Verify console shows: "fromCache: false" (proving server read)
- [ ] Confirm NO email-based queries in network tab

#### 3.2 Fresh Server Read (No Cache) - CRITICAL TEST
- [ ] Login with unapproved user (should fail with "pending approval" message)
- [ ] Admin flips `approved: false` → `true` in Firestore console
- [ ] WITHOUT hard refresh, attempt login again immediately
- [ ] Verify login now succeeds (proves fresh read, no cache)
- [ ] Check console logs confirm "fromCache: false" on each attempt
- [ ] Verify console shows "Fresh server data retrieved" message

#### 3.3 Approved Admin User
- [ ] Ensure Firestore `users/{uid}` has:
  - `approved: true` (boolean, not string)
  - `role: "admin"` or `role: "super_admin"`
- [ ] Attempt login
- [ ] Verify NO "pending approval" message shown
- [ ] Verify login succeeds
- [ ] Verify console shows "Login successful, user is approved"
- [ ] Verify access to admin dashboard

#### 3.4 Unapproved User
- [ ] Ensure Firestore `users/{uid}` has `approved: false`
- [ ] Attempt login
- [ ] Verify exact message: "Your account is pending admin approval."
- [ ] Verify user is signed out
- [ ] Verify console shows "Not approved" message
- [ ] Verify no access to app features

#### 3.5 Missing Profile
- [ ] Create Firebase Auth user (via signup)
- [ ] Delete `users/{uid}` document from Firestore
- [ ] Attempt login
- [ ] Verify pending approval message shown
- [ ] Verify console shows "Profile missing" message
- [ ] Verify user is signed out

### 4. Security Rules Validation
- [ ] Unauthenticated user cannot read any `users` documents
- [ ] Authenticated user can read own `users/{uid}` document
- [ ] Authenticated user cannot read other users' documents (unless admin)
- [ ] Regular user cannot modify `role` or `approved` fields
- [ ] Admin can modify `role` and `approved` fields

### 5. Password Reset Flow
- [ ] Navigate to password reset page
- [ ] Verify admin-only manual reset messaging displayed
- [ ] Verify no Firebase password reset email sent
- [ ] Verify clear instructions for admin contact

### 6. Profile Image Processing
- [ ] Capture profile photo during signup
- [ ] Verify image resized to max 512x512
- [ ] Verify image compressed to <200KB
- [ ] Verify image stored as data URL in Firestore

## Test Results

### Pass Criteria
- All checkboxes marked
- No console errors
- Approval gating works correctly for all user states
- Fresh server reads confirmed (fromCache: false on every login)
- Document path uses `users/{auth.uid}` only
- Flipping approved in Firestore takes effect on next login without hard refresh

### Fail Criteria
- Any checkbox cannot be marked
- Console errors present
- Approved users blocked from login
- Unapproved users able to login
- Cached approval state between attempts (fromCache: true)
- Email-based lookups detected

## Expected Console Log Patterns

### Successful Login (Approved User)
