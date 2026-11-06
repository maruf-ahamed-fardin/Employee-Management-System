import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

function getClientApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getClientAuth(): Auth | null {
  const app = getClientApp();
  return app ? getAuth(app) : null;
}

export async function signInWithGoogle(): Promise<{ user: FirebaseUser; idToken: string }> {
  const auth = getClientAuth();
  if (!auth) throw new Error('Firebase client is not configured. Please check your environment variables.');

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function signInWithEmail(email: string, password: string): Promise<{ user: FirebaseUser; idToken: string }> {
  const auth = getClientAuth();
  if (!auth) throw new Error('Firebase client is not configured. Please check your environment variables.');

  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function signUpWithEmail(email: string, password: string): Promise<{ user: FirebaseUser; idToken: string }> {
  const auth = getClientAuth();
  if (!auth) throw new Error('Firebase client is not configured. Please check your environment variables.');

  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Send email verification
  await sendEmailVerification(result.user);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function resendVerificationEmail(): Promise<void> {
  const auth = getClientAuth();
  if (!auth || !auth.currentUser) throw new Error('No user is currently signed in');
  await sendEmailVerification(auth.currentUser);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getClientAuth();
  if (!auth) throw new Error('Firebase client is not configured. Please check your environment variables.');
  await sendPasswordResetEmail(auth, email);
}

