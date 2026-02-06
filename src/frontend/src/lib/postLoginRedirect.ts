interface UserProfile {
  role: string;
  approved: boolean;
  rejected?: boolean;
  blocked?: boolean;
}

/**
 * Determines the post-login redirect route based on user profile.
 * This helper is NO LONGER used by LoginScreen.
 * LoginScreen always redirects to /chat after successful login.
 * 
 * This function is kept for potential future use in other contexts.
 * Priority order:
 * 1. blocked user → handled in LoginScreen (no redirect)
 * 2. rejected user → handled in LoginScreen (no redirect)
 * 3. unapproved user → /pending-approval
 * 4. approved user → /chat
 */
export function getPostLoginRoute(profile: UserProfile): '/chat' | '/pending-approval' {
  // Blocked and rejected users are handled in LoginScreen before calling this
  // Unapproved users go to pending approval
  if (!profile.approved) {
    return '/pending-approval';
  }

  // All approved users go to chat (no role-based routing)
  return '/chat';
}
