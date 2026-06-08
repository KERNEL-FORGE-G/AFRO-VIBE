import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Normalise un URI local pour FormData / upload Cloudinary sur Android.
 */
export async function resolveMediaUri(uri, ext = 'jpg') {
  if (!uri) throw new Error('Fichier média introuvable.');

  let resolved = uri.trim();

  if (resolved.startsWith('/') && !resolved.startsWith('file://')) {
    resolved = `file://${resolved}`;
  }

  if (resolved.startsWith('content://')) {
    const dest = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.${ext}`;
    await RNFS.copyFile(resolved, dest);
    resolved = `file://${dest}`;
  }

  const localPath = resolved.replace(/^file:\/\//, '');
  const exists = await RNFS.exists(localPath);
  if (!exists) {
    throw new Error(`Fichier introuvable: ${localPath}`);
  }

  return Platform.OS === 'android' ? resolved : resolved.replace('file://', '');
}

export function buildUploadFile(uri, mimeType, fileName) {
  return {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    type: mimeType,
    name: fileName,
  };
}

export default { resolveMediaUri, buildUploadFile };
