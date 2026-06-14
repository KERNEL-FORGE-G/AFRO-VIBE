import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Image } from 'react-native';
import TribalPattern from './TribalPattern';
import { COLORS, SPACING } from '../styles/theme';

export const LoadingScreen = ({
  title = 'Afro Vibe',
  subtitle = 'Chargement de votre experience...',
}) => {
  return (
    <View style={styles.container}>
      <TribalPattern position="top" height={10} />
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Image source={require('../assets/images/logo_main.jpg')} style={styles.logo} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotSecondary]} />
        </View>
      </View>
      <TribalPattern position="bottom" height={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoWrap: {
    width: 94,
    height: 94,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
    fontSize: 14,
    maxWidth: 260,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  dotSecondary: {
    backgroundColor: COLORS.secondary,
  },
});

export default LoadingScreen;
