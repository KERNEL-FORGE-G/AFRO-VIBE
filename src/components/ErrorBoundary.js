import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from './SVGIcon';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset && this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <View style={styles.content}>
            <SVGIcon name="close" size={64} color={COLORS.error} />
            <Text style={styles.title}>Oups ! Quelque chose a mal tourné.</Text>
            <Text style={styles.subtitle}>
              L'application a rencontré une erreur inattendue. Nos équipes ont été prévenues.
            </Text>

            {__DEV__ && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.3)',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: 'System',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 30,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ErrorBoundary;
