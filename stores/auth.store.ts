import { create } from 'zustand';
import type { SessionUser } from '@/types/user';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: () => set({ user: null, isLoading: false }),
}));
