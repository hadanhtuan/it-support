export enum ReviewType {
  CLASS = 'class', // Legacy - could be repurposed for ticket categories
  TICKET = 'ticket'
}

export interface Review {
  id: string;
  type: ReviewType; // Whether this is a review for a ticket or other category
  targetId: string; // ID of the ticket being reviewed
  targetTitle?: string; // Title of the ticket
  reviewerId: string; // ID of the person writing the review (user or IT support)
  reviewerName?: string;
  reviewerProfilePic?: string;
  receiverId: string; // ID of the person being reviewed (IT support or user)
  receiverName?: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: any;
  updatedAt?: any;
  helpful?: number; // Number of users who found this review helpful
  reply?: {
    userId: string;
    userName: string;
    comment: string;
    createdAt: any;
  };
  isVerifiedEnrollment: boolean; // Whether the reviewer actually participated in the ticket resolution
}
