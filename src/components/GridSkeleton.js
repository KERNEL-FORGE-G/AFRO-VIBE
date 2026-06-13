import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Skeleton from './Skeleton';
import { SPACING, COLORS } from '../styles/theme';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

export const GridSkeleton = () => {
  return (
    <View style={styles.gridItem}>
      <Skeleton width="100%" height={180} borderRadius={12} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
      <View style={styles.footer}>
        <Skeleton width="80%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
        <View style={styles.row}>
          <Skeleton width={20} height={20} borderRadius={10} style={{ marginRight: 6 }} />
          <Skeleton width="50%" height={10} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  footer: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default GridSkeleton;
