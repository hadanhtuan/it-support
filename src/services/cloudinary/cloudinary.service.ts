/**
 * Base Cloudinary service for file upload and deletion
 */
export class CloudinaryService {
  // Cloudinary configuration
  protected static readonly UPLOAD_PRESET = 'it_support';

  protected static readonly BASE_FOLDER = 'it_support';

  /**
   * Get the default upload preset
   * @returns The default upload preset name
   */
  public static getDefaultUploadPreset(): string {
    return this.UPLOAD_PRESET;
  }

  /**
   * Upload a file to Cloudinary using signed upload
   * @param file - The file to upload
   * @param folder - The folder path in Cloudinary
   * @param publicId - Optional public ID for the file (for overwriting)
   * @returns The secure URL of the uploaded file
   */
  public static async uploadFile(file: File, folder: string, publicId?: string): Promise<string> {
    // Get signature from API
    const signResponse = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, publicId })
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
    formData.append('overwrite', 'true');
    formData.append('invalidate', 'true');

    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload file to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url - The Cloudinary URL
   * @returns The public ID of the image
   */
  protected static extractPublicId(url: string): string {
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    // Get everything after 'upload/v1234567890/' or 'upload/'
    const pathParts = parts.slice(uploadIndex + 1);
    // Remove version if present (v1234567890)
    const publicIdParts = pathParts[0].startsWith('v') ? pathParts.slice(1) : pathParts;

    // Join and remove file extension
    const publicIdWithExt = publicIdParts.join('/');
    return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
  }

  /**
   * Delete a file from Cloudinary
   * Note: This requires a signed request, so it should ideally be done server-side.
   * For unsigned deletion, you need to enable "Allow Unsigned Delete" in your upload preset.
   * @param url - The Cloudinary URL of the file to delete
   * @returns Promise that resolves when deletion is complete
   */
  public static async deleteFile(url: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(url);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not configured');
      }

      // Note: This is a basic implementation. For production, you should:
      // 1. Use a server-side API route to handle deletion with proper authentication
      // 2. Or enable "Allow Unsigned Delete" in your Cloudinary upload preset
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('upload_preset', this.UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.warn('Failed to delete old image from Cloudinary:', await response.text());
        // Don't throw error - deletion failure shouldn't block the update
      }
    } catch (error) {
      console.warn('Error deleting file from Cloudinary:', error);
      // Don't throw - deletion failure shouldn't block the update
    }
  }
}
