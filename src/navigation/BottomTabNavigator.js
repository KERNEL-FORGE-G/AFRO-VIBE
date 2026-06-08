// Bottom Tab Navigator
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import { dbService } from '../services/apiService';

import FeedScreen from '../screens/FeedScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import CameraScreen from '../screens/CameraScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const InboxTabIcon = ({ color, badge }) => (
  <View>
    <SVGIcon name="inbox" size={22} color={color} />
  </View>
);

export const BottomTabNavigator = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshBadge = useCallback(async () => {
    try {
      const count = await dbService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    refreshBadge();
    const interval = setInterval(refreshBadge, 30000);
    return () => clearInterval(interval);
  }, [refreshBadge]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color }) => <SVGIcon name="home" size={22} color={color} />,
          tabBarLabel: 'Accueil',
        }}
      />

      <Tab.Screen
        name="Découvrir"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color }) => <SVGIcon name="discover" size={22} color={color} />,
          tabBarLabel: 'Découvrir',
        }}
      />

      <Tab.Screen
        name="Plus"
        component={CameraScreen}
        options={{
          tabBarIcon: () => (
            <View style={styles.plusContainer}>
              <SVGIcon name="plus" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tab.Screen
        name="Boîte"
        component={InboxScreen}
        listeners={{ focus: () => refreshBadge() }}
        options={{
          tabBarIcon: ({ color }) => <InboxTabIcon color={color} />,
          tabBarLabel: 'Boîte',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <SVGIcon name="profile" size={22} color={color} />,
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  plusContainer: { justifyContent: 'center', alignItems: 'center', height: '100%' },
  badge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.text,
    fontSize: 9,
    fontWeight: 'bold',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    lineHeight: 14,
  },
});

export default BottomTabNavigator;
