import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '../tokens';

export interface ChipOption {
    id: string;
    label: string;
}

interface ChipFilterProps {
    options: ChipOption[];
    selected: string[];
    onSelect: (id: string) => void;
    multiSelect?: boolean;
    style?: ViewStyle;
}

export const ChipFilter = ({ options, selected, onSelect, multiSelect = false, style }: ChipFilterProps) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.container, style]}
            contentContainerStyle={styles.content}
        >
            {options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                    <Pressable
                        key={option.id}
                        onPress={() => onSelect(option.id)}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
    },
    content: {
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: tokens.spacing.sm,
        gap: tokens.spacing.sm,
    },
    chip: {
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: 6,
        borderRadius: tokens.radii.full,
        backgroundColor: tokens.colors.bg.surface,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    chipSelected: {
        backgroundColor: tokens.colors.brand.primary,
        borderColor: tokens.colors.brand.primary,
    },
    chipText: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        fontWeight: tokens.typography.label.fontWeight,
        color: tokens.colors.text.secondary,
    },
    chipTextSelected: {
        color: '#ffffff',
    },
});
