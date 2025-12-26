import { Collection } from '@/lib/core/models';
import { CloudinaryService } from './cloudinary.service';

/**
 * User-specific Cloudinary service for avatar uploads
 */
export class UserCloudinaryService extends CloudinaryService {
  /**
   * Get folder path for user avatar uploads
   * @param userId - The user ID
   * @returns The folder path for user avatars
   */
  public static getUserFolder(userId: string): string {
    return `${this.BASE_FOLDER}/${Collection.USERS}/${userId}`;
  }

  /**
   * Upload user avatar (overwrites existing avatar automatically)
   * @param file - The avatar file to upload
   * @param userId - The user ID
   * @returns The secure URL of the uploaded avatar
   */
  public static async uploadAvatar(file: File, userId: string): Promise<string> {
    const folder = this.getUserFolder(userId);
    // Use fixed public_id 'avatar' so Cloudinary overwrites the old file automatically
    return this.uploadFile(file, folder, 'avatar');
  }
}
