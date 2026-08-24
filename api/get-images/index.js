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
      .expression('folder:riya-images')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map((file) => ({
      // Generates an optimized, public Cloudinary CDN URL for each asset
      url: cloudinary.url(file.public_id, {
        secure: true,
        quality: 'auto',
        fetch_format: 'auto',
      }),
      public_id: file.public_id,
    }));

    res.status(200).json({ images });
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
}