/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// Ignore specific deprecation warnings that clutter the console
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (type === EventType.PRESS) {
    // App opened from background notification
    console.log('User pressed notification', notification);
  }
});

AppRegistry.registerComponent(appName, () => App);
