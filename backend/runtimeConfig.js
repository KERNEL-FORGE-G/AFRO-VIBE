const dotenv = require('dotenv');

dotenv.config();

const VALID_DATABASE_MODES = new Set(['auto', 'firestore', 'sqlite']);
const VALID_MEDIA_STORAGE = new Set(['auto', 'cloudinary', 'local']);

function normalizeChoice(value, fallback, allowedValues) {
  const normalized = String(value || fallback).trim().toLowerCase();
  return allowedValues.has(normalized) ? normalized : fallback;
}

const databaseMode = normalizeChoice(process.env.DATABASE_MODE, 'auto', VALID_DATABASE_MODES);
const mediaStorage = normalizeChoice(process.env.MEDIA_STORAGE, 'auto', VALID_MEDIA_STORAGE);

function hasFirebaseCredentials() {
  return Boolean(
    (process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIRESTORE_EMULATOR_HOST
  );
}

function hasCloudinaryCredentials() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function shouldUseCloudinary(req, firestorePrimary = false) {
  if (req?.body?.useCloudinary === 'false') return false;
  if (req?.body?.useCloudinary === 'true') return true;
  if (process.env.FORCE_CLOUDINARY === 'true') return true;
  if (mediaStorage === 'cloudinary') return true;
  if (mediaStorage === 'local') return false;
  return firestorePrimary;
}

module.exports = {
  databaseMode,
  mediaStorage,
  hasFirebaseCredentials,
  hasCloudinaryCredentials,
  shouldUseCloudinary,
};
