// Welcome Screen (Splash/Landing)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import TribalPattern from '../components/TribalPattern';
import SVGIcon from '../components/SVGIcon';

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Top Traditional Border */}
      <TribalPattern position="top" height={15} />

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => navigation.navigate('Settings')}
      >
        <SVGIcon name="settings" size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Main Circular Logo */}
        <View style={styles.logoOutline}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text Slogan */}
        <Text style={styles.appName}>AFRO VIBE</Text>
        <Text style={styles.slogan}>DANSE TA CULTURE</Text>

        {/* Button Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnTextPrimary}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.btnTextSecondary}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Traditional Border */}
      <TribalPattern position="bottom" height={15} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logoOutline: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 2,
    marginTop: SPACING.lg,
  },
  slogan: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 3,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.accent,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  btnTextPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  btnTextSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  settingsBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : (StatusBar.currentHeight || 0) + 15,
    right: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default WelcomeScreen;
