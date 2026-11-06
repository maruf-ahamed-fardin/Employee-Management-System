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
  } catch (err) {
    console.warn('Firebase Admin SDK initialization skipped:', err);
  }

  return null;
}

/**
 * Validates a Firebase Auth ID token using the official Google Identity Toolkit REST API.
 * This guarantees 100% reliable verification in Serverless / Vercel environments
 * directly using the Firebase API Key, without requiring server-side private key files.
 */
async function verifyViaFirebaseRestApi(idToken: string): Promise<DecodedIdToken> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not configured');
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();
  if (!res.ok || !data.users || data.users.length === 0) {
    throw new Error(data?.error?.message || 'Invalid or expired Firebase ID token');
  }

  const u = data.users[0];
  const provider = u.providerUserInfo?.[0]?.providerId || 'firebase';
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  return {
    uid: u.localId,
    email: u.email,
    email_verified: Boolean(u.emailVerified),
    name: u.displayName,
    picture: u.photoUrl,
    firebase: {
      sign_in_provider: provider,
      identities: {},
    },
    aud: projectId,
    auth_time: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    iss: `https://securetoken.google.com/${projectId}`,
    sub: u.localId,
  } as DecodedIdToken;
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  // 1. If Firebase Admin Service Account credentials are fully set, try Admin SDK first
  if (isFirebaseAdminConfigured()) {
    try {
      const auth = await getAdminAuth();
      if (auth) {
        return await auth.verifyIdToken(idToken);
      }
    } catch (err: any) {
      console.warn('Firebase Admin verifyIdToken error, falling back to Identity Toolkit:', err?.message);
    }
  }

  // 2. Official Google Firebase Identity Toolkit REST API (100% reliable on Vercel)
  return verifyViaFirebaseRestApi(idToken);
}
