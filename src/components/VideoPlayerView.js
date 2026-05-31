// Video Player View Component wrapping react-native-video and react-native-youtube-iframe
import React, { useState, useRef, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableWithoutFeedback,
  Image,
  Text,
  Animated
} from 'react-native';
import Video from 'react-native-video';
import YouTube from 'react-native-youtube-iframe';
import { COLORS } from '../styles/theme';
import SVGIcon from './SVGIcon';
import { configService } from '../services/apiService';

export const VideoPlayerView = ({ 
  videoUrl, 
  paused, 
  isMuted = false, 
  thumbnail, 
  onSingleTap, 
  onDoubleTap,
  showStaticPlay = false 
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showPauseAnim, setShowPauseAnim] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const pauseScale = useRef(new Animated.Value(0)).current;
  const pauseOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  const fixedUrl = useMemo(() => configService.fixMediaUrl(videoUrl), [videoUrl]);
  const fixedThumbnail = useMemo(() => configService.fixMediaUrl(thumbnail), [thumbnail]);
  
  const isYouTube = useMemo(() => {
    return videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  }, [videoUrl]);
  const youtubeId = useMemo(() => {
    if (!isYouTube) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }, [videoUrl, isYouTube]);

  const triggerPauseAnim = () => {
    setShowPauseAnim(true);
    pauseScale.setValue(0);
    pauseOpacity.setValue(1);
    
    Animated.parallel([
      Animated.spring(pauseScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(pauseOpacity, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPauseAnim(false);
    });
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    console.log('[VideoPlayer] Tap detected, interval:', now - lastTap.current);

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Trigger like animation
      setShowHeartAnim(true);
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.5,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeartAnim(false);
      });
      if (onDoubleTap) onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now && onSingleTap) {
          triggerPauseAnim();
          onSingleTap();
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const onBuffer = ({ isBuffering }) => {
    setLoading(isBuffering);
  };

  const onLoad = () => {
    setLoading(false);
  };

  const onError = (err) => {
    console.warn('[VideoPlayer] Playback error:', err, 'URL:', videoUrl);
    setHasError(true);
    setLoading(false);
  };

  if (!videoUrl) {
    return (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        {hasError ? (
          // Fallback view if the video file or player errors out
          <View style={styles.fallbackContainer}>
            <Image 
              source={require('../assets/images/logo_main.jpg')} 
              style={styles.fallbackImage}
              resizeMode="cover"
            />
            <View style={styles.errorOverlay}>
              <SVGIcon name="music" size={48} color={COLORS.primary} />
              <Text style={styles.errorText}>Lecture Vibe en cours...</Text>
            </View>
          </View>
        ) : isYouTube && youtubeId ? (
          <View style={styles.youtubeContainer}>
            <YouTube
              videoId={youtubeId}
              height={styles.videoPlayer.height}
              play={!paused}
              mute={isMuted}
              onReady={() => setLoading(false)}
              onError={() => setHasError(true)}
              onChangeState={(state) => {
                if (state === 'buffering') setLoading(true);
                else setLoading(false);
              }}
            />
          </View>
        ) : (
          <Video
            //source={{ uri: videoUrl }}
            source={{ uri: fixedUrl }}
            poster={fixedThumbnail}
            posterResizeMode="cover"
            style={styles.videoPlayer}
            resizeMode="cover"
            repeat={true}
            paused={paused}
            muted={isMuted}
            playInBackground={false}
            playWhenInactive={false}
            onBuffer={onBuffer}
            onLoad={onLoad}
            onError={onError}
            ignoreSilentSwitch="obey"
          />
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {/* Floating Heart Animation on Double Tap */}
        {showHeartAnim && (
          <View style={styles.feedbackContainer}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <SVGIcon name="heart" size={80} color={COLORS.secondary} />
            </Animated.View>
          </View>
        )}

        {/* Play/Pause Feedback Animation on Single Tap */}
        {showPauseAnim && (
          <View style={styles.feedbackContainer}>
            <Animated.View 
              style={{ 
                transform: [{ scale: pauseScale }],
                opacity: pauseOpacity 
              }}
            >
              <SVGIcon 
                name={paused ? "play" : "pause"} 
                size={70} 
                color="rgba(255,255,255,0.8)" 
              />
            </Animated.View>
          </View>
        )}

        {/* Static Play Icon when paused and not animating */}
        {paused && !showPauseAnim && (
          <View style={styles.feedbackContainer} pointerEvents="none">
            <SVGIcon name="play" size={60} color="rgba(255,255,255,0.4)" />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  youtubeContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  errorOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default VideoPlayerView;
