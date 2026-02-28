import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { tokens } from '../../ui-kit/tokens';
import { EmptyState } from '../../ui-kit/components/EmptyState';
import { SearchBar } from '../../ui-kit/components/SearchBar';
import { Filter } from 'lucide-react-native';

export default function TransactionsScreen() {
    const [search, setSearch] = React.useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={search}
                        onChangeText={setSearch}
                        onClear={() => setSearch('')}
                        placeholder="Search transactions..."
                    />
                </View>
                <View style={styles.filterButton}>
                    <Filter size={20} color={tokens.colors.text.secondary as string} />
                </View>
            </View>

            <FlatList
                data={[]}
                keyExtractor={(_, index) => index.toString()}
                renderItem={() => null}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <EmptyState
                        title="No transactions found"
                        subtitle="When you add transactions they will appear here."
                        actionLabel="Add Transaction"
                        onAction={() => { }}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: tokens.colors.bg.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: tokens.spacing.lg,
        backgroundColor: tokens.colors.bg.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchContainer: {
        flex: 1,
        marginRight: tokens.spacing.md,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: tokens.radii.full,
        backgroundColor: tokens.colors.bg.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        flexGrow: 1,
    }
});
