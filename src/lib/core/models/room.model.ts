export enum RoomType {
  PRIVATE = 'private', // One-to-one chat
  TICKET = 'ticket', // Ticket support chat
  GROUP = 'group' // Custom group chat
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string;
  content: string;
  timestamp: Date | string;
  readBy: string[]; // Array of user IDs who have read the message
  attachments?: {
    id: string;
    type: 'image' | 'document' | 'link';
    url: string;
    name?: string;
    size?: number;
  }[];
  isSystemMessage?: boolean;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  participants: {
    userId: string;
    name: string;
    profilePic?: string;
    role: 'user' | 'it_support' | 'admin';
    isActive: boolean;
    lastSeen?: Date | string;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date | string;
    isRead: boolean;
  };
  ticketId?: string; // For ticket-related rooms
  isArchived?: boolean;
  pinnedMessages?: string[]; // Array of message IDs
}
