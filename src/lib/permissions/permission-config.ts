import { UserRole, UserStatus } from '@/lib/core/models';

export interface RoutePermission {
  path: string;
  allowedRoles?: UserRole[];
  allowedStatuses?: UserStatus[];
  requireEmailVerified?: boolean;
  isPublic?: boolean;
  redirectTo?: string; // Where to redirect if access denied
  allowUnauthenticated?: boolean; // For public routes that don't require login
}

export interface PermissionRule {
  roles?: UserRole[];
  statuses?: UserStatus[];
  requireEmailVerified?: boolean;
  custom?: (user: any) => boolean; // For complex permission logic
}

// Define all route permissions
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Public routes (no authentication required)
  {
    path: '/',
    isPublic: true,
    allowUnauthenticated: true,
    allowedRoles: [UserRole.USER, UserRole.IT_SUPPORT] // Exclude admin from home page
  },
  {
    path: '/auth/login',
    isPublic: true,
    allowUnauthenticated: true
  },
  {
    path: '/auth/register',
    isPublic: true,
    allowUnauthenticated: true
  },
  {
    path: '/auth/forgot-password',
    isPublic: true,
    allowUnauthenticated: true
  },

  // Public routes (visible to all authenticated users except admins)
  {
    path: '/tickets',
    isPublic: true,
    allowedRoles: [UserRole.USER, UserRole.IT_SUPPORT], // Exclude admin
    allowedStatuses: [UserStatus.ACTIVE, UserStatus.INACTIVE],
    requireEmailVerified: true
  },
  {
    path: '/profile',
    isPublic: true,
    allowedRoles: [UserRole.USER, UserRole.IT_SUPPORT], // Exclude admin
    allowedStatuses: [UserStatus.ACTIVE, UserStatus.INACTIVE],
    requireEmailVerified: true
  },
  {
    path: '/user/profile',
    isPublic: true
  },
  // IT Support routes
  {
    path: '/it-support/assigned-tickets',
    allowedRoles: [UserRole.IT_SUPPORT],
    allowedStatuses: [UserStatus.ACTIVE],
    requireEmailVerified: true,
    redirectTo: '/'
  },
  {
    path: '/it-support/manage-tickets',
    allowedRoles: [UserRole.IT_SUPPORT],
    allowedStatuses: [UserStatus.ACTIVE],
    requireEmailVerified: true,
    redirectTo: '/'
  },

  // User routes
  {
    path: '/user/create-ticket',
    allowedRoles: [UserRole.USER],
    allowedStatuses: [UserStatus.ACTIVE],
    requireEmailVerified: true,
    redirectTo: '/'
  },
  {
    path: '/user/update-profile',
    allowedRoles: [UserRole.USER, UserRole.IT_SUPPORT],
    allowedStatuses: [UserStatus.ACTIVE, UserStatus.INACTIVE],
    redirectTo: '/'
  },
  {
    path: '/user/my-tickets',
    allowedRoles: [UserRole.USER],
    allowedStatuses: [UserStatus.ACTIVE, UserStatus.INACTIVE],
    requireEmailVerified: true,
    redirectTo: '/'
  },
  {
    path: '/user/edit-ticket',
    allowedRoles: [UserRole.USER],
    allowedStatuses: [UserStatus.ACTIVE],
    requireEmailVerified: true,
    redirectTo: '/'
  },

  // Admin routes
  {
    path: '/admin',
    allowedRoles: [UserRole.ADMIN],
    allowedStatuses: [UserStatus.ACTIVE],
    redirectTo: '/'
  },
  {
    path: '/admin/manage-users',
    allowedRoles: [UserRole.ADMIN],
    allowedStatuses: [UserStatus.ACTIVE],
    redirectTo: '/admin'
  },
  {
    path: '/admin/configuration',
    allowedRoles: [UserRole.ADMIN],
    allowedStatuses: [UserStatus.ACTIVE],
    redirectTo: '/admin'
  },
  {
    path: '/admin/manage-it-support',
    allowedRoles: [UserRole.ADMIN],
    allowedStatuses: [UserStatus.ACTIVE],
    redirectTo: '/admin'
  },
  {
    path: '/admin/manage-tickets',
    allowedRoles: [UserRole.ADMIN],
    allowedStatuses: [UserStatus.ACTIVE],
    redirectTo: '/admin'
  }
];

// Default redirects based on user role
export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.IT_SUPPORT]: '/it-support/update-profile',
  [UserRole.USER]: '/user/update-profile'
};

// Auth page redirects (where to go after login)
export const AUTH_REDIRECTS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.IT_SUPPORT]: '/',
  [UserRole.USER]: '/'
};
