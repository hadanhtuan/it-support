'use client';

import React from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { usePathname } from 'next/navigation';
import { UserRole, UserStatus, User } from '@/lib/core/models';
import { PermissionChecker } from './permission-checker';
import { PermissionRule } from './permission-config';

interface RoutePermissionResult {
  hasPermission: boolean;
  redirectTo?: string;
  reason?: string;
  loading: boolean;
}

interface PermissionResult {
  hasPermission: boolean;
  loading: boolean;
  user: User | null;
}

interface UserRoleResult {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isITSupport: boolean;
  isRegularUser: boolean;
  isActive: boolean;
  role?: UserRole;
  status?: UserStatus;
}

interface ConditionalRenderFunctions {
  renderForRole: (allowedRoles: UserRole[], children: React.ReactNode) => React.ReactNode | null;
  renderForStatus: (allowedStatuses: UserStatus[], children: React.ReactNode) => React.ReactNode | null;
  renderForPermission: (rule: PermissionRule, children: React.ReactNode) => React.ReactNode | null;
  renderForAdmin: (children: React.ReactNode) => React.ReactNode | null;
  renderForITSupport: (children: React.ReactNode) => React.ReactNode | null;
  renderForRegularUser: (children: React.ReactNode) => React.ReactNode | null;
  renderForActive: (children: React.ReactNode) => React.ReactNode | null;
  renderForEmailVerified: (children: React.ReactNode) => React.ReactNode | null;
}

/**
 * Hook to check if current user has permission for the current route
 */
export const useRoutePermission = (): RoutePermissionResult => {
  const { userState, loading } = useAuth();
  const pathname = usePathname();

  const user = userState?.userInfo ?? null;
  const isEmailVerified = userState?.identity?.emailVerified ?? false;

  const permissionResult = PermissionChecker.hasRoutePermission(pathname, user, isEmailVerified);

  return {
    hasPermission: permissionResult.allowed,
    redirectTo: permissionResult.redirectTo,
    reason: permissionResult.reason,
    loading
  };
};

/**
 * Hook to check if current user has specific permissions
 */
export const usePermission = (rule: PermissionRule): PermissionResult => {
  const { userState, loading } = useAuth();

  const user = userState?.userInfo ?? null;
  const isEmailVerified = userState?.identity?.emailVerified ?? false;

  const hasPermission = PermissionChecker.hasPermission(user, rule, isEmailVerified);

  return {
    hasPermission,
    loading,
    user
  };
};

/**
 * Hook to check user roles
 */
export const useUserRole = (): UserRoleResult => {
  const { userState, loading } = useAuth();

  const user = userState?.userInfo ?? null;

  return {
    user,
    loading,
    isAdmin: PermissionChecker.isAdmin(user),
    isITSupport: PermissionChecker.isITSupport(user),
    isRegularUser: PermissionChecker.isRegularUser(user),
    isActive: PermissionChecker.isActiveUser(user),
    role: user?.role,
    status: user?.status
  };
};

/**
 * Hook for conditional rendering based on permissions
 */
export const useConditionalRender = (): ConditionalRenderFunctions => {
  const { userState } = useAuth();
  const user = userState?.userInfo ?? null;
  const isEmailVerified = userState?.identity?.emailVerified ?? false;

  return {
    renderForRole: (allowedRoles: UserRole[], children: React.ReactNode): React.ReactNode | null => {
      if (!user || !allowedRoles.includes(user.role)) return null;
      return children;
    },

    renderForStatus: (allowedStatuses: UserStatus[], children: React.ReactNode): React.ReactNode | null => {
      if (!user || !allowedStatuses.includes(user.status)) return null;
      return children;
    },

    renderForPermission: (rule: PermissionRule, children: React.ReactNode): React.ReactNode | null => {
      if (!PermissionChecker.hasPermission(user, rule, isEmailVerified)) return null;
      return children;
    },

    renderForAdmin: (children: React.ReactNode): React.ReactNode | null => {
      if (!PermissionChecker.isAdmin(user)) return null;
      return children;
    },

    renderForITSupport: (children: React.ReactNode): React.ReactNode | null => {
      if (!PermissionChecker.isITSupport(user)) return null;
      return children;
    },

    renderForRegularUser: (children: React.ReactNode): React.ReactNode | null => {
      if (!PermissionChecker.isRegularUser(user)) return null;
      return children;
    },

    renderForActive: (children: React.ReactNode): React.ReactNode | null => {
      if (!PermissionChecker.isActiveUser(user)) return null;
      return children;
    },

    renderForEmailVerified: (children: React.ReactNode): React.ReactNode | null => {
      if (!isEmailVerified) return null;
      return children;
    }
  };
};
