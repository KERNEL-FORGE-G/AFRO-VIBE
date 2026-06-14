import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import { COLORS, SPACING } from '../styles/theme';
import { dbService } from '../services/apiService';
import { compressVideo } from '../utils/videoProcessor';

export const VideoEditScreen = ({ route, navigation }) => {
  const mediaUri = route.params?.mediaUri || route.params?.videoUri;
  const mediaType = route.params?.mediaType || 'video';
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Danse');
  const [loading, setLoading] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState('original');
  const categories = ['Danse', 'Musique', 'Tendance', 'Humour', 'Culture'];
  const photoFilters = useMemo(() => ([
    { id: 'original', label: 'Original', overlay: 'transparent', borderColor: COLORS.border },
    { id: 'sunset', label: 'Sunset', overlay: 'rgba(255, 94, 0, 0.18)', borderColor: COLORS.primary },
    { id: 'royal', label: 'Royal', overlay: 'rgba(230, 0, 103, 0.18)', borderColor: COLORS.secondary },
    { id: 'gold', label: 'Gold', overlay: 'rgba(255, 170, 0, 0.16)', borderColor: COLORS.accent },
    { id: 'cool', label: 'Cool', overlay: 'rgba(0, 176, 255, 0.14)', borderColor: COLORS.blue },
    { id: 'noir', label: 'Noir', overlay: 'rgba(6, 6, 8, 0.32)', borderColor: 'rgba(255,255,255,0.28)' },
  ]), []);
  const selectedFilter = photoFilters.find((filter) => filter.id === selectedFilterId) || photoFilters[0];

  const handlePublish = async () => {
    if (!mediaUri) {
      Alert.alert('Erreur', 'Aucun media n\'a ete recu.');
      return;
    }

    if (mediaType === 'video' && !caption.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter une description.');
      return;
    }

    setLoading(true);
    try {
      if (mediaType === 'photo') {
        await dbService.uploadAvatar(mediaUri);
        Alert.alert('Succes', 'Photo mise a jour avec succes.');
        navigation.navigate('MainTabs', { screen: 'Profil' });
        return;
      }

      console.log('[Upload] Compression de la video...');
      const processedUri = await compressVideo(mediaUri);

      console.log('[Upload] Publication video:', processedUri);
      await dbService.uploadVideo(processedUri, caption, category);
      Alert.alert('Succes', 'Video publiee avec succes !');
      navigation.navigate('MainTabs', { screen: 'Accueil' });
    } catch (err) {
      console.error('[Upload] Erreur publication:', err);
      Alert.alert('Erreur', err.message || 'La publication a échoué.');
    } finally {
      setLoading(false);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {mediaType === 'photo' ? 'Editer votre photo' : 'Modifier votre Afro Vibe'}
        </Text>

        <View style={styles.previewCard}>
          {mediaType === 'photo' ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="cover" />
              <View
                pointerEvents="none"
                style={[
                  styles.photoFilterOverlay,
                  {
                    backgroundColor: selectedFilter.overlay,
                    borderColor: selectedFilter.borderColor,
                  },
                ]}
              />
            </View>
          ) : (
            <View style={styles.videoPreview}>
              <Video
                source={{ uri: mediaUri }}
                style={styles.previewMedia}
                resizeMode="cover"
                repeat
                muted
                paused={false}
              />
            </View>
          )}
        </View>

        {mediaType === 'photo' && (
          <>
            <Text style={styles.label}>Filtres photo :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {photoFilters.map((filter) => {
                const isActive = filter.id === selectedFilterId;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                      isActive && { borderColor: filter.borderColor },
                    ]}
                    onPress={() => setSelectedFilterId(filter.id)}
                  >
                    <View style={[styles.filterSwatch, { backgroundColor: filter.overlay === 'transparent' ? COLORS.surface : filter.overlay }]} />
                    <Text style={styles.filterChipText}>{filter.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={styles.helperText}>
              Les filtres sont appliques en apercu pour affiner votre photo avant validation.
            </Text>
          </>
        )}

        {mediaType === 'video' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={caption}
              onChangeText={setCaption}
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.label}>Choisir une categorie :</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, category === cat && styles.activeCatBtn]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.catText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.publishBtnText}>
              {mediaType === 'photo' ? 'Valider la photo' : 'Publier'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.lg },
  previewCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  photoPreview: {
    height: 340,
    backgroundColor: COLORS.brandDeep,
  },
  videoPreview: {
    height: 340,
    backgroundColor: COLORS.black,
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  photoFilterOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
  filterRow: {
    paddingBottom: SPACING.sm,
  },
  filterChip: {
    width: 88,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.surface,
  },
  filterSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  input: { backgroundColor: COLORS.cardBackground, color: COLORS.text, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  label: { color: COLORS.text, marginBottom: SPACING.sm, fontWeight: '600' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg },
  catBtn: { padding: SPACING.sm, borderRadius: 20, backgroundColor: COLORS.cardBackground, marginRight: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  activeCatBtn: { backgroundColor: COLORS.primary },
  catText: { color: COLORS.text },
  publishBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 12, alignItems: 'center' },
  publishBtnText: { color: COLORS.text, fontWeight: 'bold' }
});

export default VideoEditScreen;
