import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { dbService } from '../services/apiService';

export const VideoEditScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Danse');
  const [loading, setLoading] = useState(false);
  const categories = ['Danse', 'Musique', 'Tendance', 'Humour', 'Culture'];

  const handlePublish = async () => {
    if (!caption.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter une description.');
      return;
    }
    setLoading(true);
    try {
      await dbService.uploadVideo(videoUri, caption, category);
      setLoading(false);
      Alert.alert('Succès', 'Vidéo publiée avec succès !');
      navigation.navigate('MainTabs', { screen: 'Accueil' });
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'La publication a échoué.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier votre Afro Vibe</Text>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={caption}
        onChangeText={setCaption}
        placeholderTextColor={COLORS.textSecondary}
      />
      <Text style={styles.label}>Choisir une catégorie :</Text>
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
      <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.text} /> : <Text style={styles.publishBtnText}>Publier</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.background },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.lg },
  input: { backgroundColor: COLORS.cardBackground, color: COLORS.text, padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md },
  label: { color: COLORS.text, marginBottom: SPACING.sm },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg },
  catBtn: { padding: SPACING.sm, borderRadius: 20, backgroundColor: COLORS.cardBackground, marginRight: SPACING.sm, marginBottom: SPACING.sm },
  activeCatBtn: { backgroundColor: COLORS.primary },
  catText: { color: COLORS.text },
  publishBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  publishBtnText: { color: COLORS.text, fontWeight: 'bold' }
});

export default VideoEditScreen;
