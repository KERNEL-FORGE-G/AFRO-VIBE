// Sound Details Screen (Son)
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList,
  Animated,
  Easing,
  Dimensions,
  StatusBar
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { dbService } from '../services/apiService';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = width / 3 - 2;

export const SoundDetailScreen = ({ route, navigation }) => {
  const soundName = route?.params?.soundName || 'Afro Vibe Original';
  const spinValue = useRef(new Animated.Value(0)).current;
  const [videos, setVideos] = useState([]);

  // Spin animation for the large vinyl disc
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const allVideos = await dbService.getVideos();
        // Filtrer par audioName si possible, sinon afficher tout
        const filtered = allVideos.filter(v => v.audioName === soundName);
        setVideos(filtered.length > 0 ? filtered : allVideos);
      } catch (err) {
        console.error('Error fetching videos for sound:', err);
      }
    };
    fetchVideos();
  }, [soundName]);

  const renderVideoThumbnail = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('MainTabs', { screen: 'Accueil' })}
    >
      <Image 
        source={{ uri: item.videoUrl || item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.viewsContainer}>
        <SVGIcon name="music" size={10} color={COLORS.text} style={styles.viewsIcon} />
        <Text style={styles.viewsText}>{item.views || '0'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      {/* Top Header Navigation Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SVGIcon name="back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Son original</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <SVGIcon name="share" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Audio Info Board */}
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        renderItem={renderVideoThumbnail}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.soundHeaderContainer}>
            {/* Spinning Disc and Thumbnail */}
            <View style={styles.vinylContainer}>
              <Animated.View style={[styles.largeVinylOuter, { transform: [{ rotate: spin }] }]}>
                <View style={styles.largeVinylInner}>
                  <Image 
                    source={require('../assets/images/logo.jpg')} // Center disc cover image
                    style={styles.largeVinylCenter} 
                  />
                </View>
              </Animated.View>
              
              {/* Disc Center needle styling */}
              <View style={styles.detailsTextContainer}>
                <Text style={styles.soundTitle} numberOfLines={1}>{soundName}</Text>
                <Text style={styles.soundCreator}>Utilisateur AfroVibe</Text>
                <Text style={styles.videoCountText}>{videos.length} vidéos créées</Text>
                
                {/* Favorite Action Button */}
                <TouchableOpacity style={styles.favBtn}>
                  <SVGIcon name="inbox" size={14} color={COLORS.text} style={styles.favIcon} />
                  <Text style={styles.favBtnText}>Ajouter aux favoris</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Core CTA - Utiliser ce son */}
            <TouchableOpacity 
              style={styles.useSoundBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Plus' })}
            >
              <Text style={styles.useSoundBtnText}>Utiliser ce son</Text>
            </TouchableOpacity>

            {/* Section Divider Header */}
            <View style={styles.gridSectionHeader}>
              <Text style={styles.sectionTitle}>Vidéos populaires</Text>
            </View>
          </View>
        }
      />

      <TribalPattern position="bottom" height={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  shareBtn: {
    padding: 4,
  },
  soundHeaderContainer: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  vinylContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  largeVinylOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#050308',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D1845',
  },
  largeVinylInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#111111',
  },
  largeVinylCenter: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  detailsTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  soundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  soundCreator: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  videoCountText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  favIcon: {
    marginRight: 6,
  },
  favBtnText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '500',
  },
  useSoundBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  useSoundBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  gridSectionHeader: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.3,
    margin: 1,
    position: 'relative',
    backgroundColor: COLORS.cardBackground,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  viewsContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  viewsIcon: {
    marginRight: 4,
  },
  viewsText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default SoundDetailScreen;
