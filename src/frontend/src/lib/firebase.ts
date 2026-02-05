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
export async function createUserProfile(
  profileData: {
    name: string;
    email: string;
    photoURL: string;
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
  const email = currentUser.email || profileData.email;
  
  const modules = await loadFirebaseModules();
  const { doc, setDoc, serverTimestamp } = modules.firestore;
  
  // Check if this is the first user
  const firstUser = await isFirstUser();
  const role = firstUser ? 'super_admin' : 'user';
  const approved = firstUser ? true : false;

  console.log('createUserProfile - Creating profile for uid:', uid, 'role:', role, 'approved:', approved);

  // Write to users/{uid} using the authenticated user's UID
  await setDoc(doc(db, 'users', uid), {
    name: profileData.name,
    email: email,
    photoURL: profileData.photoURL,
    role,
    approved,
    createdAt: serverTimestamp(),
  });

  console.log('createUserProfile - Profile created successfully for uid:', uid);
}

// Helper: Get user profile from Firestore with FRESH server read (no cache)
export async function getUserProfile(uid: string): Promise<{ name: string; email: string; photoURL: string; role: string; approved: boolean } | null> {
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
      const name = data.name ?? '';
      const email = data.email ?? '';
      const photoURL = data.photoURL ?? '';
      
      console.log('getUserProfile - Fresh server data retrieved for uid:', uid, 'approved:', approved, 'role:', role, 'fromCache:', userDoc.metadata.fromCache);
      
      return {
        name,
        email,
        photoURL,
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

// Helper: Get all users (admin only)
export async function getAllUsers(): Promise<Array<{ uid: string; name: string; email: string; photoURL: string; role: string; approved: boolean; createdAt: any }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, getDocs } = modules.firestore;
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users: Array<{ uid: string; name: string; email: string; photoURL: string; role: string; approved: boolean; createdAt: any }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        name: data.name ?? '',
        email: data.email ?? '',
        photoURL: data.photoURL ?? '',
        role: data.role ?? 'user',
        approved: data.approved === true,
        createdAt: data.createdAt,
      });
    });
    
    return users;
  } catch (error) {
    console.error('getAllUsers - Error fetching users:', error);
    return [];
  }
}

// Helper: Update user approval status (admin only)
export async function updateUserApproval(uid: string, approved: boolean): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { approved });
  
  console.log('updateUserApproval - Updated approval for uid:', uid, 'approved:', approved);
}

// Helper: Update user role (admin only)
export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { role });
  
  console.log('updateUserRole - Updated role for uid:', uid, 'role:', role);
}

// Helper: Delete user profile (super_admin only)
export async function deleteUserProfile(uid: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, deleteDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await deleteDoc(userDocRef);
  
  console.log('deleteUserProfile - Deleted profile for uid:', uid);
}

// Helper: Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: {
    name: string;
    photoURL: string;
  }
): Promise<{ success: boolean; error?: string; isProfileError?: boolean; isFirstUser?: boolean }> {
  try {
    await waitForFirebase();
    const auth = getAuth();
    
    const modules = await loadFirebaseModules();
    const { createUserWithEmailAndPassword, signOut } = modules.auth;
    
    // Check if this is the first user BEFORE creating auth account
    const firstUser = await isFirstUser();
    console.log('signUpWithEmail - Is first user:', firstUser);
    
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
      await createUserProfile({ ...profileData, email });
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

    // Step 3: If first user, keep them logged in; otherwise sign out
    if (firstUser) {
      console.log('signUpWithEmail - First user, keeping logged in');
      return { success: true, isFirstUser: true };
    } else {
      await signOut(auth);
      console.log('signUpWithEmail - Not first user, signed out after successful signup');
      return { success: true, isFirstUser: false };
    }
  } catch (error: any) {
    console.error('signUpWithEmail - Unexpected error:', error);
    return { success: false, error: error.code || 'unknown' };
  }
}

// Helper: Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; needsApproval?: boolean; uid?: string }> {
  try {
    await waitForFirebase();
    const auth = getAuth();
    
    const modules = await loadFirebaseModules();
    const { signInWithEmailAndPassword } = modules.auth;
    
    console.log('signInWithEmail - Attempting authentication for:', email);
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('signInWithEmail - Authenticated user uid:', user.uid);

    // Return success with uid - let the UI handle profile fetching and routing
    return { success: true, uid: user.uid };
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
