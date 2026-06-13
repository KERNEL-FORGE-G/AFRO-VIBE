// Inbox Screen (Boîte de Réception)
import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { dbService, configService } from '../services/apiService';

const NotificationItem = memo(({ item, index, handleNotificationPress, deleteNotification, getAvatarSource, getNotificationIcon }) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: Math.min(index * 50, 600), useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: Math.min(index * 50, 600), useNativeDriver: true })
    ]).start();
  }, [slideAnim, opacityAnim, index]);

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.notificationItem, item.unread && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => deleteNotification(item.id)}
      >
        <View style={styles.notifAvatarContainer}>
          <Image source={getAvatarSource(item.user)} style={styles.notifAvatar} />
          <View style={[styles.iconBadge, { backgroundColor: COLORS.cardBackground }]}>
            {getNotificationIcon(item.type)}
          </View>
        </View>

        <View style={styles.notifContent}>
          <Text style={styles.notifText}>
            <Text style={styles.notifUsername}>{item.user?.fullName || item.user?.username}</Text>
            {' '}{item.message}
          </Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>

        {item.videoThumb ? (
          <Image
            source={require('../assets/images/banner_mock.jpg')}
            style={styles.videoThumb}
          />
        ) : (
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Voir</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export const InboxScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, recentUsers] = await Promise.all([
        dbService.getNotifications(),
        dbService.getRecentChatUsers(),
      ]);
      setNotifications(notifs);
      setCreators(recentUsers);
    } catch (err) {
      console.error('Inbox load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [loadInbox]),
  );

  const deleteNotification = useCallback((id) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await dbService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
          },
        },
      ],
    );
  }, []);

  const handleNotificationPress = useCallback(async (item) => {
    if (item.unread) {
      await dbService.markNotificationRead(item.id);
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, unread: false } : n)),
      );
    }
    if (item.type === 'message' || item.user?.uid) {
      navigation.navigate('Chat', { otherUser: item.user });
    }
  }, [navigation]);

  const getAvatarSource = useCallback((user) => {
    const url = configService.fixMediaUrl(user?.avatar);
    return url ? { uri: url } : require('../assets/images/logo.jpg');
  }, []);

  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'like': return <SVGIcon name="heart" size={16} color={COLORS.secondary} />;
      case 'message': return <SVGIcon name="inbox" size={16} color={COLORS.accent} />;
      case 'comment': return <SVGIcon name="comment" size={16} color={COLORS.primary} />;
      case 'follow': return <SVGIcon name="profile" size={16} color={COLORS.accent} />;
      default: return <SVGIcon name="adinkra1" size={16} color={COLORS.text} />;
    }
  }, []);

  const renderCreatorStory = (creator) => (
    <TouchableOpacity
      key={creator.uid || creator.username}
      style={styles.storyWrapper}
      onPress={() => navigation.navigate('Chat', { otherUser: creator })}
    >
      <View style={styles.avatarBorder}>
        <Image source={getAvatarSource(creator)} style={styles.storyAvatar} />
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>@{creator.username}</Text>
    </TouchableOpacity>
  );

  const renderNotificationItem = useCallback(({ item, index }) => (
    <NotificationItem
      item={item}
      index={index}
      handleNotificationPress={handleNotificationPress}
      deleteNotification={deleteNotification}
      getAvatarSource={getAvatarSource}
      getNotificationIcon={getNotificationIcon}
    />
  ), [handleNotificationPress, deleteNotification, getAvatarSource, getNotificationIcon]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boîte de réception</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <>
          {creators.length > 0 && (
            <View style={styles.storiesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
                {creators.map(renderCreatorStory)}
              </ScrollView>
            </View>
          )}
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<View style={styles.activityHeader}><Text style={styles.activityTitle}>Activités</Text></View>}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune activité pour le moment.</Text>}
          />
        </>
      )}
      <TribalPattern position="bottom" height={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  storiesContainer: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm },
  storiesScroll: { paddingHorizontal: SPACING.md },
  storyWrapper: { alignItems: 'center', marginRight: SPACING.md, width: 65 },
  avatarBorder: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: COLORS.primary, padding: 2, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  storyAvatar: { width: '100%', height: '100%', borderRadius: 23 },
  onlineDot: { position: 'absolute', bottom: 0, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.background },
  storyUsername: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' },
  listContent: { paddingBottom: SPACING.lg },
  activityHeader: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.accent },
  notificationItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  unreadItem: { backgroundColor: 'rgba(255, 94, 0, 0.05)' },
  notifAvatarContainer: { position: 'relative', marginRight: SPACING.md },
  notifAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  iconBadge: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  notifContent: { flex: 1, marginRight: SPACING.sm },
  notifText: { color: COLORS.text, fontSize: 13, lineHeight: 18 },
  notifUsername: { fontWeight: 'bold' },
  notifTime: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  videoThumb: { width: 36, height: 48, borderRadius: 4, backgroundColor: COLORS.cardBackground },
  actionBtn: { paddingHorizontal: SPACING.md, paddingVertical: 6, backgroundColor: COLORS.cardBackground, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { color: COLORS.text, fontSize: 11, fontWeight: 'bold' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 14 },
});

export default InboxScreen;
