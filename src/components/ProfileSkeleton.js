import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Skeleton from './Skeleton';
import { SPACING, COLORS } from '../styles/theme';

const { width } = Dimensions.get('window');

export const ProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <Skeleton width={96} height={96} borderRadius={48} style={{ marginBottom: SPACING.md }} />
        <Skeleton width={120} height={20} borderRadius={4} style={{ marginBottom: SPACING.lg }} />

        {/* Stats */}
        <View style={styles.statsRow}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.statItem}>
              <Skeleton width={40} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={60} height={10} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Skeleton width="70%" height={40} borderRadius={6} style={{ marginRight: SPACING.sm }} />
          <Skeleton width={40} height={40} borderRadius={6} />
        </View>

        {/* Bio */}
        <Skeleton width="80%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={12} borderRadius={4} style={{ marginBottom: SPACING.xl }} />

        {/* Tabs */}
        <View style={styles.tabs}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.tabItem}>
              <Skeleton width={24} height={24} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>

      {/* Grid items */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
          <View key={i} style={styles.gridItem}>
             <Skeleton width="100%" height="100%" borderRadius={0} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { alignItems: 'center', paddingTop: SPACING.xl },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  statItem: { alignItems: 'center' },
  actionsRow: { flexDirection: 'row', width: '100%', paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl, justifyContent: 'center' },
  tabs: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: COLORS.border, height: 44 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: width / 3, height: (width / 3) * 1.3, padding: 1 },
});

export default ProfileSkeleton;
