import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { X, DollarSign } from 'lucide-react-native';
import { tokens } from '../ui-kit/tokens';
import { useAllCategories, useCreateTransaction, useUpdateTransaction } from '../hooks/useApi';

interface EditData {
    id: string;
    type: string;
    categoryId: string;
    amountCents: number;
    date: string;
    note: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
    editData?: EditData | null;
}

export default function AddTransactionModal({ visible, onClose, onSaved, editData }: Props) {
    const [type, setType] = useState<'COST' | 'INCOME'>('COST');
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState('');

    const { data: allCategories = [] } = useAllCategories();
    const createTx = useCreateTransaction();
    const updateTx = useUpdateTransaction();

    const isEditing = !!editData;

    useEffect(() => {
        if (editData) {
            setType(editData.type as 'COST' | 'INCOME');
            setCategoryId(editData.categoryId);
            setAmount(String(editData.amountCents / 100));
            setDate(editData.date);
            setNote(editData.note || '');
        } else {
            setType('COST');
            setCategoryId('');
            setAmount('');
            setDate(new Date().toISOString().slice(0, 10));
            setNote('');
        }
    }, [editData, visible]);

    const filteredCategories = allCategories.filter((c) => c.type === type);

    const handleSave = async () => {
        if (!categoryId) { Alert.alert('Required', 'Please select a category.'); return; }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) { Alert.alert('Invalid amount', 'Please enter a valid amount.'); return; }
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) { Alert.alert('Invalid date', 'Date must be YYYY-MM-DD.'); return; }

        const amountCents = Math.round(parsedAmount * 100);

        try {
            if (isEditing && editData) {
                await updateTx.mutateAsync({ id: editData.id, payload: { type, categoryId, amountCents, date, note } });
            } else {
                await createTx.mutateAsync({ type, categoryId, amountCents, date, note });
            }
            onSaved();
        } catch {
            Alert.alert('Error', 'Failed to save transaction. Please try again.');
        }
    };

    const isLoading = createTx.isPending || updateTx.isPending;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={22} color={tokens.colors.text.secondary as string} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                        {/* Type Selector */}
                        <Text style={styles.label}>Type</Text>
                        <View style={styles.typeRow}>
                            {(['COST', 'INCOME'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeChip, type === t && styles.typeChipActive(t)]}
                                    onPress={() => { setType(t); setCategoryId(''); }}
                                >
                                    <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                                        {t === 'COST' ? '💸 Cost' : '💵 Income'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Category */}
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                            {filteredCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
                                    onPress={() => setCategoryId(cat.id)}
                                >
                                    <Text style={[styles.catChipText, categoryId === cat.id && styles.catChipTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Amount */}
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.inputRow}>
                            <DollarSign size={18} color={tokens.colors.text.secondary as string} />
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor={tokens.colors.text.disabled as string}
                            />
                        </View>

                        {/* Date */}
                        <Text style={styles.label}>Date</Text>
                        <TextInput
                            style={styles.inputFull}
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={tokens.colors.text.disabled as string}
                        />

                        {/* Note */}
                        <Text style={styles.label}>Note (optional)</Text>
                        <TextInput
                            style={[styles.inputFull, { height: 80, textAlignVertical: 'top' }]}
                            value={note}
                            onChangeText={setNote}
                            placeholder="e.g. Grocery run"
                            placeholderTextColor={tokens.colors.text.disabled as string}
                            multiline
                        />
                    </ScrollView>

                    {/* Save Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
                            {isLoading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.saveBtnText}>{isEditing ? 'Update' : 'Add Transaction'}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.colors.bg.base },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: tokens.colors.bg.surface,
    },
    title: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        color: tokens.colors.text.primary,
    },
    closeBtn: { padding: 4 },
    body: { flex: 1, padding: tokens.spacing.lg },
    label: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        fontWeight: '600',
        color: tokens.colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: tokens.spacing.sm,
        marginTop: tokens.spacing.lg,
    },
    typeRow: { flexDirection: 'row', gap: tokens.spacing.md },
    typeChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: tokens.radii.md,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        backgroundColor: tokens.colors.bg.surface,
    },
    typeChipActive: (t: string) => ({
        borderColor: t === 'COST' ? tokens.colors.semantic.error : tokens.colors.semantic.success,
        backgroundColor: t === 'COST' ? '#fef2f2' : '#f0fdf4',
    }),
    typeChipText: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.colors.text.secondary,
    },
    typeChipTextActive: { color: tokens.colors.text.primary },
    catScroll: { marginBottom: 4 },
    catChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: tokens.radii.full,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        marginRight: tokens.spacing.sm,
        backgroundColor: tokens.colors.bg.surface,
    },
    catChipActive: {
        borderColor: tokens.colors.brand.primary,
        backgroundColor: tokens.colors.brand.primary,
    },
    catChipText: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 13,
        color: tokens.colors.text.secondary,
    },
    catChipTextActive: { color: '#fff' },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.md,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        paddingHorizontal: tokens.spacing.md,
    },
    input: {
        flex: 1,
        height: 48,
        fontFamily: tokens.typography.fontFamily,
        fontSize: 16,
        color: tokens.colors.text.primary,
        marginLeft: 8,
    },
    inputFull: {
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.md,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        paddingHorizontal: tokens.spacing.md,
        height: 48,
        fontFamily: tokens.typography.fontFamily,
        fontSize: 16,
        color: tokens.colors.text.primary,
    },
    footer: { padding: tokens.spacing.lg, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    saveBtn: {
        backgroundColor: tokens.colors.brand.primary,
        borderRadius: tokens.radii.md,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
