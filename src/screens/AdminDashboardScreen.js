import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import { dbService } from '../services/apiService';

export const AdminDashboardScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const list = await dbService.getAllVideosAdmin();
      setVideos(list);
    } catch (err) {
      console.error('Admin load error:', err);
      Alert.alert('Erreur', 'Impossible de charger les vidéos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, [loadVideos]),
  );

  const handleDelete = async (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette vidéo ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await dbService.deleteVideoAdmin(id);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setVideos(prev => prev.filter(v => v.id !== id));
          } catch (err) {
            Alert.alert('Erreur', err.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;
  }

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.header}>Tableau de bord Admin</Text>
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.caption || 'Pas de description'}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <SVGIcon name="close" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>Aucune vidéo trouvée.</Text>}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.background },
  header: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  card: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground, padding: SPACING.md,
    borderRadius: 8, marginBottom: SPACING.sm,
  },
  text: { color: COLORS.text, flex: 1 },
});

export default AdminDashboardScreen;
