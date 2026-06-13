import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from './SVGIcon';

const { width } = Dimensions.get('window');

export const Toast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'info' | 'error' | 'success'
  const translateY = useRef(new Animated.Value(-100)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'info') => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);

      Animated.spring(translateY, {
        toValue: 50,
        useNativeDriver: true,
        friction: 8,
        tension: 40
      }).start();

      setTimeout(() => {
        hide();
      }, 4000);
    }
  }));

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true
    }).start(() => setVisible(false));
  }, [translateY]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return 'close';
      case 'success': return 'verified';
      default: return 'music';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#E74C3C';
      case 'success': return '#2ECC71';
      default: return COLORS.primary;
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ translateY }],
        backgroundColor: getBackgroundColor()
      }
    ]}>
      <SVGIcon name={getIcon()} size={20} color={COLORS.text} />
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  }
});

export default Toast;
