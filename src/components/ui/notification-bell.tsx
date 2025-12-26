'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsQuery, useUnreadNotificationCountQuery } from '@/hooks/use-notification-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationList } from './notification-list';

interface NotificationBellProps {
  userId: string;
}

/**
 * Notification bell component with unread count badge
 * Shows dropdown with notification list when clicked
 */
export function NotificationBell({ userId }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className='sr-only'>Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80 p-0'>
        <NotificationList userId={userId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
