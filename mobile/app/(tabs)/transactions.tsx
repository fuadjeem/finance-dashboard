import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { Filter, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { tokens } from '../../ui-kit/tokens';
import { Card } from '../../ui-kit/components/Card';
import { SearchBar } from '../../ui-kit/components/SearchBar';
import { Skeleton } from '../../ui-kit/components/Skeleton';
import { EmptyState } from '../../ui-kit/components/EmptyState';
import {
    useAllTransactions, useDeleteTransaction, useUserCurrency
} from '../../hooks/useApi';
import { formatCurrency } from '../../lib/currency';
import AddTransactionModal from '../../components/AddTransactionModal';

const FILTER_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Costs', value: 'COST' },
    { label: 'Income', value: 'INCOME' },
];

export default function TransactionsScreen() {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;
    const [showModal, setShowModal] = useState(false);
    const [editTx, setEditTx] = useState<null | {
        id: string; type: string; categoryId: string;
        amountCents: number; date: string; note: string;
    }>(null);

    const { data, isLoading, refetch } = useAllTransactions({ filterType, search, offset, limit: LIMIT });
    const { data: currency = 'USD' } = useUserCurrency();
    const deleteTx = useDeleteTransaction();

    const fmt = useCallback((cents: number) => formatCurrency(cents, currency), [currency]);

    const transactions = data?.transactions || [];
    const total = data?.total || 0;

    const handleDelete = (id: string) => {
        Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try { await deleteTx.mutateAsync(id); refetch(); }
                    catch { Alert.alert('Error', 'Could not delete transaction.'); }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Search + Filter Header */}
            <View style={styles.topBar}>
                <View style={styles.searchWrap}>
                    <SearchBar
                        value={search}
                        onChangeText={(v) => { setSearch(v); setOffset(0); }}
                        onClear={() => { setSearch(''); setOffset(0); }}
                        placeholder="Search transactions..."
                    />
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {FILTER_OPTIONS.map((f) => (
                    <TouchableOpacity
                        key={f.value}
                        style={[styles.filterChip, filterType === f.value && styles.filterChipActive]}
                        onPress={() => { setFilterType(f.value); setOffset(0); }}
                    >
                        <Text style={[styles.filterChipText, filterType === f.value && styles.filterChipTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Text style={styles.totalCount}>{total} total</Text>
            </View>

            {/* Transaction List */}
            {isLoading ? (
                <View style={{ padding: tokens.spacing.lg, gap: 12 }}>
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} borderRadius={tokens.radii.md} />)}
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            title="No transactions found"
                            subtitle={search ? 'Try a different search term' : 'Add your first transaction to get started'}
                            actionLabel="Add Transaction"
                            onAction={() => setShowModal(true)}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item: tx }) => (
                        <View style={styles.txRow}>
                            <View style={styles.txLeft}>
                                <View style={[styles.typeBadge, { backgroundColor: tx.type === 'INCOME' ? '#dcfce7' : '#fef2f2' }]}>
                                    <Text style={[styles.typeBadgeText, { color: tx.type === 'INCOME' ? '#16a34a' : '#dc2626' }]}>
                                        {tx.type === 'INCOME' ? 'INC' : 'CST'}
                                    </Text>
                                </View>
                                <View style={styles.txMeta}>
                                    <Text style={styles.txCategory}>{tx.category.name}</Text>
                                    <Text style={styles.txDate}>{tx.date}{tx.note ? ` · ${tx.note}` : ''}</Text>
                                </View>
                            </View>
                            <View style={styles.txRight}>
                                <Text style={[styles.txAmount, { color: tx.type === 'INCOME' ? '#16a34a' : tokens.colors.text.primary as string }]}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amountCents)}
                                </Text>
                                <View style={styles.txActions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => {
                                            setEditTx({
                                                id: tx.id, type: tx.type,
                                                categoryId: tx.categoryId,
                                                amountCents: tx.amountCents,
                                                date: tx.date, note: tx.note,
                                            });
                                            setShowModal(true);
                                        }}
                                    >
                                        <Edit2 size={15} color={tokens.colors.text.secondary as string} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(tx.id)}>
                                        <Trash2 size={15} color={tokens.colors.semantic.error as string} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={
                        total > LIMIT ? (
                            <View style={styles.pagination}>
                                <TouchableOpacity
                                    style={[styles.pageBtn, offset === 0 && styles.pageBtnDisabled]}
                                    disabled={offset === 0}
                                    onPress={() => setOffset(Math.max(0, offset - LIMIT))}
                                >
                                    <Text style={styles.pageBtnText}>← Prev</Text>
                                </TouchableOpacity>
                                <Text style={styles.pageInfo}>
                                    Page {Math.floor(offset / LIMIT) + 1} of {Math.ceil(total / LIMIT)}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.pageBtn, offset + LIMIT >= total && styles.pageBtnDisabled]}
                                    disabled={offset + LIMIT >= total}
                                    onPress={() => setOffset(offset + LIMIT)}
                                >
                                    <Text style={styles.pageBtnText}>Next →</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => { setEditTx(null); setShowModal(true); }}>
                <Plus size={26} color="#fff" />
            </TouchableOpacity>

            <AddTransactionModal
                visible={showModal}
                editData={editTx}
                onClose={() => { setShowModal(false); setEditTx(null); }}
                onSaved={() => { setShowModal(false); setEditTx(null); refetch(); }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: tokens.colors.bg.base },
    topBar: {
        flexDirection: 'row', alignItems: 'center',
        padding: tokens.spacing.lg, paddingBottom: 8,
        backgroundColor: tokens.colors.bg.surface,
        borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    },
    searchWrap: { flex: 1 },
    filterRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: tokens.spacing.lg, paddingVertical: 10,
        gap: 8, backgroundColor: tokens.colors.bg.surface,
        borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: tokens.radii.full,
        borderWidth: 1.5, borderColor: '#e5e7eb',
        backgroundColor: tokens.colors.bg.base,
    },
    filterChipActive: { borderColor: tokens.colors.brand.primary, backgroundColor: tokens.colors.brand.primary },
    filterChipText: { fontFamily: tokens.typography.fontFamily, fontSize: 13, color: tokens.colors.text.secondary, fontWeight: '500' },
    filterChipTextActive: { color: '#fff' },
    totalCount: { marginLeft: 'auto', fontFamily: tokens.typography.fontFamily, fontSize: 12, color: tokens.colors.text.secondary },
    listContent: { padding: tokens.spacing.lg, paddingBottom: 100, flexGrow: 1 },
    separator: { height: 8 },
    txRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.md,
        padding: tokens.spacing.md,
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    typeBadge: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    typeBadgeText: { fontFamily: tokens.typography.fontFamily, fontSize: 10, fontWeight: '700' },
    txMeta: { flex: 1 },
    txCategory: { fontFamily: tokens.typography.fontFamily, fontSize: 14, fontWeight: '600', color: tokens.colors.text.primary },
    txDate: { fontFamily: tokens.typography.fontFamily, fontSize: 12, color: tokens.colors.text.secondary, marginTop: 2 },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontFamily: tokens.typography.fontFamily, fontSize: 15, fontWeight: '700' },
    txActions: { flexDirection: 'row', gap: 4, marginTop: 4 },
    actionBtn: { padding: 6 },
    pagination: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 16, marginTop: 12,
    },
    pageBtn: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: tokens.radii.md, backgroundColor: tokens.colors.bg.surface,
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    pageBtnDisabled: { opacity: 0.4 },
    pageBtnText: { fontFamily: tokens.typography.fontFamily, fontSize: 13, fontWeight: '600', color: tokens.colors.text.primary },
    pageInfo: { fontFamily: tokens.typography.fontFamily, fontSize: 12, color: tokens.colors.text.secondary },
    fab: {
        position: 'absolute', bottom: 30, right: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: tokens.colors.brand.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: tokens.colors.brand.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
    },
});
