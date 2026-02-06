export interface UserProfile {
  name: string;
  age: number;
  relation: string;
  phone: string;
  email: string;
  photoURL: string;
  role: 'super_admin' | 'helper_admin' | 'user';
  approved: boolean;
  rejected?: boolean;
  blocked?: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface SignupData {
  name: string;
  age: number;
  relation: string;
  phone: string;
  email: string;
  photoURL: string;
}
