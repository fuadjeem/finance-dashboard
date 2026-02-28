import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { tokens } from '../tokens';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

export const Input = ({
    label,
    error,
    leftIcon,
    rightIcon,
    containerStyle,
    style,
    onFocus,
    onBlur,
    ...rest
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusBorderColor = useSharedValue(tokens.colors.text.disabled);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        focusBorderColor.value = withTiming(tokens.colors.brand.primary, { duration: 200 });
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        focusBorderColor.value = withTiming(error ? tokens.colors.semantic.error : tokens.colors.text.disabled, { duration: 200 });
        onBlur?.(e);
    };

    const animatedBorderStyle = useAnimatedStyle(() => {
        return {
            borderColor: error ? tokens.colors.semantic.error : focusBorderColor.value,
            borderWidth: isFocused ? 2 : 1,
        };
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
                {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        leftIcon ? { paddingLeft: 0 } : undefined,
                        rightIcon ? { paddingRight: 0 } : undefined,
                        style
                    ]}
                    placeholderTextColor={tokens.colors.text.disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />

                {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
            </Animated.View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: tokens.spacing.md,
    },
    label: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.label.fontSize,
        fontWeight: tokens.typography.label.fontWeight,
        color: tokens.colors.text.primary,
        marginBottom: tokens.spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tokens.colors.bg.surface,
        borderRadius: tokens.radii.md,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.primary,
        paddingHorizontal: tokens.spacing.md,
        height: '100%',
    },
    leftIconContainer: {
        paddingLeft: tokens.spacing.md,
        paddingRight: tokens.spacing.sm,
    },
    rightIconContainer: {
        paddingRight: tokens.spacing.md,
        paddingLeft: tokens.spacing.sm,
    },
    errorText: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.caption.fontSize,
        color: tokens.colors.semantic.error,
        marginTop: tokens.spacing.sm,
    },
});
