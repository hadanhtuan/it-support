import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastVariant } from '@/lib/hooks/use-toast';

interface ToastIconProps {
  variant?: ToastVariant;
  className?: string;
}

export const ToastIcon: React.FC<ToastIconProps> = ({ variant = 'default', className = 'h-5 w-5' }) => {
  const iconMap = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    destructive: AlertCircle,
    default: Info
  };

  const Icon = iconMap[variant];

  const colorMap = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    destructive: 'text-red-600',
    default: 'text-blue-600'
  };

  return <Icon className={`${className} ${colorMap[variant]}`} />;
};

// Enhanced Toast components with icons
export const ToastWithIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: ToastVariant;
    title?: React.ReactNode;
    description?: React.ReactNode;
  }
>(({ variant = 'default', title, description, children, className, ...props }, ref) => (
  <div ref={ref} className={`flex items-start space-x-3 ${className}`} {...props}>
    <div className='flex-shrink-0 mt-0.5'>
      <ToastIcon variant={variant} />
    </div>
    <div className='flex-1 min-w-0'>
      {title && <div className='text-sm font-semibold'>{title}</div>}
      {description && <div className='text-sm opacity-90 mt-1'>{description}</div>}
      {children}
    </div>
  </div>
));

ToastWithIcon.displayName = 'ToastWithIcon';
