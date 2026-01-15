import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '../constants/theme';
import {db, authService} from '../config/firebase';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    upcomingActivities: 0,
  });
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = authService.currentUser;
      if (user) {
        // Load user profile
        const profileDoc = await db.collection('profiles').doc(user.uid).get();
        if (profileDoc.exists) {
          setUserData(profileDoc.data());
        }

        // Load stats
        const membersSnapshot = await db.collection('profiles').get();
        const eventsSnapshot = await db
          .collection('activities')
          .where('status', '==', 'active')
          .get();

        setStats({
          totalMembers: membersSnapshot.size,
          activeEvents: eventsSnapshot.size,
          upcomingActivities: eventsSnapshot.size,
        });

        // Load upcoming event
        const upcomingSnapshot = await db
          .collection('activities')
          .orderBy('startDate', 'asc')
          .limit(1)
          .get();

        if (!upcomingSnapshot.empty) {
          setUpcomingEvent({
            id: upcomingSnapshot.docs[0].id,
            ...upcomingSnapshot.docs[0].data(),
          });
        }

        // Load announcements
        const announcementsSnapshot = await db
          .collection('announcements')
          .orderBy('createdAt', 'desc')
          .limit(3)
          .get();

        setAnnouncements(
          announcementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickActionButton = ({icon, label, color, onPress}) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, {backgroundColor: color}]}>
        <Icon name={icon} size={28} color={COLORS.background} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.name || 'Member'}!</Text>
          <Text style={styles.headerSubtitle}>
            Selamat datang di KARTEJI
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color={COLORS.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="account-group" size={32} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Total Anggota</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="calendar-check" size={32} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.activeEvents}</Text>
          <Text style={styles.statLabel}>Event Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="calendar-clock" size={32} color={COLORS.accent} />
          <Text style={styles.statNumber}>{stats.upcomingActivities}</Text>
          <Text style={styles.statLabel}>Kegiatan</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionsGrid}>
          <QuickActionButton
            icon="calendar-multiselect"
            label="Events"
            color={COLORS.primary}
          />
          <QuickActionButton
            icon="clipboard-text"
            label="Agenda"
            color={COLORS.success}
          />
          <QuickActionButton
            icon="cash-multiple"
            label="Keuangan"
            color={COLORS.accent}
          />
          <QuickActionButton
            icon="vote"
            label="Voting"
            color={COLORS.error}
          />
        </View>
      </View>

      {/* Upcoming Event */}
      {upcomingEvent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kegiatan Mendatang</Text>
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View>
                <Text style={styles.eventTitle}>{upcomingEvent.title}</Text>
                <Text style={styles.eventDate}>
                  {upcomingEvent.startDate?.toDate?.().toLocaleDateString('id-ID') || 'TBA'}
                </Text>
              </View>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Upcoming</Text>
              </View>
            </View>
            <Text style={styles.eventDescription} numberOfLines={2}>
              {upcomingEvent.description}
            </Text>
            <View style={styles.eventFooter}>
              <View style={styles.eventInfo}>
                <Icon name="map-marker" size={16} color={COLORS.textSecondary} />
                <Text style={styles.eventInfoText}>
                  {upcomingEvent.location || 'Lokasi TBA'}
                </Text>
              </View>
              <TouchableOpacity style={styles.eventButton}>
                <Text style={styles.eventButtonText}>Lihat Detail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Announcements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pengumuman</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        {announcements.length > 0 ? (
          announcements.map(announcement => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementIcon}>
                <Icon name="bullhorn" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle} numberOfLines={1}>
                  {announcement.title}
                </Text>
                <Text style={styles.announcementText} numberOfLines={2}>
                  {announcement.content}
                </Text>
                <Text style={styles.announcementDate}>
                  {announcement.createdAt?.toDate?.().toLocaleDateString('id-ID')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Belum ada pengumuman</Text>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionButton: {
    width: '47%',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  actionLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  eventDate: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  eventBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  eventBadgeText: {
    color: COLORS.accentDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventInfoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  eventButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  eventButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '600',
  },
  announcementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  announcementText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  announcementDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default DashboardScreen;
