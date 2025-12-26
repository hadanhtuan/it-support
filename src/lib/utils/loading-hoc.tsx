'use client';

import React from 'react';
import { useLoadingUtils } from '@/lib/hooks/use-loading';

interface WithLoadingOptions {
  message?: string;
  autoHide?: boolean;
}

/**
 * Higher-order component that automatically handles loading states
 * @param WrappedComponent - The component to wrap
 * @param options - Loading options
 * @returns Enhanced component with loading capabilities
 *
 * @example
 * ```tsx
 * const MyComponentWithLoading = withLoading(MyComponent, {
 *   message: 'Loading component...'
 * });
 * ```
 */
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithLoadingOptions = {}
) {
  const WithLoadingComponent = (props: P) => {
    const { showLoading, hideLoading } = useLoadingUtils();

    React.useEffect(() => {
      if (options.message) {
        showLoading(options.message);
      }

      return () => {
        if (options.autoHide !== false) {
          hideLoading();
        }
      };
    }, [showLoading, hideLoading]);

    return <WrappedComponent {...props} />;
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithLoadingComponent;
}

/**
 * Component wrapper for conditional loading display
 * @param children - Child components
 * @param when - Condition to show loading
 * @param message - Loading message
 *
 * @example
 * ```tsx
 * <LoadingWrapper when={isApiLoading} message="Fetching data...">
 *   <MyComponent />
 * </LoadingWrapper>
 * ```
 */
interface LoadingWrapperProps {
  children: React.ReactNode;
  when: boolean;
  message?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  when,
  message = 'Loading...'
}) => {
  const { showLoading, hideLoading } = useLoadingUtils();

  React.useEffect(() => {
    if (when) {
      showLoading(message);
    } else {
      hideLoading();
    }

    return () => {
      hideLoading();
    };
  }, [when, message, showLoading, hideLoading]);

  return <>{children}</>;
};
