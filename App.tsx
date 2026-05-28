// Afro Vibe Application Entry Point
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initNotifications } from './src/services/notificationService';
import { configService } from './src/services/apiService';

function App() {
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load saved server IP from storage
        await configService.loadConfig();
        // Initialize notification channel and request permissions
        await initNotifications();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'app:', error);
      }
    };

    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
