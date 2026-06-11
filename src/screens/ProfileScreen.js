// Profile Screen (Profil)
import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import VideoPlayerView from '../components/VideoPlayerView';
import { authService, dbService, configService } from '../services/apiService';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { resolveMediaUri } from '../utils/mediaUri';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = width / 3 - 2;

const VideoThumbnail = memo(({ item, index, navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: Math.min(index * 30, 600),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate('MainTabs', {
          screen: 'Accueil',
          params: { initialVideoId: item.id }
        })}
      >
        <VideoPlayerView
          videoUrl={item.videoUrl}
          paused={false}
          isMuted={true}
          thumbnail={item.thumbnail}
          onSingleTap={() => navigation.navigate('MainTabs', {
            screen: 'Accueil',
            params: { initialVideoId: item.id }
          })}
        />
        <View style={styles.viewsContainer}>
          <SVGIcon name="play" size={10} color={COLORS.text} style={styles.viewsIcon} />
          <Text style={styles.viewsText}>{item.views || '0'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export const ProfileScreen = ({ navigation, route }) => {
  const targetUserId = route?.params?.userId;
  const currentUser = authService.getCurrentUser();
  const isOwnProfile = !targetUserId || targetUserId === currentUser?.uid;

  const [profile, setProfile] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'liked' | 'bookmarks'
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const avatarScale = React.React.useRef(new Animated.Value(0)).current;

  React.React.useEffect(() => {
    if (profile) {
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [profile, avatarScale]);

  const loadProfileAndVideos = useCallback(async () => {
    setLoading(true);
    try {
      const uidToShow = targetUserId || currentUser?.uid;
      if (!uidToShow) {
        navigation.replace('Welcome');
        return;
      }
      const userDetails = await dbService.getUser(uidToShow);
      if (userDetails && userDetails.avatar) {
        userDetails.avatar = configService.fixMediaUrl(userDetails.avatar);
      }
      setProfile(userDetails || {
        id: uidToShow,
        username: 'Utilisateur',
        bio: 'Afro Vibe Creator',
        followers: 0,
        following: 0,
        likes: 0,
        isVerified: false
      });
      setEditBioValue(userDetails?.bio || 'Afro Vibe Creator');
      setIsFollowing(!!userDetails?.isFollowing);

      let tabVideos = [];
      if (activeTab === 'liked') {
        tabVideos = await dbService.getLikedVideos(uidToShow);
      } else if (activeTab === 'bookmarks') {
        tabVideos = await dbService.getBookmarkedVideos(uidToShow);
      } else {
        const allVideos = await dbService.getVideos();
        tabVideos = allVideos.filter(v => v.user.uid === uidToShow);
      }
      setMyVideos(tabVideos);
    } catch (err) {
      console.error('Profile load error:', err);
      if (isOwnProfile && currentUser) {
        setProfile({
          ...currentUser,
          avatar: configService.fixMediaUrl(currentUser.avatar),
          bio: 'Afro Vibe Creator',
          followers: 0,
          following: 0,
          likes: 0,
          isVerified: false
        });
        setEditBioValue('Afro Vibe Creator');
      }
    } finally {
      setLoading(false);
    }
  }, [navigation, targetUserId, currentUser, isOwnProfile, activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadProfileAndVideos();
    }, [loadProfileAndVideos])
  );

  const handleEditProfile = () => {
    if (!isOwnProfile) return;
    setIsEditingBio(true);
  };

  const handleFollowToggle = async () => {
    if (isOwnProfile) return;
    try {
      if (isFollowing) {
        await dbService.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile(p => ({ ...p, followers: Math.max(0, p.followers - 1) }));
      } else {
        await dbService.followUser(profile.id);
        setIsFollowing(true);
        setProfile(p => ({ ...p, followers: p.followers + 1 }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'abonnement.');
    }
  };

  const handleMessage = () => {
    navigation.navigate('Chat', {
      otherUser: { uid: profile.id, username: profile.username, avatar: profile.avatar }
    });
  };

  const handleSaveBio = async () => {
    try {
      setLoading(true);
      await dbService.updateProfile({ bio: editBioValue });
      setProfile(prev => ({ ...prev, bio: editBioValue }));
      setIsEditingBio(false);
      Alert.alert('Succès', 'Profil mis à jour !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets || result.assets.length === 0) return;
    setLoading(true);
    try {
      const sourceUri = result.assets[0].uri;
      const res = await dbService.uploadAvatar(sourceUri);
      setProfile((prev) => ({ ...prev, avatar: res.avatarUrl }));
      Alert.alert('Succès', 'Avatar mis à jour !');
    } catch (err) {
      console.error('Avatar process error:', err);
      Alert.alert('Erreur', err.message || 'Impossible de mettre à jour l\'avatar.');
    } finally {
      setLoading(false);
    }
  };

  const renderVideoThumbnail = useCallback(({ item, index }) => (
    <VideoThumbnail item={item} index={index} navigation={navigation} />
  ), [navigation]);

  if (!profile && loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const avatarSource = profile?.avatar ? { uri: profile.avatar } : require('../assets/images/logo.jpg');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />
      <View style={styles.header}>
        {!isOwnProfile ? (
          <TouchableOpacity onPress={() => navigation.goBack()}><SVGIcon name="close" size={24} color={COLORS.text} /></TouchableOpacity>
        ) : (
          <View style={styles.flexEmpty} />
        )}
        <Text style={styles.headerTitle}>{profile?.username || 'Profil'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}><SVGIcon name="settings" size={24} color={COLORS.text} /></TouchableOpacity>
      </View>
      <FlatList
        data={myVideos}
        keyExtractor={item => item.id}
        renderItem={renderVideoThumbnail}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileHeaderContainer}>
            <TouchableOpacity style={styles.avatarOutline} onPress={isOwnProfile ? handleAvatarPick : null} disabled={!isOwnProfile}>
              <Animated.Image source={avatarSource} style={[styles.avatar, { transform: [{ scale: avatarScale }] }]} />
              {isOwnProfile && <View style={styles.editAvatarIcon}><SVGIcon name="settings" size={12} color={COLORS.text} /></View>}
            </TouchableOpacity>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>@{profile?.username}</Text>
              {profile?.isVerified && <SVGIcon name="verified" size={16} style={styles.verifiedIcon} />}
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statColumn}><Text style={styles.statNumber}>{profile?.following || 0}</Text><Text style={styles.statLabel}>Abonnements</Text></View>
              <View style={styles.statColumn}><Text style={styles.statNumber}>{profile?.followers || 0}</Text><Text style={styles.statLabel}>Abonnés</Text></View>
              <View style={styles.statColumn}><Text style={styles.statNumber}>{profile?.likes || 0}</Text><Text style={styles.statLabel}>J'aime</Text></View>
            </View>
            <View style={styles.actionButtonsRow}>
              {isOwnProfile ? (
                <>
                  {isEditingBio ? (
                    <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: COLORS.primary }]} onPress={handleSaveBio}><Text style={styles.editProfileText}>Sauvegarder</Text></TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}><Text style={styles.editProfileText}>Éditer le profil</Text></TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.bookmarkBtn} onPress={() => isEditingBio && setIsEditingBio(false)}><SVGIcon name={isEditingBio ? "close" : "inbox"} size={18} color={COLORS.text} /></TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: isFollowing ? COLORS.cardBackground : COLORS.primary }]} onPress={handleFollowToggle}><Text style={styles.editProfileText}>{isFollowing ? 'Se désabonner' : 'S\'abonner'}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.editProfileBtn} onPress={handleMessage}><Text style={styles.editProfileText}>Message</Text></TouchableOpacity>
                </>
              )}
            </View>
            {isEditingBio ? (
              <TextInput style={styles.bioInput} value={editBioValue} onChangeText={setEditBioValue} multiline maxLength={150} placeholder="Votre bio..." placeholderTextColor={COLORS.textSecondary} autoFocus />
            ) : (
              <Text style={styles.bioText}>{profile?.bio || 'Pas encore de bio.'}</Text>
            )}
            <View style={styles.tabsContainer}>
              <TouchableOpacity style={[styles.tabBtn, activeTab === 'posts' && styles.activeTabBtn]} onPress={() => setActiveTab('posts')}><SVGIcon name="adinkra1" size={20} color={activeTab === 'posts' ? COLORS.accent : COLORS.textSecondary} /></TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, activeTab === 'liked' && styles.activeTabBtn]} onPress={() => setActiveTab('liked')}><SVGIcon name="heart" size={20} color={activeTab === 'liked' ? COLORS.accent : COLORS.textSecondary} /></TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, activeTab === 'bookmarks' && styles.activeTabBtn]} onPress={() => setActiveTab('bookmarks')}><SVGIcon name="discover" size={20} color={activeTab === 'bookmarks' ? COLORS.accent : COLORS.textSecondary} /></TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={!loading && <View style={styles.emptyContainer}><SVGIcon name="music" size={48} color={COLORS.border} /><Text style={styles.emptyText}>Aucune vidéo pour le moment.</Text></View>}
      />
      <TribalPattern position="bottom" height={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  flexEmpty: { width: 24 },
  profileHeaderContainer: { alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarOutline: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: COLORS.primary, padding: 3, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm, position: 'relative' },
  avatar: { width: '100%', height: '100%', borderRadius: 44 },
  editAvatarIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 4, borderRadius: 10, borderWidth: 1, borderColor: COLORS.text },
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  username: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  verifiedIcon: { marginLeft: SPACING.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  statColumn: { alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  editProfileBtn: { flex: 1, height: 40, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  editProfileText: { color: COLORS.text, fontSize: 14, fontWeight: 'bold' },
  bookmarkBtn: { width: 40, height: 40, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  bioText: { fontSize: 13, color: COLORS.text, textAlign: 'center', lineHeight: 18, paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  bioInput: { fontSize: 13, color: COLORS.text, textAlign: 'center', backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: SPACING.sm, marginHorizontal: SPACING.xl, marginBottom: SPACING.lg, width: width - SPACING.xl * 2, minHeight: 60 },
  tabsContainer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, width: '100%' },
  tabBtn: { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center' },
  activeTabBtn: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  listContent: { paddingBottom: SPACING.lg },
  gridItem: { width: GRID_ITEM_WIDTH, height: GRID_ITEM_WIDTH * 1.3, margin: 1, position: 'relative', backgroundColor: COLORS.cardBackground },
  viewsContainer: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  viewsIcon: { marginRight: 4 },
  viewsText: { color: COLORS.text, fontSize: 9, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  emptyText: { color: COLORS.textSecondary, marginTop: 10, fontSize: 14 },
});

export default ProfileScreen;
