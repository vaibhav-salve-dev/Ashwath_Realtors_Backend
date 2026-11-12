const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Check if Cloudinary is configured
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Upload a Buffer, File Path, or Base64 Data URI to Cloudinary
 * @param {Buffer|string} fileSource - Buffer, local file path, or base64/data URI string
 * @param {Object} customOptions - Optional Cloudinary upload options (e.g. folder, public_id)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileSource, customOptions = {}) => {
  const defaultOptions = {
    folder: 'ashwath-realtors',
    resource_type: 'auto',
    ...customOptions
  };

  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary credentials not configured in environment.'));
    }

    if (Buffer.isBuffer(fileSource)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileSource);
    } else if (typeof fileSource === 'string') {
      cloudinary.uploader.upload(fileSource, defaultOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    } else {
      reject(new Error('Unsupported file source. Expected Buffer, file path string, or Base64 URI.'));
    }
  });
};

/**
 * Extract public_id from a Cloudinary URL
 * @param {string} url - Full Cloudinary image URL
 * @returns {string|null} public_id
 */
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Remove version tag like v1234567890/
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const publicIdWithExt = withoutVersion;
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    return lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
  } catch (err) {
    return null;
  }
};

/**
 * Delete an asset from Cloudinary
 * @param {string} publicIdOrUrl - Cloudinary public_id or full URL
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicIdOrUrl) => {
  if (!publicIdOrUrl || !isCloudinaryConfigured()) return null;
  
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    publicId = getPublicIdFromUrl(publicIdOrUrl);
  }
  if (!publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, err.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl
};

