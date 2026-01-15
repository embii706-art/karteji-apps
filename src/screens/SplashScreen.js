import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {COLORS, SPACING, TYPOGRAPHY} from '../constants/theme';

const SplashScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Login');
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Logo/Icon Placeholder */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>K</Text>
        </View>
      </View>

      {/* App Name */}
      <Text style={styles.appName}>KARTEJI</Text>
      <Text style={styles.subtitle}>Karang Taruna RT 05</Text>
      
      {/* Slogan */}
      <Text style={styles.slogan}>Pemuda Aktif, RT Produktif</Text>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
      
      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 4,
    marginTop: SPACING.lg,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.background,
    opacity: 0.9,
    marginTop: SPACING.sm,
  },
  slogan: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: SPACING.xl,
    fontStyle: 'italic',
  },
  loadingContainer: {
    marginTop: SPACING.xxl,
  },
  version: {
    position: 'absolute',
    bottom: SPACING.lg,
    fontSize: 12,
    color: COLORS.background,
    opacity: 0.6,
  },
});

export default SplashScreen;
