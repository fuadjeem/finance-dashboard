import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { tokens } from '../tokens';

interface CardProps {
    children: React.ReactNode;
    elevated?: boolean;
    padding?: number;
    style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, elevated = false, padding = tokens.spacing.lg, style }: CardProps) => {
    return (
        <View style={[
            styles.container,
            { padding },
            elevated && styles.elevated,
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.lg,
        borderWidth: 1,
        borderColor: '#e5e7eb', // soft border for flat cards
    },
    elevated: {
        borderWidth: 0,
        backgroundColor: tokens.colors.bg.elevated,
        ...tokens.shadows.md,
    },
});
