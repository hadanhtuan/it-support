'use client';

import * as React from 'react';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { ToastIcon } from '@/components/ui/toast-with-icon';
import { useToast } from '@/lib/hooks/use-toast';

export function Toaster(): React.JSX.Element {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          <div className='flex items-start space-x-3'>
            {variant && variant !== 'default' && (
              <div className='flex-shrink-0 mt-0.5'>
                <ToastIcon variant={variant} />
              </div>
            )}
            <div className='grid gap-1 flex-1'>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
