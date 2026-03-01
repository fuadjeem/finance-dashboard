import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Alert, useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LineChart } from '../../components/Charts';
import { tokens } from '../../ui-kit/tokens';
import { Card } from '../../ui-kit/components/Card';
import { Skeleton } from '../../ui-kit/components/Skeleton';
import { EmptyState } from '../../ui-kit/components/EmptyState';
import {
    useCategoryTransactions, useAllCategories, useUpdateTransaction
} from '../../hooks/useApi';
import { useUserCurrency } from '../../hooks/useApi';
import { formatCurrency } from '../../lib/currency';

function formatMonth(ym: string) {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function navigateMonth(ym: string, delta: number): string {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [reassignCatId, setReassignCatId] = useState('');

    const { data: txData, isLoading, refetch } = useCategoryTransactions(id!, month);
    const { data: allCategories = [] } = useAllCategories();
    const { data: currency = 'USD' } = useUserCurrency();
    const updateTx = useUpdateTransaction();

    const transactions = txData?.transactions || [];
    const fmt = useCallback((cents: number) => formatCurrency(cents, currency), [currency]);

    // Build daily chart data
    const dailyData = (() => {
        const [y, m] = month.split('-').map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const dayMap: Record<string, number> = {};
        for (let d = 1; d <= daysInMonth; d++) dayMap[d] = 0;
        for (const tx of transactions) {
            if (!tx.excluded) {
                const day = parseInt(tx.date.split('-')[2]);
                dayMap[day] = (dayMap[day] || 0) + tx.amountCents;
            }
        }
        return Object.entries(dayMap).map(([day, cents]) => ({ x: parseInt(day), y: cents / 100 }));
    })();

    const totalCents = transactions.filter((t) => !t.excluded).reduce((s, t) => s + t.amountCents, 0);
    const categoryName = transactions[0]?.category?.name || 'Category';
    const categoryType = transactions[0]?.type || 'COST';
    const sameTypeCategories = allCategories.filter((c) => c.type === categoryType && c.id !== id);

    const toggleSelect = (txId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(txId) ? next.delete(txId) : next.add(txId);
            return next;
        });
    };

    const { width: screenWidth } = useWindowDimensions();
    const chartWidth = screenWidth - tokens.spacing.lg * 4;


    const handleBulkExclude = async (exclude: boolean) => {
        if (selectedIds.size === 0) return;
        try {
            await Promise.all(
                Array.from(selectedIds).map((txId) =>
                    updateTx.mutateAsync({ id: txId, payload: { excluded: exclude } })
                )
            );
            setSelectedIds(new Set());
            refetch();
        } catch { Alert.alert('Error', 'Could not update transactions.'); }
    };

    const handleRecategorize = async () => {
        if (!reassignCatId || selectedIds.size === 0) return;
        try {
            await Promise.all(
                Array.from(selectedIds).map((txId) =>
                    updateTx.mutateAsync({ id: txId, payload: { categoryId: reassignCatId } })
                )
            );
            setSelectedIds(new Set());
            setReassignCatId('');
            refetch();
        } catch { Alert.alert('Error', 'Could not recategorize transactions.'); }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={22} color={tokens.colors.brand.primary as string} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.categoryName}>{categoryName}</Text>
                <Text style={styles.totalAmount}>{fmt(totalCents)}</Text>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => setMonth(navigateMonth(month, -1))} style={styles.navBtn}>
                        <ChevronLeft size={20} color={tokens.colors.text.secondary as string} />
                    </TouchableOpacity>
                    <Text style={styles.monthLabel}>{formatMonth(month)}</Text>
                    <TouchableOpacity onPress={() => setMonth(navigateMonth(month, 1))} style={styles.navBtn}>
                        <ChevronRight size={20} color={tokens.colors.text.secondary as string} />
                    </TouchableOpacity>
                </View>

                {/* Chart */}
                <Card style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Daily Spending</Text>
                    {isLoading ? (
                        <Skeleton height={180} borderRadius={tokens.radii.sm} />
                    ) : (
                        <LineChart
                            data={dailyData}
                            height={200}
                            width={chartWidth}
                            color="#f43f5e"
                        />
                    )}
                </Card>

                {/* Bulk Action Bar */}
                {selectedIds.size > 0 && (
                    <View style={styles.bulkBar}>
                        <Text style={styles.bulkCount}>{selectedIds.size} selected</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {sameTypeCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catChip, reassignCatId === cat.id && styles.catChipActive]}
                                    onPress={() => setReassignCatId(cat.id)}
                                >
                                    <Text style={[styles.catChipText, reassignCatId === cat.id && styles.catChipTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.bulkBtns}>
                            {reassignCatId !== '' && (
                                <TouchableOpacity style={styles.btnPrimary} onPress={handleRecategorize}>
                                    <Text style={styles.btnPrimaryText}>Move</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.btnSecondary} onPress={() => handleBulkExclude(true)}>
                                <Text style={styles.btnSecondaryText}>Exclude</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnSecondary} onPress={() => handleBulkExclude(false)}>
                                <Text style={styles.btnSecondaryText}>Include</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedIds(new Set())}>
                                <Text style={[styles.btnSecondaryText, { color: tokens.colors.text.disabled }]}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Transactions */}
                <View style={styles.txSection}>
                    <Text style={styles.sectionTitle}>Transactions ({transactions.length})</Text>
                    {isLoading ? (
                        [1, 2, 3].map((i) => <Skeleton key={i} height={56} style={{ marginBottom: 1 }} />)
                    ) : transactions.length === 0 ? (
                        <EmptyState
                            title="No transactions"
                            subtitle={`No transactions in this category for ${formatMonth(month)}`}
                        />
                    ) : (
                        <Card padding={0}>
                            {transactions.map((tx, idx) => {
                                const isSelected = selectedIds.has(tx.id);
                                return (
                                    <React.Fragment key={tx.id}>
                                        <TouchableOpacity
                                            style={[styles.txRow, isSelected && styles.txRowSelected, tx.excluded && styles.txRowExcluded]}
                                            onPress={() => toggleSelect(tx.id)}
                                        >
                                            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                                                {isSelected && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>}
                                            </View>
                                            <View style={styles.txInfo}>
                                                <Text style={styles.txDate}>{tx.date}</Text>
                                                {tx.note ? <Text style={styles.txNote} numberOfLines={1}>{tx.note}</Text> : null}
                                                {tx.excluded && <Text style={styles.excludedBadge}>excluded</Text>}
                                            </View>
                                            <Text style={[styles.txAmount, tx.excluded && { textDecorationLine: 'line-through', color: tokens.colors.text.disabled as string }]}>
                                                {fmt(tx.amountCents)}
                                            </Text>
                                        </TouchableOpacity>
                                        {idx < transactions.length - 1 && <View style={styles.divider} />}
                                    </React.Fragment>
                                );
                            })}
                        </Card>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: tokens.colors.bg.base },
    content: { padding: tokens.spacing.lg, paddingBottom: 60 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    backBtn: { flexDirection: 'row', alignItems: 'center' },
    backText: { fontFamily: tokens.typography.fontFamily, fontSize: 16, color: tokens.colors.brand.primary },
    categoryName: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h2.fontSize,
        fontWeight: tokens.typography.h2.fontWeight,
        color: tokens.colors.text.primary,
        marginTop: 8,
    },
    totalAmount: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 28,
        fontWeight: '700',
        color: tokens.colors.text.primary,
        marginTop: 4,
        marginBottom: tokens.spacing.lg,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: tokens.spacing.lg,
        gap: tokens.spacing.md,
    },
    navBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: tokens.colors.bg.surface,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    monthLabel: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 15,
        fontWeight: '600',
        color: tokens.colors.text.primary,
    },
    chartCard: { marginBottom: tokens.spacing.lg },
    sectionTitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        color: tokens.colors.text.primary,
        marginBottom: tokens.spacing.md,
    },
    bulkBar: {
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.md,
        padding: tokens.spacing.md,
        marginBottom: tokens.spacing.lg,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    bulkCount: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 12,
        color: tokens.colors.text.secondary,
        marginBottom: 8,
    },
    bulkBtns: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
    btnPrimary: {
        backgroundColor: tokens.colors.brand.primary,
        borderRadius: tokens.radii.sm,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '600', fontFamily: tokens.typography.fontFamily },
    btnSecondary: {
        backgroundColor: tokens.colors.bg.base,
        borderRadius: tokens.radii.sm,
        borderWidth: 1, borderColor: '#e5e7eb',
        paddingHorizontal: 14, paddingVertical: 6,
    },
    btnSecondaryText: { fontSize: 13, fontWeight: '600', fontFamily: tokens.typography.fontFamily, color: tokens.colors.text.primary },
    catChip: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: tokens.radii.full,
        borderWidth: 1.5, borderColor: '#e5e7eb',
        marginRight: 8, backgroundColor: tokens.colors.bg.surface,
    },
    catChipActive: { borderColor: tokens.colors.brand.primary, backgroundColor: tokens.colors.brand.primary },
    catChipText: { fontFamily: tokens.typography.fontFamily, fontSize: 12, color: tokens.colors.text.secondary },
    catChipTextActive: { color: '#fff' },
    txSection: {},
    txRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: tokens.spacing.lg, paddingVertical: 14,
    },
    txRowSelected: { backgroundColor: '#eff6ff' },
    txRowExcluded: { opacity: 0.5 },
    checkbox: {
        width: 20, height: 20, borderRadius: 4,
        borderWidth: 2, borderColor: '#d1d5db',
        marginRight: 12, alignItems: 'center', justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: tokens.colors.brand.primary, borderColor: tokens.colors.brand.primary },
    txInfo: { flex: 1 },
    txDate: { fontFamily: tokens.typography.fontFamily, fontSize: 13, color: tokens.colors.text.secondary },
    txNote: { fontFamily: tokens.typography.fontFamily, fontSize: 14, color: tokens.colors.text.primary, marginTop: 1 },
    excludedBadge: {
        fontFamily: tokens.typography.fontFamily, fontSize: 10,
        color: tokens.colors.text.disabled, marginTop: 2,
    },
    txAmount: { fontFamily: tokens.typography.fontFamily, fontSize: 15, fontWeight: '600', color: tokens.colors.text.primary },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: tokens.spacing.lg },
});
