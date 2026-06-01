// Login Screen
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import TribalPattern from '../components/TribalPattern';
import { authService } from '../services/apiService';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.signInWithEmailAndPassword(email, password);
      // Success is handled by auth listener, but for safety in navigation:
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <TribalPattern position="top" height={15} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.formContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <SVGIcon name="back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
              <SVGIcon name="settings" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Se connecter</Text>
          <Text style={styles.subtitle}>Ravis de vous revoir sur Afro Vibe ! 🌍</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Email input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: christian.mboa@gmail.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Register Redirect */}
          <View style={styles.redirectContainer}>
            <Text style={styles.redirectText}>Nouveau sur Afro Vibe ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.redirectLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <TribalPattern position="bottom" height={15} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: SPACING.md,
    fontWeight: 'bold',
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  loginBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  socialBtn: {
    flex: 0.48,
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialBtnText: {
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  redirectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  redirectText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  redirectLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingsBtn: {
    padding: 5,
  },
});

export default LoginScreen;
borderWidth: 1,
    borderColor: COLORS.accent,
  },
  loginBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  redirectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  redirectText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  redirectLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingsBtn: {
    padding: 5,
  },
});

export default LoginScreen;
