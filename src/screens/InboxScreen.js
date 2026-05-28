// Inbox Screen (Boîte de Réception)
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  StatusBar
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { MOCK_NOTIFICATIONS, MOCK_USERS } from '../services/mockData';

export const InboxScreen = () => {
  
  const creators = Object.values(MOCK_USERS);

  const renderCreatorStory = (creator) => (
    <TouchableOpacity key={creator.username} style={styles.storyWrapper}>
      <View style={styles.avatarBorder}>
        <Image 
          source={require('../assets/images/logo.jpg')} // Fallback image setup
          style={styles.storyAvatar} 
        />
        {/* Online Indicator */}
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>@{creator.username}</Text>
    </TouchableOpacity>
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <SVGIcon name="heart" size={16} color={COLORS.secondary} />;
      case 'message':
        return <SVGIcon name="inbox" size={16} color={COLORS.accent} />;
      case 'mention':
        return <SVGIcon name="discover" size={16} color={COLORS.primary} />;
      case 'system':
      default:
        return <SVGIcon name="adinkra1" size={16} color={COLORS.text} />;
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationItem, item.unread && styles.unreadItem]}>
      <View style={styles.notifAvatarContainer}>
        <Image 
          source={require('../assets/images/logo.jpg')} // Fallback image setup
          style={styles.notifAvatar} 
        />
        <View style={[styles.iconBadge, { backgroundColor: COLORS.cardBackground }]}>
          {getNotificationIcon(item.type)}
        </View>
      </View>
      
      <View style={styles.notifContent}>
        <Text style={styles.notifText}>
          <Text style={styles.notifUsername}>{item.user.fullName}</Text>
          {' '}{item.message}
        </Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>

      {item.videoThumb ? (
        <Image 
          source={require('../assets/images/banner_mock.jpg')} // Fallback
          style={styles.videoThumb} 
        />
      ) : (
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Voir</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boîte de réception</Text>
        <TouchableOpacity style={styles.composeBtn}>
          <SVGIcon name="edit" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Online Creators Stories */}
      <View style={styles.storiesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {creators.map(renderCreatorStory)}
        </ScrollView>
      </View>

      {/* Notification List */}
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Activités</Text>
          </View>
        }
      />

      <TribalPattern position="bottom" height={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  composeBtn: {
    padding: 4,
  },
  storiesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  storiesScroll: {
    paddingHorizontal: SPACING.md,
  },
  storyWrapper: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 65,
  },
  avatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  storyUsername: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  activityHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unreadItem: {
    backgroundColor: 'rgba(255, 94, 0, 0.05)',
  },
  notifAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  notifAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  notifText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  notifUsername: {
    fontWeight: 'bold',
  },
  notifTime: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  videoThumb: {
    width: 36,
    height: 48,
    borderRadius: 4,
    backgroundColor: COLORS.cardBackground,
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default InboxScreen;
