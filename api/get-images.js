const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const result = await cloudinary.api.resources({
      type: 'authenticated',
      resource_type: 'image',
      prefix: process.env.CLOUDINARY_GALLERY_FOLDER || 'riya-images',
      max_results: 100,
    });

    const images = result.resources.map((resource) => ({
      url: cloudinary.url(resource.public_id, {
        type: 'authenticated',
        resource_type: 'image',
        sign_url: true,
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }),
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load gallery images' });
  }
};
