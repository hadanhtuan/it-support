import { useLoading } from '@/lib/context/loading.context';

export interface LoadingUtils {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
  isLoading: boolean;
}

/**
 * Custom hook to access loading utilities from anywhere in the app
 * @returns Loading utilities object with show/hide functions
 *
 * @example
 * ```tsx
 * const { showLoading, hideLoading } = useLoadingUtils();
 *
 * const handleSubmit = async () => {
 *   showLoading('Saving data...');
 *   try {
 *     await saveData();
 *   } finally {
 *     hideLoading();
 *   }
 * };
 * ```
 */
export const useLoadingUtils = (): LoadingUtils => {
  const { isLoading, showLoading, hideLoading, setLoadingMessage } = useLoading();

  return {
    showLoading,
    hideLoading,
    setLoadingMessage,
    isLoading
  };
};

/**
 * Promise wrapper that automatically shows/hides loading state
 * @param promise - The promise to wrap
 * @param message - Optional loading message
 * @returns The promise result
 *
 * @example
 * ```tsx
 * const { withLoading } = useLoadingUtils();
 *
 * const data = await withLoading(
 *   fetchUserData(userId),
 *   'Fetching user data...'
 * );
 * ```
 */
export const useLoadingWrapper = () => {
  const { showLoading, hideLoading } = useLoadingUtils();

  const withLoading = async <T>(promise: Promise<T>, message?: string): Promise<T> => {
    showLoading(message);
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  };

  return { withLoading };
};
