import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Normalise un URI local pour FormData / upload Cloudinary sur Android.
 */
export async function resolveMediaUri(uri, ext = 'jpg') {
  if (!uri) throw new Error('Fichier média introuvable.');
  console.log(`[MediaUri] Resolving URI: ${uri} (ext: ${ext})`);

  let resolved = uri.trim();

  // Handle case where URI might be encoded or have spaces
  resolved = decodeURI(resolved);

  if (resolved.startsWith('/') && !resolved.startsWith('file://')) {
    resolved = `file://${resolved}`;
  }

  if (resolved.startsWith('content://')) {
    try {
      const dest = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.${ext}`;
      console.log(`[MediaUri] Copying content URI to: ${dest}`);
      await RNFS.copyFile(resolved, dest);
      resolved = `file://${dest}`;
    } catch (err) {
      console.error('[MediaUri] Error copying content URI:', err);
      // Fallback: sometimes the URI might work as is, but usually content:// needs copying
    }
  }

  const localPath = resolved.replace(/^file:\/\//, '');
  console.log(`[MediaUri] Checking existence of path: ${localPath}`);

  const exists = await RNFS.exists(localPath);
  if (!exists) {
    console.error(`[MediaUri] File not found at path: ${localPath}`);
    // If it doesn't exist, we might have an issue with the path format
    throw new Error(`Fichier introuvable: ${localPath}`);
  }

  const finalUri = Platform.OS === 'android' ? resolved : resolved.replace('file://', '');
  console.log(`[MediaUri] Final resolved URI: ${finalUri}`);
  return finalUri;
}

export function buildUploadFile(uri, mimeType, fileName) {
  return {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    type: mimeType,
    name: fileName,
  };
}

export default { resolveMediaUri, buildUploadFile };
