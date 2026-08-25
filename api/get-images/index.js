import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.search
      .expression('folder:riya-images*')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map((file) => {
      // Generates an authenticated signed private download URL
      const signedUrl = cloudinary.utils.private_download_url(
        file.public_id,
        file.format,
        {
          resource_type: file.resource_type || 'image',
          type: file.type || 'private',
          expires_at: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
        }
      );

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