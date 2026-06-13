/**
 * Utilitaire de traitement vidéo pour Afro Vibe
 * Note: Nécessite l'installation de 'react-native-compressor'
 * Commande: npm install react-native-compressor
 */

// Tentative d'importation dynamique pour éviter de casser l'app si non installé
let VideoCompressor = null;
try {
  VideoCompressor = require('react-native-compressor').Video;
} catch (e) {
  console.warn('react-native-compressor n\'est pas installé. La compression sera ignorée.');
}

/**
 * Compresse une vidéo pour optimiser l'upload
 * @param {string} sourceUri - URI de la vidéo originale
 * @returns {Promise<string>} - URI de la vidéo compressée
 */
export const compressVideo = async (sourceUri) => {
  if (!VideoCompressor) {
    console.log('[Compressor] Utilisation de la vidéo originale (pas de librairie de compression)');
    return sourceUri;
  }

  try {
    console.log('[Compressor] Début de la compression pour:', sourceUri);

    const result = await VideoCompressor.compress(
      sourceUri,
      {
        compressionMethod: 'auto',
        minimumVideoBitrate: 2000000, // 2Mbps pour garder une bonne qualité Afro
      },
      (progress) => {
        console.log(`[Compressor] Progress: ${Math.round(progress * 100)}%`);
      }
    );

    console.log('[Compressor] Compression terminée:', result);
    return result;
  } catch (error) {
    console.error('[Compressor] Échec de la compression:', error);
    return sourceUri; // Fallback sur l'original en cas d'erreur
  }
};
