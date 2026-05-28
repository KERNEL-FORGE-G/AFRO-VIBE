import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { dbService } from '../services/apiService';

export const VideoEditScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!caption.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter une description.');
      return;
    }
    setLoading(true);
    try {
      await dbService.uploadVideo(videoUri, `${caption} ${tags}`);
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
        placeholder="Description (Titre, contexte...)"
        value={caption}
        onChangeText={setCaption}
        placeholderTextColor={COLORS.textSecondary}
      />
      <TextInput
        style={styles.input}
        placeholder="Tags (ex: #Danse #Afro)"
        value={tags}
        onChangeText={setTags}
        placeholderTextColor={COLORS.textSecondary}
      />
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
  publishBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  publishBtnText: { color: COLORS.text, fontWeight: 'bold' }
});

export default VideoEditScreen;
