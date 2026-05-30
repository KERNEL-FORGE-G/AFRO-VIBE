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
  AppState
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { dbService } from '../services/apiService';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

export const CameraScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState('off');
  const [cameraType, setCameraType] = useState('back');
  
  const camera = useRef(null);

  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);
  
  const device = useCameraDevice(cameraType);
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();

  const speeds = ['0.3x', '0.5x', '1x', '2x', '3x'];

  const isCameraActive = isFocused && appState === 'active' && hasCameraPermission && hasMicPermission;



  const handleRecord = async () => {
    if (recording) {
      if (camera.current) {
        await camera.current.stopRecording();
      }
      setRecording(false);
    } else {
      try {
        if (!camera.current) {
          console.error('Camera ref is null');
          return;
        }
        setRecording(true);
        
        camera.current.startRecording({
          flash: flash === 'on' ? 'on' : 'off',
          onRecordingFinished: (video) => {
            console.log('Recording finished:', video.path);
            setRecording(false);
            setLoading(false);
            navigation.navigate('VideoEdit', { videoUri: video.path });
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
            setRecording(false);
            setLoading(false);
            Alert.alert('Erreur', 'L\'enregistrement s\'est arrêté.');
          }
        });
      } catch (e) {
        console.error('Start recording error:', e);
        setRecording(false);
        setLoading(false);
      }
    }
  };

  const handleUpload = async () => {
    try {
      const result = await launchImageLibrary({ 
        mediaType: 'video',
        quality: 0.8,
        selectionLimit: 1
      });
      
      if (result.didCancel || !result.assets || result.assets.length === 0) return;
      
      const videoUri = result.assets[0].uri;
      console.log('File selected for upload:', videoUri);
      
      // Navigate to edit screen instead of immediate upload
      navigation.navigate('VideoEdit', { videoUri });
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Erreur', 'Impossible de téléverser la vidéo.');
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  if (!hasCameraPermission || !hasMicPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>L'accès à la caméra et au microphone est requis pour cette fonctionnalité.</Text>
        {!hasCameraPermission && (
          <TouchableOpacity style={styles.permissionBtn} onPress={requestCameraPermission}>
            <Text style={styles.permissionBtnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        )}
        {!hasMicPermission && (
          <TouchableOpacity style={[styles.permissionBtn, {marginTop: 10}]} onPress={requestMicPermission}>
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

      {/* Main Camera HUD View */}
      <View style={styles.cameraView}>
        {/* Real Camera Preview */}
        {isCameraActive && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            video={true}
            audio={hasMicPermission}
          />
        )}

        {/* Top Controls Overlay */}
        <View style={styles.topControlOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('Accueil')}>
            <SVGIcon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.musicSelectBtn}>
            <SVGIcon name="music" size={14} color={COLORS.text} style={styles.musicIcon} />
            <Text style={styles.musicSelectText}>Ajouter un son</Text>
          </TouchableOpacity>
          <View style={styles.flexEmpty} />
        </View>

        {/* Right side controls panel */}
        <View style={styles.rightSideControls}>
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
        </View>

        {/* Center Loading */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Publication de votre Afro Vibe...</Text>
          </View>
        )}

        {/* Bottom Recording Control Board */}
        <View style={styles.bottomControlBoard}>
          
          {/* Speed Selector */}
          <View style={styles.speedSelectorContainer}>
            {speeds.map(s => {
              const isActive = s === speed;
              return (
                <TouchableOpacity 
                  key={s}
                  style={[styles.speedOption, isActive && styles.speedOptionActive]}
                  onPress={() => setSpeed(s)}
                >
                  <Text style={[styles.speedText, isActive && styles.speedTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Record Row */}
          <View style={styles.recordRow}>
            {/* Effects Button */}
            <TouchableOpacity style={styles.accessoryBtn}>
              <View style={styles.effectIconWrapper}>
                <SVGIcon name="adinkra1" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.accessoryText}>Effets</Text>
            </TouchableOpacity>

            {/* Main Red Circle Record Button */}
            <TouchableOpacity 
              style={[
                styles.recordBtnOuter,
                recording && styles.recordBtnOuterActive
              ]}
              onPress={handleRecord}
              disabled={loading}
            >
              <View style={[
                styles.recordBtnInner,
                recording && styles.recordBtnInnerActive
              ]} />
            </TouchableOpacity>

            {/* Upload Gallery Button */}
            <TouchableOpacity style={styles.accessoryBtn} onPress={handleUpload}>
              <View style={styles.uploadIconWrapper}>
                <SVGIcon name="share" size={20} color={COLORS.text} />
              </View>
              <Text style={styles.accessoryText}>Téléverser</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Tabs Selection */}
          <View style={styles.cameraModesContainer}>
            <Text style={styles.modeTextActive}>Appareil</Text>
            <Text style={styles.modeText}>Modèles</Text>
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
    width: 32, // Balance for back button
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
    backgroundColor: COLORS.secondary, // red/pink indicator
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
