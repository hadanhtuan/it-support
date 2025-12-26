import { User, UserRole, UserStatus } from '@/lib/core/models';
import { RoutePermission, PermissionRule, ROUTE_PERMISSIONS } from './permission-config';

export class PermissionChecker {
  /**
   * Check if a path matches a route pattern
   */
  private static isPathMatch(currentPath: string, routePath: string): boolean {
    // Exact match
    if (routePath === currentPath) {
      return true;
    }

    // Wildcard match (e.g., '/admin' matches '/admin/manage-users')
    if (currentPath.startsWith(`${routePath}/`)) {
      return true;
    }

    return false;
  }

  /**
   * Find the most specific route permission for a given path
   */
  private static findRoutePermission(path: string): RoutePermission | null {
    // Sort by specificity (longer paths first)
    const sortedPermissions = [...ROUTE_PERMISSIONS].sort((a, b) => b.path.length - a.path.length);

    for (const permission of sortedPermissions) {
      if (this.isPathMatch(path, permission.path)) {
        return permission;
      }
    }

    return null;
  }

  /**
   * Check if user has permission to access a specific route
   */
  public static hasRoutePermission(
    path: string,
    user: User | null,
    isEmailVerified = false
  ): {
    allowed: boolean;
    redirectTo?: string;
    reason?: string;
  } {
    const routePermission = this.findRoutePermission(path);

    // If no specific permission found, deny access by default
    if (!routePermission) {
      return {
        allowed: false,
        redirectTo: '/',
        reason: 'Route not configured'
      };
    }

    // Handle unauthenticated users
    if (!user) {
      if (routePermission.allowUnauthenticated) {
        return { allowed: true };
      }
      return {
        allowed: false,
        redirectTo: '/auth/login',
        reason: 'Authentication required'
      };
    }

    // Special handling for admin users - they can only access admin pages
    if (user.role === UserRole.ADMIN) {
      const isAdminPath = path === '/admin' || path.startsWith('/admin/');
      if (!isAdminPath) {
        return {
          allowed: false,
          redirectTo: '/admin',
          reason: 'Admin users can only access admin pages'
        };
      }
      // For admin paths, continue with normal permission checking
    }

    // Handle public routes
    if (routePermission.isPublic) {
      // Admin users should not access public routes (except auth pages)
      if (user.role === UserRole.ADMIN && !routePermission.allowUnauthenticated) {
        return {
          allowed: false,
          redirectTo: '/admin',
          reason: 'Admin users cannot access public routes'
        };
      }

      // Check role restrictions for public routes
      if (routePermission.allowedRoles && !routePermission.allowedRoles.includes(user.role)) {
        // If admin user tries to access public route, redirect to admin
        if (user.role === UserRole.ADMIN) {
          return {
            allowed: false,
            redirectTo: '/admin',
            reason: 'Admin users cannot access this route'
          };
        }
        return {
          allowed: false,
          redirectTo: routePermission.redirectTo || '/',
          reason: 'Role not authorized for this public route'
        };
      }

      // Still need to check status and email verification for public routes
      if (routePermission.allowedStatuses && !routePermission.allowedStatuses.includes(user.status)) {
        return {
          allowed: false,
          redirectTo: routePermission.redirectTo || '/',
          reason: 'User status not allowed'
        };
      }

      if (routePermission.requireEmailVerified && !isEmailVerified) {
        return {
          allowed: false,
          redirectTo: routePermission.redirectTo || '/',
          reason: 'Email verification required'
        };
      }

      return { allowed: true };
    }

    // Check role permissions
    if (routePermission.allowedRoles && !routePermission.allowedRoles.includes(user.role)) {
      return {
        allowed: false,
        redirectTo: routePermission.redirectTo || '/',
        reason: 'Role not authorized'
      };
    }

    // Check status permissions
    if (routePermission.allowedStatuses && !routePermission.allowedStatuses.includes(user.status)) {
      return {
        allowed: false,
        redirectTo: routePermission.redirectTo || '/',
        reason: 'User status not allowed'
      };
    }

    // Check email verification
    if (routePermission.requireEmailVerified && !isEmailVerified) {
      return {
        allowed: false,
        redirectTo: routePermission.redirectTo || '/',
        reason: 'Email verification required'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user has specific permission based on rules
   */
  public static hasPermission(user: User | null, rule: PermissionRule, isEmailVerified = false): boolean {
    if (!user) return false;

    // Check roles
    if (rule.roles && !rule.roles.includes(user.role)) {
      return false;
    }

    // Check statuses
    if (rule.statuses && !rule.statuses.includes(user.status)) {
      return false;
    }

    // Check email verification
    if (rule.requireEmailVerified && !isEmailVerified) {
      return false;
    }

    // Check custom rule
    if (rule.custom && !rule.custom(user)) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can access admin features
   */
  public static isAdmin(user: User | null): boolean {
    return user?.role === UserRole.ADMIN && user?.status === UserStatus.ACTIVE;
  }

  /**
   * Check if user can access IT support features
   */
  public static isITSupport(user: User | null): boolean {
    return user?.role === UserRole.IT_SUPPORT && [UserStatus.ACTIVE, UserStatus.INACTIVE].includes(user.status);
  }

  /**
   * Check if user can access regular user features
   */
  public static isRegularUser(user: User | null): boolean {
    return user?.role === UserRole.USER && [UserStatus.ACTIVE, UserStatus.INACTIVE].includes(user.status);
  }

  /**
   * Check if user is active (can perform actions)
   */
  public static isActiveUser(user: User | null): boolean {
    return user?.status === UserStatus.ACTIVE;
  }

  /**
   * Get appropriate redirect path for user after login
   */
  public static getLoginRedirect(user: User): string {
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.IT_SUPPORT:
        return '/';
      case UserRole.USER:
        return '/';
      default:
        return '/';
    }
  }

  /**
   * Check if user should be redirected from auth pages
   */
  public static shouldRedirectFromAuth(user: User | null, currentPath: string): string | null {
    if (!user) return null;

    const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];

    if (authPaths.some((path) => currentPath.startsWith(path))) {
      return this.getLoginRedirect(user);
    }

    return null;
  }
}
