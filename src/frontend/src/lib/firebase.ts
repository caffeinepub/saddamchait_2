// Firebase types and wrapper for CDN-loaded Firebase
// The actual Firebase SDK is loaded via CDN in index.html

interface FirebaseApp {
  name: string;
  options: any;
}

interface FirebaseAuth {
  currentUser: any;
  app: FirebaseApp;
}

interface FirebaseFirestore {
  app: FirebaseApp;
}

interface FirebaseUser {
  uid: string;
  email: string | null;
}

interface UserCredential {
  user: FirebaseUser;
}

// Extend Window interface to include Firebase globals
declare global {
  interface Window {
    __FIREBASE_APP__: FirebaseApp;
    __FIREBASE_AUTH__: FirebaseAuth;
    __FIREBASE_FIRESTORE__: FirebaseFirestore;
    __FIREBASE_MODULES__: {
      auth: any;
      firestore: any;
    };
  }
}

// Wait for Firebase to be loaded from CDN
function waitForFirebase(): Promise<void> {
  return new Promise((resolve) => {
    if (window.__FIREBASE_APP__ && window.__FIREBASE_AUTH__ && window.__FIREBASE_FIRESTORE__) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.__FIREBASE_APP__ && window.__FIREBASE_AUTH__ && window.__FIREBASE_FIRESTORE__) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Load Firebase modules dynamically
async function loadFirebaseModules() {
  if (!window.__FIREBASE_MODULES__) {
    const [authModule, firestoreModule] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js' as any),
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js' as any)
    ]);
    
    window.__FIREBASE_MODULES__ = {
      auth: authModule,
      firestore: firestoreModule
    };
  }
  return window.__FIREBASE_MODULES__;
}

// Initialize Firebase (already done in HTML, but we export references)
export const getAuth = () => window.__FIREBASE_AUTH__;
export const getDb = () => window.__FIREBASE_FIRESTORE__;

// Helper: Check if this is the first user
export async function isFirstUser(): Promise<boolean> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, getDocs } = modules.firestore;
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking first user:', error);
    return false;
  }
}

// Helper: Create user profile in Firestore
// ALWAYS uses the authenticated user's UID from Firebase Auth currentUser
export async function createUserProfile(
  profileData: {
    name?: string;
    relation?: string;
    customRelation?: string;
    age?: string;
    countryCode?: string;
    phoneNumber?: string;
    profileImageDataUrl?: string;
  }
): Promise<void> {
  await waitForFirebase();
  const auth = getAuth();
  const db = getDb();
  
  // Get the authenticated user's UID
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user found');
  }
  
  const uid = currentUser.uid;
  const email = currentUser.email || '';
  
  const modules = await loadFirebaseModules();
  const { doc, setDoc } = modules.firestore;
  
  // Check if this is the first user
  const firstUser = await isFirstUser();
  const role = firstUser ? 'super_admin' : 'user';
  const approved = firstUser ? true : false;

  console.log('createUserProfile - Creating profile for uid:', uid, 'role:', role, 'approved:', approved);

  // ALWAYS write to users/{uid} using the authenticated user's UID
  // Use setDoc to overwrite any existing data
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    name: profileData.name || '',
    role,
    approved,
    createdAt: new Date().toISOString(),
    ...profileData,
  });

  console.log('createUserProfile - Profile created successfully for uid:', uid);
}

// Helper: Get user profile from Firestore with FRESH server read (no cache)
// Uses getDocFromServer() to bypass cache entirely
export async function getUserProfile(uid: string): Promise<{ approved: boolean; role: string } | null> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { doc, getDocFromServer } = modules.firestore;
    
    console.log('getUserProfile - Fetching FRESH server data for uid:', uid);
    
    // Use getDocFromServer() to force fresh read from server, bypassing cache entirely
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDocFromServer(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Explicitly check approved field - must be exactly true (boolean)
      const approved = data.approved === true;
      const role = data.role ?? 'user';
      
      console.log('getUserProfile - Fresh server data retrieved for uid:', uid, 'approved:', approved, 'role:', role, 'raw approved value:', data.approved, 'fromCache:', userDoc.metadata.fromCache);
      
      return {
        approved,
        role,
      };
    }
    
    console.log('getUserProfile - Document does not exist for uid:', uid);
    return null;
  } catch (error) {
    console.error('getUserProfile - Error fetching user profile:', error);
    return null;
  }
}

// Helper: Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: {
    name?: string;
    relation?: string;
    customRelation?: string;
    age?: string;
    countryCode?: string;
    phoneNumber?: string;
    profileImageDataUrl?: string;
  }
): Promise<{ success: boolean; error?: string; isProfileError?: boolean }> {
  try {
    await waitForFirebase();
    const auth = getAuth();
    
    const modules = await loadFirebaseModules();
    const { createUserWithEmailAndPassword, signOut } = modules.auth;
    
    // Step 1: Create Firebase Auth user
    let userCredential: UserCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      console.error('signUpWithEmail - Auth error:', authError);
      return { success: false, error: authError.code || 'unknown' };
    }

    const user = userCredential.user;
    console.log('signUpWithEmail - Auth user created with uid:', user.uid);

    // Step 2: Create Firestore profile using the authenticated user's UID
    try {
      await createUserProfile(profileData);
      console.log('signUpWithEmail - Firestore profile created successfully');
    } catch (profileError: any) {
      console.error('signUpWithEmail - Firestore profile creation failed:', profileError);
      // Sign out the user since profile creation failed
      await signOut(auth);
      return { 
        success: false, 
        error: 'profile-creation-failed',
        isProfileError: true 
      };
    }

    // Step 3: Sign out immediately (unapproved users should not remain logged in)
    await signOut(auth);
    console.log('signUpWithEmail - User signed out after successful signup');

    return { success: true };
  } catch (error: any) {
    console.error('signUpWithEmail - Unexpected error:', error);
    return { success: false, error: error.code || 'unknown' };
  }
}

// Helper: Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; needsApproval?: boolean }> {
  try {
    await waitForFirebase();
    const auth = getAuth();
    
    const modules = await loadFirebaseModules();
    const { signInWithEmailAndPassword, signOut } = modules.auth;
    
    console.log('signInWithEmail - Attempting authentication for:', email);
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('signInWithEmail - Authenticated user uid:', user.uid);

    // ALWAYS fetch fresh approval state from server using users/{uid}
    // Use getDocFromServer() to bypass cache entirely - NO cached data
    const profile = await getUserProfile(user.uid);

    console.log('signInWithEmail - Profile fetched:', profile);

    // Check if profile exists and approved is exactly true
    if (!profile) {
      console.log('signInWithEmail - Profile missing for uid:', user.uid, '- signing out');
      await signOut(auth);
      return { success: false, needsApproval: true };
    }

    if (profile.approved !== true) {
      console.log('signInWithEmail - Not approved (approved =', profile.approved, ') for uid:', user.uid, '- signing out');
      await signOut(auth);
      return { success: false, needsApproval: true };
    }

    console.log('signInWithEmail - Login successful, user is approved for uid:', user.uid);
    return { success: true };
  } catch (error: any) {
    console.error('signInWithEmail - Error:', error);
    return { success: false, error: error.code || 'unknown' };
  }
}

// Helper: Sign out
export async function signOutUser(): Promise<void> {
  await waitForFirebase();
  const auth = getAuth();
  
  const modules = await loadFirebaseModules();
  const { signOut } = modules.auth;
  
  await signOut(auth);
}
