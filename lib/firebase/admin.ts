import { type DecodedIdToken } from 'firebase-admin/auth';

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.slice(1, -1);
  }
  return formatted.replace(/\\n/g, '\n');
}

export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return Boolean(projectId && clientEmail && privateKey);
}

let cachedAuth: any = null;

async function getAdminAuth() {
  if (cachedAuth) return cachedAuth;

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    const apps = getApps();
    if (apps.length > 0) {
      cachedAuth = getAuth(apps[0]);
      return cachedAuth;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = formatPrivateKey(rawPrivateKey);

    if (clientEmail && privateKey && projectId) {
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      cachedAuth = getAuth(app);
      return cachedAuth;
    }

    if (projectId) {
      const app = initializeApp({ projectId });
      cachedAuth = getAuth(app);
      return cachedAuth;
    }
  } catch (err) {
    console.warn('Firebase Admin SDK init skipped or failed, using Google Tokeninfo fallback:', err);
  }

  return null;
}

/**
 * Fallback token verification using Google's official public tokeninfo endpoint.
 * Works seamlessly in serverless / Edge / zero-credential deployments where
 * full Firebase Admin credentials are not set on Vercel.
 */
async function verifyViaGoogleTokenInfo(idToken: string): Promise<DecodedIdToken> {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google token validation failed: ${errorBody || res.statusText}`);
  }

  const info = await res.json();

  if (projectId && info.aud && info.aud !== projectId) {
    throw new Error(`Token audience mismatch. Expected project ${projectId}, got ${info.aud}`);
  }

  return {
    uid: info.sub || info.user_id,
    email: info.email,
    email_verified: info.email_verified === 'true' || info.email_verified === true,
    name: info.name,
    picture: info.picture,
    firebase: {
      sign_in_provider: info.email && !info.name ? 'password' : 'google.com',
      identities: {},
    },
    aud: info.aud,
    auth_time: parseInt(info.auth_time || '0', 10),
    exp: parseInt(info.exp || '0', 10),
    iat: parseInt(info.iat || '0', 10),
    iss: info.iss,
    sub: info.sub,
  } as DecodedIdToken;
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  // 1. Try Firebase Admin SDK if available
  try {
    const auth = await getAdminAuth();
    if (auth) {
      return await auth.verifyIdToken(idToken);
    }
  } catch (err: any) {
    console.warn('Firebase Admin verifyIdToken failed, falling back to Google tokeninfo:', err?.message);
  }

  // 2. Direct Google tokeninfo verification fallback
  return verifyViaGoogleTokenInfo(idToken);
}
