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
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';
import YouTube from 'react-native-youtube-iframe';
import { COLORS } from '../styles/theme';
import SVGIcon from './SVGIcon';
import { configService } from '../services/apiService';

export const VideoPlayerView = ({
  videoUrl,
  paused: forcePaused = false,
  isMuted = false,
  thumbnail,
  onSingleTap,
  onDoubleTap,
  onShare,
  enableTapControls = true,
  showPauseIndicator = false,
  metadata = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showPauseAnim, setShowPauseAnim] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const pauseScale = useRef(new Animated.Value(0)).current;
  const pauseOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  const tapTimeoutRef = useRef(null);
  const wasForcePaused = useRef(forcePaused);

  const isPaused = forcePaused || userPaused;

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

  const filters = useMemo(() => ([
    { id: 'original', overlay: 'transparent' },
    { id: 'sunset', overlay: 'rgba(255, 94, 0, 0.18)' },
    { id: 'royal', overlay: 'rgba(230, 0, 103, 0.18)' },
    { id: 'gold', overlay: 'rgba(255, 170, 0, 0.16)' },
    { id: 'cool', overlay: 'rgba(0, 176, 255, 0.14)' },
    { id: 'noir', overlay: 'rgba(6, 6, 8, 0.32)' },
    { id: 'vintage', overlay: 'rgba(121, 85, 72, 0.2)' },
  ]), []);

  const selectedFilter = useMemo(() => {
    if (!metadata?.filterId) return filters[0];
    return filters.find(f => f.id === metadata.filterId) || filters[0];
  }, [metadata, filters]);

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

  const handleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 280;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      lastTap.current = 0;
      setShowHeartAnim(true);
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.5, friction: 3, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setShowHeartAnim(false));
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
  }, [heartScale, onDoubleTap, onSingleTap, triggerPauseAnim]);

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
          resizeMode="contain"
          repeat
          paused={isPaused}
          muted={isMuted}
          rate={playbackRate}
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

      {/* Filter Overlay */}
      {selectedFilter && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: selectedFilter.overlay }
          ]}
        />
      )}

      {/* Stickers Overlay */}
      {metadata?.stickers && metadata.stickers.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {metadata.stickers.map((s, idx) => (
            <View
              key={idx}
              style={[
                styles.stickerContainer,
                { transform: [{ translateX: s.x }, { translateY: s.y }] }
              ]}
            >
              <Text style={styles.stickerEmoji}>{s.icon}</Text>
            </View>
          ))}
        </View>
      )}

      {loading && (
        <View style={styles.loaderContainer} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {showHeartAnim && (
        <View style={styles.feedbackContainer} pointerEvents="none">
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <SVGIcon name="heart" size={80} color={COLORS.secondary} />
          </Animated.View>
        </View>
      )}

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

      {(enableTapControls || showPauseIndicator) && isPaused && !showPauseAnim && (
        <View style={styles.feedbackContainer} pointerEvents="none">
          <View style={styles.playBadge}>
            <SVGIcon name="play" size={48} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      )}

      {enableTapControls && (
        <Pressable style={styles.tapLayer} onPress={handleTap} accessibilityRole="button" />
      )}

      {/* Manual Controls Overlay */}
      <View style={styles.controlsOverlay}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            const rates = [0.5, 1.0, 1.5, 2.0];
            const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
            setPlaybackRate(rates[nextIdx]);
          }}
        >
          <Text style={styles.controlText}>{playbackRate}x</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            setUserPaused(!userPaused);
            triggerPauseAnim(!userPaused);
            onSingleTap?.(!userPaused);
          }}
        >
          <SVGIcon name={isPaused ? "play" : "pause"} size={24} color={COLORS.text} />
        </TouchableOpacity>

        {onShare && (
          <TouchableOpacity style={styles.controlBtn} onPress={onShare}>
            <SVGIcon name="share" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>
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
    alignSelf: 'center',
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
  stickerContainer: {
    position: 'absolute',
    padding: 10,
  },
  stickerEmoji: {
    fontSize: 40,
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
  controlsOverlay: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    zIndex: 30,
    gap: 15,
    alignItems: 'center',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
