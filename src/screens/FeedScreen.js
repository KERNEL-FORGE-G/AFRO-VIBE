// Home Feed Screen (Accueil)
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Image,
  Animated,
  Easing,
  StatusBar,
  RefreshControl,
  Share,
  Alert,
  LayoutAnimation
} from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import VideoPlayerView from '../components/VideoPlayerView';
import CommentsBottomSheet from '../components/CommentsBottomSheet';
import { dbService, configService, authService } from '../services/apiService';
import offlineService from '../services/offlineService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const BOTTOM_BAR_HEIGHT = 60; // Approximate bottom tab bar height
const FEED_HEIGHT = height - BOTTOM_BAR_HEIGHT;
const VIDEO_CACHE_KEY = 'AFROVIBE_FEED_CACHE';

// Spin animation for vinyl disk
const SpinVinyl = memo(({ isPlaying }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation;
    if (isPlaying) {
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinValue.setValue(0);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isPlaying, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.vinylOuter, { transform: [{ rotate: spin }] }]}>
      <View style={styles.vinylInner}>
        <Image
          source={require('../assets/images/logo.jpg')}
          style={styles.vinylCenter}
        />
      </View>
    </Animated.View>
  );
});

const VideoItem = memo(({
  item,
  index,
  isFocused,
  currentVisibleIndex,
  commentsVisible,
  userPaused,
  handleVideoTap,
  navigation,
  handleFollowCreator,
  handleLike,
  openComments,
  handleShare,
  handleBookmark,
  handleSaveOffline
}) => {
  const isPlaying = isFocused && index === currentVisibleIndex;
  const isCurrentItem = index === currentVisibleIndex;
  const forcePaused = !isPlaying || commentsVisible || (isCurrentItem && userPaused);
  const canTapVideo = isCurrentItem && isFocused && !commentsVisible;

  const animValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isCurrentItem) {
      animValue.setValue(0);
      Animated.spring(animValue, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [isCurrentItem, animValue]);

  const slideAnim = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const opacityAnim = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.videoContainer}>
      <VideoPlayerView
        videoUrl={item.videoUrl}
        paused={forcePaused}
        thumbnail={item.thumbnail}
        enableTapControls={false}
        showPauseIndicator={isCurrentItem && userPaused && !commentsVisible}
      />

      {canTapVideo && (
        <Pressable
          style={styles.tapOverlay}
          onPress={() => handleVideoTap(item.id)}
          accessibilityRole="button"
          accessibilityLabel={userPaused ? 'Lire la vidéo' : 'Mettre en pause'}
        />
      )}

      <Animated.View
        style={[
          styles.bottomInfoContainer,
          { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user.uid })}>
          <Text style={styles.username}>@{item.user.username}</Text>
        </TouchableOpacity>
        {item.user.isVerified && (
          <SVGIcon name="verified" size={14} style={styles.verifiedIcon} />
        )}
        <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>

        <View style={styles.musicContainer}>
          <SVGIcon name="music" size={14} color={COLORS.text} style={styles.musicIcon} />
          <Text style={styles.musicText} numberOfLines={1}>{item.audioName}</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.rightButtonsPanel,
          { opacity: opacityAnim, transform: [{ translateX: slideAnim }] }
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user.uid })}>
            <Image
              source={item.user?.avatar ? { uri: configService.fixMediaUrl(item.user.avatar) } : require('../assets/images/logo.jpg')}
              style={styles.creatorAvatar}
            />
          </TouchableOpacity>
          {!item.user.isFollowing && item.user.uid !== authService.getCurrentUser()?.uid && (
            <TouchableOpacity
              style={styles.followBtn}
              onPress={() => handleFollowCreator(item.user.uid)}
            >
              <Text style={styles.followBtnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <SVGIcon
            name="heart"
            size={36}
            color={item.isLiked ? COLORS.secondary : COLORS.text}
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openComments(item.id)}
        >
          <SVGIcon name="comment" size={34} color={COLORS.text} />
          <Text style={styles.actionText}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <SVGIcon name="share" size={32} color={COLORS.text} />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBookmark(item)}
        >
          <SVGIcon
            name="inbox"
            size={30}
            color={item.isBookmarked ? COLORS.accent : COLORS.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSaveOffline(item)}
        >
          <SVGIcon name="settings" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <SpinVinyl isPlaying={isPlaying && !commentsVisible && !(isCurrentItem && userPaused)} />
      </Animated.View>
    </View>
  );
});

export const FeedScreen = ({ route, navigation }) => {
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('pourToi');
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const isFocused = useIsFocused();
  const flatListRef = useRef(null);
  const isReadyToScroll = useRef(false);
  const lastTapRef = useRef(0);

  const initialVideoId = route?.params?.initialVideoId;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentVisibleIndex(index);
      setActiveVideoId(viewableItems[0].item.id);
    }
  }).current;

  const loadVideos = useCallback(async () => {
    try {
      const list = await dbService.getVideos();
      if (list && list.length > 0) {
        await AsyncStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(list));
        const offline = await offlineService.getOfflineVideos();
        const merged = offlineService.mergeWithOffline(list, offline);
        setVideos(merged);

        if (!initialVideoId && !activeVideoId) {
          setActiveVideoId(merged[0].id);
        }
      } else {
        throw new Error('No online videos');
      }
    } catch (err) {
      const cachedRaw = await AsyncStorage.getItem(VIDEO_CACHE_KEY);
      const cachedList = cachedRaw ? JSON.parse(cachedRaw) : [];
      const offline = await offlineService.getOfflineVideos();
      const merged = offlineService.mergeWithOffline(cachedList, offline);
      setVideos(merged);

      if (!initialVideoId && merged.length > 0 && !activeVideoId) {
        setActiveVideoId(merged[0].id);
      }
    }
  }, [activeVideoId, initialVideoId]);

  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, [loadVideos])
  );

  useEffect(() => {
    if (initialVideoId && videos.length > 0 && isReadyToScroll.current) {
      const index = videos.findIndex(v => v.id === initialVideoId);
      if (index !== -1) {
        setCurrentVisibleIndex(index);
        setActiveVideoId(initialVideoId);

        const timer = setTimeout(() => {
          if (flatListRef.current) {
            try {
              flatListRef.current.scrollToIndex({
                index,
                animated: false
              });
              navigation.setParams({ initialVideoId: null });
            } catch (e) {
              console.warn('Scroll failed:', e);
            }
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [initialVideoId, videos, navigation]);

  const getItemLayout = useCallback((data, index) => ({
    length: FEED_HEIGHT,
    offset: FEED_HEIGHT * index,
    index,
  }), []);

  const onScrollToIndexFailed = useCallback((info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  useEffect(() => {
    setUserPaused(false);
  }, [currentVisibleIndex, activeVideoId]);

  const handleLike = useCallback(async (videoId) => {
    let previousVideos;
    setVideos(prev => {
      previousVideos = prev;
      return prev.map(v => {
        if (v.id === videoId) {
          const isLiked = !v.isLiked;
          const currentLikesStr = v.likes.toString();
          let numericLikes = parseFloat(currentLikesStr);
          if (currentLikesStr.includes('K')) {
            numericLikes = numericLikes * 1000;
          }
          const newLikes = isLiked ? numericLikes + 1 : numericLikes - 1;
          const newLikesStr = newLikes >= 1000 ? (newLikes / 1000).toFixed(1) + 'K' : newLikes.toString();

          return {
            ...v,
            likes: newLikesStr,
            isLiked,
          };
        }
        return v;
      });
    });

    try {
      await dbService.likeVideo(videoId);
    } catch (err) {
      console.error('Like error:', err);
      if (previousVideos) setVideos(previousVideos);
      Alert.alert('Erreur', 'Impossible de liker la vidéo.');
    }
  }, []);

  const handleVideoTap = useCallback((videoId) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      lastTapRef.current = 0;
      handleLike(videoId);
      return;
    }

    lastTapRef.current = now;
    setTimeout(() => {
      if (lastTapRef.current !== now) return;
      lastTapRef.current = 0;
      setUserPaused((prev) => !prev);
    }, DOUBLE_PRESS_DELAY);
  }, [handleLike]);

  const handleShare = useCallback(async (video) => {
    try {
      const result = await Share.share({
        message: `Regarde cette vidéo sur Afro Vibe !`,
        url: video.videoUrl,
        title: 'Partager la vidéo',
      });

      if (result.action === Share.sharedAction) {
        await dbService.shareVideo(video.id);
        setVideos(prev => prev.map(v => {
          if (v.id === video.id) {
            const currentSharesStr = v.shares.toString();
            let numericShares = parseFloat(currentSharesStr);
            if (currentSharesStr.includes('K')) {
              numericShares = numericShares * 1000;
            }
            const newShares = numericShares + 1;
            const newSharesStr = newShares >= 1000 ? (newShares / 1000).toFixed(1) + 'K' : newShares.toString();

            return {
              ...v,
              shares: newSharesStr,
            };
          }
          return v;
        }));
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('Erreur', 'Impossible de partager la vidéo.');
    }
  }, []);

  const handleBookmark = useCallback(async (video) => {
    try {
      const result = await dbService.toggleBookmark(video.id);
      setVideos(prev => prev.map(v =>
        v.id === video.id ? { ...v, isBookmarked: result.bookmarked } : v,
      ));
      Alert.alert('Favoris', result.bookmarked ? 'Vidéo sauvegardée.' : 'Retirée des favoris.');
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  }, []);

  const handleSaveOffline = useCallback(async (video) => {
    try {
      await offlineService.saveVideoOffline({
        id: video.id,
        videoUri: video.videoUrl,
        caption: video.caption,
        category: video.category,
        audioName: video.audioName,
      });
      Alert.alert('Hors ligne', 'Vidéo sauvegardée pour lecture hors ligne.');
    } catch (err) {
      console.error('Offline save error:', err);
    }
  }, []);

  const handleFollowCreator = useCallback(async (creatorId) => {
    let previousVideos;
    setVideos(prev => {
      previousVideos = prev;
      return prev.map(v => {
        if (v.user.uid === creatorId) {
          return {
            ...v,
            user: { ...v.user, isFollowing: true }
          };
        }
        return v;
      });
    });

    try {
      await dbService.followUser(creatorId);
    } catch (err) {
      console.error('Follow error:', err);
      if (previousVideos) setVideos(previousVideos);
      Alert.alert('Erreur', "Impossible de s'abonner au créateur.");
    }
  }, []);

  const openComments = useCallback((videoId) => {
    setActiveVideoId(videoId);
    setCommentsVisible(true);
  }, []);

  const renderVideoItem = useCallback(({ item, index }) => (
    <VideoItem
      item={item}
      index={index}
      isFocused={isFocused}
      currentVisibleIndex={currentVisibleIndex}
      commentsVisible={commentsVisible}
      userPaused={userPaused}
      handleVideoTap={handleVideoTap}
      navigation={navigation}
      handleFollowCreator={handleFollowCreator}
      handleLike={handleLike}
      openComments={openComments}
      handleShare={handleShare}
      handleBookmark={handleBookmark}
      handleSaveOffline={handleSaveOffline}
    />
  ), [isFocused, currentVisibleIndex, commentsVisible, userPaused, handleVideoTap, navigation, handleFollowCreator, handleLike, openComments, handleShare, handleBookmark, handleSaveOffline]);

  const displayedVideos = React.useMemo(() => {
    if (activeTab === 'abonnements') {
      const myId = authService.getCurrentUser()?.uid;
      return videos.filter(
        (v) => v.user?.isFollowing || v.user?.uid === myId,
      );
    }
    return videos;
  }, [videos, activeTab]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      <View style={styles.topSelectorContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pourToi' && styles.activeTabBorder]}
          onPress={() => setActiveTab('pourToi')}
        >
          <Text style={[styles.tabText, activeTab === 'pourToi' && styles.activeTabText]}>
            Pour toi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'abonnements' && styles.activeTabBorder]}
          onPress={() => setActiveTab('abonnements')}
        >
          <Text style={[styles.tabText, activeTab === 'abonnements' && styles.activeTabText]}>
            Abonnements
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={(ref) => {
          flatListRef.current = ref;
          if (ref) isReadyToScroll.current = true;
        }}
        data={displayedVideos}
        renderItem={renderVideoItem}
        keyExtractor={item => item.id}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        style={styles.feedList}
        windowSize={2}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={100}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={
          activeTab === 'abonnements' ? (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyFeedText}>
                Abonnez-vous à des créateurs pour voir leurs vidéos ici.
              </Text>
            </View>
          ) : null
        }
      />

      <CommentsBottomSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        videoId={activeVideoId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topSelectorContainer: {
    position: 'absolute',
    top: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 100,
  },
  tabButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.sm,
  },
  activeTabBorder: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: COLORS.text,
  },
  feedList: {
    flex: 1,
  },
  emptyFeed: {
    height: FEED_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyFeedText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  videoContainer: {
    width: width,
    height: FEED_HEIGHT,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  bottomInfoContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    width: width * 0.7,
    zIndex: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIcon: {
    marginLeft: 4,
    display: 'flex',
  },
  caption: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  musicIcon: {
    marginRight: 6,
  },
  musicText: {
    fontSize: 11,
    color: COLORS.text,
    maxWidth: width * 0.5,
  },
  rightButtonsPanel: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.sm,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  creatorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  followBtn: {
    position: 'absolute',
    bottom: -6,
    left: 15,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  vinylOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginTop: SPACING.sm,
  },
  vinylInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

export default FeedScreen;
