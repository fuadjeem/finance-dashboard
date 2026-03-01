import React, { useRef } from 'react';
import { Animated, ActivityIndicator, Text, Pressable, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { tokens } from '../tokens';
import { motion } from '../motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    label: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
    label,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onPress,
    style,
    textStyle,
}: ButtonProps) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (disabled || loading) return;
        Animated.timing(scale, { toValue: motion.buttonScaleDown, ...motion.buttonPressConfig }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scale, { toValue: 1, ...motion.buttonPressConfig }).start();
    };

    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const getContainerStyle = (): ViewStyle => {
        switch (variant) {
            case 'primary': return styles.primaryContainer;
            case 'secondary': return styles.secondaryContainer;
            case 'ghost': return styles.ghostContainer;
        }
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'primary': return styles.primaryText;
            case 'secondary': return styles.secondaryText;
            case 'ghost': return styles.ghostText;
        }
    };

    const getSizeStyle = (): ViewStyle => {
        switch (size) {
            case 'sm': return styles.sizeSm;
            case 'md': return styles.sizeMd;
            case 'lg': return styles.sizeLg;
        }
    };

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                disabled={disabled || loading}
                style={[
                    styles.baseContainer,
                    getContainerStyle(),
                    getSizeStyle(),
                    (disabled || loading) && styles.disabledContainer,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'primary' ? 'white' : tokens.colors.brand.primary} />
                ) : (
                    <Text style={[styles.baseText, getTextStyle(), disabled && styles.disabledText, textStyle]}>
                        {label}
                    </Text>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    baseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: tokens.radii.md,
    },
    baseText: {
        fontFamily: tokens.typography.fontFamily,
        fontWeight: '600',
        textAlign: 'center',
    },
    sizeSm: {
        paddingVertical: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.md,
    },
    sizeMd: {
        paddingVertical: tokens.spacing.md,
        paddingHorizontal: tokens.spacing.lg,
    },
    sizeLg: {
        paddingVertical: 14,
        paddingHorizontal: tokens.spacing.xl,
    },
    primaryContainer: {
        backgroundColor: tokens.colors.brand.primary,
    },
    primaryText: {
        color: '#ffffff',
        fontSize: tokens.typography.body.fontSize,
    },
    secondaryContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: tokens.colors.brand.primary,
    },
    secondaryText: {
        color: tokens.colors.brand.primary,
        fontSize: tokens.typography.body.fontSize,
    },
    ghostContainer: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: tokens.colors.text.secondary,
        fontSize: tokens.typography.body.fontSize,
    },
    disabledContainer: {
        opacity: 0.6,
    },
    disabledText: {
        color: tokens.colors.text.disabled,
    },
});
