import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [imageResults, rawResults] = await Promise.all([
      cloudinary.search
        .expression('folder:riya-resume* AND resource_type:image')
        .max_results(2)
        .execute(),
      cloudinary.search
        .expression('folder:riya-resume* AND resource_type:raw')
        .max_results(2)
        .execute(),
    ]);
    const files = [...imageResults.resources, ...rawResults.resources];

    if (files.length === 0) {
      return res.status(404).json({ error: 'No resume found in the riya-resume folder' });
    }

    if (files.length !== 1) {
      return res.status(409).json({ error: 'Keep only one resume in the riya-resume folder' });
    }

    const file = files[0];
    const resourceType = file.resource_type || 'image';
    const fileType = file.type || 'private';
    const url = cloudinary.utils.private_download_url(file.public_id, file.format, {
      resource_type: resourceType,
      type: fileType,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    return res.redirect(302, url);
  } catch (error) {
    console.error('Cloudinary resume error:', error);
    return res.status(500).json({ error: 'Failed to retrieve the resume from Cloudinary' });
  }
}
