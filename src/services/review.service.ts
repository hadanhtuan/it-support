import { Collection, Review, ReviewType, Ticket } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { Timestamp } from 'firebase/firestore';

export interface IReviewService {
  createReview: (payload: Partial<Review>, targetData?: Ticket) => Promise<string>;
  getReviewsByTarget: (targetId: string, type: ReviewType) => Promise<Review[]>;
  updateReview: (id: string, payload: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  canUserReview: (userId: string, targetId: string, type: ReviewType, targetData?: Ticket) => Promise<boolean>;
  canUserReviewWithTarget: (userId: string, targetData: Ticket, type: ReviewType) => boolean;
  getAverageRating: (receiverId: string, type: ReviewType) => Promise<{ averageRating: number; totalReviews: number }>;
  markHelpful: (reviewId: string) => Promise<void>;
  addReply: (reviewId: string, reply: { userId: string; userName: string; comment: string }) => Promise<void>;
}

// Helper function to update receiver's average rating
const updateReceiverRating = async (receiverId: string, type: ReviewType, service: IReviewService): Promise<void> => {
  try {
    const { averageRating, totalReviews } = await service.getAverageRating(receiverId, type);

    // Update the user's rating field
    await FirestoreClientHelper.updateDocument(Collection.USERS, receiverId, {
      rating: averageRating,
      reviewCount: totalReviews,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating receiver rating:', error);
  }
};

export const reviewService = ((): IReviewService => {
  const customReviewService: IReviewService = {
    createReview: async (payload: Partial<Review>, targetData?: Ticket): Promise<string> => {
      const { reviewerId, targetId, type } = payload;
      if (!reviewerId || !targetId || !type) {
        throw new Error('Reviewer ID, target ID, and type are required to create a review');
      }

      // eslint-disable-next-line no-console
      console.log('🔄 [ReviewService] Starting review creation process:', {
        reviewerId,
        targetId,
        type,
        hasTargetData: !!targetData
      });

      // Verify user can review this target (use provided target data if available)
      const canReview = targetData
        ? customReviewService.canUserReviewWithTarget(reviewerId, targetData, type)
        : await customReviewService.canUserReview(reviewerId, targetId, type);

      // eslint-disable-next-line no-console
      console.log('🔐 [ReviewService] Permission check result:', canReview);

      if (!canReview) {
        const errorMessage = type === ReviewType.CLASS
          ? 'Only users involved with the ticket can review'
          : 'Only assigned IT support or ticket creators can review';
        throw new Error(`User is not authorized to review this item: ${errorMessage}`);
      }

      // Validate rating is within bounds
      if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      // eslint-disable-next-line no-console
      console.log('📝 [ReviewService] Creating review document with payload:', payload);

      const reviewId = await FirestoreClientHelper.createDocument<Partial<Review>>(Collection.REVIEWS, {
        ...payload,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        helpful: 0,
        isVerifiedEnrollment: true
      });

      // eslint-disable-next-line no-console
      console.log('✅ [ReviewService] Review created successfully:', { reviewId, targetId, type });

      // Update the receiver's average rating
      if (payload.receiverId) {
        await updateReceiverRating(payload.receiverId, type!, customReviewService);
      }

      return reviewId;
    },

    getReviewsByTarget: async (targetId: string, type: ReviewType): Promise<Review[]> => {
      try {
        // eslint-disable-next-line no-console
        const result = await FirestoreClientHelper.getMany<Review>(Collection.REVIEWS, {
          conditions: [
            { field: 'targetId', op: '==', value: targetId },
            { field: 'type', op: '==', value: type }
          ],
          orderBy: [{ field: 'createdAt', op: 'desc' }],
          limitCount: 50
        });
        // eslint-disable-next-line no-console
        console.log('📊 [ReviewService] Reviews fetched:', {
          count: result.documents.length,
          reviews: result.documents.map((r) => ({
            id: r.id,
            reviewerId: r.reviewerId,
            rating: r.rating,
            comment: r.comment?.substring(0, 50)
          }))
        });
        return result.documents;
      } catch (error) {
        console.error('❌ [ReviewService] Error fetching reviews:', error);
        return [];
      }
    },

    updateReview: async (id: string, payload: Partial<Review>): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.REVIEWS, id, {
        ...payload,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Update receiver's rating if rating changed
      if (payload.rating && payload.receiverId && payload.type) {
        await updateReceiverRating(payload.receiverId, payload.type, customReviewService);
      }
    },

    deleteReview: async (id: string): Promise<void> => {
      // Get review data before deleting to update receiver's rating
      const review = await FirestoreClientHelper.getItemById<Review>(Collection.REVIEWS, id);

      await FirestoreClientHelper.deleteDocument(Collection.REVIEWS, id);

      // Update receiver's rating
      if (review?.receiverId && review.type) {
        await updateReceiverRating(review.receiverId, review.type, customReviewService);
      }
    },

    canUserReview: async (
      userId: string,
      targetId: string,
      type: ReviewType,
      targetData?: Ticket
    ): Promise<boolean> => {
      try {
        // Use provided target data if available, otherwise fetch it
        const target = targetData || (await FirestoreClientHelper.getItemById<Ticket>(Collection.TICKETS, targetId));
        if (!target) {
          return false;
        }

        return customReviewService.canUserReviewWithTarget(userId, target, type);
      } catch (error) {
        console.error('Error checking review permission:', error);
        return false;
      }
    },

    canUserReviewWithTarget: (userId: string, targetData: Ticket, type: ReviewType): boolean => {
      if (!userId || !targetData || !type) {
        console.warn('Missing required parameters for canUserReviewWithTarget:', {
          userId,
          targetData: !!targetData,
          type
        });
        return false;
      }

      if (type === ReviewType.CLASS) {
        // For IT support: users can review resolved tickets they were involved with
        const isInvolved = targetData.assignedToId === userId || targetData.creatorId === userId;
        return isInvolved;
      }

      if (type === ReviewType.TICKET) {
        // For tickets: only the assigned IT support or ticket creator can leave reviews
        const isAssignedITSupport = targetData.assignedToId === userId;
        const isTicketCreator = targetData.creatorId === userId;
        return isAssignedITSupport || isTicketCreator;
      }

      console.warn('Unknown review type:', type);
      return false;
    },

    getAverageRating: async (
      receiverId: string,
      type: ReviewType
    ): Promise<{ averageRating: number; totalReviews: number }> => {
      try {
        const result = await FirestoreClientHelper.getMany<Review>(Collection.REVIEWS, {
          conditions: [
            { field: 'receiverId', op: '==', value: receiverId },
            { field: 'type', op: '==', value: type }
          ]
        });

        const reviews = result.documents;
        if (reviews.length === 0) {
          return { averageRating: 0, totalReviews: 0 };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        return { averageRating: Math.round(averageRating * 10) / 10, totalReviews: reviews.length };
      } catch (error) {
        console.error('Error calculating average rating:', error);
        return { averageRating: 0, totalReviews: 0 };
      }
    },

    markHelpful: async (reviewId: string): Promise<void> => {
      const review = await FirestoreClientHelper.getItemById<Review>(Collection.REVIEWS, reviewId);
      if (review) {
        await FirestoreClientHelper.updateDocument(Collection.REVIEWS, reviewId, {
          helpful: (review.helpful || 0) + 1
        });
      }
    },

    addReply: async (reviewId: string, reply: { userId: string; userName: string; comment: string }): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.REVIEWS, reviewId, {
        reply: {
          ...reply,
          createdAt: Timestamp.fromDate(new Date())
        },
        updatedAt: Timestamp.fromDate(new Date())
      });
    }
  };

  return customReviewService;
})();
