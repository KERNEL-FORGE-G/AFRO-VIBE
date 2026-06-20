import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../styles/theme';

export const Skeleton = ({ width, height, borderRadius = 4, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const w = typeof width === 'number' ? width : 150;

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-w, w],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [
              { translateX },
              { skewX: '-20deg' }
            ],
            height: '100%',
            width: w * 0.6,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default Skeleton;
