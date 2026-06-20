// Camera & Publication Screen (Plus)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Animated,
  Linking,
  Platform
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';

export const CameraScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [flash, setFlash] = useState('off');
  const [cameraPosition, setCameraPosition] = useState('back');

  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  const device = useCameraDevice(cameraPosition);
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();

  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

  useEffect(() => {
    (async () => {
      if (!hasCameraPermission) await requestCameraPermission();
      if (!hasMicrophonePermission) await requestMicrophonePermission();
    })();
  }, [hasCameraPermission, hasMicrophonePermission, requestCameraPermission, requestMicrophonePermission]);

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
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          setIsRecording(false);
          const mediaUri = Platform.OS === 'android' && !video.path.startsWith('file://')
            ? `file://${video.path}`
            : video.path;
          navigation.navigate('VideoEdit', { mediaUri, mediaType: 'video' });
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setIsRecording(false);
          Alert.alert('Erreur', 'L\'enregistrement a échoué.');
        },
        flash: flash,
      });
    } catch (e) {
      console.error('Start recording error:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    try {
      await cameraRef.current.stopRecording();
    } catch (e) {
      console.error('Stop recording error:', e);
    }
  };

  const toggleCamera = () => {
    setCameraPosition(prev => prev === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  if (!hasCameraPermission || !hasMicrophonePermission) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <SVGIcon name="camera" size={64} color={COLORS.primary} />
          <Text style={styles.disabledText}>Permissions requises</Text>
          <Text style={styles.subText}>Afro Vibe a besoin d'accéder à votre caméra et micro pour créer des vidéos.</Text>
          <TouchableOpacity style={styles.uploadLargeBtn} onPress={() => Linking.openSettings()}>
            <Text style={styles.uploadBtnText}>Ouvrir les paramètres</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        video={true}
        audio={true}
      />

      <View style={styles.overlay}>
        <View style={styles.topControlOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('MainTabs')}>
            <SVGIcon name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.sideControls}>
            <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
              <SVGIcon name="camera" size={24} color={COLORS.text} />
              <Text style={styles.controlText}>Retourner</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={toggleFlash}>
              <SVGIcon name={flash === 'on' ? 'sun' : 'moon'} size={24} color={COLORS.text} />
              <Text style={styles.controlText}>Flash</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handleUpload}>
            <View style={styles.galleryIcon}>
               <SVGIcon name="share" size={20} color={COLORS.text} />
            </View>
            <Text style={styles.galleryText}>Galerie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordingBtn]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={[styles.recordInner, isRecording && styles.recordingInner]} />
          </TouchableOpacity>

          <View style={styles.emptySpace} />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Traitement de votre Afro Vibe...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  topControlOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: StatusBar.currentHeight || 20,
  },
  sideControls: {
    alignItems: 'center',
  },
  controlBtn: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  controlText: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeBtn: {
    padding: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xl,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingBtn: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  recordInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
  },
  recordingInner: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  galleryBtn: {
    alignItems: 'center',
    width: 60,
  },
  galleryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  galleryText: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  emptySpace: {
    width: 60,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 30,
  },
  uploadBtnText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
