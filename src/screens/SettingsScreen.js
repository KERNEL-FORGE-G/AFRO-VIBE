// Settings & More Screen (Plus)
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Image,
  StatusBar,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { configService, authService } from '../services/apiService';

export const SettingsScreen = ({ navigation }) => {
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
      try {
        await configService.setApiUrl(serverIp);
        setServerIp(configService.getApiUrl());
        Alert.alert('Succès', 'Connexion au serveur réussie ! Configuration sauvegardée.');
      } catch (e) {
        Alert.alert('Erreur', e.message || 'URL invalide.');
      }
    } else {
      Alert.alert('Erreur', 'Impossible de se connecter au serveur. Vérifiez l\'IP et le port.');
    }
  };

  const handleToggleStorage = async (mode) => {
    setStorageMode(mode);
    try {
      await configService.setStorageMode(mode);
      let modeLabel = '';
      if (mode === 'online') modeLabel = 'En ligne (Firebase)';
      else if (mode === 'cloudinary') modeLabel = 'Cloudinary (via Backend)';
      else modeLabel = 'Hors-ligne (Local Node.js)';
      
      Alert.alert('Mode de stockage', `L'application utilise désormais le mode ${modeLabel}.`);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de changer le mode de stockage.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            // Reset navigation stack to Welcome screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      ]
    );
  };

  const handleHelp = () => {
    Linking.openURL('https://afrovibe.app/help').catch(() => {
      Alert.alert('Info', 'Le centre d\'aide sera bientôt disponible.');
    });
  };

  const handleShare = () => {
    Alert.alert('Partager', 'Lien de partage : https://afrovibe.app/download');
  };

  const renderOptionRow = (iconName, label, extraText = null, action = () => {}) => (
    <TouchableOpacity style={styles.optionRow} onPress={action}>
      <View style={styles.optionLeft}>
        <SVGIcon name={iconName} size={20} color={COLORS.textSecondary} style={styles.optionIcon} />
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <View style={styles.optionRight}>
        {extraText && <Text style={styles.extraText}>{extraText}</Text>}
        <SVGIcon name="discover" size={14} color={COLORS.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={10} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SVGIcon name="back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.flexEmpty} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Summary */}
        {currentUser && (
          <View style={styles.profileSummary}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{currentUser.username?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser.fullName || currentUser.username}</Text>
              <Text style={styles.profileEmail}>{currentUser.email}</Text>
            </View>
          </View>
        )}

        {/* Section 1: Account */}
        <Text style={styles.sectionHeader}>Mon Compte</Text>
        
        {renderOptionRow('profile', 'Gérer le compte', null, () => navigation.navigate('MainTabs', { screen: 'Profil' }))}
        {renderOptionRow('settings', 'Paramètres et confidentialité')}
        
        {/* Section 2: Content & Display */}
        <Text style={styles.sectionHeader}>Contenu et affichage</Text>
        
        {renderOptionRow('inbox', 'Notifications')}
        {renderOptionRow('discover', 'Langue', 'Français')}
        
        {/* Toggle Dark Mode Option */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <SVGIcon name="adinkra1" size={20} color={COLORS.textSecondary} style={styles.optionIcon} />
            <Text style={styles.optionLabel}>Mode sombre</Text>
          </View>
          <Switch 
            value={darkMode} 
            onValueChange={setDarkMode}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={darkMode ? COLORS.accent : '#f4f3f4'}
          />
        </View>

        {/* Storage Mode Selection */}
        <Text style={styles.sectionHeader}>Mode de stockage</Text>
        
        <TouchableOpacity 
          style={[styles.optionRow, storageMode === 'online' && styles.selectedOption]} 
          onPress={() => handleToggleStorage('online')}
        >
          <View style={styles.optionLeft}>
            <SVGIcon name="live" size={20} color={storageMode === 'online' ? COLORS.accent : COLORS.textSecondary} style={styles.optionIcon} />
            <View>
              <Text style={[styles.optionLabel, storageMode === 'online' && styles.selectedText]}>Firebase Storage</Text>
              <Text style={styles.optionSubLabel}>Utiliser le cloud Google Firebase</Text>
            </View>
          </View>
          {storageMode === 'online' && <SVGIcon name="discover" size={14} color={COLORS.accent} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionRow, storageMode === 'cloudinary' && styles.selectedOption]} 
          onPress={() => handleToggleStorage('cloudinary')}
        >
          <View style={styles.optionLeft}>
            <SVGIcon name="adinkra1" size={20} color={storageMode === 'cloudinary' ? COLORS.accent : COLORS.textSecondary} style={styles.optionIcon} />
            <View>
              <Text style={[styles.optionLabel, storageMode === 'cloudinary' && styles.selectedText]}>Cloudinary Cloud</Text>
              <Text style={styles.optionSubLabel}>Optimisation vidéo et stockage CDN</Text>
            </View>
          </View>
          {storageMode === 'cloudinary' && <SVGIcon name="discover" size={14} color={COLORS.accent} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionRow, storageMode === 'offline' && styles.selectedOption]} 
          onPress={() => handleToggleStorage('offline')}
        >
          <View style={styles.optionLeft}>
            <SVGIcon name="settings" size={20} color={storageMode === 'offline' ? COLORS.accent : COLORS.textSecondary} style={styles.optionIcon} />
            <View>
              <Text style={[styles.optionLabel, storageMode === 'offline' && styles.selectedText]}>Local Backend</Text>
              <Text style={styles.optionSubLabel}>Stockage sur le disque dur du serveur local</Text>
            </View>
          </View>
          {storageMode === 'offline' && <SVGIcon name="discover" size={14} color={COLORS.accent} />}
        </TouchableOpacity>

        {/* Section: Server Configuration */}
        <Text style={styles.sectionHeader}>Configuration Serveur Local</Text>
        <View style={styles.serverConfigContainer}>
          <Text style={styles.serverConfigLabel}>IP/Port du backend :</Text>
          <TextInput
            style={styles.serverConfigInput}
            value={serverIp}
            onChangeText={setServerIp}
            placeholder="http://192.168.x.x:3000/api"
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity 
            style={styles.testBtn} 
            onPress={handleTestConnection}
            disabled={isTesting}
          >
            <Text style={styles.testBtnText}>{isTesting ? 'Test en cours...' : 'Tester et sauvegarder'}</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Support */}
        <Text style={styles.sectionHeader}>Assistance & Informations</Text>
        
        {renderOptionRow('discover', 'Centre d\'aide', null, handleHelp)}
        {renderOptionRow('adinkra2', 'À propos')}
        {renderOptionRow('share', 'Partager AfroVibe', null, handleShare)}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Footer Branding Banner */}
        <View style={styles.brandBannerContainer}>
          <Image 
            source={require('../assets/images/logo_main.jpg')} // banner graphic
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>AFRO VIBE</Text>
            <Text style={styles.bannerSubtext}>Rapprochons nos cultures par la danse</Text>
          </View>
        </View>
      </ScrollView>

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
  },
  flexEmpty: {
    width: 24, // balance back icon
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarInitial: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: SPACING.md,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingLeft: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: SPACING.sm,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: 14,
  },
  selectedOption: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 171, 0, 0.05)',
  },
  selectedText: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  optionSubLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginRight: 6,
  },
  logoutBtn: {
    marginTop: SPACING.xl,
    backgroundColor: 'rgba(230, 0, 103, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  brandBannerContainer: {
    marginTop: SPACING.xl,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.accent,
    position: 'relative',
  },
  bannerImage: {
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 9, 27, 0.4)',
  },
  bannerText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bannerSubtext: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  serverConfigContainer: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  serverConfigLabel: {
    color: COLORS.text,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  serverConfigInput: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: SPACING.sm,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  testBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  testBtnText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
