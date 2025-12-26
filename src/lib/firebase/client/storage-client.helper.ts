import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadResult,
  uploadString
} from 'firebase/storage';
import { firebaseApp } from './client-config';

export class StorageClientHelper {
  private static storage = getStorage(firebaseApp);

  /**
   * Uploads a file to Firebase Storage
   * @param file - The file to upload
   * @param path - The storage path where the file will be stored
   * @returns Promise<string> - The download URL of the uploaded file
   */
  public static async uploadFile(value: File | string, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);

      let snapshot: UploadResult;

      if (typeof value === 'string') {
        snapshot = await uploadString(storageRef, value);
      } else {
        snapshot = await uploadBytes(storageRef, value);
      }

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // /**
  //  * Uploads a user avatar
  //  * @param file - The avatar file to upload
  //  * @param userId - The user ID
  //  * @returns Promise<string> - The download URL of the uploaded avatar
  //  */
  // public static async uploadAvatar(file: File, userId: string): Promise<string> {
  //   const timestamp = Date.now();
  //   const fileExtension = file.name.split('.').pop();
  //   const fileName = `avatar_${timestamp}.${fileExtension}`;
  //   const path = `users/${userId}/avatar/${fileName}`;

  //   return this.uploadFile(file, path);
  // }

  /**
   * Uploads a user avatar
   * @param file - The avatar file to upload
   * @param userId - The user ID
   * @returns Promise<string> - The download URL of the uploaded avatar
   */
  public static async uploadUserAvatar(file: File, userId: string): Promise<string> {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar_${timestamp}.${fileExtension}`;
    const path = `users/${userId}/avatar/${fileName}`;

    return this.uploadFile(file, path);
  }

  // /**
  //  * Uploads an ID card image
  //  * @param file - The ID card file to upload
  //  * @param userId - The user ID
  //  * @param side - 'front' or 'back'
  //  * @returns Promise<string> - The download URL of the uploaded ID card
  //  */
  // public static async uploadIdCard(file: File, userId: string, side: 'front' | 'back'): Promise<string> {
  //   const timestamp = Date.now();
  //   const fileExtension = file.name.split('.').pop();
  //   const fileName = `id_card_${side}_${timestamp}.${fileExtension}`;
  //   const path = `users/${userId}/id_cards/${fileName}`;

  //   return this.uploadFile(file, path);
  // }

  // /**
  //  * Uploads a certificate file
  //  * @param file - The certificate file to upload
  //  * @param userId - The user ID
  //  * @param certificateIndex - The index of the certificate
  //  * @returns Promise<string> - The download URL of the uploaded certificate
  //  */
  // public static async uploadCertificate(file: File, userId: string, certificateIndex: number): Promise<string> {
  //   const timestamp = Date.now();
  //   const fileExtension = file.name.split('.').pop();
  //   const fileName = `certificate_${certificateIndex}_${timestamp}.${fileExtension}`;
  //   const path = `users/${userId}/certificates/${fileName}`;

  //   return this.uploadFile(file, path);
  // }

  /**
   * Deletes a file from Firebase Storage
   * @param path - The storage path of the file to delete
   */
  public static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Extracts the storage path from a Firebase Storage URL
   * @param url - The Firebase Storage download URL
   * @returns string - The storage path
   */
  public static extractPathFromUrl(url: string): string {
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/\/o\/(.+?)\?/);
      return match ? match[1] : '';
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return '';
    }
  }
}
