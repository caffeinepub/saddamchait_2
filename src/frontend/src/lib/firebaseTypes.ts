export interface UserProfile {
  fullName: string;
  age: number;
  relation: string;
  phoneNumber: string;
  email: string;
  photoURL: string;
  role: 'super_admin' | 'helper_admin' | 'user' | 'admin'; // Allow legacy 'admin' for migration
  approved: boolean;
  rejected?: boolean;
  blocked?: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface SignupData {
  fullName: string;
  age: number;
  relation: string;
  phoneNumber: string;
  email: string;
  photoURL: string;
}
