import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { tokens } from '../tokens';

interface ListRowProps {
    title: string;
    subtitle?: string;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const ListRow = ({ title, subtitle, leftIcon, rightElement, onPress, style }: ListRowProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && onPress && styles.pressed,
                style
            ]}
        >
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
            </View>
            {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: tokens.spacing.md,
        paddingHorizontal: tokens.spacing.lg,
        backgroundColor: tokens.colors.bg.surface,
    },
    pressed: {
        backgroundColor: tokens.colors.bg.base,
    },
    leftIcon: {
        marginRight: tokens.spacing.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        fontWeight: tokens.typography.body.fontWeight,
        color: tokens.colors.text.primary,
    },
    subtitle: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.caption.fontSize,
        color: tokens.colors.text.secondary,
        marginTop: 2,
    },
    rightElement: {
        marginLeft: tokens.spacing.md,
    },
});
