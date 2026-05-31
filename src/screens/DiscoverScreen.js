import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import VideoPlayerView from '../components/VideoPlayerView';
import apiService from '../services/apiService';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

export const DiscoverScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tendances');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ['Tendances', 'Danse', 'Musique', 'Défis', 'Mode', 'Humour'];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await apiService.db.getVideos();
      setVideos(data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = (category) => {
    const isActive = category === activeCategory;
    return (
      <TouchableOpacity 
        key={category}
        style={[styles.categoryPill, isActive && styles.activeCategoryPill]}
        onPress={() => setActiveCategory(category)}
      >
        <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredVideos = videos.filter(video => {
    // If querying, search caption/username
    if (searchQuery) {
      return video.caption.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // Filter by active category tab (except Tendances/all)
    if (activeCategory !== 'Tendances') {
      return video.category === activeCategory;
    }
    return true;
  });

  const renderVideoGridItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('MainTabs', { screen: 'Accueil', params: { initialVideoId: item.id } })}
    >
      <View style={styles.thumbnailContainer}>
        <VideoPlayerView 
          videoUrl={item.videoUrl} 
          paused={false} 
          isMuted={true}
          thumbnail={item.thumbnail}
          onSingleTap={() => navigation.navigate('MainTabs', { screen: 'Accueil', params: { initialVideoId: item.id } })}
        />
        
        {/* Views overlay */}
        <View style={styles.viewsOverlay}>
          <SVGIcon name="play" size={10} color={COLORS.text} style={styles.viewsIcon} />
          <Text style={styles.viewsText}>{item.views || '0'}</Text>
        </View>
      </View>

      {/* Info footer */}
      <View style={styles.gridItemFooter}>
        <Text style={styles.gridCaption} numberOfLines={2}>{item.caption}</Text>
        <View style={styles.creatorRow}>
          <View style={styles.miniAvatar}>
            <Text style={styles.avatarInitial}>{item.user?.username?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.gridUsername} numberOfLines={1}>@{item.user?.username || 'user'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <SVGIcon name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher des vidéos, sons, créateurs..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={fetchVideos}>
          <SVGIcon name="inbox" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(renderCategoryItem)}
        </ScrollView>
      </View>

      {/* Grid Content */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}}/>
      ) : (
        <FlatList
          data={filteredVideos}
          keyExtractor={item => item.id}
          renderItem={renderVideoGridItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Banner Section */}
              <View style={styles.bannerContainer}>
                <Image 
                  source={require('../assets/images/logo_main.jpg')} 
                  style={styles.bannerBackground} 
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTag}>AFRO VIBE CHALLENGE</Text>
                  <Text style={styles.bannerTitle}>DÉFIE TA CULTURE</Text>
                  <Text style={styles.bannerSubtitle}>Partage ton style, fais vibrer l’Afrique !</Text>
                  
                  <TouchableOpacity style={styles.bannerBtn}>
                    <Text style={styles.bannerBtnText}>Participer</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sub-heading */}
              <Text style={styles.sectionTitle}>Vibes Populaires</Text>
            </>
          }
        />
      )}

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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    padding: 0,
  },
  notificationBtn: {
    marginLeft: SPACING.md,
    padding: 4,
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
    backgroundColor: COLORS.cardBackground,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCategoryText: {
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.lg,
  },
  bannerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  bannerBackground: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.md,
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 9, 27, 0.4)',
  },
  bannerTag: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bannerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 15,
  },
  bannerBtnText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
    position: 'relative',
  },
  viewsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  viewsIcon: {
    marginRight: 4,
  },
  viewsText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridItemFooter: {
    padding: 10,
  },
  gridCaption: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  avatarInitial: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridUsername: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
});

export default DiscoverScreen;
