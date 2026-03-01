import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    Alert, ActivityIndicator, TouchableOpacity, TextInput
} from 'react-native';
import { LogOut, Plus, Pencil, Trash2 } from 'lucide-react-native';
import { tokens } from '../../ui-kit/tokens';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../ui-kit/components/Card';
import { Button } from '../../ui-kit/components/Button';
import { SegmentedControl } from '../../ui-kit/components/SegmentedControl';
import { Skeleton } from '../../ui-kit/components/Skeleton';
import {
    useCategoriesByType, useCreateCategory, useUpdateCategory,
    useDeleteCategory, useUserCurrency, useUpdateCurrency
} from '../../hooks/useApi';
import { CURRENCIES } from '../../lib/currency';
import { Picker } from '@react-native-picker/picker';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'COST' | 'INCOME'>('COST');
    const [newCatName, setNewCatName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const { data: categories = [], isLoading: catLoading, refetch: refetchCats } = useCategoriesByType(activeTab);
    const { data: currency = 'USD', isLoading: currencyLoading } = useUserCurrency();
    const createCat = useCreateCategory();
    const updateCat = useUpdateCategory();
    const deleteCat = useDeleteCategory();
    const updateCurrency = useUpdateCurrency();

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
        ]);
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            await createCat.mutateAsync({ name: newCatName.trim(), type: activeTab });
            setNewCatName('');
            refetchCats();
        } catch { Alert.alert('Error', 'Could not add category.'); }
    };

    const handleRename = async (id: string) => {
        if (!editingName.trim()) { setEditingId(null); return; }
        try {
            await updateCat.mutateAsync({ id, name: editingName.trim() });
            setEditingId(null);
            refetchCats();
        } catch { Alert.alert('Error', 'Could not rename category.'); }
    };

    const handleDelete = (cat: { id: string; name: string }) => {
        if (cat.name === 'Uncategorized') { Alert.alert('Cannot delete', 'Uncategorized is a system category.'); return; }
        Alert.alert(`Delete "${cat.name}"?`, 'Its transactions will move to Uncategorized.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try { await deleteCat.mutateAsync(cat.id); refetchCats(); }
                    catch { Alert.alert('Error', 'Could not delete category.'); }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || ''}</Text>
                </View>

                {/* Currency Section */}
                <Text style={styles.sectionHeader}>💱 Currency</Text>
                <Card style={styles.card}>
                    {currencyLoading ? (
                        <Skeleton height={48} borderRadius={tokens.radii.sm} />
                    ) : (
                        <Picker
                            selectedValue={currency}
                            onValueChange={(val) => updateCurrency.mutate(val as string)}
                            style={styles.picker}
                        >
                            {CURRENCIES.map((c) => (
                                <Picker.Item key={c.code} label={`${c.symbol} — ${c.name} (${c.code})`} value={c.code} />
                            ))}
                        </Picker>
                    )}
                </Card>

                {/* Category Management */}
                <Text style={styles.sectionHeader}>📂 Categories</Text>
                <Card style={styles.card}>
                    <SegmentedControl
                        options={['Cost', 'Income']}
                        selectedIndex={activeTab === 'COST' ? 0 : 1}
                        onChange={(idx) => setActiveTab(idx === 0 ? 'COST' : 'INCOME')}
                        style={{ marginBottom: tokens.spacing.lg }}
                    />

                    {/* Add new category */}
                    <View style={styles.addRow}>
                        <TextInput
                            style={styles.addInput}
                            value={newCatName}
                            onChangeText={setNewCatName}
                            placeholder={`New ${activeTab.toLowerCase()} category...`}
                            placeholderTextColor={tokens.colors.text.disabled as string}
                            onSubmitEditing={handleAddCategory}
                            returnKeyType="done"
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory} disabled={createCat.isPending}>
                            {createCat.isPending
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Plus size={18} color="#fff" />
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Category List */}
                    {catLoading ? (
                        [1, 2, 3].map((i) => <Skeleton key={i} height={48} style={{ marginBottom: 8 }} borderRadius={tokens.radii.sm} />)
                    ) : categories.length === 0 ? (
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} categories yet.</Text>
                    ) : (
                        <View style={styles.catList}>
                            {categories.map((cat, idx) => (
                                <React.Fragment key={cat.id}>
                                    {idx > 0 && <View style={styles.catDivider} />}
                                    <View style={styles.catRow}>
                                        {editingId === cat.id ? (
                                            <TextInput
                                                style={styles.editInput}
                                                value={editingName}
                                                onChangeText={setEditingName}
                                                onSubmitEditing={() => handleRename(cat.id)}
                                                onBlur={() => handleRename(cat.id)}
                                                autoFocus
                                                returnKeyType="done"
                                            />
                                        ) : (
                                            <Text style={styles.catName}>{cat.name}</Text>
                                        )}
                                        {cat.name !== 'Uncategorized' && editingId !== cat.id && (
                                            <View style={styles.catActions}>
                                                <TouchableOpacity
                                                    style={styles.catActionBtn}
                                                    onPress={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                                >
                                                    <Pencil size={15} color={tokens.colors.text.secondary as string} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.catActionBtn}
                                                    onPress={() => handleDelete(cat)}
                                                >
                                                    <Trash2 size={15} color={tokens.colors.semantic.error as string} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </React.Fragment>
                            ))}
                        </View>
                    )}
                </Card>

                {/* Logout */}
                <Button
                    label="Log Out"
                    variant="secondary"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    textStyle={{ color: tokens.colors.semantic.error }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: tokens.colors.bg.base },
    scrollContent: { padding: tokens.spacing.lg, paddingBottom: 60 },
    profileSection: { alignItems: 'center', marginBottom: tokens.spacing.xl, marginTop: tokens.spacing.lg },
    avatarLarge: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: tokens.colors.brand.primary,
        alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing.md,
    },
    avatarText: { fontFamily: tokens.typography.fontFamily, fontSize: 32, fontWeight: '700', color: '#ffffff' },
    name: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h2.fontSize,
        fontWeight: tokens.typography.h2.fontWeight,
        color: tokens.colors.text.primary,
    },
    email: { fontFamily: tokens.typography.fontFamily, fontSize: 14, color: tokens.colors.text.secondary, marginTop: 4 },
    sectionHeader: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        fontWeight: '700',
        color: tokens.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: tokens.spacing.sm,
        marginLeft: 4,
    },
    card: { marginBottom: tokens.spacing.xl },
    picker: { color: tokens.colors.text.primary },
    addRow: { flexDirection: 'row', gap: tokens.spacing.sm, marginBottom: tokens.spacing.md },
    addInput: {
        flex: 1, height: 44,
        backgroundColor: tokens.colors.bg.base,
        borderRadius: tokens.radii.md,
        borderWidth: 1.5, borderColor: '#e5e7eb',
        paddingHorizontal: 12,
        fontFamily: tokens.typography.fontFamily,
        fontSize: 14, color: tokens.colors.text.primary,
    },
    addBtn: {
        width: 44, height: 44, borderRadius: tokens.radii.md,
        backgroundColor: tokens.colors.brand.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    catList: {},
    catDivider: { height: 1, backgroundColor: '#f3f4f6' },
    catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    catName: { flex: 1, fontFamily: tokens.typography.fontFamily, fontSize: 15, color: tokens.colors.text.primary },
    catActions: { flexDirection: 'row', gap: 4 },
    catActionBtn: { padding: 8 },
    editInput: {
        flex: 1, height: 40, backgroundColor: tokens.colors.bg.base,
        borderRadius: tokens.radii.sm, borderWidth: 1.5, borderColor: tokens.colors.brand.primary,
        paddingHorizontal: 10, fontFamily: tokens.typography.fontFamily,
        fontSize: 15, color: tokens.colors.text.primary,
    },
    emptyText: { fontFamily: tokens.typography.fontFamily, color: tokens.colors.text.disabled, textAlign: 'center', paddingVertical: 20 },
    logoutButton: { borderColor: tokens.colors.semantic.error, marginTop: tokens.spacing.md },
});
