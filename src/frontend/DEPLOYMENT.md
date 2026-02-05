# Deployment Runbook

## LIVE Deployment Process

### Pre-Deployment Checklist
- [ ] All tests passing in draft environment
- [ ] Firebase configuration verified
- [ ] Firestore security rules deployed
- [ ] Environment variables configured

### Build Steps
1. Install dependencies: `npm install`
2. Build production bundle: `npm run build`
3. Deploy to hosting: `firebase deploy --only hosting`

### Post-Deployment Verification

#### Critical Approval Gating Checks

1. **Document Path Verification**
   - Login uses `users/{auth.uid}` (NOT email-based lookup)
   - Check browser console logs for "getUserProfile - Fetching FRESH server data for uid:" messages
   - Verify uid matches Firebase Auth currentUser.uid
   - Verify console shows "fromCache: false" (proving server read)

2. **Fresh Server Read Verification - CRITICAL**
   - Each login triggers fresh Firestore read using `getDocFromServer()`
   - No cached approval state between login attempts
   - Console logs must show "fromCache: false" on every login attempt
   - Admin can flip `approved` field and next login reflects change WITHOUT hard refresh
   - Test procedure:
     1. Login with unapproved user (should fail)
     2. Admin sets `approved: true` in Firestore
     3. Login again immediately (should succeed)
     4. Verify console shows fresh server read both times

3. **Approved Admin User Test**
   - User with `approved: true` and `role: "admin"` in `users/{uid}`
   - Should NOT see "Your account is pending admin approval"
   - Should successfully log in
   - Console should show "Login successful, user is approved"

4. **Unapproved User Test**
   - User with `approved: false` in `users/{uid}`
   - Should see exact message: "Your account is pending admin approval"
   - Should be signed out immediately
   - Console should show "Not approved" message

5. **Missing Profile Test**
   - User with no document in `users/{uid}`
   - Should see pending approval message
   - Should be signed out immediately
   - Console should show "Profile missing" message

### Rollback Procedure
If critical issues are detected:
1. Revert to previous hosting version: `firebase hosting:rollback`
2. Investigate logs and errors
3. Fix issues in draft environment
4. Re-test before redeploying

### Troubleshooting

#### User sees "pending approval" despite approved=true
- Check browser console for getUserProfile logs
- Verify document path is `users/{auth.uid}` not email-based
- Confirm `approved` field is boolean true (not string "true")
- Check Firestore security rules allow read access
- **CRITICAL**: Verify console shows "fromCache: false" - if it shows "fromCache: true", the fix is not working
- Verify code is using `getDocFromServer()` not `getDoc()`

#### Login fails silently
- Check browser console for errors
- Verify Firebase Auth is initialized
- Check network tab for Firestore requests
- Confirm security rules allow user document read

#### Approval state cached between logins
- **ROOT CAUSE**: Code is using `getDoc()` instead of `getDocFromServer()`
- **FIX**: Ensure `getUserProfile()` uses `getDocFromServer()` to bypass cache
- Verify console logs show "fromCache: false" on every login
- Test by flipping approved field and logging in again without refresh

### Expected Console Log Patterns

#### Successful Login (Approved User)
