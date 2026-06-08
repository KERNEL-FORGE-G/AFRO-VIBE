import { ENV, isCloudinaryConfigured } from '../config/env';
import { resolveMediaUri, buildUploadFile } from '../utils/mediaUri';

const parseCloudinaryError = async (res) => {
  try {
    const data = await res.json();
    return data.error?.message || `Erreur Cloudinary (${res.status})`;
  } catch {
    return `Erreur Cloudinary (${res.status})`;
  }
};

export async function uploadVideoToCloudinary(videoUri) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary non configuré. Remplissez env.js (cloudName + uploadPreset).');
  }

  const resolvedUri = await resolveMediaUri(videoUri, 'mp4');
  console.log('[Cloudinary] Upload vidéo:', resolvedUri);

  const formData = new FormData();
  formData.append('file', buildUploadFile(resolvedUri, 'video/mp4', `video_${Date.now()}.mp4`));
  formData.append('upload_preset', ENV.cloudinary.uploadPreset);
  formData.append('folder', ENV.cloudinary.videoFolder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${ENV.cloudinary.cloudName}/video/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const msg = await parseCloudinaryError(res);
    throw new Error(msg);
  }

  const data = await res.json();
  console.log('[Cloudinary] Vidéo OK:', data.secure_url);
  return {
    url: data.secure_url,
    publicId: data.public_id,
    thumbnail: data.secure_url,
  };
}

export async function uploadImageToCloudinary(imageUri, folder) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary non configuré. Remplissez env.js (cloudName + uploadPreset).');
  }

  const resolvedUri = await resolveMediaUri(imageUri, 'jpg');
  console.log('[Cloudinary] Upload image:', resolvedUri);

  const formData = new FormData();
  formData.append('file', buildUploadFile(resolvedUri, 'image/jpeg', `image_${Date.now()}.jpg`));
  formData.append('upload_preset', ENV.cloudinary.uploadPreset);
  formData.append('folder', folder || ENV.cloudinary.imageFolder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${ENV.cloudinary.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const msg = await parseCloudinaryError(res);
    throw new Error(msg);
  }

  const data = await res.json();
  console.log('[Cloudinary] Image OK:', data.secure_url);
  return data.secure_url;
}

export default { uploadVideoToCloudinary, uploadImageToCloudinary };
