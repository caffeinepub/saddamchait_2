export interface UserProfile {
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  approved: boolean;
  createdAt: string;
  name?: string;
  relation?: string;
  customRelation?: string;
  age?: string;
  countryCode?: string;
  phoneNumber?: string;
  profileImageDataUrl?: string;
}

export interface SignupData {
  name?: string;
  relation?: string;
  customRelation?: string;
  age?: string;
  countryCode?: string;
  phoneNumber?: string;
  profileImageDataUrl?: string;
}
