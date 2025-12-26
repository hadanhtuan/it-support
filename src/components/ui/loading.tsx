import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="relative">
      {/* Outer ring */}
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700',
          sizeClasses[size],
          className
        )}
      />
      {/* Inner spinning element */}
      <div
        className={cn(
          'absolute top-0 left-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary',
          sizeClasses[size],
          'animate-[spin_1s_linear_infinite]'
        )}
      />
      {/* Center dot */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary',
          {
            'w-1 h-1': size === 'sm',
            'w-1.5 h-1.5': size === 'md',
            'w-2 h-2': size === 'lg'
          }
        )}
      />
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  backdrop?: 'light' | 'dark' | 'blur';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  backdrop = 'dark',
  size = 'lg'
}) => {
  if (!isVisible) return null;

  const backdropClasses = {
    light: 'bg-white/90 backdrop-blur-sm',
    dark: 'bg-black/60 backdrop-blur-sm',
    blur: 'bg-white/90 backdrop-blur-md'
  };

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center transition-all duration-300',
        'z-[9999] animate-in fade-in-0',
        backdropClasses[backdrop]
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className={cn(
        'flex flex-col items-center space-y-6 p-8 rounded-2xl',
        'bg-background/95 backdrop-blur-sm shadow-2xl border border-border/50',
        'animate-in slide-in-from-bottom-4 zoom-in-95 duration-300',
        'max-w-sm mx-4'
      )}>
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <div className="relative w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
        </div>

        {/* Loading animation container */}
        <div className="relative">
          <LoadingSpinner size={size} className="text-primary" />
          {/* Pulse effect */}
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-20 bg-primary',
            {
              'scale-150': size === 'sm',
              'scale-125': size === 'md',
              'scale-110': size === 'lg'
            }
          )} />
        </div>

        {/* Content section */}
        <div className="text-center space-y-2">
          {message && (
            <p className="text-base font-medium text-foreground leading-relaxed">
              {message}
            </p>
          )}
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};