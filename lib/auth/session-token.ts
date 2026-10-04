// Signed session tokens: base64url(payload JSON) + "." + base64url(HMAC-SHA256).
// Uses Web Crypto only so it runs in both the Edge middleware and Node route handlers.

export const SESSION_COOKIE_NAME = 'ems_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let cachedKey: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('AUTH_SECRET must be set to a random string of at least 32 characters');
    }
    cachedKey = crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
      'verify',
    ]);
  }
  return cachedKey;
}

export async function signSessionToken(payload: Record<string, unknown>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body = toBase64Url(encoder.encode(JSON.stringify({ ...payload, iat: now, exp: now + SESSION_MAX_AGE_SECONDS })));
  const signature = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the payload only if the signature is valid and the token has not expired. */
export async function verifySessionToken<T = Record<string, unknown>>(token?: string | null): Promise<T | null> {
  if (!token) return null;
  const [body, signature, ...rest] = token.split('.');
  if (!body || !signature || rest.length > 0) return null;

  try {
    const valid = await crypto.subtle.verify('HMAC', await getKey(), fromBase64Url(signature), encoder.encode(body));
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(body)));
    if (typeof payload?.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as T;
  } catch {
    return null;
  }
}
