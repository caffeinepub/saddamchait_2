interface UserProfile {
  role: string;
  approved: boolean;
}

/**
 * Determines the post-login redirect route based on user profile.
 * Priority order:
 * 1. super_admin → /chat
 * 2. admin → /chat
 * 3. approved user → /chat
 * 4. unapproved user → /pending-approval
 */
export function getPostLoginRoute(profile: UserProfile): '/chat' | '/pending-approval' {
  // Admins always go to /chat regardless of approval status
  if (profile.role === 'super_admin' || profile.role === 'admin') {
    return '/chat';
  }

  // Regular users: approved → /chat, unapproved → /pending-approval
  return profile.approved ? '/chat' : '/pending-approval';
}
