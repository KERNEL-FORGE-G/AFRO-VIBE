const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const { hasCloudinaryCredentials } = require('./runtimeConfig');

dotenv.config();

if (hasCloudinaryCredentials()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn('Cloudinary disabled: missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured: hasCloudinaryCredentials,
};
