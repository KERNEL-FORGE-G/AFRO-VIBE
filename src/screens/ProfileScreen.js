// Profile Screen (Profil)
import React, { useState, useCallback } from 'react';
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
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { authService, dbService } from '../services/apiService';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = width / 3 - 2;

export const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'liked' | 'bookmarks'
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState('');

  const loadProfileAndVideos = useCallback(async () => {
    setLoading(true);
    try {
      const activeUser = authService.getCurrentUser();
      if (!activeUser) {
        navigation.replace('Welcome');
        return;
      }
      
      // Load user details from server to get latest stats/avatar
      const userDetails = await dbService.getUser(activeUser.uid);
      setProfile(userDetails || {
        ...activeUser,
        bio: 'Afro Vibe Creator',
        followers: 0,
        following: 0,
        likes: 0,
        isVerified: false
      });
      setEditBioValue(userDetails?.bio || 'Afro Vibe Creator');

      // Load videos for this specific user
      const filteredVideos = await dbService.getVideos(activeUser.uid);
      setMyVideos(filteredVideos);
    } catch (err) {
      console.error('Profile load error:', err);
      // Fallback to local user if server fails
      const activeUser = authService.getCurrentUser();
      if (activeUser) {
        setProfile({
          ...activeUser,
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
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadProfileAndVideos();
    }, [loadProfileAndVideos])
  );

  const handleEditProfile = () => {
    setIsEditingBio(true);
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
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.didCancel || !result.assets || result.assets.length === 0) return;
    
    setLoading(true);
    try {
      const uri = result.assets[0].uri;
      const res = await dbService.uploadAvatar(uri);
      // Update profile with new avatar
      setProfile(prev => ({ ...prev, avatar: res.avatarUrl }));
      Alert.alert('Succès', 'Avatar mis à jour !');
    } catch (err) {
      console.error('Avatar upload error:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'avatar.');
    } finally {
      setLoading(false);
    }
  };

  const renderVideoThumbnail = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('SoundDetail', { soundName: item.audioName })}
    >
      <Image 
        source={require('../assets/images/banner_mock.jpg')} // Fallback
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.viewsContainer}>
        <SVGIcon name="music" size={10} color={COLORS.text} style={styles.viewsIcon} />
        <Text style={styles.viewsText}>{item.views || '0'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!profile && loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const avatarSource = profile?.avatar 
    ? { uri: profile.avatar }
    : require('../assets/images/logo.jpg');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.flexEmpty} />
        <Text style={styles.headerTitle}>{profile?.username || 'Profil'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <SVGIcon name="settings" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Details Header Component */}
      <FlatList
        data={myVideos}
        keyExtractor={item => item.id}
        renderItem={renderVideoThumbnail}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileHeaderContainer}>
            {/* Avatar Circle */}
            <TouchableOpacity style={styles.avatarOutline} onPress={handleAvatarPick}>
              <Image 
                source={avatarSource}
                style={styles.avatar} 
              />
              <View style={styles.editAvatarIcon}>
                <SVGIcon name="settings" size={12} color={COLORS.text} />
              </View>
            </TouchableOpacity>

            {/* Username Row */}
            <View style={styles.usernameRow}>
              <Text style={styles.username}>@{profile?.username}</Text>
              {profile?.isVerified && (
                <SVGIcon name="verified" size={16} style={styles.verifiedIcon} />
              )}
            </View>

            {/* Statistics Row */}
            <View style={styles.statsRow}>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{profile?.following || 0}</Text>
                <Text style={styles.statLabel}>Abonnements</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{profile?.followers || 0}</Text>
                <Text style={styles.statLabel}>Abonnés</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{profile?.likes || 0}</Text>
                <Text style={styles.statLabel}>J'aime</Text>
              </View>
            </View>

            {/* Buttons Row */}
            <View style={styles.actionButtonsRow}>
              {isEditingBio ? (
                <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: COLORS.primary }]} onPress={handleSaveBio}>
                  <Text style={styles.editProfileText}>Sauvegarder</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}>
                  <Text style={styles.editProfileText}>Éditer le profil</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.bookmarkBtn} onPress={() => isEditingBio && setIsEditingBio(false)}>
                <SVGIcon name={isEditingBio ? "close" : "inbox"} size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Biography */}
            {isEditingBio ? (
              <TextInput
                style={styles.bioInput}
                value={editBioValue}
                onChangeText={setEditBioValue}
                multiline
                maxLength={150}
                placeholder="Votre bio..."
                placeholderTextColor={COLORS.textSecondary}
                autoFocus
              />
            ) : (
              <Text style={styles.bioText}>{profile?.bio || 'Pas encore de bio.'}</Text>
            )}

            {/* Tab Selectors */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'posts' && styles.activeTabBtn]}
                onPress={() => setActiveTab('posts')}
              >
                <SVGIcon 
                  name="adinkra1" 
                  size={20} 
                  color={activeTab === 'posts' ? COLORS.accent : COLORS.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'liked' && styles.activeTabBtn]}
                onPress={() => setActiveTab('liked')}
              >
                <SVGIcon 
                  name="heart" 
                  size={20} 
                  color={activeTab === 'liked' ? COLORS.accent : COLORS.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'bookmarks' && styles.activeTabBtn]}
                onPress={() => setActiveTab('bookmarks')}
              >
                <SVGIcon 
                  name="discover" 
                  size={20} 
                  color={activeTab === 'bookmarks' ? COLORS.accent : COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <SVGIcon name="music" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>Aucune vidéo pour le moment.</Text>
            </View>
          )
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  flexEmpty: {
    width: 24,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarOutline: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.text,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  editProfileBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  editProfileText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  bioInput: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.sm,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    width: width - SPACING.xl * 2,
    minHeight: 60,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    width: '100%',
  },
  tabBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.3,
    margin: 1,
    position: 'relative',
    backgroundColor: COLORS.cardBackground,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  viewsContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  viewsIcon: {
    marginRight: 4,
  },
  viewsText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
});

export default ProfileScreen;
