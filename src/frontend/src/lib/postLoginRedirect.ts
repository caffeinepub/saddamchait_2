interface UserProfile {
  role: string;
  approved: boolean;
  rejected?: boolean;
  blocked?: boolean;
}

/**
 * Determines the post-login redirect route based on user profile.
 * Priority order:
 * 1. blocked user → handled in LoginScreen (no redirect)
 * 2. rejected user → handled in LoginScreen (no redirect)
 * 3. unapproved user → /pending-approval
 * 4. ALL approved users (including admin/super_admin/helper_admin) → /chat
 */
export function getPostLoginRoute(profile: UserProfile): '/chat' | '/pending-approval' {
  // Blocked and rejected users are handled in LoginScreen before calling this
  // Unapproved users always go to pending approval
  if (!profile.approved) {
    return '/pending-approval';
  }

  // All approved users (including admin, super_admin, and helper_admin) go to /chat
  return '/chat';
}
