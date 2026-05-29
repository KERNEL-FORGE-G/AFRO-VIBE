import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../styles/theme';
import { authService } from '../services/apiService';

// Import Screens & Sub-Navigators
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator';
import LiveScreen from '../screens/LiveScreen';
import SoundDetailScreen from '../screens/SoundDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VideoEditScreen from '../screens/VideoEditScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const navigationRef = useRef();

  // Monitor auth status on startup
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  // Handle dynamic redirection upon auth status changes
  useEffect(() => {
    if (!initializing && navigationRef.current) {
      if (user) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  }, [user, initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
        initialRouteName={user ? 'MainTabs' : 'Welcome'}
      >
        {/* Auth Stack */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main Application Tabs */}
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        
        {/* Auxiliary Screens Stack */}
        <Stack.Screen name="Live" component={LiveScreen} />
        <Stack.Screen name="SoundDetail" component={SoundDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="VideoEdit" component={VideoEditScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
