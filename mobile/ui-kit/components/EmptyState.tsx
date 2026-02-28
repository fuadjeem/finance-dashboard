import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../tokens';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) => {
    return (
        <View style={styles.container}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    variant="secondary"
                    size="md"
                    style={styles.actionButton}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacing.xl,
    },
    iconContainer: {
        marginBottom: tokens.spacing.lg,
        opacity: 0.8,
    },
    title: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.h3.fontSize,
        fontWeight: tokens.typography.h3.fontWeight,
        color: tokens.colors.text.primary,
        textAlign: 'center',
        marginBottom: tokens.spacing.sm,
    },
    subtitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: tokens.spacing.xl,
    },
    actionButton: {
        minWidth: 160,
    },
});
