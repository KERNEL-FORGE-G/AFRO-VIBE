import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';

export const AdminDashboardScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('videos')
      .onSnapshot(snapshot => {
        const videoList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(videoList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette vidéo ?', [
      { text: 'Annuler' },
      { text: 'Supprimer', onPress: () => firestore().collection('videos').doc(id).delete() }
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
