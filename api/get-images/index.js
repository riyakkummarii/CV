import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      max_results: 100,
    });

    // Exclude any sample assets from Cloudinary default folders
    const images = (result.resources || [])
      .filter((resource) => !resource.public_id.startsWith('samples/'))
      .map((resource) => ({
        url: resource.secure_url,
      }));

    // Disable caching so changes display immediately across all browsers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({ images });
  } catch (error) {
    console.error('Cloudinary API Error:', error);
    return res.status(500).json({ error: error.message || 'Unable to load gallery images' });
  }
}