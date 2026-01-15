import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '../constants/theme';
import {db, authService} from '../config/firebase';

const VotingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [votingList, setVotingList] = useState([]);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    loadVotingData();
  }, []);

  const loadVotingData = async () => {
    try {
      const user = authService.currentUser;
      
      // Load voting polls
      const snapshot = await db
        .collection('voting')
        .orderBy('createdAt', 'desc')
        .get();

      const votingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVotingList(votingData);

      // Load user votes
      if (user) {
        const votesSnapshot = await db
          .collection('votes')
          .where('userId', '==', user.uid)
          .get();

        const votes = {};
        votesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          votes[data.votingId] = data.optionId;
        });
        setUserVotes(votes);
      }
    } catch (error) {
      console.error('Error loading voting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (votingId, optionId) => {
    const user = authService.currentUser;
    if (!user) {
      Alert.alert('Error', 'Anda harus login untuk voting');
      return;
    }

    try {
      // Check if already voted
      if (userVotes[votingId]) {
        Alert.alert('Info', 'Anda sudah melakukan voting untuk ini');
        return;
      }

      // Record vote
      await db.collection('votes').add({
        userId: user.uid,
        votingId: votingId,
        optionId: optionId,
        createdAt: new Date(),
      });

      // Update vote count
      const votingRef = db.collection('voting').doc(votingId);
      const votingDoc = await votingRef.get();
      const currentData = votingDoc.data();
      
      const updatedOptions = currentData.options.map(opt => {
        if (opt.id === optionId) {
          return {...opt, votes: (opt.votes || 0) + 1};
        }
        return opt;
      });

      await votingRef.update({
        options: updatedOptions,
        totalVotes: (currentData.totalVotes || 0) + 1,
      });

      Alert.alert('Berhasil', 'Voting Anda telah tercatat');
      loadVotingData();
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Gagal melakukan voting');
    }
  };

  const calculatePercentage = (votes, total) => {
    if (!total || total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const getTimeRemaining = endDate => {
    if (!endDate) return 'Tidak ada batas waktu';
    
    const now = new Date();
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Voting ditutup';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} hari lagi`;
    if (hours > 0) return `${hours} jam lagi`;
    return 'Kurang dari 1 jam';
  };

  const VotingCard = ({voting}) => {
    const hasVoted = !!userVotes[voting.id];
    const isActive = voting.status === 'active';
    const timeRemaining = getTimeRemaining(voting.endDate);

    return (
      <View style={styles.votingCard}>
        {/* Header */}
        <View style={styles.votingHeader}>
          <View style={styles.votingTitleContainer}>
            <Icon name="vote" size={24} color={COLORS.primary} />
            <View style={styles.votingTitleContent}>
              <Text style={styles.votingTitle}>{voting.title}</Text>
              <Text style={styles.votingSubtitle}>
                {voting.description || 'Musyawarah Pemuda'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isActive
                  ? COLORS.success + '20'
                  : COLORS.textLight + '20',
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {color: isActive ? COLORS.success : COLORS.textLight},
              ]}>
              {isActive ? 'Aktif' : 'Ditutup'}
            </Text>
          </View>
        </View>

        {/* Timer */}
        {isActive && (
          <View style={styles.timerContainer}>
            <Icon name="clock-outline" size={16} color={COLORS.accent} />
            <Text style={styles.timerText}>{timeRemaining}</Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {voting.options?.map(option => {
            const percentage = calculatePercentage(
              option.votes || 0,
              voting.totalVotes || 0,
            );
            const isSelected = userVotes[voting.id] === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  !isActive && styles.optionCardDisabled,
                ]}
                onPress={() => handleVote(voting.id, option.id)}
                disabled={!isActive || hasVoted}>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionText}>{option.name}</Text>
                    {hasVoted && (
                      <Text style={styles.optionPercentage}>{percentage}%</Text>
                    )}
                  </View>
                  
                  {option.description && (
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  )}

                  {hasVoted && (
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {width: `${percentage}%`},
                        ]}
                      />
                    </View>
                  )}

                  {hasVoted && (
                    <Text style={styles.voteCount}>
                      {option.votes || 0} suara
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <Icon name="check-circle" size={24} color={COLORS.success} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.votingFooter}>
          <View style={styles.totalVotes}>
            <Icon name="account-group" size={16} color={COLORS.textSecondary} />
            <Text style={styles.totalVotesText}>
              {voting.totalVotes || 0} total suara
            </Text>
          </View>
          {hasVoted && (
            <View style={styles.votedBadge}>
              <Icon name="check" size={14} color={COLORS.success} />
              <Text style={styles.votedText}>Anda sudah voting</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Voting & Musyawarah</Text>
        <Text style={styles.headerSubtitle}>
          Partisipasi dalam keputusan bersama
        </Text>
      </View>

      {/* Voting List */}
      <ScrollView
        style={styles.votingList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.votingListContent}>
        {votingList.length > 0 ? (
          votingList.map(voting => <VotingCard key={voting.id} voting={voting} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="vote-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Belum ada voting aktif</Text>
          </View>
        )}
      </ScrollView>
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
  votingList: {
    flex: 1,
  },
  votingListContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  votingCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  votingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  votingTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.sm,
  },
  votingTitleContent: {
    flex: 1,
  },
  votingTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  votingSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  timerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accentDark,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionCardSelected: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  optionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  optionPercentage: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  optionDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  voteCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  votingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  totalVotesText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  votedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
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
});

export default VotingScreen;
