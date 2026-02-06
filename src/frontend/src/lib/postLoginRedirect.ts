interface UserProfile {
  role: string;
  approved: boolean;
  rejected?: boolean;
  blocked?: boolean;
}

/**
 * Determines the post-login redirect route based on user profile and role.
 * Priority order:
 * 1. blocked user → handled in LoginScreen (no redirect)
 * 2. rejected user → handled in LoginScreen (no redirect)
 * 3. unapproved user → /pending-approval
 * 4. super_admin/helper_admin (approved) → /admin/users
 * 5. user (approved) → /chat
 */
export function getPostLoginRoute(profile: UserProfile): '/chat' | '/pending-approval' | '/admin/users' {
  // Blocked and rejected users are handled in LoginScreen before calling this
  // Unapproved users always go to pending approval
  if (!profile.approved) {
    return '/pending-approval';
  }

  // Admins go to admin dashboard
  if (profile.role === 'super_admin' || profile.role === 'helper_admin') {
    return '/admin/users';
  }

  // Regular users go to chat
  return '/chat';
}
