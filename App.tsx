// Afro Vibe Application Entry Point
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initNotifications, showNotification } from './src/services/notificationService';
import { configService, authService, dbService } from './src/services/apiService';
import outboxService from './src/services/outboxService';

function App() {
  useEffect(() => {
    const initialize = async () => {
      try {
        await configService.loadConfig();
        await initNotifications();
        await outboxService.sync();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'app:', error);
      }
    };

    initialize();
  }, []);

  // Écoute des notifications en temps réel
  useEffect(() => {
    let unsubscribeNotifs = () => {};

    const setupNotifs = () => {
      const user = authService.getCurrentUser();
      if (user?.uid) {
        unsubscribeNotifs = dbService.subscribeToNotifications(user.uid, (newNotifs) => {
          // On ne montre que la notification la plus récente si elle vient d'arriver
          if (newNotifs.length > 0) {
            const latest = newNotifs[0];
            // Optionnel : vérifier si on l'a déjà montrée via un cache local
            showNotification(
              latest.user.username,
              latest.message
            );
          }
        });
      }
    };

    const unsubscribeAuth = authService.onAuthStateChanged(() => {
      unsubscribeNotifs();
      setupNotifs();
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifs();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
