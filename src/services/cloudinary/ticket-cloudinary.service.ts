import { Collection } from '@/lib/core/models';
import { CloudinaryService } from './cloudinary.service';

/**
 * Ticket-specific Cloudinary service for file uploads
 */
export class TicketCloudinaryService extends CloudinaryService {
  /**
   * Get folder path for ticket file uploads
   * @param ticketId - The ticket ID
   * @returns The folder path for ticket files
   */
  public static getTicketFolder(ticketId: string): string {
    return `${this.BASE_FOLDER}/${Collection.TICKETS}/${ticketId}`;
  }

  /**
   * Upload ticket image (screenshot)
   * @param file - The image file to upload
   * @param ticketId - The ticket ID
   * @param imageNumber - The image number (1 or 2)
   * @returns The secure URL of the uploaded image
   */
  public static async uploadTicketImage(file: File, ticketId: string, imageNumber: number): Promise<string> {
    // Validate image number
    if (imageNumber < 1 || imageNumber > 2) {
      throw new Error('Image number must be 1 or 2');
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      throw new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('Image size must not exceed 5MB');
    }

    const folder = this.getTicketFolder(ticketId);
    const publicId = `screenshot_${imageNumber}`;
    return this.uploadFile(file, folder, publicId);
  }

  /**
   * Upload ticket video
   * @param file - The video file to upload
   * @param ticketId - The ticket ID
   * @returns The secure URL of the uploaded video
   */
  public static async uploadTicketVideo(file: File, ticketId: string): Promise<string> {
    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validVideoTypes.includes(file.type)) {
      throw new Error('Invalid video type. Only MP4, WebM, MOV, and AVI are allowed.');
    }

    // Validate file size (50MB max)
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error('Video size must not exceed 50MB');
    }

    const folder = this.getTicketFolder(ticketId);
    const publicId = 'video';

    // Get signature from API
    const signResponse = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, publicId, resourceType: 'video' })
    });

    if (!signResponse.ok) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, timestamp, cloudName, apiKey } = await signResponse.json();

    // Prepare form data with signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('resource_type', 'video');
    formData.append('overwrite', 'true');
    formData.append('invalidate', 'true');
    formData.append('public_id', publicId);

    // Upload to Cloudinary (note the video endpoint)
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload video to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }

  /**
   * Upload all ticket attachments (images and video)
   * @param images - Array of image files (max 2)
   * @param video - Optional video file
   * @param ticketId - The ticket ID
   * @returns Object containing arrays of image URLs and optional video URL
   */
  public static async uploadTicketAttachments(
    images: File[],
    video: File | null,
    ticketId: string
  ): Promise<{ imageUrls: string[]; videoUrl?: string }> {
    // Validate images count
    if (images.length > 2) {
      throw new Error('Maximum 2 images allowed');
    }

    try {
      // Prepare all upload promises
      const imageUploadPromises = images.map((image, index) =>
        this.uploadTicketImage(image, ticketId, index + 1));

      const videoUploadPromise = video ? this.uploadTicketVideo(video, ticketId) : Promise.resolve(undefined);

      // Upload all files in parallel
      const [imageUrls, videoUrl] = await Promise.all([
        Promise.all(imageUploadPromises),
        videoUploadPromise
      ]);

      return {
        imageUrls,
        ...(videoUrl && { videoUrl })
      };
    } catch (error) {
      console.error('Failed to upload attachments:', error);
      throw new Error(`Failed to upload attachments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
