const cloudinary = require('cloudinary').v2;

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
    const folderName = process.env.CLOUDINARY_GALLERY_FOLDER || 'riya-images';

    // Search specifically inside your target folder
    const result = await cloudinary.search
      .expression(`folder:${folderName}/*`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const images = result.resources.map((resource) => ({
      url: resource.secure_url,
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ images });
  } catch (error) {
    console.error('Cloudinary Search API Error:', error);
    return res.status(500).json({ error: error.message || 'Unable to load gallery images' });
  }
}