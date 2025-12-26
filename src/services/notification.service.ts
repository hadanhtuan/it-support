import { FirebaseCollection } from '@/lib/constant/firebase';
import { CreateNotificationDto, Notification, NotificationType } from '@/lib/core/models/notification.model';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit as firestoreLimit,
  getDocs
} from 'firebase/firestore';
import { firebaseDB } from '@/lib/firebase/client/client-config';

export interface INotificationService {
  createNotification: (data: CreateNotificationDto) => Promise<string>;
  getNotifications: (userId: string, limit?: number) => Promise<Notification[]>;
  getUnreadCount: (userId: string) => Promise<number>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const notificationService = ((): INotificationService => {
  const customNotificationService: INotificationService = {
    /**
     * Create a new notification
     */
    createNotification: async (data: CreateNotificationDto): Promise<string> => {
      try {
        const notificationRef = collection(firebaseDB, FirebaseCollection.notifications);
        const notificationData = {
          ...data,
          isRead: false,
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(notificationRef, notificationData);
        return docRef.id;
      } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
    },

    /**
     * Get notifications for a user with pagination
     */
    getNotifications: async (userId: string, limit: number = 20): Promise<Notification[]> => {
      try {
        const notificationRef = collection(firebaseDB, FirebaseCollection.notifications);
        const q = query(
          notificationRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          firestoreLimit(limit)
        );

        const querySnapshot = await getDocs(q);
        const notifications: Notification[] = [];

        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          } as Notification);
        });

        return notifications;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },

    /**
     * Get count of unread notifications
     */
    getUnreadCount: async (userId: string): Promise<number> => {
      try {
        const notificationRef = collection(firebaseDB, FirebaseCollection.notifications);
        const q = query(notificationRef, where('userId', '==', userId), where('isRead', '==', false));

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
      try {
        const notificationRef = doc(firebaseDB, FirebaseCollection.notifications, notificationId);
        await updateDoc(notificationRef, {
          isRead: true,
          readAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },

    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead: async (userId: string): Promise<void> => {
      try {
        const notificationRef = collection(firebaseDB, FirebaseCollection.notifications);
        const q = query(notificationRef, where('userId', '==', userId), where('isRead', '==', false));

        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map((document) =>
          updateDoc(doc(firebaseDB, FirebaseCollection.notifications, document.id), {
            isRead: true,
            readAt: serverTimestamp()
          })
        );

        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    }
  };

  return customNotificationService;
})();
