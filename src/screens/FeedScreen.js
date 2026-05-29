// Home Feed Screen (Accueil)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Easing,
  StatusBar,
  RefreshControl
} from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import VideoPlayerView from '../components/VideoPlayerView';
import CommentsBottomSheet from '../components/CommentsBottomSheet';
import { dbService } from '../services/apiService';

const { width, height } = Dimensions.get('window');
const BOTTOM_BAR_HEIGHT = 60; // Approximate bottom tab bar height
const FEED_HEIGHT = height - BOTTOM_BAR_HEIGHT;

export const FeedScreen = () => {
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('pourToi'); // 'pourToi' or 'abonnements'
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  // Reload videos when screen comes into focus (e.g. after upload)
  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, [])
  );

  const loadVideos = async () => {
    try {
      const list = await dbService.getVideos();
      console.log('DEBUG FRONTEND: Liste complète reçue:', JSON.stringify(list, null, 2));
      setVideos(list);
      if (list.length > 0 && !activeVideoId) {
        setActiveVideoId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading videos:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handleLike = async (videoId) => {
    try {
      await dbService.likeVideo(videoId);
      // Reload local visual state
      setVideos(prev => prev.map(v => {
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
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const openComments = (videoId) => {
    setActiveVideoId(videoId);
    setCommentsVisible(true);
  };

  // Track which item is currently visible
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

  // Spin animation for vinyl disk
  const SpinVinyl = ({ isPlaying }) => {
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
    }, [isPlaying]);

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
  };

  const renderVideoItem = ({ item, index }) => {
    const isPlaying = isFocused && index === currentVisibleIndex;
    
    return (
      <View style={styles.videoContainer}>
        {/* Fullscreen Video Player */}
        <VideoPlayerView 
          videoUrl={item.videoUrl} 
          paused={!isPlaying || commentsVisible} 
          thumbnail={item.thumbnail}
        />

        {/* Bottom Overlay Info */}
        <View style={styles.bottomInfoContainer}>
          <Text style={styles.username}>@{item.user.username}</Text>
          {item.user.isVerified && (
            <SVGIcon name="verified" size={14} style={styles.verifiedIcon} />
          )}
          <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>
          
          <View style={styles.musicContainer}>
            <SVGIcon name="music" size={14} color={COLORS.text} style={styles.musicIcon} />
            <Text style={styles.musicText} numberOfLines={1}>{item.audioName}</Text>
          </View>
        </View>

        {/* Right Side Buttons Panel */}
        <View style={styles.rightButtonsPanel}>
          {/* Creator Profile Bubble */}
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../assets/images/logo.jpg')}
              style={styles.creatorAvatar} 
            />
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Like Button */}
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

          {/* Comment Button */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => openComments(item.id)}
          >
            <SVGIcon name="comment" size={34} color={COLORS.text} />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.actionButton}>
            <SVGIcon name="share" size={32} color={COLORS.text} />
            <Text style={styles.actionText}>{item.shares}</Text>
          </TouchableOpacity>

          {/* Rotating Vinyl Record */}
          <SpinVinyl isPlaying={isPlaying && !commentsVisible} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      {/* Top Header Selector (Pour toi / Abonnements) */}
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

      {/* Vertical Video Feed */}
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={item => item.id}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.feedList}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      />

      {/* Comments Sheet Overlay */}
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
  videoContainer: {
    width: width,
    height: FEED_HEIGHT,
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
