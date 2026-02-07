// Firebase types and wrapper for CDN-loaded Firebase
// The actual Firebase SDK is loaded via CDN in index.html

import { normalizeRole, isSuperAdminRole } from './roles';

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
  displayName?: string | null;
  photoURL?: string | null;
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

// Firebase Auth Functions

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  await waitForFirebase();
  const auth = getAuth();
  
  const modules = await loadFirebaseModules();
  const { signInWithEmailAndPassword } = modules.auth;
  
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  await waitForFirebase();
  const auth = getAuth();
  
  const modules = await loadFirebaseModules();
  const { createUserWithEmailAndPassword } = modules.auth;
  
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  await waitForFirebase();
  const auth = getAuth();
  
  const modules = await loadFirebaseModules();
  const { signOut } = modules.auth;
  
  await signOut(auth);
  console.log('signOutUser - User signed out successfully');
}

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
    fullName: string;
    age: number;
    relation: string;
    phoneNumber: string;
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

  // Write to users/{uid} using the authenticated user's UID with EXACT Firestore field names
  await setDoc(doc(db, 'users', uid), {
    fullName: profileData.fullName,
    age: profileData.age,
    relation: profileData.relation,
    phoneNumber: profileData.phoneNumber,
    email: email,
    photoURL: profileData.photoURL,
    role,
    approved,
    rejected: false,
    blocked: false,
    createdAt: serverTimestamp(),
  });

  console.log('createUserProfile - Profile created successfully for uid:', uid);
}

// Helper: Migrate legacy admin role to super_admin
async function migrateLegacyAdminRole(uid: string, currentRole: string): Promise<void> {
  if (currentRole !== 'admin') return;
  
  try {
    await waitForFirebase();
    const db = getDb();
    const modules = await loadFirebaseModules();
    const { doc, updateDoc } = modules.firestore;
    
    console.log('=== MIGRATING LEGACY ADMIN ROLE ===');
    console.log('Detected legacy "admin" role for uid:', uid);
    console.log('Updating to "super_admin" with approved=true');
    
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      role: 'super_admin',
      approved: true,
    });
    
    console.log('Migration complete - user is now super_admin with approved=true');
  } catch (error) {
    console.error('Failed to migrate legacy admin role:', error);
  }
}

// Helper: Get user profile from Firestore with FRESH server read (no cache)
export async function getUserProfile(uid: string): Promise<{ fullName: string; age: number; relation: string; phoneNumber: string; email: string; photoURL: string; role: string; approved: boolean; rejected?: boolean; blocked?: boolean } | null> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { doc, getDocFromServer } = modules.firestore;
    
    console.log('=== FIRESTORE PROFILE FETCH DEBUG ===');
    console.log('getUserProfile - Fetching from path: users/' + uid);
    console.log('getUserProfile - Using getDocFromServer() for FRESH server read (no cache)');
    
    // Use getDocFromServer() to force fresh read from server, bypassing cache entirely
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDocFromServer(userDocRef);
    
    console.log('getUserProfile - Snapshot metadata:', {
      exists: userDoc.exists(),
      fromCache: userDoc.metadata.fromCache,
      hasPendingWrites: userDoc.metadata.hasPendingWrites
    });
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // LOG EXACT FIRESTORE FIELD NAMES (case-sensitive)
      console.log('=== EXACT FIRESTORE DOCUMENT FIELDS (case-sensitive) ===');
      console.log('All field keys in Firestore document:', Object.keys(data));
      console.log('Full name field detected:', data.fullName !== undefined ? 'fullName' : 'NOT FOUND');
      console.log('Email field detected:', data.email !== undefined ? 'email' : 'NOT FOUND');
      console.log('Profile photo field detected:', data.photoURL !== undefined ? 'photoURL' : 'NOT FOUND');
      console.log('Phone number field detected:', data.phoneNumber !== undefined ? 'phoneNumber' : 'NOT FOUND');
      console.log('=== RAW FIELD VALUES ===');
      console.log('data.fullName =', data.fullName);
      console.log('data.email =', data.email);
      console.log('data.photoURL =', data.photoURL ? data.photoURL.substring(0, 100) + '...' : '(empty or undefined)');
      console.log('data.phoneNumber =', data.phoneNumber);
      console.log('data.role (raw) =', data.role);
      console.log('=== END FIRESTORE FIELD INSPECTION ===');
      
      // Migrate legacy admin role if detected
      const rawRole = data.role ?? 'user';
      if (rawRole === 'admin') {
        console.log('⚠️ Legacy "admin" role detected - triggering migration');
        await migrateLegacyAdminRole(uid, rawRole);
      }
      
      // Normalize role for consistent handling
      const normalizedRole = normalizeRole(rawRole);
      console.log('Role normalization:', rawRole, '->', normalizedRole);
      
      // Explicitly check approved field - must be exactly true (boolean)
      // For admins, ensure they are always approved
      const isAdmin = normalizedRole === 'super_admin' || normalizedRole === 'helper_admin';
      const approved = isAdmin ? true : (data.approved === true);
      const rejected = data.rejected === true;
      const blocked = data.blocked === true;
      const fullName = data.fullName ?? '';
      const age = data.age ?? 0;
      const relation = data.relation ?? '';
      const phoneNumber = data.phoneNumber ?? '';
      const email = data.email ?? '';
      const photoURL = data.photoURL ?? '';
      
      console.log('getUserProfile - Normalized profile data returned to UI:', {
        uid,
        fullName,
        email,
        photoURL: photoURL.substring(0, 50) + (photoURL.length > 50 ? '...' : ''),
        phoneNumber,
        approved,
        rejected,
        blocked,
        role: normalizedRole,
        fromCache: userDoc.metadata.fromCache
      });
      
      return {
        fullName,
        age,
        relation,
        phoneNumber,
        email,
        photoURL,
        approved,
        rejected,
        blocked,
        role: normalizedRole,
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
export async function getAllUsers(): Promise<Array<{ uid: string; fullName: string; age: number; relation: string; phoneNumber: string; email: string; photoURL: string; role: string; approved: boolean; rejected?: boolean; blocked?: boolean; createdAt: any }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, getDocs } = modules.firestore;
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users: Array<{ uid: string; fullName: string; age: number; relation: string; phoneNumber: string; email: string; photoURL: string; role: string; approved: boolean; rejected?: boolean; blocked?: boolean; createdAt: any }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const rawRole = data.role ?? 'user';
      const normalizedRole = normalizeRole(rawRole);
      
      users.push({
        uid: doc.id,
        fullName: data.fullName ?? '',
        age: data.age ?? 0,
        relation: data.relation ?? '',
        phoneNumber: data.phoneNumber ?? '',
        email: data.email ?? '',
        photoURL: data.photoURL ?? '',
        role: normalizedRole,
        approved: data.approved === true,
        rejected: data.rejected === true,
        blocked: data.blocked === true,
        createdAt: data.createdAt,
      });
    });
    
    return users;
  } catch (error) {
    console.error('getAllUsers - Error fetching users:', error);
    return [];
  }
}

// Helper: Get pending users (approved === false)
export async function getPendingUsers(): Promise<Array<{ uid: string; fullName: string; age: number; relation: string; phoneNumber: string; email: string; photoURL: string; role: string; approved: boolean; rejected?: boolean; blocked?: boolean; createdAt: any }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, query, where, getDocs } = modules.firestore;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('approved', '==', false));
    const snapshot = await getDocs(q);
    
    const users: Array<{ uid: string; fullName: string; age: number; relation: string; phoneNumber: string; email: string; photoURL: string; role: string; approved: boolean; rejected?: boolean; blocked?: boolean; createdAt: any }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const rawRole = data.role ?? 'user';
      const normalizedRole = normalizeRole(rawRole);
      
      users.push({
        uid: doc.id,
        fullName: data.fullName ?? '',
        age: data.age ?? 0,
        relation: data.relation ?? '',
        phoneNumber: data.phoneNumber ?? '',
        email: data.email ?? '',
        photoURL: data.photoURL ?? '',
        role: normalizedRole,
        approved: false,
        rejected: data.rejected === true,
        blocked: data.blocked === true,
        createdAt: data.createdAt,
      });
    });
    
    return users;
  } catch (error) {
    console.error('getPendingUsers - Error fetching pending users:', error);
    return [];
  }
}

// Helper: Get approved users (excluding current user)
export async function getApprovedUsers(currentUid: string): Promise<Array<{ uid: string; fullName: string; email: string; photoURL: string; role: string; approved: boolean }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, query, where, getDocs } = modules.firestore;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('approved', '==', true));
    const snapshot = await getDocs(q);
    
    const users: Array<{ uid: string; fullName: string; email: string; photoURL: string; role: string; approved: boolean }> = [];
    snapshot.forEach((doc) => {
      // Exclude current user from the list
      if (doc.id === currentUid) return;
      
      const data = doc.data();
      const rawRole = data.role ?? 'user';
      const normalizedRole = normalizeRole(rawRole);
      
      users.push({
        uid: doc.id,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        photoURL: data.photoURL ?? '',
        role: normalizedRole,
        approved: true,
      });
    });
    
    return users;
  } catch (error) {
    console.error('getApprovedUsers - Error fetching users:', error);
    return [];
  }
}

// Helper: Approve user (set approved = true, rejected = false)
export async function approveUser(uid: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { 
    approved: true,
    rejected: false,
  });
  
  console.log('approveUser - Approved user uid:', uid);
}

// Helper: Reject user (set rejected = true, keep approved = false)
export async function rejectUser(uid: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { 
    rejected: true,
    approved: false,
  });
  
  console.log('rejectUser - Rejected user uid:', uid);
}

// Helper: Block user (set blocked = true)
export async function blockUser(uid: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { 
    blocked: true,
    approved: false,
  });
  
  console.log('blockUser - Blocked user uid:', uid);
}

// Helper: Promote user to helper_admin (super_admin only)
export async function promoteToHelperAdmin(uid: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { 
    role: 'helper_admin',
    approved: true,
  });
  
  console.log('promoteToHelperAdmin - Promoted user uid:', uid, 'to helper_admin');
}

// Helper: Delete user (super_admin only)
export async function deleteUser(uid: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, deleteDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await deleteDoc(userDocRef);
  
  console.log('deleteUser - Deleted user uid:', uid);
}

// Helper: Update user approval status (admin only) - DEPRECATED, use specific functions
export async function updateUserApproval(uid: string, approved: boolean): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { approved });
  
  console.log('updateUserApproval - Updated approval for uid:', uid, 'approved:', approved);
}

// Helper: Update user role (admin only) - DEPRECATED for new roles
export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc } = modules.firestore;
  
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { role });
  
  console.log('updateUserRole - Updated role for uid:', uid, 'role:', role);
}

// Chat Request Functions

export async function sendChatRequest(fromUserId: string, toUserId: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { collection, addDoc, serverTimestamp, query, where, getDocs, or } = modules.firestore;
  
  // Check if any request already exists between these users (pending, accepted, or recently rejected)
  const requestsRef = collection(db, 'chat_requests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const existingRequest = snapshot.docs[0].data();
    
    // If pending or accepted, don't allow resend
    if (existingRequest.status === 'pending' || existingRequest.status === 'accepted') {
      console.log('Chat request already exists with status:', existingRequest.status);
      throw new Error('A chat request already exists');
    }
    
    // If rejected, check 24-hour cooldown
    if (existingRequest.status === 'rejected' && existingRequest.rejectedAt) {
      const rejectedTime = existingRequest.rejectedAt.toMillis ? existingRequest.rejectedAt.toMillis() : existingRequest.rejectedAt;
      const now = Date.now();
      const hoursSinceRejection = (now - rejectedTime) / (1000 * 60 * 60);
      
      if (hoursSinceRejection < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceRejection);
        throw new Error(`Please wait ${hoursRemaining} hours before sending another request`);
      }
    }
  }
  
  await addDoc(requestsRef, {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  
  console.log('sendChatRequest - Request sent from', fromUserId, 'to', toUserId);
}

export async function getChatRequests(userId: string): Promise<Array<{ id: string; fromUserId: string; toUserId: string; status: string; createdAt: any; rejectedAt?: any }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, query, where, getDocs, or } = modules.firestore;
    
    const requestsRef = collection(db, 'chat_requests');
    const q = query(
      requestsRef,
      or(
        where('fromUserId', '==', userId),
        where('toUserId', '==', userId)
      )
    );
    const snapshot = await getDocs(q);
    
    const requests: Array<{ id: string; fromUserId: string; toUserId: string; status: string; createdAt: any; rejectedAt?: any }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        status: data.status,
        createdAt: data.createdAt,
        rejectedAt: data.rejectedAt,
      });
    });
    
    return requests;
  } catch (error) {
    console.error('getChatRequests - Error fetching requests:', error);
    return [];
  }
}

export async function respondToChatRequest(requestId: string, accept: boolean): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp } = modules.firestore;
  
  const requestDocRef = doc(db, 'chat_requests', requestId);
  const requestDoc = await getDoc(requestDocRef);
  
  if (!requestDoc.exists()) {
    throw new Error('Chat request not found');
  }
  
  const requestData = requestDoc.data();
  
  if (accept) {
    // Update request status to accepted
    await updateDoc(requestDocRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });
    
    // Create a permanent chat room
    const chatsRef = collection(db, 'chats');
    const chatId = [requestData.fromUserId, requestData.toUserId].sort().join('_');
    
    await addDoc(chatsRef, {
      chatId,
      participants: [requestData.fromUserId, requestData.toUserId],
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
    
    console.log('respondToChatRequest - Accepted request and created chat:', chatId);
  } else {
    // Update request status to rejected with timestamp
    await updateDoc(requestDocRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
    });
    
    console.log('respondToChatRequest - Rejected request:', requestId);
  }
}

export async function getAcceptedChats(userId: string): Promise<Array<{ chatId: string; otherUserId: string }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, query, where, getDocs } = modules.firestore;
    
    const requestsRef = collection(db, 'chat_requests');
    const q = query(
      requestsRef,
      where('status', '==', 'accepted')
    );
    const snapshot = await getDocs(q);
    
    const chats: Array<{ chatId: string; otherUserId: string }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only include chats where current user is a participant
      if (data.fromUserId === userId || data.toUserId === userId) {
        const otherUserId = data.fromUserId === userId ? data.toUserId : data.fromUserId;
        const chatId = [data.fromUserId, data.toUserId].sort().join('_');
        
        chats.push({
          chatId,
          otherUserId,
        });
      }
    });
    
    return chats;
  } catch (error) {
    console.error('getAcceptedChats - Error fetching chats:', error);
    return [];
  }
}

// Chat Messages Functions

export async function getChatMessages(chatId: string): Promise<Array<{ id: string; senderId: string; text: string; createdAt: any }>> {
  try {
    await waitForFirebase();
    const db = getDb();
    
    const modules = await loadFirebaseModules();
    const { collection, query, where, orderBy, getDocs } = modules.firestore;
    
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    const messages: Array<{ id: string; senderId: string; text: string; createdAt: any }> = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt,
      });
    });
    
    return messages;
  } catch (error) {
    console.error('getChatMessages - Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
  await waitForFirebase();
  const db = getDb();
  
  const modules = await loadFirebaseModules();
  const { collection, addDoc, serverTimestamp } = modules.firestore;
  
  const messagesRef = collection(db, 'messages');
  await addDoc(messagesRef, {
    chatId,
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  
  console.log('sendMessage - Message sent to chat:', chatId);
}
