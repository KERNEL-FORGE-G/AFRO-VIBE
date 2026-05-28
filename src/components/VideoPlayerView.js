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

export const VideoPlayerView = ({ videoUrl, paused, isMuted = false, thumbnail }) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  const isYouTube = useMemo(() => {
    return videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  }, [videoUrl]);

  const youtubeId = useMemo(() => {
    if (!isYouTube) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }, [videoUrl, isYouTube]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
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
    } else {
      lastTap.current = now;
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
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
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
            source={{ uri: videoUrl }}
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
          <View style={styles.heartAnimContainer}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <SVGIcon name="heart" size={80} color={COLORS.secondary} />
            </Animated.View>
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
  heartAnimContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default VideoPlayerView;
