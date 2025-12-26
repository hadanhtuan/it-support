import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { folder, publicId } = body;

    if (!folder) {
      return NextResponse.json({ error: 'Folder is required' }, { status: 400 });
    }

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Prepare params for signature
    const params: Record<string, string | number | boolean> = {
      timestamp,
      folder,
      overwrite: true,
      invalidate: true
    };

    if (publicId) {
      params.public_id = publicId;
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    // Return signature and params
    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      publicId
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
