// Settings & More Screen (Plus)
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView,
  Image, StatusBar, TextInput, Alert, Linking
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { configService, authService } from '../services/apiService';

export default SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [storageMode, setStorageMode] = useState(configService.getStorageMode());
  const [serverIp, setServerIp] = useState(configService.getApiUrl());
  const [isTesting, setIsTesting] = useState(false);
  const currentUser = authService.getCurrentUser();

  const handleTestConnection = async () => {
    setIsTesting(true);
    const success = await configService.testConnection(serverIp);
    setIsTesting(false);
    if (success) {
      await configService.setApiUrl(serverIp);
      Alert.alert('Succès', 'Connexion réussie !');
    } else {
      Alert.alert('Erreur', 'Impossible de se connecter.');
    }
  };

  const handleToggleStorage = async (mode) => {
    setStorageMode(mode);
    try {
      await configService.setStorageMode(mode);
      Alert.alert('Mode', `L'application utilise désormais le mode ${mode === 'online' ? 'En Ligne' : 'Local'}.`);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de changer le mode.');
    }
  };

  const handleSync = async () => {
    Alert.alert('Synchronisation', 'Synchronisation en cours...');
    try {
      const res = await fetch(`${configService.getApiUrl()}/sync`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Succès', `Synchro réussie: ${data.results.users} utilisateurs, ${data.results.videos} vidéos.`);
      } else {
        Alert.alert('Erreur', 'Erreur serveur: ' + data.error);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de synchroniser avec le cloud.');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><SVGIcon name="back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Mode de fonctionnement</Text>
        
        <TouchableOpacity 
          style={[styles.optionRow, storageMode === 'online' && styles.selectedOption]} 
          onPress={() => handleToggleStorage('online')}
        >
          <View style={styles.optionLeft}>
            <SVGIcon name="live" size={20} color={storageMode === 'online' ? COLORS.accent : COLORS.textSecondary} style={styles.optionIcon} />
            <View>
              <Text style={[styles.optionLabel, storageMode === 'online' && styles.selectedText]}>Mode En Ligne</Text>
              <Text style={styles.optionSubLabel}>Supabase + Cloudinary</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionRow, storageMode === 'offline' && styles.selectedOption]} 
          onPress={() => handleToggleStorage('offline')}
        >
          <View style={styles.optionLeft}>
            <SVGIcon name="settings" size={20} color={storageMode === 'offline' ? COLORS.accent : COLORS.textSecondary} style={styles.optionIcon} />
            <View>
              <Text style={[styles.optionLabel, storageMode === 'offline' && styles.selectedText]}>Mode Local</Text>
              <Text style={styles.optionSubLabel}>SQLite (Serveur Node.js local)</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
          <Text style={styles.syncBtnText}>☁️ Synchroniser avec le Cloud</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Configuration Serveur Local</Text>
        <View style={styles.serverConfigContainer}>
          <TextInput
            style={styles.serverConfigInput}
            value={serverIp}
            onChangeText={setServerIp}
            placeholder="http://192.168.x.x:3000/api"
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity style={styles.testBtn} onPress={handleTestConnection}>
            <Text style={styles.testBtnText}>Tester et sauvegarder</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  scrollContent: { padding: SPACING.md },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: COLORS.accent, textTransform: 'uppercase', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBackground, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xs },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { marginRight: SPACING.sm },
  optionLabel: { color: COLORS.text, fontSize: 14 },
  selectedOption: { borderColor: COLORS.accent, backgroundColor: 'rgba(255, 171, 0, 0.05)' },
  selectedText: { color: COLORS.accent, fontWeight: 'bold' },
  optionSubLabel: { color: COLORS.textSecondary, fontSize: 11 },
  syncBtn: { marginTop: SPACING.md, backgroundColor: COLORS.blue, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  syncBtnText: { color: COLORS.text, fontWeight: 'bold' },
  serverConfigContainer: { backgroundColor: COLORS.cardBackground, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  serverConfigInput: { backgroundColor: COLORS.background, borderRadius: 6, padding: SPACING.sm, color: COLORS.text, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  testBtn: { backgroundColor: COLORS.primary, padding: SPACING.sm, borderRadius: 6, alignItems: 'center' },
  testBtnText: { color: COLORS.text, fontWeight: 'bold' },
  logoutBtn: { marginTop: SPACING.xl, backgroundColor: 'rgba(230, 0, 103, 0.1)', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  logoutBtnText: { color: COLORS.secondary, fontWeight: 'bold' },
});
