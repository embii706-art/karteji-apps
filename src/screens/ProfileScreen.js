import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '../constants/theme';
import {db, authService} from '../config/firebase';
import {getOptimizedImageUrl} from '../services/cloudinary';

const ProfileScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    eventParticipation: 0,
    activityPoints: 0,
    badges: 0,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = authService.currentUser;
      if (user) {
        // Load user profile
        const profileDoc = await db.collection('profiles').doc(user.uid).get();
        if (profileDoc.exists) {
          setUserData({
            uid: user.uid,
            email: user.email,
            ...profileDoc.data(),
          });
        }

        // Load participation stats
        const participationSnapshot = await db
          .collection('participation')
          .where('userId', '==', user.uid)
          .get();

        setStats({
          eventParticipation: participationSnapshot.size,
          activityPoints: profileDoc.data()?.activityPoints || 0,
          badges: profileDoc.data()?.badges?.length || 0,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.signOut();
            navigation.replace('Login');
          } catch (error) {
            Alert.alert('Error', 'Gagal keluar');
          }
        },
      },
    ]);
  };

  const MenuButton = ({icon, label, onPress, color = COLORS.text}) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuButtonLeft}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.menuButtonText, {color}]}>{label}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const profileImageUrl = userData?.profilePhoto
    ? getOptimizedImageUrl(userData.profilePhoto, 200)
    : null;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {profileImageUrl ? (
            <Image
              source={{uri: profileImageUrl}}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Icon name="account" size={64} color={COLORS.textLight} />
            </View>
          )}
          <TouchableOpacity style={styles.editPhotoButton}>
            <Icon name="camera" size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        <Text style={styles.profileName}>{userData?.name || 'Member'}</Text>
        <Text style={styles.profileRole}>
          {userData?.role || 'Anggota Karang Taruna'}
        </Text>
        {userData?.email && (
          <Text style={styles.profileEmail}>{userData.email}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="calendar-check" size={28} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.eventParticipation}</Text>
          <Text style={styles.statLabel}>Kegiatan</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="star" size={28} color={COLORS.accent} />
          <Text style={styles.statNumber}>{stats.activityPoints}</Text>
          <Text style={styles.statLabel}>Poin</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="medal" size={28} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.badges}</Text>
          <Text style={styles.statLabel}>Badge</Text>
        </View>
      </View>

      {/* Badges Section */}
      {userData?.badges && userData.badges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badge & Penghargaan</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}>
            {userData.badges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Icon name={badge.icon || 'medal'} size={32} color={COLORS.accent} />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.menuContainer}>
          <MenuButton
            icon="account-edit"
            label="Edit Profil"
            onPress={() => {}}
          />
          <MenuButton
            icon="history"
            label="Riwayat Kegiatan"
            onPress={() => {}}
          />
          <MenuButton
            icon="bell-outline"
            label="Notifikasi"
            onPress={() => {}}
          />
          <MenuButton
            icon="cog-outline"
            label="Pengaturan"
            onPress={() => {}}
          />
          <MenuButton
            icon="help-circle-outline"
            label="Bantuan"
            onPress={() => {}}
          />
          <MenuButton
            icon="information-outline"
            label="Tentang Aplikasi"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}>
        <Icon name="logout" size={24} color={COLORS.error} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.versionText}>KARTEJI v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.accent,
  },
  profileImagePlaceholder: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  profileRole: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  badgesContainer: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  badgeItem: {
    alignItems: 'center',
    width: 80,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  badgeName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  menuButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.error + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  logoutText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    fontWeight: '600',
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default ProfileScreen;
