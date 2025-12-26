import { Collection, User, UserStatus } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { ClientFirestoreQueryCondition } from '@/lib/firebase/client/firestore.model';
import { isEmpty } from 'lodash';
import { apiService } from './api.service';

export interface IAuthService {
  isEmailValid: (email: string) => Promise<boolean>;
  // All auth operations now handled client-side via Firebase Auth
}

export const authService = ((): IAuthService => {
  const customAuthService: IAuthService = {
    isEmailValid: async (email: string): Promise<boolean> => {
      const conditions: Array<ClientFirestoreQueryCondition> = [{ field: 'email', op: '==', value: email }];

      const user: User | null = await FirestoreClientHelper.getOne<User>(Collection.USERS, conditions);

      return isEmpty(user);
    }
  };

  return customAuthService;
})();
