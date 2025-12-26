'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck } from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead
} from '@/hooks/use-notification-queries';
import { Notification, NotificationType } from '@/lib/core/models/notification.model';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface NotificationListProps {
  userId: string;
  limit?: number;
}

/**
 * Notification list component
 * Displays list of notifications with mark as read functionality
 */
export function NotificationList({ userId, limit = 20 }: NotificationListProps) {
  const { data: notifications = [], isLoading } = useNotificationsQuery(userId, limit);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate to the related room/message if applicable
    if (notification.roomId) {
      // TODO: Implement navigation to chat room
      // This would depend on your routing structure
      // e.g., router.push(`/chat/${notification.roomId}`);
      console.log('Navigate to room:', notification.roomId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync(userId);
  };

  if (isLoading) {
    return <div className='p-4 text-center text-sm text-muted-foreground'>Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className='p-8 text-center'>
        <Bell className='mx-auto h-12 w-12 text-muted-foreground/50 mb-2' />
        <p className='text-sm text-muted-foreground'>No notifications yet</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <h3 className='font-semibold'>Notifications</h3>
        {unreadCount > 0 && (
          <Button variant='ghost' size='sm' onClick={handleMarkAllAsRead} className='text-xs'>
            <CheckCheck className='h-3 w-3 mr-1' />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className='max-h-[400px] overflow-y-auto'>
        <div className='divide-y'>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const formattedTime = notification.createdAt
    ? formatDistanceToNow(notification.createdAt.toDate?.() || new Date(notification.createdAt), {
        addSuffix: true
      })
    : '';

  return (
    <button
      onClick={onClick}
      className={cn('w-full p-4 text-left hover:bg-accent transition-colors', !notification.isRead && 'bg-accent/50')}
    >
      <div className='flex gap-3'>
        {/* Avatar */}
        {notification.senderAvatarUrl || notification.senderName ? (
          <Avatar className='h-10 w-10'>
            <AvatarImage src={notification.senderAvatarUrl} />
            <AvatarFallback>{notification.senderName ? getInitials(notification.senderName) : '?'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
            <Bell className='h-5 w-5 text-primary' />
          </div>
        )}

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <p className='text-sm font-medium line-clamp-1'>{notification.title}</p>
            {!notification.isRead && <div className='h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1' />}
          </div>
          <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>{notification.message}</p>
          <p className='text-xs text-muted-foreground mt-1'>{formattedTime}</p>
        </div>
      </div>
    </button>
  );
}
