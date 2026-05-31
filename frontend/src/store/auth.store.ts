import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, BorrowerProfile, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  borrowerProfile: BorrowerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (token: string, user: User, borrowerProfile?: BorrowerProfile | null) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setBorrowerProfile: (profile: BorrowerProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      borrowerProfile: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (token, user, borrowerProfile = null) => {
        localStorage.setItem('lms_token', token);
        set({
          token,
          user,
          borrowerProfile,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        set({
          token: null,
          user: null,
          borrowerProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user) => set({ user }),

      setBorrowerProfile: (borrowerProfile) => set({ borrowerProfile }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'lms_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        borrowerProfile: state.borrowerProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectRole = (state: AuthStore): UserRole | null => state.user?.role ?? null;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectToken = (state: AuthStore) => state.token;
export const selectBorrowerProfile = (state: AuthStore) => state.borrowerProfile;
