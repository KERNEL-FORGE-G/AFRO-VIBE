// Video Player View Component wrapping react-native-video and react-native-youtube-iframe
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Text,
  Animated,
} from 'react-native';

import Video from 'react-native-video';
import YouTube from 'react-native-youtube-iframe';
import { COLORS } from '../styles/theme';
import SVGIcon from './SVGIcon';
import { configService } from '../services/apiService';

const FloatingHeart = ({ x, y, onComplete }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotateVal = useRef((Math.random() * 40 - 20) + 'deg').current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  }, [scale, translateY, opacity, onComplete]);

  return (
    <Animated.View
      style={[
        styles.floatingHeart,
        {
          left: x - 40,
          top: y - 40,
          transform: [
            { scale },
            { translateY },
            { rotate: rotateVal }
          ],
          opacity,
        }
      ]}
      pointerEvents="none"
    >
      <SVGIcon name="heart" size={80} color={COLORS.secondary} />
    </Animated.View>
  );
};

export const VideoPlayerView = ({
  videoUrl,
  paused: forcePaused = false,
  isMuted = false,
  thumbnail,
  onSingleTap,
  onDoubleTap,
  enableTapControls = true,
  showPauseIndicator = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [showPauseAnim, setShowPauseAnim] = useState(false);
  const pauseScale = useRef(new Animated.Value(0)).current;
  const pauseOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  const tapTimeoutRef = useRef(null);
  const wasForcePaused = useRef(forcePaused);

  const isPaused = forcePaused || userPaused;

  const playButtonScale = useRef(new Animated.Value(isPaused ? 1 : 0.7)).current;
  const playButtonOpacity = useRef(new Animated.Value(isPaused ? 1 : 0)).current;

  useEffect(() => {
    if (isPaused) {
      Animated.parallel([
        Animated.spring(playButtonScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(playButtonOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(playButtonScale, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(playButtonOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isPaused, playButtonScale, playButtonOpacity]);

  useEffect(() => {
    // If the component is force-paused from outside (e.g., screen lost focus or comment sheet opened),
    // we reset the local userPaused state to false, so that when it's unpaused from outside,
    // it starts playing immediately.
    if (forcePaused && !wasForcePaused.current) {
      setUserPaused(false);
    }
    wasForcePaused.current = forcePaused;
  }, [forcePaused]);

  useEffect(() => () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
  }, []);

  const fixedUrl = useMemo(() => configService.fixMediaUrl(videoUrl), [videoUrl]);
  const fixedThumbnail = useMemo(() => configService.fixMediaUrl(thumbnail), [thumbnail]);

  const isYouTube = useMemo(
    () => videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')),
    [videoUrl],
  );

  const youtubeId = useMemo(() => {
    if (!isYouTube) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  }, [videoUrl, isYouTube]);

  const triggerPauseAnim = useCallback((willPause) => {
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
    ]).start(() => setShowPauseAnim(false));
  }, [pauseOpacity, pauseScale]);

  const handleTap = useCallback((event) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 280;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      lastTap.current = 0;
      const { locationX, locationY } = event.nativeEvent;
      // Add a floating heart at the coordinates
      setHearts((prev) => [
        ...prev,
        { id: now, x: locationX, y: locationY },
      ]);
      onDoubleTap?.();
      return;
    }

    lastTap.current = now;
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    tapTimeoutRef.current = setTimeout(() => {
      if (lastTap.current !== now) return;
      lastTap.current = 0;
      tapTimeoutRef.current = null;

      // Toggle user pause state and trigger animation
      setUserPaused((prev) => {
        const next = !prev;
        triggerPauseAnim(next);
        onSingleTap?.(next);
        return next;
      });
    }, DOUBLE_PRESS_DELAY);
  }, [onDoubleTap, onSingleTap, triggerPauseAnim]);

  if (!videoUrl) {
    return (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasError ? (
        <View style={styles.fallbackContainer}>
          <Image
            source={require('../assets/images/logo_main.jpg')}
            style={styles.fallbackImage}
            resizeMode="cover"
          />
          <View style={styles.errorOverlay}>
            <SVGIcon name="music" size={48} color={COLORS.primary} />
            <Text style={styles.errorText}>Lecture indisponible</Text>
          </View>
        </View>
      ) : isYouTube && youtubeId ? (
        <View style={styles.youtubeContainer}>
          <YouTube
            videoId={youtubeId}
            height={styles.videoPlayer.height}
            play={!isPaused}
            mute={isMuted}
            onReady={() => setLoading(false)}
            onError={() => setHasError(true)}
            onChangeState={(state) => setLoading(state === 'buffering')}
          />
        </View>
      ) : (
        <Video
          source={{ uri: fixedUrl }}
          poster={fixedThumbnail}
          posterResizeMode="cover"
          style={styles.videoPlayer}
          resizeMode="cover"
          repeat
          paused={isPaused}
          muted={isMuted}
          playInBackground={false}
          playWhenInactive={false}
          controls={false}
          onLoadStart={() => {
            setLoading(true);
            setHasError(false);
          }}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
          onLoad={() => setLoading(false)}
          onError={(err) => {
            console.warn('[VideoPlayer] Erreur:', err?.error, fixedUrl);
            setHasError(true);
            setLoading(false);
          }}
          ignoreSilentSwitch="obey"
          automaticallyWaitsToMinimizeStalling={true}
          bufferConfig={{
            minBufferMs: 1000,
            maxBufferMs: 20000,
            bufferForPlaybackMs: 500,
            bufferForPlaybackAfterRebufferMs: 1000,
          }}
          preferredForwardBufferDuration={5}
          preventsDisplaySleepDuringVideoPlayback={true}
          progressUpdateInterval={1000.0}
        />
      )}

      {loading && (
        <View style={styles.loaderContainer} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {hearts.map((heart) => (
        <FloatingHeart
          key={heart.id}
          x={heart.x}
          y={heart.y}
          onComplete={() => {
            setHearts((prev) => prev.filter((h) => h.id !== heart.id));
          }}
        />
      ))}

      {showPauseAnim && (
        <View style={styles.feedbackContainer} pointerEvents="none">
          <Animated.View style={{ transform: [{ scale: pauseScale }], opacity: pauseOpacity }}>
            <SVGIcon
              name={isPaused ? 'play' : 'pause'}
              size={70}
              color="rgba(255,255,255,0.85)"
            />
          </Animated.View>
        </View>
      )}

      {(enableTapControls || showPauseIndicator) && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: playButtonOpacity,
              transform: [{ scale: playButtonScale }],
            }
          ]}
          pointerEvents="none"
        >
          <SVGIcon name="play" size={64} color="rgba(255,255,255,0.85)" />
        </Animated.View>
      )}

      {enableTapControls && (
        <Pressable style={styles.tapLayer} onPress={handleTap} accessibilityRole="button" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
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
    ...StyleSheet.absoluteFillObject,
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  feedbackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 40,
    padding: 16,
  },
  floatingHeart: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});

export default VideoPlayerView;
