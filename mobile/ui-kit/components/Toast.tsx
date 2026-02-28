import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { tokens } from '../tokens';
import { motion } from '../motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss?: () => void;
    visible: boolean;
}

export const Toast = ({ message, type = 'info', duration = 3000, onDismiss, visible }: ToastProps) => {
    const [show, setShow] = useState(visible);
    const translateY = useSharedValue(100);

    useEffect(() => {
        if (visible) {
            setShow(true);
            translateY.value = withSpring(0, motion.toastSpringConfig);

            if (duration > 0) {
                const timer = setTimeout(() => {
                    hideToast();
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            hideToast();
        }
    }, [visible]);

    const hideToast = () => {
        translateY.value = withTiming(100, { duration: 250 }, (finished) => {
            if (finished) {
                runOnJS(setShow)(false);
                if (onDismiss) runOnJS(onDismiss)();
            }
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color={tokens.colors.semantic.success as string} />;
            case 'error': return <AlertCircle size={20} color={tokens.colors.semantic.error as string} />;
            case 'info': return <Info size={20} color={tokens.colors.semantic.info as string} />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return tokens.colors.semantic.success;
            case 'error': return tokens.colors.semantic.error;
            case 'info': return tokens.colors.semantic.info;
        }
    };

    return (
        <Animated.View style={[styles.container, animatedStyle, { borderLeftColor: getBorderColor() }]}>
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: tokens.spacing.lg,
        right: tokens.spacing.lg,
        backgroundColor: tokens.colors.bg.elevated,
        borderRadius: tokens.radii.sm,
        padding: tokens.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        ...tokens.shadows.lg,
        zIndex: 1000,
    },
    iconContainer: {
        marginRight: tokens.spacing.sm,
    },
    message: {
        flex: 1,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.fontSize,
        color: tokens.colors.text.primary,
    },
});
