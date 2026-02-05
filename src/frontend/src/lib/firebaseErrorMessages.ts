export function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    // Auth errors
    'auth/email-already-in-use': 'This email is already registered. Please login instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    
    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'unavailable': 'Service is currently unavailable. Please try again later.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'resource-exhausted': 'Resource quota exceeded. Please try again later.',
    'failed-precondition': 'Operation failed. Please try again.',
    'aborted': 'Operation was aborted. Please try again.',
    'out-of-range': 'Operation was out of range.',
    'unimplemented': 'This operation is not implemented.',
    'data-loss': 'Data loss occurred. Please contact support.',
    'unauthenticated': 'You must be logged in to perform this action.',
    
    // Custom profile creation error
    'profile-creation-failed': 'Failed to create user profile. Please contact support or try again.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
