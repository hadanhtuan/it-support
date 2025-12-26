import { Collection, ITSupport, UserRole } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { apiService } from './api.service';
import { BulkUpdateStatusRequest } from './models/requests/user';

export interface IUserService {
  bulkUpdateStatus: (payload: BulkUpdateStatusRequest) => Promise<void>;
  getHighestRatedITSupport: (limit?: number) => Promise<ITSupport[]>;
  getAllITSupport: () => Promise<ITSupport[]>;
  getUserByUid: (uid: string) => Promise<any | null>;
}

export const userService = ((): IUserService => {
  const customUserService: IUserService = {
    bulkUpdateStatus: async (payload: BulkUpdateStatusRequest): Promise<void> => {
      await apiService.post<void>('/api/user/bulk-update-status', payload);
    },

    getHighestRatedITSupport: async (limit: number = 3): Promise<ITSupport[]> => {
      try {
        const result = await FirestoreClientHelper.getMany<ITSupport>(Collection.USERS, {
          conditions: [{ field: 'role', op: '==', value: UserRole.IT_SUPPORT }],
          orderBy: [{ field: 'rating', op: 'desc' }],
          limitCount: limit
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching highest rated IT support:', error);
        return [];
      }
    },

    getAllITSupport: async (): Promise<ITSupport[]> => {
      try {
        const result = await FirestoreClientHelper.getMany<ITSupport>(Collection.USERS, {
          conditions: [{ field: 'role', op: '==', value: UserRole.IT_SUPPORT }],
          orderBy: [{ field: 'fullname', op: 'asc' }]
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching all IT support:', error);
        return [];
      }
    },

    getUserByUid: async (uid: string): Promise<any | null> => {
      try {
        return await FirestoreClientHelper.getItemById(Collection.USERS, uid);
      } catch (error) {
        console.error('Error fetching user by UID:', error);
        return null;
      }
    }
  };

  return customUserService;
})();
