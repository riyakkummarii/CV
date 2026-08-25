import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  try {
    // 1. Search for all assets inside your folder
    const result = await cloudinary.search
      .expression('folder:riya-images*')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    // 2. Generate a signed URL for every asset
    const images = result.resources.map((file) => {
      const signedUrl = cloudinary.url(file.public_id, {
        sign_url: true, // Signs the URL with your API Secret
        type: file.type || 'upload', // Supports private, authenticated, or upload types
        resource_type: file.resource_type || 'image',
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour (3600 seconds)
      });

      return {
        url: signedUrl,
        public_id: file.public_id,
      };
    });

    res.status(200).json({ images });
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch signed image URLs' });
  }
}