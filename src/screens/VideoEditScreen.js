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
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { COLORS, SPACING } from '../styles/theme';
import { dbService } from '../services/apiService';
import { compressVideo } from '../utils/videoProcessor';
import SVGIcon from '../components/SVGIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Sticker = ({ id, icon, x, y, onUpdate }) => {
  const translateX = useRef(new Animated.Value(x)).current;
  const translateY = useRef(new Animated.Value(y)).current;
  const lastOffset = useRef({ x, y }).current;

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.x += event.nativeEvent.translationX;
      lastOffset.y += event.nativeEvent.translationY;
      translateX.setOffset(lastOffset.x);
      translateX.setValue(0);
      translateY.setOffset(lastOffset.y);
      translateY.setValue(0);
      onUpdate(id, lastOffset.x, lastOffset.y);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.stickerContainer,
          {
            transform: [
              { translateX: translateX },
              { translateY: translateY },
            ],
          },
        ]}
      >
        <Text style={styles.stickerEmoji}>{icon}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

export const VideoEditScreen = ({ route, navigation }) => {
  const mediaUri = route.params?.mediaUri || route.params?.videoUri;
  const mediaType = route.params?.mediaType || 'video';
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Danse');
  const [loading, setLoading] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState('original');
  const [stickers, setStickers] = useState([]);

  const categories = ['Danse', 'Musique', 'Tendance', 'Humour', 'Culture'];
  const emojis = ['🔥', '❤️', '😂', '💯', '✨', '🙌', '🦁', '🌍', '🎵', '💃'];

  const filters = useMemo(() => ([
    { id: 'original', label: 'Original', overlay: 'transparent', borderColor: COLORS.border },
    { id: 'sunset', label: 'Sunset', overlay: 'rgba(255, 94, 0, 0.18)', borderColor: COLORS.primary },
    { id: 'royal', label: 'Royal', overlay: 'rgba(230, 0, 103, 0.18)', borderColor: COLORS.secondary },
    { id: 'gold', label: 'Gold', overlay: 'rgba(255, 170, 0, 0.16)', borderColor: COLORS.accent },
    { id: 'cool', label: 'Cool', overlay: 'rgba(0, 176, 255, 0.14)', borderColor: COLORS.blue },
    { id: 'noir', label: 'Noir', overlay: 'rgba(6, 6, 8, 0.32)', borderColor: 'rgba(255,255,255,0.28)' },
    { id: 'vintage', label: 'Vintage', overlay: 'rgba(121, 85, 72, 0.2)', borderColor: '#795548' },
  ]), []);

  const selectedFilter = filters.find((f) => f.id === selectedFilterId) || filters[0];

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
      // We pass the filter and stickers metadata
      await dbService.uploadVideo(processedUri, caption, category, {
        filterId: selectedFilterId,
        stickers: stickers.map(s => ({ icon: s.icon, x: s.x, y: s.y }))
      });

      Alert.alert('Succes', 'Video publiee avec succes !');
      navigation.navigate('MainTabs', { screen: 'Accueil' });
    } catch (err) {
      console.error('[Upload] Erreur publication:', err);
      Alert.alert('Erreur', err.message || 'La publication a échoué.');
    } finally {
      setLoading(false);
    }
  };

  const addSticker = (emoji) => {
    setStickers([...stickers, { id: Date.now(), icon: emoji, x: 100, y: 100 }]);
  };

  const updateStickerPosition = (id, x, y) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SVGIcon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {mediaType === 'photo' ? 'Editer votre photo' : 'Modifier votre Afro Vibe'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            {mediaType === 'photo' ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="cover" />
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

            {/* Filter Overlay */}
            <View
              pointerEvents="none"
              style={[
                styles.filterOverlay,
                { backgroundColor: selectedFilter.overlay }
              ]}
            />

            {/* Stickers Layer */}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {stickers.map((s) => (
                <Sticker
                  key={s.id}
                  id={s.id}
                  icon={s.icon}
                  x={s.x}
                  y={s.y}
                  onUpdate={updateStickerPosition}
                />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.label}>Filtres :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((filter) => {
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

        <Text style={styles.label}>Ajouter un sticker :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
          {emojis.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiBtn}
              onPress={() => addSticker(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {mediaType === 'video' && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ajouter une légende..."
              value={caption}
              onChangeText={setCaption}
              placeholderTextColor={COLORS.textSecondary}
              multiline
            />

            <Text style={styles.label}>Catégorie :</Text>
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
          </View>
        )}

        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.publishBtnText}>
              {mediaType === 'photo' ? 'Valider la photo' : 'Publier mon Afro Vibe'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  previewContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  previewCard: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 1.3,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
    position: 'relative',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  stickerContainer: {
    position: 'absolute',
    padding: 10,
    zIndex: 10,
  },
  stickerEmoji: {
    fontSize: 40,
  },
  filterRow: {
    paddingBottom: SPACING.md,
  },
  filterChip: {
    width: 80,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
  },
  filterSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterChipText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  emojiRow: {
    paddingBottom: SPACING.md,
  },
  emojiBtn: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiText: {
    fontSize: 24,
  },
  formContainer: {
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.text,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: { color: COLORS.text, marginBottom: SPACING.sm, fontWeight: 'bold' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg },
  catBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, backgroundColor: COLORS.cardBackground, marginRight: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  activeCatBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: COLORS.text, fontSize: 13 },
  publishBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 12, alignItems: 'center', marginTop: SPACING.md },
  publishBtnText: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 }
});

export default VideoEditScreen;
