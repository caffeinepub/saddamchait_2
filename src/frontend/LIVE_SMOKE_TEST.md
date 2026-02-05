# Live Smoke Test Checklist

## Pre-Deployment Verification
- [ ] Firebase project configured with Authentication and Firestore enabled
- [ ] Firestore security rules deployed (see firestore.rules)
- [ ] Environment variables set correctly in frontend/index.html

## Test 1: First User Signup (Super Admin Auto-Approval)
1. [ ] Navigate to signup page
2. [ ] Fill in name, email, password
3. [ ] Capture profile photo
4. [ ] Submit signup form
5. [ ] Verify success message appears
6. [ ] Check Firestore console:
   - [ ] Document exists at `users/{uid}`
   - [ ] Fields: `name`, `email`, `role: "super_admin"`, `approved: true`, `profilePhotoUrl`
   - [ ] `profilePhotoUrl` is a valid Firebase Storage URL
7. [ ] Verify user is signed out after signup
8. [ ] Login with the same credentials
9. [ ] **Verify redirect to /home immediately after login**
10. [ ] **Verify /home shows Dashboard/Home screen**
11. [ ] **Refresh page on /home - verify stays on home screen**
12. [ ] **Navigate back - verify browser back/forward works**

## Test 2: Second User Signup (Regular User - Needs Approval)
1. [ ] Sign out if logged in
2. [ ] Navigate to signup page
3. [ ] Fill in different name, email, password
4. [ ] Capture profile photo
5. [ ] Submit signup form
6. [ ] Verify success message appears
7. [ ] Check Firestore console:
   - [ ] Document exists at `users/{uid}`
   - [ ] Fields: `name`, `email`, `role: "user"`, `approved: false`, `profilePhotoUrl`
8. [ ] Verify user is signed out after signup

## Test 3: Login with Unapproved User (Critical Approval Gating)
1. [ ] Login with second user credentials
2. [ ] **Verify English pending approval message appears**
3. [ ] **Verify no redirect to /home**
4. [ ] **Verify login button is NOT stuck in loading state**
5. [ ] **Verify form remains usable (can try again)**
6. [ ] Check browser console for logs:
   ```
   LoginScreen - Attempting login for: [email]
   firebase.ts - Attempting sign in for: [email]
   firebase.ts - Sign in successful, checking approval...
   firebase.ts - Reading user document from: users/{uid}
   firebase.ts - User document data: { approved: false, ... }
   firebase.ts - User not approved, signing out
   LoginScreen - Login result: { needsApproval: true }
   LoginScreen - User needs approval
   ```
7. [ ] **Verify fromCache indicator is false in console logs**
8. [ ] Verify user is signed out (check Firebase Auth console)

## Test 4: Admin Approves User
1. [ ] Login as super admin (first user)
2. [ ] **Verify redirect to /home**
3. [ ] Navigate to Firestore console
4. [ ] Find second user's document at `users/{uid}`
5. [ ] Manually change `approved: false` to `approved: true`
6. [ ] Save the change

## Test 5: Login with Approved User
1. [ ] Sign out from admin account
2. [ ] Login with second user credentials (now approved)
3. [ ] **Verify redirect to /home immediately**
4. [ ] **Verify /home shows Dashboard/Home screen**
5. [ ] **Refresh page - verify stays on /home**
6. [ ] Check browser console for logs:
   ```
   LoginScreen - Attempting login for: [email]
   firebase.ts - Attempting sign in for: [email]
   firebase.ts - Sign in successful, checking approval...
   firebase.ts - Reading user document from: users/{uid}
   firebase.ts - User document data: { approved: true, ... }
   firebase.ts - User approved, login successful
   LoginScreen - Login result: { success: true }
   LoginScreen - Login successful, user is approved, navigating to /home
   ```
7. [ ] **Verify fromCache indicator is false in console logs**
8. [ ] Verify user remains signed in

## Test 6: Missing Profile Handling
1. [ ] Create a new Firebase Auth user manually in Firebase console
2. [ ] Do NOT create a corresponding Firestore document
3. [ ] Try to login with this user
4. [ ] **Verify English pending approval message appears**
5. [ ] **Verify no redirect**
6. [ ] **Verify login button is NOT stuck**
7. [ ] Check console logs:
   ```
   firebase.ts - User document does not exist
   firebase.ts - User profile missing, signing out
   LoginScreen - Login result: { needsApproval: true }
   ```

## Test 7: Security Rules Validation
1. [ ] Verify authenticated users can read their own document:
   - [ ] Login as any approved user
   - [ ] Check console - no permission errors
2. [ ] Verify users cannot modify `role` or `approved` fields:
   - [ ] Attempt to update these fields via Firestore console as non-admin
   - [ ] Should be blocked by security rules

## Test 8: Error Handling
1. [ ] Try login with wrong password
2. [ ] **Verify user-friendly error message appears**
3. [ ] **Verify login button is NOT stuck**
4. [ ] Try login with non-existent email
5. [ ] **Verify appropriate error message**
6. [ ] **Verify login button is NOT stuck**

## Test 9: Password Reset Flow
1. [ ] Navigate to password reset page
2. [ ] Verify admin-only manual reset message is displayed
3. [ ] Verify no Firebase password reset email is sent

## Test 10: Logout and Navigation
1. [ ] Login as approved user
2. [ ] **Verify on /home**
3. [ ] Click logout button
4. [ ] **Verify redirect to /login**
5. [ ] **Verify user is signed out**
6. [ ] Try to manually navigate to /home
7. [ ] **Verify redirect back to /login (if auth guard implemented)**

## Critical Checks (Must Pass)
- [ ] **Approved users redirect to /home immediately after login**
- [ ] **Unapproved users see English pending message without infinite spinner**
- [ ] **Login button always ends loading state (success, needsApproval, or error)**
- [ ] **Refresh on /home keeps user on home screen**
- [ ] **Browser back/forward navigation works correctly**
- [ ] **No Firebase/Firestore configuration changes needed**
- [ ] Fresh server reads confirmed (fromCache: false in logs)
- [ ] No cached approval state issues
- [ ] Document path is always `users/{auth.uid}`
- [ ] `approved` field is boolean (true/false)
- [ ] First user gets `super_admin` role with `approved: true`
- [ ] Subsequent users get `user` role with `approved: false`
- [ ] Missing profiles are handled gracefully
- [ ] Security rules prevent unauthorized modifications

## Notes
- All console logs should be present for debugging
- No errors should appear in browser console during normal flow
- Firebase Auth state should be consistent with Firestore approval state
- Profile photos should be stored in Firebase Storage and accessible
