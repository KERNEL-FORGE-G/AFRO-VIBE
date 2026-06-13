import AsyncStorage from '@react-native-async-storage/async-storage';
import { dbService } from './apiService';

const OUTBOX_KEY = 'AFROVIBE_OUTBOX';
let isSyncing = false;

export const outboxService = {
  /**
   * Ajoute une action à la file d'attente (Outbox)
   */
  addAction: async (type, payload) => {
    try {
      const raw = await AsyncStorage.getItem(OUTBOX_KEY);
      const queue = raw ? JSON.parse(raw) : [];

      const newAction = {
        id: Date.now().toString(),
        type,
        payload,
        timestamp: new Date().toISOString(),
      };

      queue.push(newAction);
      await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
      console.log(`[Outbox] Action ajoutée: ${type}`);

      // Tentative de synchro immédiate
      outboxService.sync();
    } catch (error) {
      console.error('[Outbox] Erreur lors de l\'ajout:', error);
    }
  },

  /**
   * Tente de synchroniser les actions en attente
   */
  sync: async () => {
    if (isSyncing) return;

    try {
      const raw = await AsyncStorage.getItem(OUTBOX_KEY);
      if (!raw) return;

      let queue = JSON.parse(raw);
      if (queue.length === 0) return;

      console.log(`[Outbox] Début de synchro: ${queue.length} actions`);
      isSyncing = true;

      const remainingActions = [];

      for (const action of queue) {
        try {
          await outboxService.processAction(action);
          console.log(`[Outbox] Action traitée avec succès: ${action.type}`);
        } catch (error) {
          console.log(`[Outbox] Échec pour ${action.type}, sera retenté plus tard.`, error.message);
          remainingActions.push(action);
        }
      }

      await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(remainingActions));
    } catch (error) {
      console.error('[Outbox] Erreur synchro:', error);
    } finally {
      isSyncing = false;
    }
  },

  /**
   * Traite une action spécifique en appelant le bon service
   */
  processAction: async (action) => {
    switch (action.type) {
      case 'LIKE':
        return await dbService.likeVideo(action.payload.videoId);
      case 'FOLLOW':
        return await dbService.followUser(action.payload.userId);
      case 'BOOKMARK':
        return await dbService.toggleBookmark(action.payload.videoId);
      case 'COMMENT':
        return await dbService.addComment(action.payload.videoId, action.payload.text);
      default:
        console.warn(`[Outbox] Type d'action inconnu: ${action.type}`);
    }
  }
};

export default outboxService;
