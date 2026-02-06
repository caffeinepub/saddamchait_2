# Live Smoke Test Checklist

This document provides a comprehensive checklist to verify the Saddam Chat application is working correctly after deployment.

## Pre-Test Setup
- [ ] Application is deployed and accessible
- [ ] Firebase configuration is correct (check console for errors)
- [ ] Test with a fresh browser session (incognito/private mode recommended)

## 1. First User Super Admin Creation
**Goal:** Verify the first user becomes super_admin automatically

### Steps:
1. [ ] Open the app in a fresh browser (clear all data or use incognito)
2. [ ] Navigate to signup page
3. [ ] Fill in all required fields (photo, name, age, relation, phone, email, password)
4. [ ] Submit signup form
5. [ ] **Expected:** Redirect to `/admin/users` (not `/home` or `/chat`)
6. [ ] Open browser console and check logs for:
   - `createUserProfile - Creating profile for uid: [uid] role: super_admin approved: true`
   - `getUserProfile - Role normalization: super_admin -> super_admin`
7. [ ] Verify you can access admin pages without approval wait

### Acceptance Criteria:
- [ ] First user is created with `role: 'super_admin'` in Firestore
- [ ] First user has `approved: true` in Firestore
- [ ] First user is redirected to `/admin/users` after signup
- [ ] No "Pending approval" screen is shown

## 2. Legacy Admin Role Migration
**Goal:** Verify existing users with legacy 'admin' role are migrated to 'super_admin'

### Steps:
1. [ ] If you have an existing user with `role: 'admin'` in Firestore (from old version):
   - Log in with that account
   - Check browser console for migration logs:
     - `⚠️ Legacy "admin" role detected - triggering migration`
     - `Migration complete - user is now super_admin with approved=true`
2. [ ] Verify in Firestore that the role is now `super_admin`
3. [ ] Verify `approved: true` is set
4. [ ] Verify admin dashboard is accessible

### Acceptance Criteria:
- [ ] Legacy 'admin' role is detected and migrated automatically
- [ ] User role is updated to 'super_admin' in Firestore
- [ ] User is marked as approved
- [ ] No manual Firestore edits required

## 3. Admin Dashboard Access from Profile Dropdown
**Goal:** Verify both super_admin and helper_admin can access admin dashboard from profile menu

### Steps:
1. [ ] Log in as super_admin
2. [ ] Click on avatar in top-right corner
3. [ ] **Expected:** Dropdown shows:
   - User name
   - Role badge (e.g., "Super Admin")
   - "My Profile" option
   - **"Admin Dashboard" option** ← Must be visible
   - "Logout" option
4. [ ] Click "Admin Dashboard"
5. [ ] **Expected:** Navigate to `/admin/users` successfully
6. [ ] Repeat test with helper_admin account (if available)
7. [ ] Verify regular users do NOT see "Admin Dashboard" option

### Acceptance Criteria:
- [ ] "Admin Dashboard" menu item is visible for super_admin
- [ ] "Admin Dashboard" menu item is visible for helper_admin
- [ ] "Admin Dashboard" menu item is hidden for regular users
- [ ] Clicking "Admin Dashboard" navigates to `/admin/users`

## 4. Admin Dashboard Access from Profile Screen
**Goal:** Verify admin CTA button on Profile screen works on mobile and desktop

### Steps:
1. [ ] Log in as super_admin or helper_admin
2. [ ] Navigate to "My Profile" (from dropdown or direct navigation)
3. [ ] Scroll down to bottom of profile card
4. [ ] **Expected:** See "Open Admin Dashboard" button with Settings icon
5. [ ] Click the button
6. [ ] **Expected:** Navigate to `/admin/users` successfully
7. [ ] Test on mobile viewport (resize browser or use mobile device)
8. [ ] Verify button is full-width on mobile, auto-width on desktop
9. [ ] Verify regular users do NOT see this button

### Acceptance Criteria:
- [ ] "Open Admin Dashboard" button is visible for super_admin
- [ ] "Open Admin Dashboard" button is visible for helper_admin
- [ ] Button is hidden for regular users
- [ ] Button is mobile-friendly (full-width on small screens)
- [ ] Clicking button navigates to `/admin/users`

## 5. Pending User Details Dialog
**Goal:** Verify all signup fields are shown in "View Details" dialog

### Steps:
1. [ ] Log in as super_admin or helper_admin
2. [ ] Navigate to `/admin/users` (Pending Users screen)
3. [ ] Ensure there is at least one pending user (create a second account if needed)
4. [ ] Click the actions menu (three dots) for a pending user
5. [ ] Click "View Details"
6. [ ] **Expected:** Dialog shows ALL signup fields:
   - Profile photo (avatar)
   - Full name
   - Status badge (Pending/Rejected/Blocked)
   - Role badge
   - Email address
   - Phone number
   - Age
   - Relation
   - User ID (UID)
7. [ ] Verify no fields are blank (unless truly missing in Firestore)
8. [ ] Close dialog and test with another pending user

### Acceptance Criteria:
- [ ] Dialog displays profile photo with fallback initials
- [ ] All contact info fields are shown (email, phone)
- [ ] All personal info fields are shown (age, relation)
- [ ] User ID is displayed for reference
- [ ] No accidental blank fields (use '—' fallback only when data is truly missing)
- [ ] Both super_admin and helper_admin can open the dialog

## 6. Approval Flow
**Goal:** Verify approved users redirect to /home, unapproved users see pending message

### Steps:
1. [ ] Create a new user account (not first user)
2. [ ] Complete signup
3. [ ] **Expected:** Redirect to `/pending-approval` screen
4. [ ] Verify screen shows:
   - Heading: "Pending approval for admin"
   - Status message explaining approval is needed
   - "Back to Login" button
5. [ ] Log in as super_admin
6. [ ] Navigate to `/admin/users`
7. [ ] Approve the pending user
8. [ ] Log out and log back in as the approved user
9. [ ] **Expected:** Redirect to `/chat` (not `/pending-approval`)
10. [ ] Verify user can access all app features

### Acceptance Criteria:
- [ ] Unapproved users are redirected to `/pending-approval`
- [ ] Pending approval screen shows correct English message
- [ ] Approved users can access `/chat` and other features
- [ ] No loading lock or infinite spinner

## 7. Navigation and Routing
**Goal:** Verify all routes work correctly with refresh/back/forward

### Steps:
1. [ ] Log in as approved user
2. [ ] Navigate to `/chat`
3. [ ] Refresh page (F5 or Cmd+R)
4. [ ] **Expected:** Stay on `/chat`, no redirect to login
5. [ ] Navigate to `/profile`
6. [ ] Use browser back button
7. [ ] **Expected:** Return to `/chat`
8. [ ] Use browser forward button
9. [ ] **Expected:** Return to `/profile`
10. [ ] Test with admin routes (`/admin/users`, `/admin/chats`, etc.)

### Acceptance Criteria:
- [ ] Refresh works on all routes without losing auth state
- [ ] Browser back/forward buttons work correctly
- [ ] No unexpected redirects or blank screens

## 8. Role-Based Access Control
**Goal:** Verify route guards work correctly for all roles

### Steps:
1. [ ] Log in as regular user
2. [ ] Try to access `/admin/users` directly (type in URL or navigate)
3. [ ] **Expected:** Redirect to `/chat` (not allowed)
4. [ ] Log in as helper_admin
5. [ ] Access `/admin/users`
6. [ ] **Expected:** Access granted, can view pending users
7. [ ] Verify helper_admin can approve/reject but NOT promote to helper_admin
8. [ ] Log in as super_admin
9. [ ] Verify super_admin can promote users to helper_admin

### Acceptance Criteria:
- [ ] Regular users cannot access admin routes
- [ ] Helper admins can access admin routes
- [ ] Super admins have full access
- [ ] Role-specific actions are enforced (e.g., only super_admin can promote)

## 9. Console Logs and Debugging
**Goal:** Verify console logs are helpful for debugging

### Steps:
1. [ ] Open browser console (F12)
2. [ ] Log in and navigate through the app
3. [ ] Check for:
   - Role normalization logs
   - Profile fetch logs with field inspection
   - Admin access check logs
   - No unexpected errors or warnings

### Acceptance Criteria:
- [ ] Console logs clearly show role normalization
- [ ] Profile fetch logs show exact Firestore field names
- [ ] Admin route guard logs show access decisions
- [ ] No critical errors in console

## 10. Firebase Configuration
**Goal:** Verify Firebase is configured correctly

### Steps:
1. [ ] Check browser console for Firebase initialization logs
2. [ ] Verify no "Firebase not initialized" errors
3. [ ] Check Firestore rules are deployed correctly
4. [ ] Verify helper_admin can read users collection
5. [ ] Verify helper_admin cannot update role/phone/email fields

### Acceptance Criteria:
- [ ] Firebase SDK loads successfully
- [ ] Firestore rules allow helper_admin read access
- [ ] Firestore rules restrict helper_admin write access appropriately
- [ ] No configuration errors in console

## Post-Test Verification
- [ ] All critical paths tested and working
- [ ] No blocking issues found
- [ ] Console logs are clean (no critical errors)
- [ ] Ready for production use

## Rollback Procedure
If critical issues are found:
1. Document the issue with screenshots and console logs
2. Revert to previous version if necessary
3. Fix issues in development environment
4. Re-run smoke tests before re-deploying

## Notes
- Test with multiple browsers (Chrome, Firefox, Safari) if possible
- Test on both desktop and mobile devices
- Clear browser cache if experiencing unexpected behavior
- Check Firestore console to verify data is written correctly
