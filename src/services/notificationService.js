import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'afrovibe_channel';
const CHANNEL_NAME = 'AfroVibe Notifications';

/**
 * Initialize the notification channel (Android only).
 * Must be called once on app start.
 */
export async function initNotifications() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      vibration: true,
      vibrationPattern: [300, 500],
      sound: 'default',
    });
  }

  // Request permission (iOS & Android 13+)
  await notifee.requestPermission();
}

/**
 * Display a local notification with the app logo.
 * Tapping it will bring the app to foreground.
 *
 * @param {string} title  - Notification title
 * @param {string} body   - Notification body text
 * @param {object} data   - Optional payload attached to the notification
 */
export async function showNotification(title, body, data = {}) {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: CHANNEL_ID,
      // Use the app launcher icon — the logo present in mipmap/ic_launcher
      smallIcon: 'ic_launcher',
      largeIcon: require('../assets/images/logo.jpg'),
      pressAction: {
        id: 'default',
        // Launching the main activity brings the app to the foreground
        launchActivity: 'default',
      },
      importance: AndroidImportance.HIGH,
      showTimestamp: true,
    },
    ios: {
      // iOS uses the app icon automatically
      sound: 'default',
    },
  });
}

/**
 * Subscribe to foreground notification events.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function subscribeToForegroundEvents(onPress) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      onPress && onPress(detail.notification);
    }
  });
}

export default {
  initNotifications,
  showNotification,
  subscribeToForegroundEvents,
};
