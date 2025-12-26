export enum NotificationType {
  MENTION = 'MENTION',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED'
}

export interface Notification {
  id: string;
  userId: string; // The user who should receive this notification
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  roomId?: string; // Related room ID if applicable
  messageId?: string; // Related message ID if applicable
  senderId?: string; // User who triggered the notification
  senderName?: string;
  senderAvatarUrl?: string;
  metadata?: Record<string, any>; // Additional data
  createdAt: any; // Firestore Timestamp
  readAt?: any; // Firestore Timestamp when marked as read
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  roomId?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  metadata?: Record<string, any>;
}
