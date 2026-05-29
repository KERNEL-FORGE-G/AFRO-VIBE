/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  signInAnonymously: jest.fn(async () => ({ user: { uid: 'test-user' } })),
}));
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(async () => ({ docs: [] })),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(async () => ({ exists: () => false })),
  where: jest.fn(),
}));
jest.mock('@react-native-firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  putFile: jest.fn(),
  getDownloadURL: jest.fn(),
}));
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
