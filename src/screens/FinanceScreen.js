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
import {db} from '../config/firebase';

const FinanceScreen = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, income, expense

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      // Load transactions
      const snapshot = await db
        .collection('finance')
        .orderBy('date', 'desc')
        .limit(50)
        .get();

      const txData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(txData);

      // Calculate balance
      let totalIncome = 0;
      let totalExpense = 0;

      txData.forEach(tx => {
        if (tx.type === 'income') {
          totalIncome += tx.amount || 0;
        } else {
          totalExpense += tx.amount || 0;
        }
      });

      setBalance({
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      });
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const TransactionItem = ({transaction}) => {
    const isIncome = transaction.type === 'income';

    return (
      <View style={styles.transactionItem}>
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: isIncome
                ? COLORS.success + '20'
                : COLORS.error + '20',
            },
          ]}>
          <Icon
            name={isIncome ? 'arrow-down' : 'arrow-up'}
            size={20}
            color={isIncome ? COLORS.success : COLORS.error}
          />
        </View>

        <View style={styles.transactionContent}>
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>
              {transaction.date?.toDate?.().toLocaleDateString('id-ID') || '-'}
            </Text>
            <Text style={styles.transactionCategory}>
              {transaction.category || 'Umum'}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            {color: isIncome ? COLORS.success : COLORS.error},
          ]}>
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
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

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
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
        <Text style={styles.headerTitle}>Keuangan</Text>
        <Text style={styles.headerSubtitle}>
          Transparansi keuangan organisasi
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo Kas</Text>
            <Icon name="cash-multiple" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(balance.balance)}</Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <Icon name="arrow-down" size={20} color={COLORS.success} />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Pemasukan</Text>
                <Text style={[styles.balanceDetailAmount, {color: COLORS.success}]}>
                  {formatCurrency(balance.income)}
                </Text>
              </View>
            </View>

            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <Icon name="arrow-up" size={20} color={COLORS.error} />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Pengeluaran</Text>
                <Text style={[styles.balanceDetailAmount, {color: COLORS.error}]}>
                  {formatCurrency(balance.expense)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FilterButton label="Semua" value="all" />
          <FilterButton label="Pemasukan" value="income" />
          <FilterButton label="Pengeluaran" value="expense" />
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
            <Text style={styles.transactionCount}>
              {filteredTransactions.length} transaksi
            </Text>
          </View>

          {filteredTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {filteredTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="cash-remove" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  balanceLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    opacity: 0.9,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h1,
    color: COLORS.background,
    marginBottom: SPACING.lg,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  balanceDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background + '15',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  balanceDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceDetailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    opacity: 0.9,
  },
  balanceDetailAmount: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
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
  transactionsSection: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
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
  },
  transactionCount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  transactionsList: {
    gap: SPACING.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  transactionDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  transactionCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
  },
  transactionAmount: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
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

export default FinanceScreen;
