/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    requestPermission: jest.fn(),
    displayNotification: jest.fn(),
  },
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('react-native-video', () => 'Video');
jest.mock('react-native-youtube-iframe', () => 'YouTube');
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn(() => null),
  useCameraPermission: jest.fn(() => ({ hasPermission: true, requestPermission: jest.fn() })),
  useMicrophonePermission: jest.fn(() => ({ hasPermission: true, requestPermission: jest.fn() })),
}));
