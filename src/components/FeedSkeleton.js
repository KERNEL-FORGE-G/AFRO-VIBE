import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Skeleton from './Skeleton';
import { SPACING } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export const FeedSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Simulation de l'info en bas à gauche */}
      <View style={styles.bottomInfo}>
        <Skeleton width={120} height={15} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width={150} height={12} borderRadius={4} />
      </View>

      {/* Simulation des boutons à droite */}
      <View style={styles.rightButtons}>
        <Skeleton width={46} height={46} borderRadius={23} style={{ marginBottom: 25 }} />
        <Skeleton width={35} height={35} borderRadius={18} style={{ marginBottom: 20 }} />
        <Skeleton width={35} height={35} borderRadius={18} style={{ marginBottom: 20 }} />
        <Skeleton width={35} height={35} borderRadius={18} style={{ marginBottom: 20 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height - 60,
    backgroundColor: '#000',
    position: 'relative',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  rightButtons: {
    position: 'absolute',
    bottom: 40,
    right: 15,
    alignItems: 'center',
  },
});

export default FeedSkeleton;
