import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Pressable, useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BarChart } from '../../components/Charts';
import { tokens } from '../../ui-kit/tokens';
import { Card } from '../../ui-kit/components/Card';
import { Skeleton } from '../../ui-kit/components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardSummary, useCategorySpending, useUserCurrency } from '../../hooks/useApi';
import { formatCurrency } from '../../lib/currency';
import AddTransactionModal from '../../components/AddTransactionModal';

function currentMonthStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function navigateMonth(ym: string, delta: number): string {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(ym: string) {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatMonthShort(ym: string) {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [month, setMonth] = useState(currentMonthStr);
    const [showModal, setShowModal] = useState(false);

    const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useDashboardSummary(month, 4);
    const { data: categorySpending = [], isLoading: catLoading, refetch: refetchCat } = useCategorySpending(month);
    const { data: currency = 'USD' } = useUserCurrency();

    const fmt = useCallback((cents: number) => formatCurrency(cents, currency), [currency]);

    const analytics = summaryData?.analytics;
    const summary = summaryData?.summary || [];
    const loading = summaryLoading || catLoading;

    const costCategories = categorySpending.filter((c) => c.type === 'COST' && c.totalCents > 0);

    const chartData = summary.map((s) => ({
        label: formatMonthShort(s.month),
        income: s.income / 100,
        costs: s.costs / 100,
    }));

    const { width: screenWidth } = useWindowDimensions();
    const chartWidth = screenWidth - tokens.spacing.lg * 2 - 32; // card padding

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning,' : greetingHour < 18 ? 'Good afternoon,' : 'Good evening,';

    const summaryTiles = [
        { label: '🛒 Total Spent', value: analytics?.totalCosts ?? 0, color: tokens.colors.semantic.error },
        { label: '💵 Total Income', value: analytics?.totalIncome ?? 0, color: tokens.colors.semantic.success },
        { label: '📈 Net Income', value: analytics?.netIncome ?? 0, color: tokens.colors.brand.primary },
        { label: '📅 Avg Daily', value: analytics?.avgDailySpend ?? 0, color: '#f59e0b' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.name}>{user?.name || 'User'}</Text>
                    </View>
                    <Pressable style={styles.avatar} onPress={() => router.push('/(tabs)/settings')}>
                        <User size={20} color={tokens.colors.brand.primary as string} />
                    </Pressable>
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => setMonth(navigateMonth(month, -1))} style={styles.navBtn}>
                        <ChevronLeft size={20} color={tokens.colors.text.secondary as string} />
                    </TouchableOpacity>
                    <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>
                    <TouchableOpacity onPress={() => setMonth(navigateMonth(month, 1))} style={styles.navBtn}>
                        <ChevronRight size={20} color={tokens.colors.text.secondary as string} />
                    </TouchableOpacity>
                </View>

                {/* Swipeable Category Tiles */}
                {(loading || costCategories.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tilesRow}>
                            {loading
                                ? [1, 2, 3].map((i) => <Skeleton key={i} width={120} height={72} borderRadius={tokens.radii.md} style={{ marginRight: 12 }} />)
                                : costCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.categoryTile}
                                        onPress={() => router.push(`/category/${cat.id}?month=${month}`)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={styles.tileName} numberOfLines={1}>{cat.name}</Text>
                                        <Text style={styles.tileAmount}>{fmt(cat.totalCents)}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                    </View>
                )}

                {/* 4-Stat Summary Grid */}
                <View style={styles.section}>
                    <View style={styles.summaryGrid}>
                        {summaryTiles.map((tile) => (
                            <View key={tile.label} style={styles.summaryTile}>
                                <Text style={styles.summaryTileLabel}>{tile.label}</Text>
                                {loading
                                    ? <Skeleton width={80} height={18} style={{ marginTop: 4 }} />
                                    : <Text style={[styles.summaryTileValue, { color: tile.color as string }]}>{fmt(tile.value)}</Text>
                                }
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bar Chart: Income vs Costs */}
                <View style={styles.section}>
                    <Card>
                        <Text style={styles.sectionTitle}>Income vs Costs</Text>
                        {loading ? (
                            <Skeleton height={200} borderRadius={tokens.radii.sm} />
                        ) : chartData.length === 0 ? (
                            <View style={styles.emptyChart}>
                                <Text style={styles.emptyChartText}>📊 Add transactions to see the chart</Text>
                            </View>
                        ) : (
                            <BarChart
                                data={chartData}
                                height={220}
                                width={chartWidth}
                            />
                        )}
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                                <Text style={styles.legendText}>Income</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#f43f5e' }]} />
                                <Text style={styles.legendText}>Costs</Text>
                            </View>
                        </View>
                    </Card>
                </View>

            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
                <Plus size={26} color="#fff" />
            </TouchableOpacity>

            <AddTransactionModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSaved={() => {
                    setShowModal(false);
                    refetchSummary();
                    refetchCat();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: tokens.colors.bg.base },
    scroll: { padding: tokens.spacing.lg, paddingBottom: 100 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: tokens.spacing.lg, marginTop: tokens.spacing.sm,
    },
    greeting: { fontFamily: tokens.typography.fontFamily, fontSize: 14, color: tokens.colors.text.secondary },
    name: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h2.fontSize,
        fontWeight: tokens.typography.h2.fontWeight,
        color: tokens.colors.text.primary,
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: tokens.colors.bg.surface,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    monthSelector: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: tokens.spacing.lg, gap: 16,
    },
    navBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: tokens.colors.bg.surface, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    monthLabel: {
        fontFamily: tokens.typography.fontFamily, fontSize: 15,
        fontWeight: '600', color: tokens.colors.text.primary,
    },
    section: { marginBottom: tokens.spacing.xl },
    sectionTitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        color: tokens.colors.text.primary,
        marginBottom: tokens.spacing.md,
    },
    tilesRow: { paddingBottom: 4 },
    categoryTile: {
        width: 130, padding: 14, borderRadius: tokens.radii.md,
        backgroundColor: tokens.colors.bg.surface, marginRight: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    tileName: {
        fontFamily: tokens.typography.fontFamily, fontSize: 13,
        color: tokens.colors.text.secondary, marginBottom: 6, fontWeight: '500',
    },
    tileAmount: {
        fontFamily: tokens.typography.fontFamily, fontSize: 16,
        fontWeight: '700', color: tokens.colors.text.primary,
    },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.md },
    summaryTile: {
        flex: 1, minWidth: '45%',
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.md, padding: 14,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    summaryTileLabel: {
        fontFamily: tokens.typography.fontFamily, fontSize: 12,
        color: tokens.colors.text.secondary, marginBottom: 4,
    },
    summaryTileValue: {
        fontFamily: tokens.typography.fontFamily, fontSize: 16, fontWeight: '700',
    },
    emptyChart: { height: 160, alignItems: 'center', justifyContent: 'center' },
    emptyChartText: { fontFamily: tokens.typography.fontFamily, color: tokens.colors.text.disabled, fontSize: 14 },
    legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 4 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontFamily: tokens.typography.fontFamily, fontSize: 12, color: tokens.colors.text.secondary },
    fab: {
        position: 'absolute', bottom: 30, right: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: tokens.colors.brand.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: tokens.colors.brand.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
    },
});
