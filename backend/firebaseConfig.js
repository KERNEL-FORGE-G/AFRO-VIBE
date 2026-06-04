const admin = require('firebase-admin');
const dotenv = require('dotenv');
const { databaseMode, hasFirebaseCredentials } = require('./runtimeConfig');

dotenv.config();

let firestore = null;

function normalizePrivateKey(privateKey) {
  return privateKey ? privateKey.replace(/\\n/g, '\n') : undefined;
}

function initializeFirestore() {
  if (firestore) return firestore;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  try {
    if (!hasFirebaseCredentials()) {
      if (databaseMode === 'firestore') {
        console.error('Firestore requested with DATABASE_MODE=firestore, but Firebase credentials are missing.');
      } else {
        console.warn('Firestore disabled: missing Firebase Admin credentials.');
      }
      return null;
    }

    if (!admin.apps.length) {
      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIRESTORE_EMULATOR_HOST) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId,
        });
      }
    }

    firestore = admin.firestore();
    console.log('Firestore initialized for online database mode.');
    return firestore;
  } catch (error) {
    console.error('Firestore initialization failed:', error.message);
    firestore = null;
    return null;
  }
}

module.exports = {
  admin,
  firestore: initializeFirestore(),
  isFirestoreEnabled: () => !!firestore,
  isFirestorePrimary: () => databaseMode !== 'sqlite' && !!firestore,
};
