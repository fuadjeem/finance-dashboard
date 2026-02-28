import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { tokens } from '../tokens';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, onClear, placeholder = 'Search...' }: SearchBarProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchIcon}>
                <Search size={18} color={tokens.colors.text.disabled as string} />
            </View>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={tokens.colors.text.disabled}
                autoCorrect={false}
                autoCapitalize="none"
            />
            {value.length > 0 && (
                <Pressable onPress={onClear} style={styles.clearButton} hitSlop={10}>
                    <X size={16} color={tokens.colors.text.secondary as string} />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.full,
        paddingHorizontal: tokens.spacing.md,
        height: 40,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        marginRight: tokens.spacing.sm,
    },
    input: {
        flex: 1,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.primary,
        height: '100%',
    },
    clearButton: {
        marginLeft: tokens.spacing.sm,
        padding: 4,
    },
});
