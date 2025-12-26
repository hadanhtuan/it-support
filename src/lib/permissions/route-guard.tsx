'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { toast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

import { PermissionChecker } from './permission-checker';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { userState, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    if (loading) return;

    // Check if we're in the middle of a registration process
    const isRegistering = typeof window !== 'undefined' && localStorage.getItem('registering') === 'true';
    if (isRegistering) {
      return; // Don't interfere with registration flow
    }

    const user = userState?.userInfo ?? null;
    const firebaseUser = userState?.identity;
    const isEmailVerified = firebaseUser?.emailVerified ?? false;

    // If user is null (logged out), check permissions
    if (!user) {
      const permissionResult = PermissionChecker.hasRoutePermission(pathname, null, false);
      if (!permissionResult.allowed) {
        router.replace(permissionResult.redirectTo || '/auth/login');
        return;
      }
      return; // Allow access if permission system allows it
    }

    // Check if user should be redirected from auth pages
    const authRedirect = PermissionChecker.shouldRedirectFromAuth(user, pathname);
    if (authRedirect) {
      router.replace(authRedirect);
      return;
    }

    // Check route permissions
    const permissionResult = PermissionChecker.hasRoutePermission(pathname, user, isEmailVerified);

    if (!permissionResult.allowed) {
      console.warn(`Access denied to ${pathname}: ${permissionResult.reason}`);

      // Show appropriate toast message based on the reason
      if (permissionResult.reason === 'Email verification required') {
        toast({
          title: t('permissions.accessDenied'),
          description: t('permissions.emailVerificationRequired'),
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('permissions.accessDenied'),
          description: t('permissions.noPermission'),
          variant: 'destructive'
        });
      }

      router.replace(permissionResult.redirectTo || '/');
    }
  }, [userState, loading, pathname, router, t]);

  // Show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Check if we're in the middle of a registration process
  const isRegistering = typeof window !== 'undefined' && localStorage.getItem('registering') === 'true';
  if (isRegistering) {
    return <>{children}</>; // Don't interfere with registration flow
  }

  const user = userState?.userInfo ?? null;
  const firebaseUser = userState?.identity;
  const isEmailVerified = firebaseUser?.emailVerified ?? false;

  // If user is null (logged out), check permissions
  if (!user) {
    const permissionResult = PermissionChecker.hasRoutePermission(pathname, null, false);
    if (!permissionResult.allowed) {
      // Show loading while redirect happens
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
        </div>
      );
    }
    return <>{children}</>; // Allow access if permission system allows it
  }

  // If user is logged in, check if they should be redirected from auth pages
  const authRedirect = PermissionChecker.shouldRedirectFromAuth(user, pathname);
  if (authRedirect) {
    // Show loading instead of auth page content while redirect happens
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Check permissions - if not allowed, show loading while redirect happens
  const permissionResult = PermissionChecker.hasRoutePermission(pathname, user, isEmailVerified);

  if (!permissionResult.allowed) {
    // Show loading instead of access denied to prevent flashing
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  return <>{children}</>;
};
