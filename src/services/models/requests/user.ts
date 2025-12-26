import { UserStatus } from '@/lib/core/models';

export interface BulkUpdateStatusRequest {
  userIds: string[];
  status: UserStatus;
  avatarUrl?: string;
}
