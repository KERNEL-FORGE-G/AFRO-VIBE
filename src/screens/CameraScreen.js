// Camera & Publication Screen (Plus)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Alert,
  AppState,
  Animated
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import * as VisionCamera from 'react-native-vision-camera';
const {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} = VisionCamera;
import { useIsFocused } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';

const { width } = Dimensions.get('window');

export const CameraScreen = ({ navigation }) => {
  // Check if library is loaded
  if (!VisionCamera || !useCameraDevice) {
    console.error('VisionCamera library not correctly loaded. Check native logs.');
  }

  const [recording, setRecording] = useState(false);
  const [captureMode, setCaptureMode] = useState('video');
  const [speed, setSpeed] = useState('1x');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState('off');
  const [cameraType, setCameraType] = useState('back');
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

  const camera = useRef(null);
  const recorderRef = useRef(null);

  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);

  const device = useCameraDevice(cameraType);
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();

  const speeds = ['0.3x', '0.5x', '1x', '2x', '3x'];
  const requiresMic = captureMode === 'video';

  const isCameraActive =
    isFocused &&
    appState === 'active' &&
    hasCameraPermission &&
    !!device &&
    (!requiresMic || hasMicPermission);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    return () => {
      recorderRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (captureMode === 'video' && !hasMicPermission) {
      requestMicPermission();
    }
  }, [captureMode, hasMicPermission, requestMicPermission]);

  const handleCapture = async () => {
    if (captureMode === 'photo') {
      try {
        if (!camera.current) {
          Alert.alert('Erreur', 'La caméra n\'est pas encore prête.');
          return;
        }
        setLoading(true);
        const photo = await camera.current.takePhoto({
          flash: flash === 'on' ? 'on' : 'off',
        });
        const mediaUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
        navigation.navigate('VideoEdit', { mediaUri, mediaType: 'photo' });
      } catch (e) {
        console.error('Photo capture error:', e);
        Alert.alert('Erreur', 'Impossible de prendre la photo.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (recording) {
      try {
        await camera.current?.stopRecording();
      } catch (e) {
        console.error('Stop recording error:', e);
        Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement.');
      } finally {
        setRecording(false);
      }
      return;
    }

    try {
      if (!camera.current) {
        Alert.alert('Erreur', 'La caméra n\'est pas prête pour l\'enregistrement.');
        return;
      }

      setRecording(true);
      camera.current.startRecording({
        flash: flash === 'on' ? 'on' : 'off',
        onRecordingFinished: (video) => {
          console.log('Recording finished:', video.path);
          setRecording(false);
          setLoading(false);
          recorderRef.current = null;
          const mediaUri = video.path.startsWith('file://') ? video.path : `file://${video.path}`;
          navigation.navigate('VideoEdit', { mediaUri, mediaType: 'video' });
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setRecording(false);
          setLoading(false);
          recorderRef.current = null;
          Alert.alert('Erreur', 'L\'enregistrement s\'est arrêté.');
        },
      });
    } catch (e) {
      console.error('Start recording error:', e);
      setRecording(false);
      setLoading(false);
      recorderRef.current = null;
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  };

  const handleUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: captureMode,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const mediaUri = result.assets[0].uri;
      console.log('File selected for upload:', mediaUri);
      navigation.navigate('VideoEdit', { mediaUri, mediaType: captureMode });
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Erreur', 'Impossible de charger le media.');
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  if (!hasCameraPermission || (requiresMic && !hasMicPermission)) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {requiresMic
            ? 'L\'accès à la caméra et au microphone est requis pour enregistrer une vidéo.'
            : 'L\'accès à la caméra est requis pour prendre une photo.'}
        </Text>
        {!hasCameraPermission && (
          <TouchableOpacity style={styles.permissionBtn} onPress={requestCameraPermission}>
            <Text style={styles.permissionBtnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        )}
        {requiresMic && !hasMicPermission && (
          <TouchableOpacity
            style={[styles.permissionBtn, { marginTop: 10 }]}
            onPress={requestMicPermission}
          >
            <Text style={styles.permissionBtnText}>Autoriser le micro</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionText}>Chargement de la caméra...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      <View style={styles.cameraView}>
        {isCameraActive && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isCameraActive}
            photo={captureMode === 'photo'}
            video={captureMode === 'video'}
            audio={captureMode === 'video' && hasMicPermission}
            torch={flash === 'on' ? 'on' : 'off'}
          />
        )}

        <View style={styles.topControlOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('Accueil')}>
            <SVGIcon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.musicSelectBtn}>
            <SVGIcon name="music" size={14} color={COLORS.text} style={styles.musicIcon} />
            <Text style={styles.musicSelectText}>
              {captureMode === 'video' ? 'Ajouter un son' : 'Portrait Afro Vibe'}
            </Text>
          </TouchableOpacity>
          <View style={styles.flexEmpty} />
        </View>

        <Animated.View style={[styles.rightSideControls, { opacity: entranceAnim, transform: [{ translateX: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
          <TouchableOpacity style={styles.hudControl} onPress={toggleCamera}>
            <SVGIcon name="settings" size={24} color={COLORS.text} />
            <Text style={styles.hudLabel}>Retourner</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hudControl}>
            <SVGIcon name="speed" size={24} color={COLORS.text} />
            <Text style={styles.hudLabel}>Vitesse</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hudControl}>
            <SVGIcon name="beauty" size={24} color={COLORS.text} />
            <Text style={styles.hudLabel}>Beauté</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hudControl}>
            <SVGIcon name="timer" size={24} color={COLORS.text} />
            <Text style={styles.hudLabel}>Minuteur</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hudControl} onPress={toggleFlash}>
            <SVGIcon name="flash" size={24} color={flash === 'on' ? COLORS.accent : COLORS.text} />
            <Text style={styles.hudLabel}>Flash</Text>
          </TouchableOpacity>
        </Animated.View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Publication de votre Afro Vibe...</Text>
          </View>
        )}

        <View style={styles.bottomControlBoard}>
          <View style={styles.speedSelectorContainer}>
            {speeds.map((s) => {
              const isActive = s === speed;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.speedOption, isActive && styles.speedOptionActive]}
                  onPress={() => setSpeed(s)}
                >
                  <Text style={[styles.speedText, isActive && styles.speedTextActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.recordRow}>
            <TouchableOpacity style={styles.accessoryBtn}>
              <View style={styles.effectIconWrapper}>
                <SVGIcon name="adinkra1" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.accessoryText}>Effets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recordBtnOuter, recording && styles.recordBtnOuterActive]}
              onPress={handleCapture}
              disabled={loading}
            >
              <View style={[styles.recordBtnInner, recording && styles.recordBtnInnerActive]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accessoryBtn} onPress={handleUpload}>
              <View style={styles.uploadIconWrapper}>
                <SVGIcon name="share" size={20} color={COLORS.text} />
              </View>
              <Text style={styles.accessoryText}>
                {captureMode === 'video' ? 'Importer vidéo' : 'Importer photo'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cameraModesContainer}>
            <TouchableOpacity onPress={() => setCaptureMode('photo')}>
              <Text style={captureMode === 'photo' ? styles.modeTextActive : styles.modeText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCaptureMode('video')}>
              <Text style={captureMode === 'video' ? styles.modeTextActive : styles.modeText}>Vidéo</Text>
            </TouchableOpacity>
            <Text style={styles.modeText}>LIVE</Text>
          </View>
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
  cameraView: {
    flex: 1,
    backgroundColor: '#0F0615',
    justifyContent: 'space-between',
    position: 'relative',
  },
  topControlOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    zIndex: 10,
  },
  closeBtn: {
    padding: 6,
  },
  musicSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  musicIcon: {
    marginRight: 6,
  },
  musicSelectText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  flexEmpty: {
    width: 32,
  },
  rightSideControls: {
    position: 'absolute',
    top: 100,
    right: SPACING.sm,
    alignItems: 'center',
    zIndex: 10,
  },
  hudControl: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  hudLabel: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  bottomControlBoard: {
    paddingBottom: SPACING.md,
    zIndex: 10,
  },
  speedSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'center',
    borderRadius: 15,
    padding: 2,
    marginBottom: SPACING.lg,
  },
  speedOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 13,
  },
  speedOptionActive: {
    backgroundColor: COLORS.text,
  },
  speedText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  speedTextActive: {
    color: COLORS.background,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  accessoryBtn: {
    alignItems: 'center',
  },
  effectIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoryText: {
    color: COLORS.text,
    fontSize: 11,
    marginTop: 4,
  },
  recordBtnOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  recordBtnOuterActive: {
    borderColor: COLORS.secondary,
  },
  recordBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.secondary,
  },
  recordBtnInnerActive: {
    transform: [{ scale: 0.8 }],
    borderRadius: 6,
  },
  cameraModesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  modeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: SPACING.md,
  },
  modeTextActive: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  permissionBtnText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default CameraScreen;
