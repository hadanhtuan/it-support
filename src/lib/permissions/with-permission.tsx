'use client';

import React, { ComponentType } from 'react';
import { UserRole, UserStatus } from '@/lib/core/models';
import { PermissionRule } from './permission-config';
import { usePermission } from './use-permissions';

interface WithPermissionOptions {
  roles?: UserRole[];
  statuses?: UserStatus[];
  requireEmailVerified?: boolean;
  custom?: (user: any) => boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Higher-order component to protect pages with specific permissions
 */
export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPermissionOptions
): React.FC<P> {
  const WithPermissionComponent: React.FC<P> = (props) => {
    const rule: PermissionRule = {
      roles: options.roles,
      statuses: options.statuses,
      requireEmailVerified: options.requireEmailVerified,
      custom: options.custom
    };

    const { hasPermission, loading } = usePermission(rule);

    if (loading) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
        </div>
      );
    }

    if (!hasPermission) {
      if (options.fallback) {
        return <>{options.fallback}</>;
      }

      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Access Denied</h1>
            <p className='text-gray-600 mb-4'>You don&apos;t have permission to access this page.</p>
            <a
              href={options.redirectTo || '/'}
              className='px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 inline-block'
            >
              Go to Home
            </a>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPermissionComponent;
}

/**
 * Convenience HOCs for common permission patterns
 */
export const withAdminPermission = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> =>
  withPermission(WrappedComponent, {
    roles: [UserRole.ADMIN],
    statuses: [UserStatus.ACTIVE]
  });

export const withITSupportPermission = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> =>
  withPermission(WrappedComponent, {
    roles: [UserRole.IT_SUPPORT],
    statuses: [UserStatus.ACTIVE, UserStatus.INACTIVE]
  });

export const withUserPermission = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> =>
  withPermission(WrappedComponent, {
    roles: [UserRole.USER],
    statuses: [UserStatus.ACTIVE, UserStatus.INACTIVE]
  });

export const withActiveUserPermission = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> =>
  withPermission(WrappedComponent, {
    statuses: [UserStatus.ACTIVE]
  });

export const withEmailVerifiedPermission = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> =>
  withPermission(WrappedComponent, {
    requireEmailVerified: true
  });
