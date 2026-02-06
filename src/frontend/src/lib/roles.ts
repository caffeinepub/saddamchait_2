// Shared role helpers for consistent admin detection and role normalization

export type UserRole = 'super_admin' | 'helper_admin' | 'user';

/**
 * Normalize legacy role values to current role system
 * Handles migration from old 'admin' role to 'super_admin'
 */
export function normalizeRole(role: string | undefined): UserRole {
  if (!role) return 'user';
  
  // Normalize legacy 'admin' to 'super_admin'
  if (role === 'admin') return 'super_admin';
  
  // Validate known roles
  if (role === 'super_admin' || role === 'helper_admin' || role === 'user') {
    return role as UserRole;
  }
  
  // Default to user for unknown roles
  console.warn('Unknown role detected:', role, '- defaulting to user');
  return 'user';
}

/**
 * Check if a role has admin privileges (super_admin or helper_admin)
 */
export function isAdminRole(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'super_admin' || normalized === 'helper_admin';
}

/**
 * Check if a role is super admin
 */
export function isSuperAdminRole(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'super_admin';
}

/**
 * Check if a role is helper admin
 */
export function isHelperAdminRole(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'helper_admin';
}
