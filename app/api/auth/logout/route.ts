import { successResponse } from '@/lib/api/response';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return successResponse({ message: 'Logged out successfully' });
}
