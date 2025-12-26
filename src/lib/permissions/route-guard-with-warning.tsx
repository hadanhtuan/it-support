'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { PermissionChecker } from './permission-checker';

interface RouteGuardWithWarningProps {
  children: React.ReactNode;
  showWarning?: boolean; // If true, shows warning instead of redirecting
}

/**
 * Alternative RouteGuard that can show warning messages instead of redirecting
 * Set showWarning=true to display access denied message without redirect
 */
export const RouteGuardWithWarning: React.FC<RouteGuardWithWarningProps> = ({ children, showWarning = false }) => {
  const { userState, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const user = userState?.userInfo ?? null;
    const firebaseUser = userState?.identity;
    const isEmailVerified = firebaseUser?.emailVerified ?? false;

    // Check if user should be redirected from auth pages
    const authRedirect = PermissionChecker.shouldRedirectFromAuth(user, pathname);
    if (authRedirect) {
      router.replace(authRedirect);
      return;
    }

    // Check route permissions
    const permissionResult = PermissionChecker.hasRoutePermission(pathname, user, isEmailVerified);

    if (!permissionResult.allowed && !showWarning) {
      console.warn(`Access denied to ${pathname}: ${permissionResult.reason}`);
      router.replace(permissionResult.redirectTo || '/');
    }
  }, [userState, loading, pathname, router, showWarning]);

  // Show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  const user = userState?.userInfo ?? null;
  const firebaseUser = userState?.identity;
  const isEmailVerified = firebaseUser?.emailVerified ?? false;

  // Check permissions
  const permissionResult = PermissionChecker.hasRoutePermission(pathname, user, isEmailVerified);

  if (!permissionResult.allowed) {
    if (showWarning) {
      // Show warning message without redirect
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center max-w-md mx-auto p-6'>
            <div className='mb-4'>
              <svg className='mx-auto h-12 w-12 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Access Restricted</h1>
            <p className='text-gray-600 mb-6'>{permissionResult.reason}</p>
            <div className='space-y-3'>
              <button
                onClick={() => router.push(permissionResult.redirectTo || '/')}
                className='w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors'
              >
                Go to {permissionResult.redirectTo === '/admin' ? 'Admin Dashboard' : 'Home'}
              </button>
              <button
                onClick={() => router.back()}
                className='w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show loading while redirect happens
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }

  return <>{children}</>;
};
