'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getRoleDashboardPath } from '@/lib/utils';

export function useAuth() {
  const { user, token, isAuthenticated, borrowerProfile, login, logout, setBorrowerProfile } =
    useAuthStore();
  const router = useRouter();

  const redirectToDashboard = () => {
    if (user) {
      router.push(getRoleDashboardPath(user.role));
    }
  };

  const handleLogout = () => {
    // Clear middleware cookies
    document.cookie = 'lms_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'lms_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    logout();
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    borrowerProfile,
    login,
    logout: handleLogout,
    setBorrowerProfile,
    redirectToDashboard,
  };
}

export function useRequireAuth(requiredRole?: string | string[]) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role) && user.role !== 'ADMIN') {
        router.replace(getRoleDashboardPath(user.role));
      }
    }
  }, [isAuthenticated, user, router, requiredRole]);

  return { user, isAuthenticated };
}
