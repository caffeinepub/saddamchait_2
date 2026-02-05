export interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
  role: 'super_admin' | 'admin' | 'user';
  approved: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface SignupData {
  name: string;
  email: string;
  photoURL: string;
}
