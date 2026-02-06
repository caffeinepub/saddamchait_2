interface UserProfile {
  role: string;
  approved: boolean;
}

/**
 * Determines the post-login redirect route based on user profile.
 * Priority order:
 * 1. unapproved user → /pending-approval
 * 2. ALL approved users (including admin/super_admin) → /chat
 */
export function getPostLoginRoute(profile: UserProfile): '/chat' | '/pending-approval' {
  // Unapproved users always go to pending approval
  if (!profile.approved) {
    return '/pending-approval';
  }

  // All approved users (including admin and super_admin) go to /chat
  return '/chat';
}
