export interface UserProfile {
  name: string;
  age: number;
  relation: string;
  phone: string;
  email: string;
  photoURL: string;
  role: 'super_admin' | 'admin' | 'user';
  approved: boolean;
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
