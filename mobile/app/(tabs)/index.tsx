import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { User } from 'lucide-react-native';
import { tokens } from '../../ui-kit/tokens';
import { Card } from '../../ui-kit/components/Card';
import { ListRow } from '../../ui-kit/components/ListRow';
import { Skeleton } from '../../ui-kit/components/Skeleton';
import { Button } from '../../ui-kit/components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useApi';

export default function DashboardMock() {
    const { user } = useAuth();
    const { data: transactions, isLoading: isTransactionsLoading } = useTransactions();

    // Real data calc placeholder
    const loading = isTransactionsLoading;

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.name}>{user?.name || 'Fuad Sarker'}</Text>
            </View>
            <View style={styles.avatar}>
                <User size={20} color={tokens.colors.brand.primary as string} />
            </View>
        </View>
    );

    const renderSummaries = () => (
        <View style={styles.summaryContainer}>
            <Card style={styles.summaryCardMain} elevated>
                <Text style={styles.summaryLabelMain}>Net Balance</Text>
                {loading ? (
                    <Skeleton width={120} height={32} style={styles.skeletonSpace} />
                ) : (
                    <Text style={styles.summaryValueMain}>$4,250.00</Text>
                )}
            </Card>

            <View style={styles.summaryRow}>
                <Card style={styles.summaryCardSub}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    {loading ? (
                        <Skeleton width={80} height={20} style={styles.skeletonSpaceSm} />
                    ) : (
                        <Text style={[styles.summaryValue, { color: tokens.colors.semantic.success }]}>+$6,500</Text>
                    )}
                </Card>
                <View style={{ width: tokens.spacing.md }} />
                <Card style={styles.summaryCardSub}>
                    <Text style={styles.summaryLabel}>Costs</Text>
                    {loading ? (
                        <Skeleton width={80} height={20} style={styles.skeletonSpaceSm} />
                    ) : (
                        <Text style={[styles.summaryValue, { color: tokens.colors.semantic.error }]}>-$2,250</Text>
                    )}
                </Card>
            </View>
        </View>
    );

    const renderChartPlaceholder = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <Card padding={tokens.spacing.md}>
                {loading ? (
                    <Skeleton height={200} borderRadius={tokens.radii.sm} />
                ) : (
                    <View style={styles.chartPlaceholder}>
                        <Text style={styles.chartText}>Victory Native Chart Here</Text>
                    </View>
                )}
            </Card>
        </View>
    );

    const renderTransactions = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>
            <Card padding={0}>
                {loading ? (
                    <View style={{ padding: tokens.spacing.lg, gap: tokens.spacing.md }}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: tokens.spacing.md }} />
                                <View style={{ flex: 1, gap: 8 }}>
                                    <Skeleton height={14} width="70%" />
                                    <Skeleton height={10} width="40%" />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <>
                        <ListRow
                            title="Apple Store"
                            subtitle="Electronics • Today"
                            rightElement={<Text style={styles.costText}>-$1,299.00</Text>}
                        />
                        <View style={styles.divider} />
                        <ListRow
                            title="Salary"
                            subtitle="Income • Yesterday"
                            rightElement={<Text style={styles.incomeText}>+$5,000.00</Text>}
                        />
                        <View style={styles.divider} />
                        <ListRow
                            title="Whole Foods"
                            subtitle="Groceries • 2 days ago"
                            rightElement={<Text style={styles.costText}>-$145.20</Text>}
                        />
                    </>
                )}
            </Card>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderSummaries()}
                {renderChartPlaceholder()}
                {renderTransactions()}

                <View style={styles.devControls}>
                    <Button
                        onPress={() => { }}
                        label={loading ? 'Show Data' : 'Show Skeletons'}
                        variant="secondary"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: tokens.colors.bg.base,
    },
    scrollContent: {
        padding: tokens.spacing.lg,
        paddingBottom: tokens.spacing.xxl * 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacing.xl,
        marginTop: tokens.spacing.md,
    },
    greeting: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.secondary,
    },
    name: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h2.fontSize,
        fontWeight: tokens.typography.h2.fontWeight,
        color: tokens.colors.text.primary,
        marginTop: 2,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: tokens.radii.full,
        backgroundColor: tokens.colors.bg.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...tokens.shadows.sm,
    },
    summaryContainer: {
        marginBottom: tokens.spacing.xl,
    },
    summaryCardMain: {
        marginBottom: tokens.spacing.md,
        alignItems: 'center',
        paddingVertical: tokens.spacing.xl,
    },
    summaryLabelMain: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.secondary,
        marginBottom: tokens.spacing.xs,
    },
    summaryValueMain: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 36,
        fontWeight: '700',
        color: tokens.colors.text.primary,
        letterSpacing: -1,
    },
    summaryRow: {
        flexDirection: 'row',
    },
    summaryCardSub: {
        flex: 1,
    },
    summaryLabel: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.caption.fontSize,
        color: tokens.colors.text.secondary,
        marginBottom: 2,
    },
    summaryValue: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
    },
    section: {
        marginBottom: tokens.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: tokens.spacing.md,
    },
    sectionTitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        color: tokens.colors.text.primary,
    },
    seeAll: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        color: tokens.colors.brand.primary,
        fontWeight: '600',
    },
    chartPlaceholder: {
        height: 200,
        backgroundColor: tokens.colors.bg.base,
        borderRadius: tokens.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    chartText: {
        fontFamily: tokens.typography.fontFamily,
        color: tokens.colors.text.disabled,
    },
    costText: {
        fontFamily: tokens.typography.fontFamily,
        fontWeight: '600',
        color: tokens.colors.text.primary,
    },
    incomeText: {
        fontFamily: tokens.typography.fontFamily,
        fontWeight: '600',
        color: tokens.colors.semantic.success,
    },
    divider: {
        height: 1,
        backgroundColor: tokens.colors.bg.base,
        marginHorizontal: tokens.spacing.lg,
    },
    skeletonSpace: {
        marginTop: 8,
    },
    skeletonSpaceSm: {
        marginTop: 4,
    },
    devControls: {
        marginTop: tokens.spacing.lg,
    },
});
