'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isLoading, setUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Read session on mount
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [setUser]);

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  return {
    user,
    isLoading,
    signOut,
    isAuthenticated: Boolean(user),
  };
}
