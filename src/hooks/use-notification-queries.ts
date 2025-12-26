'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/lib/core/models/notification.model';

// Query keys
export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (userId: string) => [...notificationQueryKeys.all, 'list', userId] as const,
  unreadCount: (userId: string) => [...notificationQueryKeys.all, 'unreadCount', userId] as const
};

/**
 * Hook to fetch notifications for a user
 */
export const useNotificationsQuery = (userId: string | undefined, limit: number = 20) =>
  useQuery({
    queryKey: notificationQueryKeys.list(userId || ''),
    queryFn: () => notificationService.getNotifications(userId!, limit),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  });

/**
 * Hook to fetch unread notification count
 */
export const useUnreadNotificationCountQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: notificationQueryKeys.unreadCount(userId || ''),
    queryFn: () => notificationService.getUnreadCount(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000 // Refetch every minute for badge updates
  });

/**
 * Hook to mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Invalidate notification queries to refresh the list and count
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    }
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationService.markAllAsRead(userId),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    }
  });
};
