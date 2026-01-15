import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '../constants/theme';
import {db} from '../config/firebase';
import {getOptimizedImageUrl} from '../services/cloudinary';

const EventsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, past

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const snapshot = await db
        .collection('activities')
        .orderBy('startDate', 'desc')
        .get();

      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = event => {
    const now = new Date();
    const startDate = event.startDate?.toDate?.() || new Date();
    const endDate = event.endDate?.toDate?.() || new Date();

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'past';
    return 'ongoing';
  };

  const getStatusColor = status => {
    switch (status) {
      case 'upcoming':
        return COLORS.accent;
      case 'ongoing':
        return COLORS.success;
      case 'past':
        return COLORS.textLight;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'upcoming':
        return 'Akan Datang';
      case 'ongoing':
        return 'Berlangsung';
      case 'past':
        return 'Selesai';
      default:
        return '';
    }
  };

  const EventCard = ({event}) => {
    const status = getEventStatus(event);
    const statusColor = getStatusColor(status);
    const optimizedImageUrl = event.imageUrl
      ? getOptimizedImageUrl(event.imageUrl, 400)
      : null;

    return (
      <TouchableOpacity style={styles.eventCard}>
        {optimizedImageUrl && (
          <Image
            source={{uri: optimizedImageUrl}}
            style={styles.eventImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <View style={[styles.statusBadge, {backgroundColor: statusColor + '20'}]}>
              <Text style={[styles.statusText, {color: statusColor}]}>
                {getStatusText(status)}
              </Text>
            </View>
            <View style={styles.eventMeta}>
              <Icon name="account-group" size={14} color={COLORS.textSecondary} />
              <Text style={styles.participantCount}>
                {event.participantCount || 0}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Icon name="calendar" size={16} color={COLORS.primary} />
              <Text style={styles.eventDetailText}>
                {event.startDate?.toDate?.().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }) || 'TBA'}
              </Text>
            </View>
            {event.location && (
              <View style={styles.eventDetail}>
                <Icon name="map-marker" size={16} color={COLORS.primary} />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.eventButton}>
            <Text style={styles.eventButtonText}>Lihat Detail</Text>
            <Icon name="chevron-right" size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({label, value}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}>
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return getEventStatus(event) === filter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events & Kegiatan</Text>
        <Text style={styles.headerSubtitle}>
          Daftar seluruh kegiatan Karang Taruna
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          <FilterButton label="Semua" value="all" />
          <FilterButton label="Akan Datang" value="upcoming" />
          <FilterButton label="Berlangsung" value="ongoing" />
          <FilterButton label="Selesai" value="past" />
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsListContent}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => <EventCard key={event.id} event={event} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Belum ada event</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color={COLORS.background} />
      </TouchableOpacity>
    </View>
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
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.background,
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  eventCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  eventImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surface,
  },
  eventContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  participantCount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  eventTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  eventDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  eventDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  eventDetailText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  eventButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
});

export default EventsScreen;
