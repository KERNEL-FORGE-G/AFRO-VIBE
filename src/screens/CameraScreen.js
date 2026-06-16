// Camera & Publication Screen (Plus) - TEMPORARILY DISABLED
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  AppState,
  Animated
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
// import * as VisionCamera from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';

export const CameraScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

  const handleUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const mediaUri = result.assets[0].uri;
      console.log('File selected for upload:', mediaUri);
      navigation.navigate('VideoEdit', { mediaUri, mediaType: 'video' });
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Erreur', 'Impossible de charger le media.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      <View style={styles.cameraView}>
        <View style={styles.topControlOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('Accueil')}>
            <SVGIcon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
           <SVGIcon name="camera" size={64} color={COLORS.primary} />
           <Text style={styles.disabledText}>La caméra est temporairement désactivée pour maintenance.</Text>
           <Text style={styles.subText}>Vous pouvez toujours importer une vidéo depuis votre galerie.</Text>
           
           <TouchableOpacity style={styles.uploadLargeBtn} onPress={handleUpload}>
              <SVGIcon name="share" size={24} color={COLORS.text} />
              <Text style={styles.uploadBtnText}>Importer de la galerie</Text>
           </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Publication de votre Afro Vibe...</Text>
          </View>
        )}
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
  cameraView: {
    flex: 1,
    backgroundColor: '#0F0615',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  disabledText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  uploadLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 30,
  },
  uploadBtnText: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  topControlOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    zIndex: 10,
  },
  closeBtn: {
    padding: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19, 9, 27, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: SPACING.md,
  },
});

export default CameraScreen;