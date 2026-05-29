import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc 
} from '@react-native-firebase/firestore';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';

export const AdminDashboardScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const videosCollection = collection(db, 'videos');
    
    const unsubscribe = onSnapshot(videosCollection, snapshot => {
      if (snapshot) {
        const videoList = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setVideos(videoList);
      }
      setLoading(false);
    }, error => {
      console.error('Admin Dashboard Firestore Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette vidéo ?', [
      { text: 'Annuler' },
      { 
        text: 'Supprimer', 
        onPress: async () => {
          try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'videos', id));
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Erreur', 'Impossible de supprimer la vidéo.');
          }
        } 
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tableau de bord (Firebase)</Text>
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.background },
  header: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.cardBackground, padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.sm },
  text: { color: COLORS.text, flex: 1 }
});

export default AdminDashboardScreen;
